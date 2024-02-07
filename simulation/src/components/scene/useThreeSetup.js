import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const useThreeSetup = (onObjectLoad) => {
    const mountRef = useRef(null);
    const [scene] = useState(new THREE.Scene());
    const [camera] = useState(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
    const [renderer] = useState(new THREE.WebGLRenderer());

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

    return {
        scene,
        camera,
        renderer,
        mountRef
    };
}

export default useThreeSetup; 