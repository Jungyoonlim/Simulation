// Import necessary modules from React and Three.js.
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

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
    const renderer = new THREE.WebGLRenderer();
    const objLoader = new OBJLoader();
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
    if (container){
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);
  
      // Position the camera
      camera.position.z = 5;
  
      // Add ambient light to the scene for basic lighting.
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);
  
      // Define an animation loop to render the scene.
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
  
      if (modelPath) {
        const objLoader = new OBJLoader; 
        objLoader.load(modelPath, (object) => {
          cleanObject(currentObject);
          currentObject = object;
          scene.add(object);
          if (onObjectLoad) {
            onObjectLoad(object);
          }
        }, undefined, (error) => {
          console.error('An error happened', error);
        });
      }
  
      // Return a cleanup function to remove the renderer's DOM element when the component unmounts.
      return () => {
        container.removeChild(renderer.domElement);
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