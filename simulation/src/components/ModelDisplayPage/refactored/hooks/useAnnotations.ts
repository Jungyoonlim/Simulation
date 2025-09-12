import { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { UseAnnotationsOptions, UseAnnotationsReturn, Annotation, PendingAnnotation, AnnotationCreateData } from '../types';
import { annotationService } from '../services/annotationService';
import { analytics } from '../services/analyticsService';

export function useAnnotations(options: UseAnnotationsOptions = {}): UseAnnotationsReturn {
  const { projectId, modelPath } = options;
  
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<number | null>(null);
  const [pendingAnnotation, setPendingAnnotation] = useState<PendingAnnotation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load annotations from database
  useEffect(() => {
    if (projectId) {
      loadAnnotations();
      
      // Subscribe to real-time updates
      const subscription = annotationService.subscribe(projectId, handleAnnotationChange);
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [projectId]);

  const loadAnnotations = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await annotationService.list(projectId);
      if (error) throw error;
      
      if (data) {
        setAnnotations(data.map(ann => ({
          ...ann,
          worldPosition: new THREE.Vector3(ann.worldPosition.x, ann.worldPosition.y, ann.worldPosition.z)
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load annotations');
      analytics.trackError(err as Error, { context: 'loadAnnotations' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnnotationChange = useCallback((payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newAnn = payload.new;
      setAnnotations(prev => [...prev, {
        ...newAnn,
        worldPosition: new THREE.Vector3(newAnn.position.x, newAnn.position.y, newAnn.position.z)
      }]);
    } else if (payload.eventType === 'UPDATE') {
      setAnnotations(prev => prev.map(ann => 
        ann.id === payload.new.id ? {
          ...payload.new,
          worldPosition: new THREE.Vector3(payload.new.position.x, payload.new.position.y, payload.new.position.z)
        } : ann
      ));
    } else if (payload.eventType === 'DELETE') {
      setAnnotations(prev => prev.filter(ann => ann.id !== payload.old.id));
    }
  }, []);

  const generateAnnotationId = () => {
    return `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const createAnnotation = async (pendingAnnotation: PendingAnnotation) => {
    if (!pendingAnnotation.inputValue?.trim()) return;
    
    const newAnnotation: Annotation = {
      id: generateAnnotationId(),
      name: pendingAnnotation.inputValue.trim(),
      type: pendingAnnotation.annotationType || 'general',
      worldPosition: pendingAnnotation.position.clone(),
      modelName: modelPath,
      createdAt: new Date().toISOString(),
      author: 'Current User', // In real app, get from auth
      tags: [],
      visibility: 'public',
      aiConfidence: pendingAnnotation.aiSuggestion?.metadata?.confidence,
      aiSuggestion: pendingAnnotation.aiSuggestion
    };
    
    // Optimistically update local state
    setAnnotations(prev => [...prev, newAnnotation]);
    setPendingAnnotation(null);
    
    // Save to database if project exists
    if (projectId) {
      try {
        const createData: AnnotationCreateData = {
          name: pendingAnnotation.inputValue.trim(),
          type: pendingAnnotation.annotationType || 'general',
          position: {
            x: pendingAnnotation.position.x,
            y: pendingAnnotation.position.y,
            z: pendingAnnotation.position.z
          },
          aiConfidence: pendingAnnotation.aiSuggestion?.metadata?.confidence,
          aiSuggestion: pendingAnnotation.aiSuggestion
        };
        
        const { data, error } = await annotationService.create(projectId, createData);
        
        if (error) throw error;
        
        if (data) {
          // Update local annotation with database ID
          setAnnotations(prev => prev.map(ann => 
            ann.id === newAnnotation.id ? { ...ann, id: data.id } : ann
          ));
          
          analytics.trackEvent('annotation_created', {
            type: pendingAnnotation.annotationType,
            ai_assisted: !!pendingAnnotation.aiSuggestion,
            confidence: pendingAnnotation.aiSuggestion?.metadata?.confidence
          });
        }
      } catch (err) {
        // Rollback on error
        setAnnotations(prev => prev.filter(ann => ann.id !== newAnnotation.id));
        setError('Failed to save annotation');
        analytics.trackError(err as Error, { context: 'createAnnotation' });
      }
    }
  };

  const updateAnnotation = async (id: string, data: Partial<AnnotationCreateData>) => {
    if (!projectId) return;
    
    try {
      const { error } = await annotationService.update(projectId, id, data);
      if (error) throw error;
      
      analytics.trackEvent('annotation_updated', { id });
    } catch (err) {
      setError('Failed to update annotation');
      analytics.trackError(err as Error, { context: 'updateAnnotation' });
    }
  };

  const deleteAnnotation = async (id: string) => {
    // Find the annotation to delete
    const annotationToDelete = annotations.find(ann => ann.id === id);
    if (!annotationToDelete) return;
    
    // Optimistically remove from local state
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    setSelectedAnnotation(null);
    
    if (projectId) {
      try {
        const { error } = await annotationService.delete(projectId, id);
        if (error) throw error;
        
        analytics.trackEvent('annotation_deleted', { id });
      } catch (err) {
        // Rollback on error
        if (annotationToDelete) {
          setAnnotations(prev => [...prev, annotationToDelete]);
        }
        setError('Failed to delete annotation');
        analytics.trackError(err as Error, { context: 'deleteAnnotation' });
      }
    }
  };

  const selectAnnotation = useCallback((index: number | null) => {
    setSelectedAnnotation(index);
  }, []);

  const hoverAnnotation = useCallback((index: number | null) => {
    setHoveredAnnotation(index);
  }, []);

  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
    setSelectedAnnotation(null);
    setHoveredAnnotation(null);
    setPendingAnnotation(null);
  }, []);

  const exportAnnotations = useCallback(() => {
    const exportData = {
      modelPath: modelPath,
      timestamp: new Date().toISOString(),
      annotations: annotations.map(ann => ({
        id: ann.id,
        name: ann.name,
        type: ann.type,
        position: {
          x: ann.worldPosition.x,
          y: ann.worldPosition.y,
          z: ann.worldPosition.z
        },
        createdAt: ann.createdAt,
        author: ann.author,
        tags: ann.tags,
        visibility: ann.visibility
      }))
    };
    
    analytics.trackEvent('annotations_exported', { count: annotations.length });
    return exportData;
  }, [annotations, modelPath]);

  return {
    annotations,
    selectedAnnotation,
    hoveredAnnotation,
    pendingAnnotation,
    isLoading,
    error,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    selectAnnotation,
    hoverAnnotation,
    setPendingAnnotation,
    clearAnnotations,
    exportAnnotations
  };
}
