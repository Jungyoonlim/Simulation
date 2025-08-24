import React, { useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { ViewportProps } from '../types';
import { autoSnapService } from '../../../../services/ai/autoSnap';
import { analytics } from '../services/analyticsService';
import { ANIMATION_CONFIG } from '../constants';
import styles from '../styles/Viewport.module.css';

export const Viewport: React.FC<ViewportProps> = ({
  mountRef,
  sceneRefs,
  isAnnotationMode,
  annotationType,
  aiSnapEnabled,
  onAnnotationClick,
  onAnnotationMarkerClick,
  onAnnotationMarkerHover
}) => {
  const handleClick = useCallback(async (event: MouseEvent) => {
    // Prevent creating new annotation if clicking on existing UI
    if ((event.target as HTMLElement).tagName === 'INPUT' || 
        (event.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }

    const { scene, camera, renderer, currentObject } = sceneRefs;
    if (!scene || !camera || !renderer) return;

    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Check for annotation marker clicks first
    const annotationMeshes = scene.children.filter(child => 
      child.userData.isAnnotation && child.userData.annotationIndex !== undefined
    );
    
    const annotationIntersects = raycaster.intersectObjects(annotationMeshes);
    if (annotationIntersects.length > 0) {
      const idx = annotationIntersects[0].object.userData.annotationIndex;
      onAnnotationMarkerClick(idx);
      return;
    }

    // Check for model clicks (only in annotation mode)
    if (isAnnotationMode && currentObject) {
      const intersects = raycaster.intersectObject(currentObject, true);
      if (intersects.length > 0) {
        let finalPosition = intersects[0].point.clone();
        let aiSuggestion = null;
        
        // Use AI auto-snap if enabled
        if (aiSnapEnabled && autoSnapService.isModelLoaded) {
          analytics.trackEvent('ai_snap_used', { 
            annotation_type: annotationType,
            model_type: 'slam_mesh' 
          });
          
          const snapResult = await autoSnapService.findSnapPoint(
            intersects[0].point,
            currentObject,
            annotationType
          );
          
          if (snapResult && snapResult.confidence > 0.5) {
            finalPosition = snapResult.position;
            aiSuggestion = snapResult.suggestion;
            
            // Visual feedback for snap
            const snapIndicator = new THREE.Mesh(
              new THREE.RingGeometry(
                ANIMATION_CONFIG.snapIndicator.innerRadius,
                ANIMATION_CONFIG.snapIndicator.outerRadius,
                ANIMATION_CONFIG.snapIndicator.segments
              ),
              new THREE.MeshBasicMaterial({ 
                color: ANIMATION_CONFIG.snapIndicator.color, 
                transparent: true, 
                opacity: ANIMATION_CONFIG.snapIndicator.opacity 
              })
            );
            snapIndicator.position.copy(finalPosition);
            snapIndicator.lookAt(camera.position);
            scene.add(snapIndicator);
            
            // Remove indicator after animation
            setTimeout(() => {
              scene.remove(snapIndicator);
            }, ANIMATION_CONFIG.snapIndicator.duration);
          }
        }
        
        onAnnotationClick({
          position: finalPosition,
          inputValue: aiSuggestion?.primary || '',
          aiSuggestion: aiSuggestion,
          annotationType: annotationType
        });
      }
    }
  }, [sceneRefs, isAnnotationMode, annotationType, aiSnapEnabled, onAnnotationClick, onAnnotationMarkerClick]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const { scene, camera, renderer } = sceneRefs;
    if (!scene || !camera || !renderer) return;

    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const annotationMeshes = scene.children.filter(child => 
      child.userData.isAnnotation && child.userData.annotationIndex !== undefined
    );
    
    const intersects = raycaster.intersectObjects(annotationMeshes);
    if (intersects.length > 0) {
      onAnnotationMarkerHover(intersects[0].object.userData.annotationIndex);
      renderer.domElement.style.cursor = 'pointer';
    } else {
      onAnnotationMarkerHover(null);
      renderer.domElement.style.cursor = isAnnotationMode ? 'crosshair' : 'default';
    }
  }, [sceneRefs, isAnnotationMode, onAnnotationMarkerHover]);

  useEffect(() => {
    const { renderer } = sceneRefs;
    if (!renderer) return;

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, [sceneRefs, handleClick, handleMouseMove]);

  // Initialize AI service
  useEffect(() => {
    autoSnapService.initialize();
  }, []);

  return <div ref={mountRef} className={styles.viewport} />;
};
