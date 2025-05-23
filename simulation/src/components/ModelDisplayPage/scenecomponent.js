import './SceneComponent.css'; 
import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import PropTypes from 'prop-types';


  // Function to convert 3D position to 2D screen coordinates, defined inside the component
  const toScreenPosition = (position, camera, canvas) => {
      const vector = new THREE.Vector3(position.x, position.y, position.z);
      vector.project(camera);

      vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
      vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

      return { x: vector.x, y: vector.y };
  };
  
/**
 * This function is a React component that sets up a Three.js scene and allows for loading .obj files.
 *
 * @param {function} onObjectLoad - a callback function to be called when the .obj file is loaded
 * @return {JSX} - the JSX for the file input and Three.js canvas
 */
function SceneComponent({ modelPath, onObjectLoad }) {
    const mountRef = useRef(null);
    const sidebarRef = useRef(null);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const labelRenderer = new CSS2DRenderer();
    const [annotations, setAnnotations] = useState([]);
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [hoverMarker, setHoverMarker] = useState(null); 
    // let currentModelName = useRef('');

    SceneComponent.propTypes = {
        modelPath: PropTypes.string.isRequired,
        onObjectLoad: PropTypes.func,
    }

    // Adjust its gamma and tone mapping settings
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2; 
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1; 
  
    // Load the .obj file using Three.js's OBJLoader
    const objLoader = new OBJLoader();
    const [error, setError] = useState('');
    let currentObject = null;


    // Function to adjust camera to fit the object
    const adjustCameraToObject = (object) => {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const cameraZ = Math.abs(maxSize / (2 * Math.tan(fov / 2)));
      camera.position.z = center.z + cameraZ * 1.5; // Adjust camera distance
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(center.x, center.y, center.z);
      controls.update();
    };

    /**
     * Clean up the object from the scene.
     *
     * @param {Object} object - the object to be cleaned up
     * @return {void} `
     */
    const cleanObject = (object) => {
      if (object) {
        scene.remove(object);
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose(); 
        object.traverse(child => {
          if (child.isMesh) {
            child.geometry.dispose();
            child.material.dispose();
          }
        })
      }
    }

    /** Create a marker at the specified position 
     * @param {THREE.Vector3} position - the position of the marker
     * @return {void}
    */
    const createMarker = (position) => {
      const geometry = new THREE.SphereGeometry(0.1, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
      const marker = new THREE.Mesh(geometry, material);
      marker.position.copy(position);
      scene.add(marker);
    };

    // eslint-disable-next-line no-unused-vars
    const createAnnotation = async (annotation) => {
      const annotationData = {
        modelName: modelPath,
        position_x: annotation.position.x,
        position_y: annotation.position.y,
        position_z: annotation.position.z,
        text: annotation.text
      };
      fetch('http://localhost:5000/annotations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(annotationData),
    })
    .then(response => response.json())
    .then(data => console.log('Annotation added:', data))
    .catch((error) => console.error('Error:', error));
    }

    useEffect(() => {
          // Function to convert 3D position to 2D screen coordinates.
      const container = mountRef.current;
      if (container && !container.contains(renderer.domElement)) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
      }
    
    // Position the camera
    camera.position.z = 5;

    // Add ambient light to the scene for basic lighting.
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Add directional light to the scene
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Add point light for lighting the scene
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Function to update annotation screen positions  
    const updateAnnotationScreenPositions = () => {
      annotations.forEach(annotation => {
        const screenPosition = toScreenPosition(annotation.worldPosition, camera, renderer.domElement);
        if (annotation.markerElement) {
          annotation.markerElement.style.left = `${screenPosition.x}px`;
          annotation.markerElement.style.top = `${screenPosition.y}px`;
        }
      });
    };

    // Render function that updates both the scene and the annotations
    const render = () => {
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };

    // OrbitControls for camera interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);

    // Animation loop
    const animate = () => {
      if (!mountRef.current) return; 
      requestAnimationFrame(animate);
      render();
    };
    animate();
    
      // Load model if modelPath is provided
      if (modelPath) {
        const loader = new OBJLoader();

        // Load the .obj file 
        loader.load(modelPath, (object) => {
          cleanObject(currentObject); 
          currentObject = object;
              
            // Apply a new material to each child mesh within the loaded object
          object.traverse(child => {
            if (child instanceof THREE.Mesh) {
              child.material = new THREE.MeshStandardMaterial({ 
              color: 0xE6E6E6,
              metalness: 0.5, 
              roughness: 0.4 
            });
          }
        });

          // Calculate the bounding box and center of the object
          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = camera.fov * (Math.PI / 180);
          let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));

          cameraZ *= 2; 
          camera.position.z = center.z + cameraZ; 

          // Update the OrbitControls target to the center of the object
          controls.target.copy(center);

          // Add the object to the scene
          scene.add(object);

          // Call the onObjectLoad callback if provided
          if (onObjectLoad) onObjectLoad(object);

          // Update the controls and render the scene
          controls.update();

          },
          undefined,
          error => {
            console.error('An error happened:', error);
            setError('Failed to load the model.');
          }
        );
      }
    
      // Handle scene clicks for annotations
      const onClick = (event) => {
        const mouse = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        );
    
        // Create a raycaster and cast a ray from the mouse position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        // Example: Only intersect with the main loaded model
        const modelChildren = currentObject ? currentObject.children : [];
        const intersects = raycaster.intersectObjects(modelChildren, true);

        if (intersects.length > 0) {
          const intersect = intersects[0];
          // Convert to model-local coordinates
          const localPosition = intersect.object.worldToLocal(intersect.point.clone());

          // Optionally create a 3D marker or store local coordinates
          createMarker(intersect.point);

          console.log('World coords:', intersect.point);
          console.log('Local coords:', localPosition);

          // Store local coords if you want them to remain accurate upon transformations
          const annotation = {
            name: 'New Annotation',
            localPosition,   // store local
            worldPosition: intersect.point,  // store world
            modelName: modelPath
          };

          setAnnotations(prev => [...prev, annotation]);
        }
      };
    
      renderer.domElement.addEventListener('click', onClick);
    
      // Cleanup function
      return () => {
        cancelAnimationFrame(animate);
        controls.removeEventListener('change', updateAnnotationScreenPositions);
        renderer.domElement.removeEventListener('click', onClick);
        if (hoverMarker) scene.remove(hoverMarker); 
        controls.dispose();
        if (container && container.contains(renderer.domElement))container.removeChild(renderer.domElement);
        if (container && container.contains(labelRenderer.domElement)) container.removeChild(labelRenderer.domElement);
      };
    }, [modelPath, onObjectLoad, annotations, selectedAnnotation]); 
    

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
      objLoader.load(url, (object) => {
        // Clean up previous object
        cleanObject(currentObject);
        currentObject = object;
        scene.add(object);
        adjustCameraToObject(object); // Ensure the camera fits the new object
        if (onObjectLoad) onObjectLoad(object);
      }, undefined, (error) => {
        console.error('Failed to load the model:', error);
        setError('Failed to load the model.');
      });
    }
  };
  

    // Return the JSX. It includes a file input for loading .obj files and a div that will contain the Three.js canvas.
    return (
      <div ref={mountRef} style={{ width: '100%', height: '100vh', position: 'relative' }}>
        {error && <div className="error-message">{error}</div>}
        <input
          type="file"
          onChange={handleLoadObject}
          accept=".obj"
          className="choose-file-button"
        />
        {/* Sidebar annotation list */}
        <div ref={sidebarRef} style={{ position: 'absolute', left: 0, top: 0, width: '250px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', zIndex: 10, maxHeight: '100vh', overflowY: 'auto' }}>
          <h4>Annotations</h4>
          {annotations.map((annotation, idx) => (
            <div key={idx} style={{ marginBottom: '8px', cursor: 'pointer', fontWeight: selectedAnnotation === idx ? 'bold' : 'normal' }} onClick={() => setSelectedAnnotation(idx)}>
              {annotation.name} <br />
              <span style={{ fontSize: '11px', color: '#ccc' }}>
                ({annotation.worldPosition.x.toFixed(2)}, {annotation.worldPosition.y.toFixed(2)}, {annotation.worldPosition.z.toFixed(2)})
              </span>
              {selectedAnnotation === idx && (
                <div style={{ marginTop: '4px', color: '#ff0' }}>Annotation details here</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
}

// Export the component so it can be used in other parts of the application.
export default SceneComponent;