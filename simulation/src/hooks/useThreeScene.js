import { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';

export function useThreeScene(options = {}){
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const requestIdRef = useRef(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize Scene: Set up scene, camera, renderer 
    const initializeScene = useCallback((container) => {
        if (!container) return; 

        if (!cameraRef.current){
            // Create camera 
            const camera = new THREE.PerspectiveCamera(
                fov,
                aspect,
                nearPlane,
                farPlane
            );
            camera.position.z = 5; 
        }
        // Set up scene
        const scene = new THREE.Scene();


        if (!rendererRef.current){
            // Create renderer 
            const renderer = new THREE.WebGLRenderer({ 
                antialias: true 
            });
            renderer.setSize(width, height);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.appendChild(renderer.domElement);
        }
        setIsInitialized(true);
        return true;
    }, [])

    // handle Resize: Update on window resize 
    const handleResize = useCallback(() => {

    }, []);

    // Begin render loop


    // Clean up render loop


    // Helper to add objects 


}