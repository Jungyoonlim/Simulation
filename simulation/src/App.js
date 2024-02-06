import React, { useState } from 'react';
import SceneComponent from './components/scene/scenecomponent'; // Ensure the correct path and casing
import './App.css'; // Assuming you have a CSS file for basic styling

const App = () => {
  // State for loading feedback
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const handleObjectLoadStart = () => {
    setIsLoading(true); // Start loading
    setLoadError(''); // Reset any previous errors
  };

  const handleObjectLoad = (object) => {
    console.log("Object loaded:", object);
    setIsLoading(false); // End loading
  };

  const handleObjectLoadError = (error) => {
    console.error("Loading error:", error);
    setLoadError('Failed to load object. Please try again.');
    setIsLoading(false); // End loading
  };

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh' }}>
      {isLoading && <div className="loading-indicator">Loading...</div>}
      {loadError && <div className="error-message">{loadError}</div>}
      <SceneComponent 
        onObjectLoad={handleObjectLoad} 
        onObjectLoadStart={handleObjectLoadStart}
        onObjectLoadError={handleObjectLoadError}
      />
    </div>
  );
};

export default App;



/**import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import SceneComponent from './components/scene/scenecomponent';

const App = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene, camera, and renderer setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Adding a cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    // Start animation loop
    animate();

    // Handle resize
    const handleResize = () => {
      const { clientWidth, clientHeight } = mountRef.current;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default App;
 */