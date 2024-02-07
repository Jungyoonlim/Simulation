// Import necessary modules from React and Three.js.
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

/**
 * This function is a React component that sets up a Three.js scene and allows for loading .obj files.
 *
 * @param {function} onObjectLoad - a callback function to be called when the .obj file is loaded
 * @return {JSX} - the JSX for the file input and Three.js canvas
 */
const SceneComponent = ({ onObjectLoad }) => {
    const mountRef = useRef(null);
    const [scene] = useState(new THREE.Scene());
    const [camera] = useState(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
    const [renderer] = useState(new THREE.WebGLRenderer());
    const [objectLoader] = useState(new OBJLoader());
    const [currentObject, setCurrentObject] = useState(null); 

  useEffect(() => {
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

    // Return a cleanup function to remove the renderer's DOM element when the component unmounts.
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [camera, renderer, scene]); // The array here lists dependencies which, when changed, will re-run the effect.

  const handleLoadObject = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    
    if (currentObject) {
      scene.remove(currentObject);
      // Dispose of the object if necessary to free up memory
      if (currentObject.geometry) currentObject.geometry.dispose();
      if (currentObject.material) currentObject.material.dispose();
      // If the object has children like a group, you may need to dispose of their geometries and materials as well
      currentObject.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
      setCurrentObject(null); // Clear the current object
    }

    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      const content = e.target.result;
      // Use the OBJLoader to parse the content of the .obj file.
      const object = objectLoader.parse(content);
      // Apply a material to all meshes in the object.
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshNormalMaterial();
        }
      });

      setCurrentObject(object);
      // Add the loaded object to the scene.
      scene.add(object);
      // Call the "onObjectLoad" prop function to notify the parent component that the object has been loaded.
      onObjectLoad(object);
    };
  };

  // Return the JSX. It includes a file input for loading .obj files and a div that will contain the Three.js canvas.
  return (
    <>
      <input
        type="file"
        onChange={handleLoadObject}
        accept=".obj"
        className="choose-file-button"
      />
      <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
    </>
  );
};

// Export the component so it can be used in other parts of the application.
export default SceneComponent;