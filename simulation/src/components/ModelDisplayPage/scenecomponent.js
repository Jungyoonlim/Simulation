import './SceneComponent.css'; 
import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import PropTypes from 'prop-types';

/**
 * This function is a React component that sets up a Three.js scene and allows for loading .obj files.
 *
 * @param {function} onObjectLoad - a callback function to be called when the .obj file is loaded
 * @return {JSX} - the JSX for the file input and Three.js canvas
 */
function SceneComponent({ modelPath, onObjectLoad }) {
    const mountRef = useRef(null);
    const sidebarRef = useRef(null);
    const sceneRef = useRef();
    const cameraRef = useRef();
    const rendererRef = useRef();
    const labelRendererRef = useRef();
    const controlsRef = useRef();
    const currentObjectRef = useRef(null);
    const [annotations, setAnnotations] = useState([]);
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);
    const [pendingAnnotation, setPendingAnnotation] = useState(null);
    const [error, setError] = useState('');

    SceneComponent.propTypes = {
        modelPath: PropTypes.string.isRequired,
        onObjectLoad: PropTypes.func,
    }

    // Initialize Three.js scene ONCE
    useEffect(() => {
      const container = mountRef.current;
      // Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      // Camera
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;
      cameraRef.current = camera;
      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.gammaOutput = true;
      renderer.gammaFactor = 2.2; 
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1; 
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      rendererRef.current = renderer;
      container.appendChild(renderer.domElement);
      // Label Renderer
      const labelRenderer = new CSS2DRenderer();
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.domElement.style.position = 'absolute';
      labelRenderer.domElement.style.top = '0px';
      labelRenderer.domElement.style.pointerEvents = 'none';
      labelRendererRef.current = labelRenderer;
      container.appendChild(labelRenderer.domElement);
      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controlsRef.current = controls;
      controls.addEventListener('change', () => {
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
      });
      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 1, 0);
      scene.add(directionalLight);
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);
      // Animation loop
      let stop = false;
      const animate = () => {
        if (stop) return;
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
      };
      animate();
      // Cleanup
      return () => {
        stop = true;
        controls.dispose();
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
        if (container.contains(labelRenderer.domElement)) container.removeChild(labelRenderer.domElement);
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
        // Apply material
        object.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({ 
              color: 0xE6E6E6,
              metalness: 0.5, 
              roughness: 0.4 
            });
          }
        });
        // Center and fit camera only on first load
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));
        cameraZ *= 2; 
        camera.position.z = center.z + cameraZ; 
        controls.target.copy(center);
        scene.add(object);
        if (onObjectLoad) onObjectLoad(object);
        controls.update();
      }, undefined, () => {
        setError('Failed to load the model.');
      });
    }, [modelPath, onObjectLoad]);

    // Handle annotation markers and labels
    useEffect(() => {
      const scene = sceneRef.current;
      if (!scene) return;
      
      // Remove ALL annotation markers (both saved and pending)
      scene.children = scene.children.filter(child => !child.isAnnotationMarker);
      
      // Add delicate 3D markers and CSS2D labels for each SAVED annotation
      annotations.forEach((annotation, idx) => {
        // Smaller, more delicate marker
        const geometry = new THREE.SphereGeometry(0.03, 12, 12);
        const material = new THREE.MeshBasicMaterial({ 
          color: selectedAnnotation === idx ? 0xff6b6b : 0x4ecdc4,
          transparent: true,
          opacity: 0.9
        });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(annotation.worldPosition);
        marker.isAnnotationMarker = true;
        scene.add(marker);
        
        // Delicate CSS2D label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'annotation-label-saved';
        labelDiv.innerText = annotation.name;
        labelDiv.style.cssText = `
          background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9));
          color: #1e293b;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.08);
          cursor: pointer;
          transition: all 0.2s ease;
          pointer-events: auto;
          backdrop-filter: blur(10px);
          min-width: 40px;
          text-align: center;
          white-space: nowrap;
        `;
        
        labelDiv.onmouseenter = () => {
          labelDiv.style.transform = 'scale(1.05) translateY(-2px)';
          labelDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.15)';
          labelDiv.style.background = 'linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.95))';
        };
        labelDiv.onmouseleave = () => {
          labelDiv.style.transform = 'scale(1) translateY(0)';
          labelDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)';
          labelDiv.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9))';
        };
        labelDiv.onclick = (e) => {
          e.stopPropagation();
          setSelectedAnnotation(selectedAnnotation === idx ? null : idx);
        };
        
        const labelObj = new CSS2DObject(labelDiv);
        labelObj.position.copy(annotation.worldPosition.clone().add(new THREE.Vector3(0, 0.08, 0)));
        marker.add(labelObj);
      });
      
      // Add delicate pending annotation input (only one at a time)
      if (pendingAnnotation) {
        // Smaller, pulsing marker for pending annotation
        const geometry = new THREE.SphereGeometry(0.035, 12, 12);
        const material = new THREE.MeshBasicMaterial({ 
          color: 0x3b82f6,
          transparent: true,
          opacity: 0.8
        });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(pendingAnnotation.position);
        marker.isAnnotationMarker = true;
        scene.add(marker);
        
        // Delicate input container
        const inputContainer = document.createElement('div');
        inputContainer.className = 'annotation-input-container';
        inputContainer.style.cssText = `
          background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95));
          padding: 8px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.08);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          pointer-events: auto;
          backdrop-filter: blur(15px);
          min-width: 160px;
          max-width: 200px;
        `;
        
        // Delicate input field
        const input = document.createElement('input');
        input.type = 'text';
        input.value = pendingAnnotation.inputValue;
        input.placeholder = 'Name...';
        input.style.cssText = `
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 12px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
          background: rgba(255,255,255,0.9);
          margin-bottom: 6px;
          box-sizing: border-box;
          color: #1e293b;
        `;
        
        input.onfocus = () => {
          input.style.borderColor = '#3b82f6';
          input.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
          input.style.background = 'rgba(255,255,255,1)';
        };
        input.onblur = () => {
          input.style.borderColor = '#e2e8f0';
          input.style.boxShadow = 'none';
          input.style.background = 'rgba(255,255,255,0.9)';
        };
        
        input.oninput = (e) => {
          setPendingAnnotation({ ...pendingAnnotation, inputValue: e.target.value });
        };
        
        const saveAnnotation = () => {
          if (input.value.trim()) {
            setAnnotations(prev => [...prev, {
              name: input.value.trim(),
              worldPosition: pendingAnnotation.position.clone(),
              localPosition: pendingAnnotation.position.clone(),
              modelName: modelPath
            }]);
            // Clear pending annotation immediately to remove input box
            setPendingAnnotation(null);
          } else {
            // If empty, just remove the input box
            setPendingAnnotation(null);
          }
        };
        
        input.onkeydown = (e) => {
          e.stopPropagation(); // Prevent event bubbling
          if (e.key === 'Enter') {
            e.preventDefault();
            saveAnnotation();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setPendingAnnotation(null);
          }
        };
        
        // Delicate button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
          display: flex;
          gap: 4px;
          justify-content: flex-end;
        `;
        
        // Delicate save button
        const saveBtn = document.createElement('button');
        saveBtn.innerText = '✓';
        saveBtn.style.cssText = `
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          min-width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        saveBtn.onmouseenter = () => {
          saveBtn.style.transform = 'scale(1.05)';
          saveBtn.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
        };
        saveBtn.onmouseleave = () => {
          saveBtn.style.transform = 'scale(1)';
          saveBtn.style.boxShadow = 'none';
        };
        saveBtn.onclick = (e) => {
          e.stopPropagation(); // Prevent event bubbling
          saveAnnotation();
        };
        
        // Delicate cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = '✕';
        cancelBtn.style.cssText = `
          background: rgba(248,250,252,0.8);
          color: #64748b;
          border: 1px solid #e2e8f0;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          min-width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        cancelBtn.onmouseenter = () => {
          cancelBtn.style.background = '#f1f5f9';
          cancelBtn.style.transform = 'scale(1.05)';
          cancelBtn.style.color = '#ef4444';
        };
        cancelBtn.onmouseleave = () => {
          cancelBtn.style.background = 'rgba(248,250,252,0.8)';
          cancelBtn.style.transform = 'scale(1)';
          cancelBtn.style.color = '#64748b';
        };
        cancelBtn.onclick = (e) => {
          e.stopPropagation(); // Prevent event bubbling
          setPendingAnnotation(null);
        };
        
        // Assemble the input container
        inputContainer.appendChild(input);
        buttonContainer.appendChild(saveBtn);
        buttonContainer.appendChild(cancelBtn);
        inputContainer.appendChild(buttonContainer);
        
        const labelObj = new CSS2DObject(inputContainer);
        labelObj.position.copy(pendingAnnotation.position.clone().add(new THREE.Vector3(0, 0.1, 0)));
        marker.add(labelObj);
        
        // Auto-focus the input
        setTimeout(() => input.focus(), 100);
      }
    }, [annotations, selectedAnnotation, pendingAnnotation, modelPath]);

    // Handle scene clicks for annotations
    useEffect(() => {
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      let currentObject = currentObjectRef.current;
      const onClick = (event) => {
        const mouse = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        currentObject = currentObjectRef.current;
        const modelChildren = currentObject ? currentObject.children : [];
        const intersects = raycaster.intersectObjects(modelChildren, true);
        if (intersects.length > 0) {
          const intersect = intersects[0];
          // Always replace any existing pending annotation
          setPendingAnnotation({ position: intersect.point.clone(), inputValue: '' });
        }
      };
      if (renderer) {
        renderer.domElement.addEventListener('click', onClick);
      }
      return () => {
        if (renderer) {
          renderer.domElement.removeEventListener('click', onClick);
        }
      };
    }, [modelPath]);

    // Function to adjust camera to fit the object
    const adjustCameraToObject = (object) => {
      if (!object || !cameraRef.current || !controlsRef.current) return;
      
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const cameraZ = Math.abs(maxSize / (2 * Math.tan(fov / 2)));
      
      camera.position.z = center.z + cameraZ * 1.5;
      controls.target.copy(center);
      controls.update();
    };

    /**
     * Handle the loading of an object from a file input event.
     *
     * @param {Event} event - the event triggered by the file input
     * @return {void} 
     */
    const handleLoadObject = (event) => {
      const file = event.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        const loader = new OBJLoader();
        loader.load(url, (object) => {
          // Clean up previous object
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
          adjustCameraToObject(object); // Ensure the camera fits the new object
          if (onObjectLoad) onObjectLoad(object);
        }, undefined, (loadError) => {
          console.error('Failed to load the model:', loadError);
          setError('Failed to load the model.');
        });
      }
    };
  
    // Return the JSX. It includes a file input for loading .obj files and a div that will contain the Three.js canvas.
    return (
      <div ref={mountRef} style={{ width: '100%', height: '100vh', position: 'relative', background: '#000' }}>
        {error && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            zIndex: 1000
          }}>
            {error}
          </div>
        )}
        
        <input
          type="file"
          onChange={handleLoadObject}
          accept=".obj"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'linear-gradient(135deg, #1f2937, #374151)',
            color: 'white',
            border: '1px solid #4b5563',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            cursor: 'pointer',
            zIndex: 1000
          }}
        />
        
        {/* Professional Sidebar */}
        <div ref={sidebarRef} style={{
          position: 'absolute',
          right: '0',
          top: '0',
          width: '320px',
          height: '100vh',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          zIndex: 100,
          overflowY: 'auto',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            padding: '24px 20px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#f1f5f9'
            }}>
              Annotations
            </h3>
            <p style={{
              margin: '0',
              fontSize: '13px',
              color: '#94a3b8',
              lineHeight: '1.4'
            }}>
              {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} on this model
            </p>
          </div>
          
          <div style={{ padding: '16px 20px' }}>
            {annotations.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#64748b'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  opacity: '0.5'
                }}>
                  📍
                </div>
                <p style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  No annotations yet
                </p>
                <p style={{
                  margin: '0',
                  fontSize: '12px',
                  lineHeight: '1.4'
                }}>
                  Click on the 3D model to add your first annotation
                </p>
              </div>
            ) : (
              annotations.map((annotation, idx) => (
                <div 
                  key={idx} 
                  style={{
                    marginBottom: '12px',
                    padding: '16px',
                    background: selectedAnnotation === idx 
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1))'
                      : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: selectedAnnotation === idx 
                      ? '1px solid rgba(59, 130, 246, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onClick={() => setSelectedAnnotation(selectedAnnotation === idx ? null : idx)}
                  onMouseEnter={(e) => {
                    if (selectedAnnotation !== idx) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAnnotation !== idx) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{
                      margin: '0',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#f1f5f9'
                    }}>
                      {annotation.name}
                    </h4>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: selectedAnnotation === idx ? '#ff6b6b' : '#4ecdc4'
                    }} />
                  </div>
                  
                  <div style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}>
                    x: {annotation.worldPosition.x.toFixed(3)}<br/>
                    y: {annotation.worldPosition.y.toFixed(3)}<br/>
                    z: {annotation.worldPosition.z.toFixed(3)}
                  </div>
                  
                  {selectedAnnotation === idx && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '12px',
                        color: '#93c5fd',
                        fontWeight: '500'
                      }}>
                        Annotation Details
                      </p>
                      <p style={{
                        margin: '0',
                        fontSize: '11px',
                        color: '#cbd5e1',
                        lineHeight: '1.4'
                      }}>
                        Created on {annotation.modelName ? 'this model' : 'unknown model'}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
}

// Export the component so it can be used in other parts of the application.
export default SceneComponent;