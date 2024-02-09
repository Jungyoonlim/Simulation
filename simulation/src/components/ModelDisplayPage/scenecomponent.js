// Import necessary modules from React and Three.js.
import './SceneComponent.css'; 
import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * This function is a React component that sets up a Three.js scene and allows for loading .obj files.
 *
 * @param {function} onObjectLoad - a callback function to be called when the .obj file is loaded
 * @return {JSX} - the JSX for the file input and Three.js canvas
 */
function SceneComponent({ modelPath, onObjectLoad, onAnnotationCreate }) {
    const mountRef = useRef(null);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const [annotations, setAnnotations] = useState([]);
    const [hoverMarker, setHoverMarker] = useState(null); 
    let currentModelName = useRef('');

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

    useEffect(() => {
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
    
      // OrbitControls for camera interaction
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.addEventListener('change', () => renderer.render(scene, camera)); // Use if there's no animation loop
    
      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
      };
      animate();
    
      // Load model if modelPath is provided
      if (modelPath) {
        const objLoader = new OBJLoader;

        // Load the .obj file 
        objLoader.load(modelPath, (object) => {
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

      /**
       * Converts a 3D position in the scene to 2D screen coordinates. 
       * 
       * @param {THREE.Vector3} position - The 3D Position to convert.
       * @param {THREE.Camera} camera - The Three.js camera. 
       * @param {HTMLElement} canvas - The canvas element where the scene is rendered.
       * @return {THREE.Vector2} - The 2D position on the screen. 
       */
      const toScreenPosition = (position, camera, canvas) => {
        const vector = new THREE.Vector3(position.x, position.y, position.z);
        vector.project(camera);

        vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
        vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

        return vector;
      }
    
      // Handle scene clicks for annotations
      const onClick = (event) => {
        // Get the mouse position
        const mouse = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        );
    
        // Create a raycaster and cast a ray from the mouse position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        if (hoverMarker){
          scene.remove(hoverMarker);
          setHoverMarker(null); 
        }

        const intersects = raycaster.intersectObjects(scene.children, true);
  
        if (intersects.length > 0) {
          const intersect = intersects[0];
          const geometry = new THREE.SphereGeometry(0.1, 32, 32);
          const material = new THREE.MeshBasicMaterial({
              color: 0x00FF00,
              transparent: true,
              opacity: 0.5
          });
          const marker = new THREE.Mesh(geometry, material);
          marker.position.copy(intersect.point);
          scene.add(marker);
          setHoverMarker(marker);

          const annotationName = prompt("Enter annotation name:", `Annotation ${annotations.length + 1}`);

          const screenPosition = toScreenPosition(intersect.point, camera, renderer.domElement);
          if (annotationName) {
            const annotation = {
              name: annotationName,
              modelName: modelPath, 
              position: intersect.point,
              screenPosition: screenPosition
            };
            setAnnotations(prevAnnotations => [...prevAnnotations, annotation]);
            createMarker(intersect.point);
          }
        }
      };
    
      renderer.domElement.addEventListener('click', onClick);
    
      // Cleanup function
      return () => {
        cancelAnimationFrame(animate);
        renderer.domElement.removeEventListener('click', onClick);
        if (hoverMarker) scene.remove(hoverMarker); 
        controls.dispose();
        if (container && container.contains(renderer.domElement))container.removeChild(renderer.domElement);
      };
    }, [modelPath, onObjectLoad, annotations]);
    

  /**
   * Handle the loading of an object from a file input event.
   *
   * @param {Event} event - the event triggered by the file input
   * @return {void} 
   */
  const handleLoadObject = (event) => {
    const file = event.target.files[0];
    if (!file) return; 
    currentModelName.current=file.name; 

    const url = URL.createObjectURL(file);
    objLoader.load(url, (object) => {
      cleanObject(currentObject);
      currentObject = object;
      scene.add(object);
      if (onObjectLoad) onObjectLoad(object);
    }, undefined, (error) => {
      console.error('Failed to load the model.', error);
    });
  };

    // Return the JSX. It includes a file input for loading .obj files and a div that will contain the Three.js canvas.
    return (
      <div ref={mountRef} style={{ width: '100%', height: '100vh' }}>
        {error && <div className="error-message">{error}</div>}
        <input
          type="file"
          onChange={handleLoadObject}
          accept=".obj"
          className="choose-file-button"
      />
          {annotations.map((annotation, index) => (
                <div className="annotation-marker" key={index} style={{ 
                    position: 'absolute', 
                    left: `${annotation.position.x}px`, 
                    top: `${annotation.position.y}px` 
                }}>
                    {annotation.name}
                </div>
            ))}
            <div className="annotation-list">
            {annotations.map((annotation, index) => (
              <div className="annotation-marker" key={index} style={{ 
                  position: 'absolute', 
                  left: `${annotation.screenPosition.x}px`, 
                  top: `${annotation.screenPosition.y}px` 
              }}>
                  {annotation.name}
              </div>
            ))}
            </div>
    </div>
    );
}


// Export the component so it can be used in other parts of the application.
export default SceneComponent;