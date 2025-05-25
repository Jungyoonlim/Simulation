import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { WebsocketProvider } from 'y-websocket';

/**
 * Real-time collaboration service for robotics teams
 * Enables multiple engineers to annotate SLAM meshes simultaneously
 */
export class CollaborationService {
  constructor() {
    this.doc = null;
    this.provider = null;
    this.awareness = null;
    this.cursors = new Map();
    this.isConnected = false;
  }

  /**
   * Initialize collaboration for a project
   * @param {string} projectId - Unique project identifier
   * @param {Object} userInfo - Current user information
   */
  async initialize(projectId, userInfo) {
    // Create Yjs document
    this.doc = new Y.Doc();
    
    // Use WebRTC for peer-to-peer collaboration (with WebSocket fallback)
    try {
      // Try WebRTC first for low latency
      this.provider = new WebrtcProvider(`robomap-${projectId}`, this.doc, {
        signaling: ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-eu.herokuapp.com'],
        password: projectId, // Simple room password
        awareness: {
          user: userInfo
        }
      });
    } catch (error) {
      console.log('WebRTC not available, falling back to WebSocket');
      // Fallback to WebSocket
      this.provider = new WebsocketProvider(
        'wss://yjs-demo.herokuapp.com',
        `robomap-${projectId}`,
        this.doc
      );
    }
    
    this.awareness = this.provider.awareness;
    this.setupAwareness(userInfo);
    this.setupSharedTypes();
    
    this.isConnected = true;
    console.log('Collaboration initialized for project:', projectId);
  }

  /**
   * Setup awareness for cursor positions and user presence
   */
  setupAwareness(userInfo) {
    // Set local user info
    this.awareness.setLocalStateField('user', {
      id: userInfo.id,
      name: userInfo.name || 'Anonymous',
      color: this.generateUserColor(userInfo.id),
      cursor: null,
      selectedAnnotation: null
    });
    
    // Listen for awareness changes
    this.awareness.on('change', ({ added, updated, removed }) => {
      const allStates = this.awareness.getStates();
      
      // Update cursor positions
      allStates.forEach((state, clientId) => {
        if (state.user && state.user.cursor) {
          this.updateUserCursor(clientId, state.user);
        }
      });
      
      // Remove disconnected users
      removed.forEach(clientId => {
        this.removeUserCursor(clientId);
      });
    });
  }

  /**
   * Setup shared data types
   */
  setupSharedTypes() {
    // Shared annotations array
    this.annotations = this.doc.getArray('annotations');
    
    // Shared camera state for view synchronization
    this.cameraState = this.doc.getMap('camera');
    
    // Shared selection state
    this.selection = this.doc.getMap('selection');
    
    // Chat/comments
    this.comments = this.doc.getArray('comments');
  }

  /**
   * Add annotation with conflict resolution
   */
  addAnnotation(annotation) {
    const sharedAnnotation = {
      ...annotation,
      id: annotation.id || Y.createID(),
      timestamp: Date.now(),
      author: this.awareness.getLocalState().user
    };
    
    this.annotations.push([sharedAnnotation]);
    return sharedAnnotation;
  }

  /**
   * Update annotation
   */
  updateAnnotation(id, updates) {
    const index = this.findAnnotationIndex(id);
    if (index !== -1) {
      const annotation = this.annotations.get(index);
      const updated = {
        ...annotation,
        ...updates,
        lastModified: Date.now(),
        lastModifiedBy: this.awareness.getLocalState().user
      };
      this.annotations.delete(index, 1);
      this.annotations.insert(index, [updated]);
    }
  }

  /**
   * Delete annotation
   */
  deleteAnnotation(id) {
    const index = this.findAnnotationIndex(id);
    if (index !== -1) {
      this.annotations.delete(index, 1);
    }
  }

  /**
   * Find annotation index by ID
   */
  findAnnotationIndex(id) {
    for (let i = 0; i < this.annotations.length; i++) {
      if (this.annotations.get(i).id === id) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Update user cursor position in 3D space
   */
  updateCursorPosition(position) {
    if (!position) {
      this.awareness.setLocalStateField('user', {
        ...this.awareness.getLocalState().user,
        cursor: null
      });
    } else {
      this.awareness.setLocalStateField('user', {
        ...this.awareness.getLocalState().user,
        cursor: {
          x: position.x,
          y: position.y,
          z: position.z,
          timestamp: Date.now()
        }
      });
    }
  }

  /**
   * Update camera state for view following
   */
  updateCameraState(cameraPosition, cameraTarget) {
    this.cameraState.set('position', cameraPosition.toArray());
    this.cameraState.set('target', cameraTarget.toArray());
    this.cameraState.set('timestamp', Date.now());
    this.cameraState.set('userId', this.awareness.getLocalState().user.id);
  }

  /**
   * Follow another user's view
   */
  followUser(userId) {
    const states = this.awareness.getStates();
    for (const [clientId, state] of states) {
      if (state.user && state.user.id === userId) {
        return {
          position: this.cameraState.get('position'),
          target: this.cameraState.get('target')
        };
      }
    }
    return null;
  }

  /**
   * Add comment to annotation
   */
  addComment(annotationId, text) {
    const comment = {
      id: Y.createID(),
      annotationId,
      text,
      author: this.awareness.getLocalState().user,
      timestamp: Date.now(),
      resolved: false
    };
    this.comments.push([comment]);
    return comment;
  }

  /**
   * Resolve/unresolve comment thread
   */
  toggleCommentResolved(commentId) {
    for (let i = 0; i < this.comments.length; i++) {
      const comment = this.comments.get(i);
      if (comment.id === commentId) {
        const updated = { ...comment, resolved: !comment.resolved };
        this.comments.delete(i, 1);
        this.comments.insert(i, [updated]);
        break;
      }
    }
  }

  /**
   * Get all annotations
   */
  getAnnotations() {
    const annotations = [];
    for (let i = 0; i < this.annotations.length; i++) {
      annotations.push(this.annotations.get(i));
    }
    return annotations;
  }

  /**
   * Get comments for annotation
   */
  getCommentsForAnnotation(annotationId) {
    const comments = [];
    for (let i = 0; i < this.comments.length; i++) {
      const comment = this.comments.get(i);
      if (comment.annotationId === annotationId) {
        comments.push(comment);
      }
    }
    return comments.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get connected users
   */
  getConnectedUsers() {
    const users = [];
    this.awareness.getStates().forEach((state) => {
      if (state.user) {
        users.push(state.user);
      }
    });
    return users;
  }

  /**
   * Subscribe to annotation changes
   */
  onAnnotationsChange(callback) {
    this.annotations.observe(() => {
      callback(this.getAnnotations());
    });
  }

  /**
   * Subscribe to user presence changes
   */
  onUsersChange(callback) {
    this.awareness.on('change', () => {
      callback(this.getConnectedUsers());
    });
  }

  /**
   * Subscribe to camera state changes
   */
  onCameraChange(callback) {
    this.cameraState.observe(() => {
      const position = this.cameraState.get('position');
      const target = this.cameraState.get('target');
      const userId = this.cameraState.get('userId');
      if (position && target) {
        callback({ position, target, userId });
      }
    });
  }

  /**
   * Update user cursor in 3D scene
   */
  updateUserCursor(clientId, userInfo) {
    if (this.onCursorUpdate) {
      this.onCursorUpdate(clientId, userInfo);
    }
  }

  /**
   * Remove user cursor from 3D scene
   */
  removeUserCursor(clientId) {
    if (this.onCursorRemove) {
      this.onCursorRemove(clientId);
    }
  }

  /**
   * Generate consistent color for user
   */
  generateUserColor(userId) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#48DBFB', '#FF9FF3', '#54A0FF', '#FD79A8', '#A29BFE'
    ];
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Cleanup and disconnect
   */
  destroy() {
    if (this.provider) {
      this.provider.destroy();
    }
    if (this.doc) {
      this.doc.destroy();
    }
    this.isConnected = false;
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService(); 