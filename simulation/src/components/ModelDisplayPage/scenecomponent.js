// Import necessary modules from React and Three.js.
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
function SceneComponent({ modelPath, onObjectLoad }) {
    const mountRef = useRef(null);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // Adjust its gamma and tone mapping settings
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2; 
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1; 
  
    // Load the .obj file using Three.js's OBJLoader
    const objLoader = new OBJLoader();
    const [error, setError] = useState('');
    let currentObject = null;

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

  useEffect(() => {
    const container = mountRef.current; 

    // Append the renderer's DOM element to the container only if it's not already there. 
    if (container){
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);
  
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
  
      const controls = new OrbitControls(camera, renderer.domElement); 
      // Define an animation loop to render the scene.
      const animate = () => {
        requestAnimationFrame(animate); 

        if (controls.enabled && controls.update()) {
          renderer.render(scene, camera);
        }
      };
      animate();
  
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
          if (onObjectLoad) {
            onObjectLoad(object);
          }

          // Update the controls and render the scene
          controls.update();

        }, undefined, (error) => {
          console.error('An error happened', error);
          setError('Failed to load the model.');
        });
      }
  
      // Return a cleanup function to remove the renderer's DOM element when the component unmounts.
      return () => {
        controls.dispose();

        if (container && container.contains(renderer.domElement)){
          container.removeChild(renderer.domElement);
        }
      };
    }
  }, [modelPath, onObjectLoad]); // The array here lists dependencies which, when changed, will re-run the effect.

  /**
   * Handle the loading of an object from a file input event.
   *
   * @param {Event} event - the event triggered by the file input
   * @return {void} 
   */
  const handleLoadObject = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const url = URL.createObjectURL(file);
    objLoader.load(url, (object) => {
      cleanObject(currentObject);
      currentObject = object;
      scene.add(object);
      if (onObjectLoad) {
        onObjectLoad(object);
      }
    }, undefined, (error) => {
      console.error('An error happened', error);
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
    </div>
    );
}


// Export the component so it can be used in other parts of the application.
export default SceneComponent;