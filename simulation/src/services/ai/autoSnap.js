import * as THREE from 'three';

/**
 * AI-powered Auto-Snap for Robotics SLAM Mesh Annotation
 * Intelligently snaps annotations to nearest meaningful geometry
 */
export class AutoSnapService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
    this.snapThreshold = 0.5; // meters for robotics scale
  }

  /**
   * Initialize the AI model for geometry feature detection
   */
  async initialize() {
    try {
      // For MVP, we'll use geometric heuristics
      // In production, load a trained PointNet++ model
      this.isModelLoaded = true;
      console.log('AutoSnap AI initialized for robotics meshes');
    } catch (error) {
      console.error('Failed to load AutoSnap model:', error);
    }
  }

  /**
   * Find the best snap point for robotics SLAM validation
   * @param {THREE.Vector3} clickPoint - User's click position
   * @param {THREE.Object3D} mesh - The SLAM mesh/point cloud
   * @param {string} annotationType - Type of annotation (obstacle, path, landmark)
   * @returns {Object} Snap result with position and confidence
   */
  async findSnapPoint(clickPoint, mesh, annotationType = 'general') {
    if (!mesh) return null;

    // Extract geometry features
    const features = this.extractGeometryFeatures(mesh, clickPoint);
    
    // Find candidate snap points based on robotics use cases
    const candidates = this.findCandidatePoints(features, annotationType);
    
    // Score candidates using AI/heuristics
    const bestCandidate = await this.scoreCandidates(candidates, clickPoint, annotationType);
    
    return {
      position: bestCandidate.position,
      normal: bestCandidate.normal,
      confidence: bestCandidate.confidence,
      type: bestCandidate.type,
      suggestion: this.generateAnnotationSuggestion(bestCandidate)
    };
  }

  /**
   * Extract relevant geometry features for robotics
   */
  extractGeometryFeatures(mesh, nearPoint) {
    const features = {
      edges: [],
      corners: [],
      planes: [],
      obstacles: []
    };

    // Get search radius
    const searchRadius = this.snapThreshold;

    // Analyze mesh geometry
    mesh.traverse((child) => {
      if (child.isMesh) {
        const geometry = child.geometry;
        const positions = geometry.attributes.position;
        
        // Find edges (useful for wall following in robotics)
        features.edges.push(...this.detectEdges(positions, nearPoint, searchRadius));
        
        // Find corners (navigation waypoints)
        features.corners.push(...this.detectCorners(positions, nearPoint, searchRadius));
        
        // Find flat surfaces (floor, walls)
        features.planes.push(...this.detectPlanes());
        
        // Detect potential obstacles
        features.obstacles.push(...this.detectObstacles(geometry));
      }
    });

    return features;
  }

  /**
   * Detect edges in geometry - important for robot path planning
   */
  detectEdges(positions, nearPoint, radius) {
    const edges = [];
    const array = positions.array;
    
    for (let i = 0; i < array.length; i += 9) {
      // Triangle vertices
      const v1 = new THREE.Vector3(array[i], array[i + 1], array[i + 2]);
      const v2 = new THREE.Vector3(array[i + 3], array[i + 4], array[i + 5]);
      const v3 = new THREE.Vector3(array[i + 6], array[i + 7], array[i + 8]);
      
      // Check each edge
      const edgePairs = [[v1, v2], [v2, v3], [v3, v1]];
      
      for (const [start, end] of edgePairs) {
        const midpoint = start.clone().add(end).multiplyScalar(0.5);
        const distance = midpoint.distanceTo(nearPoint);
        
        if (distance < radius) {
          edges.push({
            position: midpoint,
            direction: end.clone().sub(start).normalize(),
            length: start.distanceTo(end),
            distance: distance
          });
        }
      }
    }
    
    return edges;
  }

  /**
   * Detect corners - critical for robotics navigation
   */
  detectCorners(positions, nearPoint, radius) {
    const corners = [];
    const vertexMap = new Map();
    
    // Group vertices by position
    const array = positions.array;
    for (let i = 0; i < array.length; i += 3) {
      const vertex = new THREE.Vector3(array[i], array[i + 1], array[i + 2]);
      const key = `${vertex.x.toFixed(3)},${vertex.y.toFixed(3)},${vertex.z.toFixed(3)}`;
      
      if (!vertexMap.has(key)) {
        vertexMap.set(key, { position: vertex, count: 0 });
      }
      vertexMap.get(key).count++;
    }
    
    // Corners have multiple faces meeting
    vertexMap.forEach((data) => {
      if (data.count >= 3 && data.position.distanceTo(nearPoint) < radius) {
        corners.push({
          position: data.position,
          sharpness: data.count,
          distance: data.position.distanceTo(nearPoint)
        });
      }
    });
    
    return corners;
  }

  /**
   * Detect planes - floors, walls, ceilings for robotics
   */
  detectPlanes() {
    const planes = [];
    // Simplified plane detection for MVP
    // In production, use RANSAC or ML-based plane detection
    
    return planes;
  }

  /**
   * Detect obstacles for robot navigation
   */
  detectObstacles(geometry) {
    const obstacles = [];
    
    // Simple height-based obstacle detection
    const boundingBox = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);
    const height = boundingBox.max.y - boundingBox.min.y;
    
    if (height > 0.1 && height < 2.0) { // Typical obstacle height range
      obstacles.push({
        position: boundingBox.getCenter(new THREE.Vector3()),
        size: boundingBox.getSize(new THREE.Vector3()),
        type: 'potential_obstacle'
      });
    }
    
    return obstacles;
  }

  /**
   * Find candidate snap points based on robotics use cases
   */
  findCandidatePoints(features, annotationType) {
    const candidates = [];
    
    switch (annotationType) {
      case 'navigation_waypoint':
        // Prefer corners and edge midpoints
        candidates.push(...features.corners.map(c => ({ ...c, type: 'corner' })));
        candidates.push(...features.edges.map(e => ({ ...e, type: 'edge' })));
        break;
        
      case 'obstacle':
        // Prefer obstacle centers and edges
        candidates.push(...features.obstacles.map(o => ({ ...o, type: 'obstacle' })));
        break;
        
      case 'path':
        // Prefer floor plane and edges
        candidates.push(...features.edges.map(e => ({ ...e, type: 'path_edge' })));
        break;
        
      default:
        // Include all features
        candidates.push(...features.corners.map(c => ({ ...c, type: 'corner' })));
        candidates.push(...features.edges.map(e => ({ ...e, type: 'edge' })));
        candidates.push(...features.obstacles.map(o => ({ ...o, type: 'obstacle' })));
    }
    
    return candidates;
  }

  /**
   * Score candidates using AI/heuristics
   */
  async scoreCandidates(candidates, clickPoint, annotationType) {
    if (candidates.length === 0) {
      return {
        position: clickPoint,
        normal: new THREE.Vector3(0, 1, 0),
        confidence: 0.1,
        type: 'free_space'
      };
    }
    
    // Score based on distance and feature importance
    let bestCandidate = null;
    let bestScore = -Infinity;
    
    for (const candidate of candidates) {
      const distance = candidate.position.distanceTo(clickPoint);
      const distanceScore = 1.0 - (distance / this.snapThreshold);
      
      // Feature-specific scoring
      let featureScore = 0.5;
      if (annotationType === 'navigation_waypoint' && candidate.type === 'corner') {
        featureScore = 1.0;
      } else if (annotationType === 'obstacle' && candidate.type === 'obstacle') {
        featureScore = 0.9;
      }
      
      const totalScore = distanceScore * 0.7 + featureScore * 0.3;
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestCandidate = {
          ...candidate,
          confidence: totalScore,
          normal: this.estimateNormal(candidate)
        };
      }
    }
    
    return bestCandidate;
  }

  /**
   * Estimate surface normal for annotation orientation
   */
  estimateNormal(candidate) {
    if (candidate.direction) {
      // For edges, normal is perpendicular
      return new THREE.Vector3(0, 1, 0).cross(candidate.direction).normalize();
    }
    return new THREE.Vector3(0, 1, 0); // Default up
  }

  /**
   * Generate smart annotation suggestions for robotics
   */
  generateAnnotationSuggestion(snapResult) {
    const suggestions = {
      corner: [
        'Navigation waypoint',
        'Turn point',
        'Reference corner'
      ],
      edge: [
        'Wall edge',
        'Path boundary',
        'Obstacle edge'
      ],
      obstacle: [
        'Detected obstacle',
        'Dynamic object',
        'Navigation hazard'
      ],
      path_edge: [
        'Path segment',
        'Navigation corridor',
        'Safe passage'
      ],
      free_space: [
        'Open area',
        'Free space',
        'Exploration zone'
      ]
    };
    
    const typesSuggestions = suggestions[snapResult.type] || suggestions.free_space;
    return {
      primary: typesSuggestions[0],
      alternatives: typesSuggestions.slice(1),
      metadata: {
        position: `${snapResult.position.x.toFixed(2)}, ${snapResult.position.y.toFixed(2)}, ${snapResult.position.z.toFixed(2)}`,
        confidence: `${(snapResult.confidence * 100).toFixed(0)}%`,
        type: snapResult.type
      }
    };
  }
}

// Export singleton instance
export const autoSnapService = new AutoSnapService(); 