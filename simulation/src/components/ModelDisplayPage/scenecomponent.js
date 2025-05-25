import './SceneComponent.css'; 
import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import PropTypes from 'prop-types';
import { autoSnapService } from '../../services/ai/autoSnap';

// Dummy stubs for now - replace with real implementations later
const annotationService = {
  list: async (projectId) => ({ data: [], error: null }),
  create: async (projectId, data) => ({ data: { id: Date.now().toString(), ...data }, error: null }),
  subscribe: (projectId, callback) => ({ unsubscribe: () => {} })
};

const analytics = {
  trackEvent: (event, data) => console.log('Analytics:', event, data)
};

/**
 * Professional CAD-grade 3D annotation component
 * Designed for robotics SLAM mesh validation
 */
function SceneComponent({ modelPath, onObjectLoad, projectId }) {
    const mountRef = useRef(null);
    const sidebarRef = useRef(null);
    const sceneRef = useRef();
    const cameraRef = useRef();
    const rendererRef = useRef();
    const labelRendererRef = useRef();
    const controlsRef = useRef();
    const currentObjectRef = useRef(null);
    const animationFrameRef = useRef();
    
    // Professional annotation data structure
    const [annotations, setAnnotations] = useState([]);
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);
    const [pendingAnnotation, setPendingAnnotation] = useState(null);
    const [hoveredAnnotation, setHoveredAnnotation] = useState(null);
    const [error, setError] = useState('');
    const [isAnnotationMode, setIsAnnotationMode] = useState(true);
    const [annotationType, setAnnotationType] = useState('general'); // general, navigation_waypoint, obstacle, path
    const [aiSnapEnabled, setAiSnapEnabled] = useState(true);
    const [showAISuggestions] = useState(true);

    SceneComponent.propTypes = {
        modelPath: PropTypes.string.isRequired,
        onObjectLoad: PropTypes.func,
        projectId: PropTypes.string
    }

    // Initialize AI service
    useEffect(() => {
        autoSnapService.initialize();
    }, []);

    // Load annotations from database if projectId is provided
    useEffect(() => {
        if (projectId) {
            loadAnnotations();
            // Subscribe to real-time updates
            const subscription = annotationService.subscribe(projectId, handleAnnotationChange);
            
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [projectId]);

    const loadAnnotations = async () => {
        if (!projectId) return;
        
        const { data, error } = await annotationService.list(projectId);
        if (!error && data) {
            setAnnotations(data.map(ann => ({
                ...ann,
                worldPosition: new THREE.Vector3(ann.position.x, ann.position.y, ann.position.z)
            })));
        }
    };

    const handleAnnotationChange = (payload) => {
        if (payload.eventType === 'INSERT') {
            const newAnn = payload.new;
            setAnnotations(prev => [...prev, {
                ...newAnn,
                worldPosition: new THREE.Vector3(newAnn.position.x, newAnn.position.y, newAnn.position.z)
            }]);
        } else if (payload.eventType === 'UPDATE') {
            setAnnotations(prev => prev.map(ann => 
                ann.id === payload.new.id ? {
                    ...payload.new,
                    worldPosition: new THREE.Vector3(payload.new.position.x, payload.new.position.y, payload.new.position.z)
                } : ann
            ));
        } else if (payload.eventType === 'DELETE') {
            setAnnotations(prev => prev.filter(ann => ann.id !== payload.old.id));
        }
    };

    // Generate unique ID for annotations (for database storage)
    const generateAnnotationId = () => {
        return `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    // Export annotations for database/API
    const exportAnnotations = useCallback(() => {
        const exportData = {
            modelPath: modelPath,
            timestamp: new Date().toISOString(),
            annotations: annotations.map(ann => ({
                id: ann.id,
                name: ann.name,
                position: {
                    x: ann.worldPosition.x,
                    y: ann.worldPosition.y,
                    z: ann.worldPosition.z
                },
                createdAt: ann.createdAt,
                author: ann.author || 'Anonymous',
                tags: ann.tags || [],
                visibility: ann.visibility || 'public'
            }))
        };
        console.log('Export data:', exportData);
        // In a real app, send this to your API
        return exportData;
    }, [annotations, modelPath]);

    // Initialize Three.js scene ONCE
    useEffect(() => {
      const container = mountRef.current;
      // Scene with professional lighting
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);
      sceneRef.current = scene;
      
      // Professional camera setup
      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
      camera.position.set(0, 0, 5);
      cameraRef.current = camera;
      
      // High-quality renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
        renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      rendererRef.current = renderer;
        container.appendChild(renderer.domElement);
      
      // Label Renderer for annotations
      const labelRenderer = new CSS2DRenderer();
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.domElement.style.position = 'absolute';
      labelRenderer.domElement.style.top = '0px';
      labelRenderer.domElement.style.pointerEvents = 'none';
      labelRendererRef.current = labelRenderer;
      container.appendChild(labelRenderer.domElement);
      
      // Professional controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 0.1;
      controls.maxDistance = 100;
      controlsRef.current = controls;
      
      // Professional lighting setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
      mainLight.position.set(5, 5, 5);
      mainLight.castShadow = true;
      mainLight.shadow.camera.near = 0.1;
      mainLight.shadow.camera.far = 50;
      mainLight.shadow.camera.left = -10;
      mainLight.shadow.camera.right = 10;
      mainLight.shadow.camera.top = 10;
      mainLight.shadow.camera.bottom = -10;
      scene.add(mainLight);
      
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
      fillLight.position.set(-5, 0, -5);
      scene.add(fillLight);
      
      // Add a grid helper so there's something visible immediately
      const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
      scene.add(gridHelper);
      
      // Animation loop with proper cleanup
      let animationId;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
      };
      animate();
      animationFrameRef.current = animationId;
      
      // Handle window resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener('resize', handleResize);
        controls.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        if (container.contains(labelRenderer.domElement)) {
          container.removeChild(labelRenderer.domElement);
        }
      };
    }, []);

    // Load model when modelPath changes
    useEffect(() => {
      if (!modelPath || !sceneRef.current) return;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const controls = controlsRef.current;
        const loader = new OBJLoader();

        loader.load(modelPath, (object) => {
        // Clean up previous object
        if (currentObjectRef.current) {
          scene.remove(currentObjectRef.current);
          currentObjectRef.current.traverse(child => {
            if (child.isMesh) {
              child.geometry.dispose();
              child.material.dispose();
            }
          });
        }
        currentObjectRef.current = object;
        
        // Apply professional material
          object.traverse(child => {
            if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhysicalMaterial({ 
              color: 0xc0c0c0,
              metalness: 0.7,
              roughness: 0.3,
              clearcoat: 0.1,
              clearcoatRoughness: 0.1
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        // Professional camera positioning
          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));

        camera.position.set(center.x, center.y, center.z + cameraZ * 1.2);
          controls.target.copy(center);
          scene.add(object);
          if (onObjectLoad) onObjectLoad(object);
        controls.update();
      }, 
      // Progress callback
      (xhr) => {
        console.log(`Loading model: ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
      },
      // Error callback
      (error) => {
        console.error('Error loading model:', error);
        console.error('Model path:', modelPath);
        setError(`Failed to load model from: ${modelPath}. Please ensure the file exists and is a valid OBJ format.`);
        // Still call onObjectLoad to stop the loading spinner
        if (onObjectLoad) onObjectLoad(null);
      });
    }, [modelPath, onObjectLoad]);

    // Professional annotation rendering
    useEffect(() => {
      const scene = sceneRef.current;
      if (!scene) return;
      
      // Clear all annotation markers AND any orphaned input containers
      scene.children = scene.children.filter(child => !child.userData.isAnnotation);
      
      // Also remove any CSS2D input containers that might be orphaned
      const labelRenderer = labelRendererRef.current;
      if (labelRenderer && labelRenderer.domElement) {
        const inputContainers = labelRenderer.domElement.querySelectorAll('.annotation-input-container');
        inputContainers.forEach(container => {
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        });
      }
      
      // Render CAD-grade annotation markers
      annotations.forEach((annotation, idx) => {
        // Ultra-precise small marker for robotics applications
        const geometry = new THREE.SphereGeometry(0.003, 32, 32); // Even smaller, high-quality sphere
        const material = new THREE.MeshBasicMaterial({ 
          color: selectedAnnotation === idx ? 0xff3d00 : 
                 hoveredAnnotation === idx ? 0x2979ff : 0x00e676,
          transparent: true,
          opacity: 1.0, // Full opacity for better visibility
          depthTest: true,
          depthWrite: true
        });
        
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(annotation.worldPosition);
        marker.userData.isAnnotation = true;
        marker.userData.annotationIndex = idx;
        marker.renderOrder = 999; // High render order for visibility
        scene.add(marker);
        
        // Enhanced highlight system for selected/hovered annotations
        if (selectedAnnotation === idx || hoveredAnnotation === idx) {
          // Inner glow effect
          const glowGeometry = new THREE.SphereGeometry(0.008, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: selectedAnnotation === idx ? 0xff3d00 : 0x2979ff,
            transparent: true,
            opacity: 0.3,
            depthTest: true,
            depthWrite: false
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          glow.position.copy(annotation.worldPosition);
          glow.userData.isAnnotation = true;
          scene.add(glow);
          
          // Outer ring for better visibility
          const ringGeometry = new THREE.RingGeometry(0.015, 0.02, 64);
          const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: selectedAnnotation === idx ? 0xff3d00 : 0x2979ff,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
            depthTest: true,
            depthWrite: false
          });
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.position.copy(annotation.worldPosition);
          ring.lookAt(cameraRef.current.position);
          ring.userData.isAnnotation = true;
          ring.renderOrder = 1000;
          scene.add(ring);
          
          // Precision crosshair for exact positioning
          const crosshairSize = 0.01;
          const crosshairGeometry = new THREE.BufferGeometry();
          const vertices = new Float32Array([
            -crosshairSize, 0, 0,  crosshairSize, 0, 0,
            0, -crosshairSize, 0,  0, crosshairSize, 0,
            0, 0, -crosshairSize,  0, 0, crosshairSize
          ]);
          crosshairGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          const crosshairMaterial = new THREE.LineBasicMaterial({ 
            color: selectedAnnotation === idx ? 0xff3d00 : 0x2979ff,
            opacity: 0.8,
            transparent: true
          });
          const crosshair = new THREE.LineSegments(crosshairGeometry, crosshairMaterial);
          crosshair.position.copy(annotation.worldPosition);
          crosshair.userData.isAnnotation = true;
          scene.add(crosshair);
        }
        
        // Professional label - only show on hover or selection with occlusion check
        if (selectedAnnotation === idx || hoveredAnnotation === idx) {
          // Check if annotation is visible from current camera position
          const camera = cameraRef.current;
          const currentObject = currentObjectRef.current;
          
          let isVisible = true;
          if (currentObject && camera) {
            // Raycast from camera to annotation to check for occlusion
            const raycaster = new THREE.Raycaster();
            const direction = annotation.worldPosition.clone().sub(camera.position).normalize();
            raycaster.set(camera.position, direction);
            
            const intersects = raycaster.intersectObject(currentObject, true);
            if (intersects.length > 0) {
              const distanceToAnnotation = camera.position.distanceTo(annotation.worldPosition);
              const distanceToIntersection = intersects[0].distance;
              
              // If there's geometry between camera and annotation, hide the label
              if (distanceToIntersection < distanceToAnnotation - 0.01) { // Small tolerance
                isVisible = false;
              }
            }
          }
          
          if (isVisible) {
            const labelDiv = document.createElement('div');
            labelDiv.className = 'cad-annotation-label';
            labelDiv.innerHTML = `
              <div style="
                background: rgba(20, 20, 20, 0.95);
                color: #ffffff;
                padding: 4px 8px;
                border-radius: 3px;
                font-size: 11px;
                font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
                font-weight: 500;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                white-space: nowrap;
                user-select: none;
                pointer-events: auto;
                cursor: pointer;
              ">
                <div style="font-weight: 600; margin-bottom: 2px;">${annotation.name}</div>
                <div style="font-size: 9px; opacity: 0.7;">
                  ${annotation.createdAt ? new Date(annotation.createdAt).toLocaleDateString() : ''}
                </div>
              </div>
            `;
            
            labelDiv.onclick = (e) => {
              e.stopPropagation();
              setSelectedAnnotation(selectedAnnotation === idx ? null : idx);
            };
            
            const labelObj = new CSS2DObject(labelDiv);
            labelObj.position.copy(annotation.worldPosition.clone().add(new THREE.Vector3(0, 0.03, 0)));
            marker.add(labelObj);
          }
        }
      });
      
      // Render pending annotation with professional input
      if (pendingAnnotation && isAnnotationMode) {
        // Pending marker with proper depth testing
        const geometry = new THREE.SphereGeometry(0.008, 16, 16);
        const material = new THREE.MeshBasicMaterial({ 
          color: 0x2196f3,
          transparent: true,
          opacity: 1,
          depthTest: true,  // Enable depth testing
          depthWrite: true  // Enable depth writing
        });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(pendingAnnotation.position);
        marker.userData.isAnnotation = true;
        marker.renderOrder = 0; // Normal render order
        scene.add(marker);
        
        // Professional input UI
        const inputContainer = document.createElement('div');
        inputContainer.className = 'annotation-input-container';
        inputContainer.style.cssText = `
          background: rgba(20, 20, 20, 0.98);
          padding: 8px;
          border-radius: 4px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          min-width: 200px;
          pointer-events: auto;
        `;
        
        // AI Suggestion Banner
        if (pendingAnnotation.aiSuggestion && showAISuggestions) {
          const suggestionBanner = document.createElement('div');
          suggestionBanner.style.cssText = `
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(33, 150, 243, 0.2));
            border: 1px solid rgba(76, 175, 80, 0.3);
            border-radius: 3px;
            padding: 4px 8px;
            margin-bottom: 6px;
            font-size: 10px;
            color: #81c784;
            display: flex;
            align-items: center;
            gap: 4px;
          `;
          suggestionBanner.innerHTML = `
            <span>🤖</span>
            <span>AI: ${pendingAnnotation.aiSuggestion.metadata.type} (${pendingAnnotation.aiSuggestion.metadata.confidence})</span>
          `;
          inputContainer.appendChild(suggestionBanner);
        }
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = pendingAnnotation.inputValue || '';
        input.placeholder = 'Enter annotation...';
        input.style.cssText = `
          width: 100%;
          padding: 6px 10px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 3px;
          font-size: 12px;
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
          outline: none;
          background: rgba(255,255,255,0.1);
          color: white;
          transition: all 0.2s ease;
          margin-bottom: 6px;
          box-sizing: border-box;
        `;
        
        // Alternative suggestions
        if (pendingAnnotation.aiSuggestion && pendingAnnotation.aiSuggestion.alternatives.length > 0) {
          const alternativesDiv = document.createElement('div');
          alternativesDiv.style.cssText = `
            display: flex;
            gap: 4px;
            margin-bottom: 6px;
            flex-wrap: wrap;
          `;
          
          pendingAnnotation.aiSuggestion.alternatives.forEach(alt => {
            const altBtn = document.createElement('button');
            altBtn.innerText = alt;
            altBtn.style.cssText = `
              background: rgba(255,255,255,0.05);
              border: 1px solid rgba(255,255,255,0.1);
              color: rgba(255,255,255,0.6);
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
              cursor: pointer;
              transition: all 0.2s ease;
            `;
            altBtn.onmouseenter = () => {
              altBtn.style.background = 'rgba(255,255,255,0.1)';
              altBtn.style.color = 'rgba(255,255,255,0.8)';
            };
            altBtn.onmouseleave = () => {
              altBtn.style.background = 'rgba(255,255,255,0.05)';
              altBtn.style.color = 'rgba(255,255,255,0.6)';
            };
            altBtn.onclick = () => {
              input.value = alt;
              input.focus();
            };
            alternativesDiv.appendChild(altBtn);
          });
          
          inputContainer.appendChild(input);
          inputContainer.appendChild(alternativesDiv);
        } else {
          inputContainer.appendChild(input);
        }
        
        // Prevent clicks from propagating
        input.onclick = (e) => {
          e.stopPropagation();
        };
        
        input.onfocus = () => {
          input.style.borderColor = '#2196f3';
          input.style.background = 'rgba(255,255,255,0.15)';
        };
        
        input.onblur = () => {
          input.style.borderColor = 'rgba(255,255,255,0.2)';
          input.style.background = 'rgba(255,255,255,0.1)';
        };
        
        input.oninput = (e) => {
          e.stopPropagation();
          // Don't update state on every keystroke to prevent re-renders
          // Just update the input value directly
        };
        
        // Professional save function
        const saveAnnotation = async () => {
          const annotationName = input.value.trim(); // Get value directly from input
          if (annotationName) {
            const newAnnotation = {
              id: generateAnnotationId(),
              name: annotationName,
              type: pendingAnnotation.annotationType || 'general',
              worldPosition: pendingAnnotation.position.clone(),
              localPosition: pendingAnnotation.position.clone(),
              modelName: modelPath,
              createdAt: new Date().toISOString(),
              author: 'Current User', // In real app, get from auth
              tags: [],
              visibility: 'public',
              aiConfidence: pendingAnnotation.aiSuggestion?.metadata?.confidence,
              aiSuggestion: pendingAnnotation.aiSuggestion
            };
            
            // Save to local state
            setAnnotations(prev => [...prev, newAnnotation]);
            
            // Save to database if project exists
            if (projectId) {
              try {
                const { data, error } = await annotationService.create(projectId, {
                  name: annotationName,
                  type: pendingAnnotation.annotationType || 'general',
                  position: {
                    x: pendingAnnotation.position.x,
                    y: pendingAnnotation.position.y,
                    z: pendingAnnotation.position.z
                  },
                  metadata: {
                    modelPath: modelPath,
                    cameraPosition: cameraRef.current.position.toArray(),
                    cameraTarget: controlsRef.current.target.toArray()
                  },
                  aiConfidence: pendingAnnotation.aiSuggestion?.metadata?.confidence,
                  aiSuggestion: pendingAnnotation.aiSuggestion
                });
                
                if (!error) {
                  // Update local annotation with database ID
                  setAnnotations(prev => prev.map(ann => 
                    ann.id === newAnnotation.id ? { ...ann, id: data.id } : ann
                  ));
                  
                  analytics.trackEvent('annotation_created', {
                    type: pendingAnnotation.annotationType,
                    ai_assisted: !!pendingAnnotation.aiSuggestion,
                    confidence: pendingAnnotation.aiSuggestion?.metadata?.confidence
                  });
                }
              } catch (err) {
                console.error('Failed to save annotation:', err);
                setError('Failed to save annotation to cloud');
              }
            }
          }
          
          // Force immediate removal of the input container
          if (inputContainer && inputContainer.parentNode) {
            inputContainer.parentNode.removeChild(inputContainer);
          }
          
          // Clear pending annotation state
          setPendingAnnotation(null);
        };
        
        const cancelAnnotation = () => {
          // Force immediate removal of the input container
          if (inputContainer && inputContainer.parentNode) {
            inputContainer.parentNode.removeChild(inputContainer);
          }
          
          // Clear pending annotation state
          setPendingAnnotation(null);
        };
        
        input.onkeydown = (e) => {
          e.stopPropagation();
          if (e.key === 'Enter') {
            e.preventDefault();
            saveAnnotation();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelAnnotation();
          }
        };
        
        // Professional button group
        const buttonGroup = document.createElement('div');
        buttonGroup.style.cssText = `
          display: flex;
          gap: 4px;
          justify-content: flex-end;
        `;
        
        const saveBtn = document.createElement('button');
        saveBtn.innerText = 'Save';
        saveBtn.style.cssText = `
          background: #2196f3;
          color: white;
          border: none;
          padding: 4px 12px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
          transition: all 0.2s ease;
        `;
        saveBtn.onmouseenter = () => {
          saveBtn.style.background = '#1976d2';
        };
        saveBtn.onmouseleave = () => {
          saveBtn.style.background = '#2196f3';
        };
        
        // Use addEventListener for more reliable event handling
        const handleSave = (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('Save button clicked'); // Debug log
          saveAnnotation();
        };
        
        saveBtn.addEventListener('click', handleSave, true);
        saveBtn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
        }, true);
        
        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = 'Cancel';
        cancelBtn.style.cssText = `
          background: transparent;
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 4px 12px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
          transition: all 0.2s ease;
        `;
        cancelBtn.onmouseenter = () => {
          cancelBtn.style.borderColor = 'rgba(255,255,255,0.4)';
          cancelBtn.style.color = 'rgba(255,255,255,0.9)';
        };
        cancelBtn.onmouseleave = () => {
          cancelBtn.style.borderColor = 'rgba(255,255,255,0.2)';
          cancelBtn.style.color = 'rgba(255,255,255,0.7)';
        };
        
        // Use addEventListener for more reliable event handling
        const handleCancel = (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('Cancel button clicked'); // Debug log
          cancelAnnotation();
        };
        
        cancelBtn.addEventListener('click', handleCancel, true);
        cancelBtn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
        }, true);
        
        // Prevent container clicks from propagating
        inputContainer.onclick = (e) => {
          e.stopPropagation();
        };
        
        inputContainer.appendChild(input);
        buttonGroup.appendChild(saveBtn);
        buttonGroup.appendChild(cancelBtn);
        inputContainer.appendChild(buttonGroup);
        
        const labelObj = new CSS2DObject(inputContainer);
        labelObj.position.copy(pendingAnnotation.position.clone().add(new THREE.Vector3(0, 0.04, 0)));
        marker.add(labelObj);
        
        // Focus input immediately
        requestAnimationFrame(() => {
          input.focus();
          input.select();
        });
      }
    }, [annotations, selectedAnnotation, hoveredAnnotation, pendingAnnotation, modelPath, isAnnotationMode]);

    // Handle annotation clicks with raycasting
    useEffect(() => {
      if (!isAnnotationMode) return;
      
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      
      const handleClick = async (event) => {
        // Prevent creating new annotation if clicking on existing UI
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON') {
          return;
        }
        
        const mouse = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        );
    
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        // Check for annotation clicks first
        const annotationMeshes = scene.children.filter(child => 
          child.userData.isAnnotation && child.userData.annotationIndex !== undefined
        );
        
        const annotationIntersects = raycaster.intersectObjects(annotationMeshes);
        if (annotationIntersects.length > 0) {
          const idx = annotationIntersects[0].object.userData.annotationIndex;
          setSelectedAnnotation(selectedAnnotation === idx ? null : idx);
          return;
        }
        
        // Check for model clicks
        const currentObject = currentObjectRef.current;
        if (currentObject) {
          const intersects = raycaster.intersectObject(currentObject, true);
        if (intersects.length > 0) {
            let finalPosition = intersects[0].point.clone();
            let aiSuggestion = null;
            
            // Use AI auto-snap if enabled
            if (aiSnapEnabled && autoSnapService.isModelLoaded) {
              analytics.trackEvent('ai_snap_used', { 
                annotation_type: annotationType,
                model_type: 'slam_mesh' 
              });
              
              const snapResult = await autoSnapService.findSnapPoint(
                intersects[0].point,
                currentObject,
                annotationType
              );
              
              if (snapResult && snapResult.confidence > 0.5) {
                finalPosition = snapResult.position;
                aiSuggestion = snapResult.suggestion;
                
                // Visual feedback for snap
                const snapIndicator = new THREE.Mesh(
                  new THREE.RingGeometry(0.02, 0.03, 16),
                  new THREE.MeshBasicMaterial({ 
                    color: 0x00ff00, 
                    transparent: true, 
                    opacity: 0.8 
                  })
                );
                snapIndicator.position.copy(finalPosition);
                snapIndicator.lookAt(camera.position);
                scene.add(snapIndicator);
                
                // Remove indicator after animation
                setTimeout(() => {
                  scene.remove(snapIndicator);
                }, 500);
              }
            }
            
            // Clear any existing pending annotation first
            setPendingAnnotation(null);
            // Then set new one with AI suggestion
            setTimeout(() => {
              setPendingAnnotation({ 
                position: finalPosition,
                inputValue: aiSuggestion?.primary || '',
                aiSuggestion: aiSuggestion,
                annotationType: annotationType
              });
            }, 0);
          }
        }
      };
      
      const handleMouseMove = (event) => {
        const mouse = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        const annotationMeshes = scene.children.filter(child => 
          child.userData.isAnnotation && child.userData.annotationIndex !== undefined
        );
        
        const intersects = raycaster.intersectObjects(annotationMeshes);
        if (intersects.length > 0) {
          setHoveredAnnotation(intersects[0].object.userData.annotationIndex);
          renderer.domElement.style.cursor = 'pointer';
        } else {
          setHoveredAnnotation(null);
          renderer.domElement.style.cursor = isAnnotationMode ? 'crosshair' : 'default';
        }
      };
      
      if (renderer) {
        renderer.domElement.addEventListener('click', handleClick);
        renderer.domElement.addEventListener('mousemove', handleMouseMove);
      }
      
      return () => {
        if (renderer) {
          renderer.domElement.removeEventListener('click', handleClick);
          renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        }
      };
    }, [isAnnotationMode, selectedAnnotation, annotations]);

    // Professional camera adjustment
    const adjustCameraToObject = (object) => {
      if (!object || !cameraRef.current || !controlsRef.current) return;
      
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z);
      const fitHeightDistance = maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
      const fitWidthDistance = fitHeightDistance / camera.aspect;
      
      const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.2;
      
      const direction = controls.target.clone()
        .sub(camera.position)
        .normalize()
        .multiplyScalar(distance);
      
      controls.maxDistance = distance * 10;
      controls.target.copy(center);
      
      camera.near = distance / 100;
      camera.far = distance * 100;
      camera.updateProjectionMatrix();
      
      camera.position.copy(controls.target).sub(direction);
      controls.update();
    };

    // Professional file handling
  const handleLoadObject = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
        const loader = new OBJLoader();
        loader.load(url, (object) => {
          if (currentObjectRef.current) {
            sceneRef.current.remove(currentObjectRef.current);
            currentObjectRef.current.traverse(child => {
              if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
              }
            });
          }
          currentObjectRef.current = object;
          sceneRef.current.add(object);
          adjustCameraToObject(object);
        if (onObjectLoad) onObjectLoad(object);
          
          // Clear annotations for new model
          setAnnotations([]);
          setPendingAnnotation(null);
          setSelectedAnnotation(null);
        }, undefined, (loadError) => {
          console.error('Failed to load model:', loadError);
          setError('Failed to load model. Please check the file format.');
      });
    }
  };
  
    // Return professional CAD-grade UI
    return (
      <div ref={mountRef} style={{ 
        width: '100%', 
        height: '100vh', 
        position: 'relative', 
        background: '#0a0a0a',
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        {/* Professional Toolbar */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '48px',
          background: 'rgba(20, 20, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Logo/Brand */}
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#ffffff',
            marginRight: '32px',
            letterSpacing: '-0.5px'
          }}>
            RoboMap Validator
          </div>
          
          {/* Tools */}
          <div style={{ display: 'flex', gap: '8px', marginRight: 'auto' }}>
            <button
              onClick={() => setIsAnnotationMode(!isAnnotationMode)}
              style={{
                background: isAnnotationMode ? '#2196f3' : 'transparent',
                color: isAnnotationMode ? 'white' : 'rgba(255, 255, 255, 0.7)',
                border: '1px solid ' + (isAnnotationMode ? '#2196f3' : 'rgba(255, 255, 255, 0.2)'),
                padding: '6px 16px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ fontSize: '14px' }}>📍</span>
              Annotation Mode
            </button>
            
            {/* Annotation Type Selector */}
            <select
              value={annotationType}
              onChange={(e) => setAnnotationType(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="general" style={{ background: '#1a1a1a' }}>General</option>
              <option value="navigation_waypoint" style={{ background: '#1a1a1a' }}>Navigation Waypoint</option>
              <option value="obstacle" style={{ background: '#1a1a1a' }}>Obstacle</option>
              <option value="path" style={{ background: '#1a1a1a' }}>Path Segment</option>
            </select>
            
            {/* AI Snap Toggle */}
            <button
              onClick={() => setAiSnapEnabled(!aiSnapEnabled)}
              style={{
                background: aiSnapEnabled ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                color: aiSnapEnabled ? '#4caf50' : 'rgba(255, 255, 255, 0.5)',
                border: '1px solid ' + (aiSnapEnabled ? '#4caf50' : 'rgba(255, 255, 255, 0.2)'),
                padding: '6px 16px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ fontSize: '14px' }}>🤖</span>
              AI Auto-Snap
            </button>
            
            <button
              onClick={exportAnnotations}
              style={{
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '6px 16px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.target.style.color = 'rgba(255, 255, 255, 0.9)';
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
            >
              Export
            </button>
          </div>
          
          {/* File Upload */}
          <label style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '6px 16px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            Load SLAM Mesh
        <input
          type="file"
          onChange={handleLoadObject}
              accept=".obj,.ply,.pcd"
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Error Toast */}
        {error && (
          <div style={{
            position: 'absolute',
            top: '64px',
            right: '16px',
            background: 'rgba(239, 68, 68, 0.95)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
            zIndex: 1001,
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            {error}
          </div>
        )}
        
        {/* Professional Sidebar */}
        <div ref={sidebarRef} style={{
                  position: 'absolute', 
          right: '0',
          top: '48px',
          width: '320px',
          height: 'calc(100vh - 48px)',
          background: 'rgba(20, 20, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          zIndex: 100,
          overflowY: 'auto',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              margin: '0 0 4px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              letterSpacing: '-0.3px'
            }}>
              Annotations
            </h3>
            <p style={{
              margin: '0',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontWeight: '400'
            }}>
              {annotations.length} total • {modelPath ? 'Model loaded' : 'No model'}
            </p>
          </div>
          
          {/* Annotations List */}
          <div style={{ padding: '12px' }}>
            {annotations.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{
                  fontSize: '32px',
                  marginBottom: '12px',
                  opacity: '0.5'
                }}>
                  📍
                </div>
                <p style={{
                  margin: '0 0 8px 0',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  No annotations yet
                </p>
                <p style={{
                  margin: '0',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.3)',
                  lineHeight: '1.5'
                }}>
                  {isAnnotationMode ? 'Click on the model to add' : 'Enable annotation mode first'}
                </p>
              </div>
            ) : (
              annotations.map((annotation, idx) => (
                <div 
                  key={annotation.id || idx} 
                  style={{
                    marginBottom: '8px',
                    padding: '12px',
                    background: selectedAnnotation === idx 
                      ? 'rgba(33, 150, 243, 0.15)'
                      : hoveredAnnotation === idx
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '6px',
                    border: '1px solid ' + (
                      selectedAnnotation === idx 
                        ? 'rgba(33, 150, 243, 0.3)'
                        : 'rgba(255, 255, 255, 0.1)'
                    ),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setSelectedAnnotation(selectedAnnotation === idx ? null : idx)}
                  onMouseEnter={() => setHoveredAnnotation(idx)}
                  onMouseLeave={() => setHoveredAnnotation(null)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <h4 style={{
                      margin: '0',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#ffffff'
                    }}>
                      {annotation.name}
                    </h4>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: selectedAnnotation === idx ? '#ff3d00' : 
                                 hoveredAnnotation === idx ? '#2979ff' : '#00e676',
                      boxShadow: '0 0 6px ' + (
                        selectedAnnotation === idx ? 'rgba(255, 61, 0, 0.5)' : 
                        hoveredAnnotation === idx ? 'rgba(41, 121, 255, 0.5)' : 'rgba(0, 230, 118, 0.5)'
                      )
                    }} />
                  </div>
                  
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontFamily: "'SF Mono', Monaco, 'Cascadia Code', monospace",
                    marginBottom: '4px'
                  }}>
                    {`${annotation.worldPosition.x.toFixed(3)}, ${annotation.worldPosition.y.toFixed(3)}, ${annotation.worldPosition.z.toFixed(3)}`}
                  </div>
                  
                  {annotation.createdAt && (
                    <div style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.3)'
                    }}>
                      {new Date(annotation.createdAt).toLocaleString()}
                    </div>
                  )}
                  
                  {/* Actions */}
                  {selectedAnnotation === idx && (
                    <div style={{
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Delete annotation
                          setAnnotations(prev => prev.filter((_, i) => i !== idx));
                          setSelectedAnnotation(null);
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          padding: '4px 8px',
                          borderRadius: '3px',
                          fontSize: '10px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Status Bar */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '24px',
          background: 'rgba(20, 20, 20, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.5)',
          zIndex: 1000
        }}>
          <span style={{ marginRight: '16px' }}>
            Mode: {isAnnotationMode ? 'Annotation' : 'View'}
          </span>
          <span style={{ marginRight: '16px' }}>
            Annotations: {annotations.length}
          </span>
          {hoveredAnnotation !== null && (
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Hovering: {annotations[hoveredAnnotation]?.name}
            </span>
          )}
            </div>
    </div>
    );
}

// Export the component
export default SceneComponent;