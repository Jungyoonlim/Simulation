// Import necessary modules from React and Three.js.
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// Define the SceneComponent. It's a functional component that takes props. 
// The "onObjectLoad" prop is a function that will be called when an object is loaded.
const SceneComponent = ({ onObjectLoad }) => {
  // useRef is a hook that allows you to persist values between renders without causing a re-render.
  const mountRef = useRef(null);

  // useState is a hook that lets you add React state to functional components.
  // We initialize the Three.js scene, camera, renderer, and object loader.
  const [scene] = useState(new THREE.Scene());
  const [camera] = useState(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
  const [renderer] = useState(new THREE.WebGLRenderer());
  const [objectLoader] = useState(new OBJLoader());

  // useEffect is a hook that lets you perform side effects in functional components.
  // It's a place where you can interact with the Three.js library, which is outside of React's purview.
  useEffect(() => {
    // Set up the renderer size and append its DOM element to the ref we defined.
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

  // Define a function to handle the .obj file loading. It uses the FileReader API to read the contents of the file.
  const handleLoadObject = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
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
        style={{ position: 'absolute', zIndex: 1 }}
      />
      <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
    </>
  );
};

// Export the component so it can be used in other parts of the application.
export default SceneComponent;
