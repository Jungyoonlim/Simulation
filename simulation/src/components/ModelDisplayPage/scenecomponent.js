// Import necessary modules from React and Three.js.
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    const [error, setError] = useState('');
    const currentObject = useRef(null);

    // Adjust its gamma and tone mapping settings
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2; 
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1; 

    // Raycaster for handling click events
    const raycaster = new THREE.Raycaster();
  
    // Load the .obj file using Three.js's OBJLoader
    const objLoader = new OBJLoader();

      /**
     * Handle the loading of an object from a file input event.
     *
     * @param {Event} event - the event triggered by the file input
     * @return {void} 
     */
    const handleLoadObject = useCallback((event) => {
      const file = event.target.files[0];
      if (!file) {
        return;
      }

      const url = URL.createObjectURL(file);
      objLoader.load(url, (object) => {
        cleanObject(currentObject);
        currentObject.current = object;
        scene.add(object);
        if (onObjectLoad) {
          onObjectLoad(object);
        }
      }, undefined, (error) => {
        console.error('An error happened', error);
      });
    }, [onObjectLoad]);

    // Handle scene clicks
    const handleSceneClick = useCallback((event) => {
      // Corrected mouse vector definition
      const mouse = new THREE.Vector2();
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
          const intersection = intersects[0];
          const annotation = {
              position: intersection.point,
              name: 'Annotation'
          };
          // Maybe later when I need to save annotations: setCurrentAnnotation(annotation);
          if (onAnnotationCreate) {
              onAnnotationCreate(annotation);
          }
      }
  }, [camera, onAnnotationCreate, raycaster]);

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

    if (container && !container.contains(renderer.domElement)) {
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);
    }

    // Position the camera
    camera.position.z = 5

    // Add lighting to the scene
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);

    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.add(pointLight);

    // Set up orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);

    if (modelPath) {
      const objLoader = new OBJLoader();
      objLoader.load(modelPath, (object) => {
          // Clean up any previously loaded object
          if (currentObject.current) {
              cleanObject(currentObject.current);
          }
          // Assign the newly loaded object to the ref
          currentObject.current = object;
  
          // Apply material to each mesh in the object
          object.traverse((child) => {
              if (child.isMesh) {
                  child.material = new THREE.MeshStandardMaterial({
                      color: 0xE6E6E6,
                      metalness: 0.5,
                      roughness: 0.4,
                  });
              }
          });
  
          // Calculate and adjust the camera position based on the object's bounding box
          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = camera.fov * (Math.PI / 180);
          let cameraZ = maxDim / 2 / Math.tan(fov / 2);
          cameraZ *= 1.5; // Increase distance so object is fully visible
          camera.position.z = center.z + cameraZ;
  
          // Update controls to orbit around the center of the new object
          controls.target.copy(center);
  
          // Add the object to the scene
          scene.add(object);
  
          // Notify parent component that the object has been loaded
          if (onObjectLoad) {
              onObjectLoad(object);
          }
      }, undefined, (error) => {
          console.error('An error happened:', error);
          setError('Failed to load the model.');
      });
  }
  

    // Animation Loop
    let frameId; 
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      controls.update();
    };
    animate();

    // Handle clicks for annotations 
    const onClick = (event) => {
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * -2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0) {
        const intersection = intersects[0];
        const annotation = {
          position: intersection.point,
          name: 'Annotation'
        };
        createMarker(intersection.point);
        setAnnotations(prevAnnotations => [...prevAnnotations, annotation]);
        onAnnotationCreate(annotation);
      }
    };
    
    }

    // Add event listener for the click event
    const domElement = renderer.domElement;
    domElement.addEventListener('click', handleSceneClick);

    // Clean up
    return () => {
      cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener('click', handleSceneClick);
    };
}, [handleSceneClick, modelPath, onObjectLoad, scene]);

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