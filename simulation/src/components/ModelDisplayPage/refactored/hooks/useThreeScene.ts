import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { threeService } from '../services/threeService';
import { UseThreeSceneOptions, UseThreeSceneReturn } from '../types';
import { analytics } from '../services/analyticsService';

export function useThreeScene(options: UseThreeSceneOptions = {}): UseThreeSceneReturn {
  const { modelPath, onObjectLoad } = options;
  
  const mountRef = useRef<HTMLDivElement>(null);
  const [sceneRefs, setSceneRefs] = useState<SceneRefs>({
    scene: null,
    camera: null,
    renderer: null,
    labelRenderer: null,
    controls: null,
    currentObject: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const refs = threeService.initialize(mountRef.current);
    setSceneRefs(refs);

    return () => {
      threeService.dispose();
    };
  }, []);

  // Load model when modelPath changes
  useEffect(() => {
    if (modelPath && sceneRefs.scene) {
      loadModel(modelPath);
    }
  }, [modelPath, sceneRefs.scene]);

  const loadModel = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      const object = await threeService.loadModel(path);
      
      const loadTime = performance.now() - startTime;
      analytics.trackTiming('model_loading', 'obj_file', loadTime);
      
      if (onObjectLoad) {
        onObjectLoad(object);
      }
      
      analytics.trackEvent('model_loaded', {
        path,
        success: true,
        loadTime
      });
    } catch (err) {
      const errorMessage = `Failed to load model from: ${path}. Please ensure the file exists and is a valid format.`;
      setError(errorMessage);
      
      if (onObjectLoad) {
        onObjectLoad(null);
      }
      
      analytics.trackError(err as Error, { 
        context: 'loadModel', 
        path 
      });
      
      analytics.trackEvent('model_load_failed', {
        path,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [onObjectLoad]);

  const loadModelFromFile = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    
    try {
      await loadModel(url);
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [loadModel]);

  const raycast = useCallback((mouse: THREE.Vector2, objects?: THREE.Object3D[]): THREE.Intersection[] => {
    return threeService.raycast(mouse, objects);
  }, []);

  return {
    mountRef,
    sceneRefs,
    isLoading,
    error,
    loadModel,
    loadModelFromFile,
    raycast
  };
}
