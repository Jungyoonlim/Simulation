import React, { useCallback, useMemo } from 'react';
import { SceneComponentProps, PendingAnnotation } from './types';
import { useThreeScene } from './hooks/useThreeScene';
import { useAnnotations } from './hooks/useAnnotations';
import { useUIState } from './hooks/useUIState';
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { StatusBar } from './components/StatusBar';
import { ErrorToast } from './components/ErrorToast';
import { Viewport } from './components/Viewport';
import { AnnotationRenderer } from './components/AnnotationRenderer';
import styles from './styles/SceneComponent.module.css';

/**
 * Professional CAD-grade 3D annotation component
 * Designed for robotics SLAM mesh validation
 * 
 * Features:
 * - 3D model loading and visualization
 * - Interactive annotation system with AI auto-snap
 * - Real-time collaboration support
 * - Professional UI with keyboard shortcuts
 * - Export functionality for annotations
 */
export const SceneComponent: React.FC<SceneComponentProps> = ({
  modelPath,
  onObjectLoad,
  projectId
}) => {
  // Custom hooks for separation of concerns
  const {
    mountRef,
    sceneRefs,
    isLoading: modelLoading,
    error: modelError,
    loadModelFromFile
  } = useThreeScene({ modelPath, onObjectLoad });

  const {
    annotations,
    selectedAnnotation,
    hoveredAnnotation,
    pendingAnnotation,
    isLoading: annotationsLoading,
    error: annotationsError,
    createAnnotation,
    deleteAnnotation,
    selectAnnotation,
    hoverAnnotation,
    setPendingAnnotation,
    exportAnnotations
  } = useAnnotations({ projectId, modelPath });

  const {
    isAnnotationMode,
    annotationType,
    aiSnapEnabled,
    showAISuggestions,
    error: uiError,
    setAnnotationType,
    toggleAnnotationMode,
    toggleAiSnap,
    clearError
  } = useUIState();

  // Combined error state
  const error = modelError || annotationsError || uiError;

  // Handlers
  const handleAnnotationClick = useCallback((annotation: PendingAnnotation) => {
    setPendingAnnotation(null);
    setTimeout(() => setPendingAnnotation(annotation), 0);
  }, [setPendingAnnotation]);

  const handleAnnotationSave = useCallback(async (name: string) => {
    if (pendingAnnotation && name.trim()) {
      await createAnnotation({
        ...pendingAnnotation,
        inputValue: name
      });
    }
  }, [pendingAnnotation, createAnnotation]);

  const handleAnnotationCancel = useCallback(() => {
    setPendingAnnotation(null);
  }, [setPendingAnnotation]);

  const handleInputChange = useCallback((value: string) => {
    if (pendingAnnotation) {
      setPendingAnnotation({
        ...pendingAnnotation,
        inputValue: value
      });
    }
  }, [pendingAnnotation, setPendingAnnotation]);

  const handleExport = useCallback(() => {
    const data = exportAnnotations();
    console.log('Exported annotations:', data);
    // In a real app, you would download this as a file or send to an API
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportAnnotations]);

  const handleDeleteAnnotation = useCallback((id: string) => {
    deleteAnnotation(id);
  }, [deleteAnnotation]);

  // Keyboard shortcuts
  const shortcuts = useMemo(() => [
    {
      ...DEFAULT_SHORTCUTS.TOGGLE_ANNOTATION_MODE,
      handler: toggleAnnotationMode
    },
    {
      ...DEFAULT_SHORTCUTS.DELETE_ANNOTATION,
      handler: () => {
        if (selectedAnnotation !== null && annotations[selectedAnnotation]) {
          handleDeleteAnnotation(annotations[selectedAnnotation].id);
        }
      }
    },
    {
      ...DEFAULT_SHORTCUTS.EXPORT_ANNOTATIONS,
      handler: handleExport
    },
    {
      ...DEFAULT_SHORTCUTS.CLEAR_SELECTION,
      handler: () => {
        selectAnnotation(null);
        setPendingAnnotation(null);
      }
    },
    {
      ...DEFAULT_SHORTCUTS.TOGGLE_AI_SNAP,
      handler: toggleAiSnap
    }
  ], [
    toggleAnnotationMode,
    selectedAnnotation,
    annotations,
    handleDeleteAnnotation,
    handleExport,
    selectAnnotation,
    setPendingAnnotation,
    toggleAiSnap
  ]);

  useKeyboardShortcuts(shortcuts);

  return (
    <div className={styles.container}>
      {/* Professional Toolbar */}
      <Toolbar
        isAnnotationMode={isAnnotationMode}
        annotationType={annotationType}
        aiSnapEnabled={aiSnapEnabled}
        onToggleAnnotationMode={toggleAnnotationMode}
        onAnnotationTypeChange={setAnnotationType}
        onToggleAISnap={toggleAiSnap}
        onExport={handleExport}
        onFileLoad={loadModelFromFile}
      />

      {/* 3D Viewport */}
      <Viewport
        mountRef={mountRef}
        sceneRefs={sceneRefs}
        isAnnotationMode={isAnnotationMode}
        annotationType={annotationType}
        aiSnapEnabled={aiSnapEnabled}
        onAnnotationClick={handleAnnotationClick}
        onAnnotationMarkerClick={selectAnnotation}
        onAnnotationMarkerHover={hoverAnnotation}
      />

      {/* Annotation Rendering */}
      <AnnotationRenderer
        sceneRefs={sceneRefs}
        annotations={annotations}
        selectedAnnotation={selectedAnnotation}
        hoveredAnnotation={hoveredAnnotation}
        pendingAnnotation={pendingAnnotation}
        showAISuggestions={showAISuggestions}
        isAnnotationMode={isAnnotationMode}
        onAnnotationSave={handleAnnotationSave}
        onAnnotationCancel={handleAnnotationCancel}
        onInputChange={handleInputChange}
      />

      {/* Professional Sidebar */}
      <Sidebar
        annotations={annotations}
        selectedAnnotation={selectedAnnotation}
        hoveredAnnotation={hoveredAnnotation}
        modelPath={modelPath}
        isAnnotationMode={isAnnotationMode}
        onSelectAnnotation={selectAnnotation}
        onHoverAnnotation={hoverAnnotation}
        onDeleteAnnotation={handleDeleteAnnotation}
      />

      {/* Status Bar */}
      <StatusBar
        isAnnotationMode={isAnnotationMode}
        annotationCount={annotations.length}
        hoveredAnnotation={hoveredAnnotation}
        annotations={annotations}
        isLoading={modelLoading || annotationsLoading}
      />

      {/* Error Toast */}
      <ErrorToast
        error={error}
        onDismiss={clearError}
      />
    </div>
  );
};

export default SceneComponent;
