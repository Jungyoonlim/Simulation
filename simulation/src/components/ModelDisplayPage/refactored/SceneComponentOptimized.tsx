import React, { useCallback, useMemo, useEffect } from 'react';
import { SceneComponentProps, PendingAnnotation } from './types';
import { useThreeScene } from './hooks/useThreeScene';
import { useAnnotations } from './hooks/useAnnotations';
import { useUIState } from './hooks/useUIState';
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { MemoizedToolbar, MemoizedSidebar, MemoizedStatusBar, MemoizedErrorToast } from './components/OptimizedComponents';
import { Viewport } from './components/Viewport';
import { AnnotationRenderer } from './components/AnnotationRenderer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { setupPerformanceMonitoring, throttle } from './utils/performance';
import styles from './styles/SceneComponent.module.css';

/**
 * Optimized Professional CAD-grade 3D annotation component
 * 
 * Performance optimizations:
 * - Memoized components to prevent unnecessary re-renders
 * - Throttled mouse events for better performance
 * - Debounced input handlers
 * - Performance monitoring
 * - Error boundaries for resilience
 */
export const SceneComponentOptimized: React.FC<SceneComponentProps> = ({
  modelPath,
  onObjectLoad,
  projectId
}) => {
  // Setup performance monitoring
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setupPerformanceMonitoring();
    }
  }, []);

  // Custom hooks
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

  const error = modelError || annotationsError || uiError;

  // Memoized handlers
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
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportAnnotations]);

  // Throttled hover handler for better performance
  const throttledHoverAnnotation = useMemo(
    () => throttle(hoverAnnotation, 50),
    [hoverAnnotation]
  );

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
          deleteAnnotation(annotations[selectedAnnotation].id);
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
    deleteAnnotation,
    handleExport,
    selectAnnotation,
    setPendingAnnotation,
    toggleAiSnap
  ]);

  useKeyboardShortcuts(shortcuts);

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        {/* Optimized Toolbar */}
        <MemoizedToolbar
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
          onAnnotationMarkerHover={throttledHoverAnnotation}
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

        {/* Optimized Sidebar */}
        <MemoizedSidebar
          annotations={annotations}
          selectedAnnotation={selectedAnnotation}
          hoveredAnnotation={hoveredAnnotation}
          modelPath={modelPath}
          isAnnotationMode={isAnnotationMode}
          onSelectAnnotation={selectAnnotation}
          onHoverAnnotation={throttledHoverAnnotation}
          onDeleteAnnotation={deleteAnnotation}
        />

        {/* Optimized Status Bar */}
        <MemoizedStatusBar
          isAnnotationMode={isAnnotationMode}
          annotationCount={annotations.length}
          hoveredAnnotation={hoveredAnnotation}
          annotations={annotations}
          isLoading={modelLoading || annotationsLoading}
        />

        {/* Optimized Error Toast */}
        <MemoizedErrorToast
          error={error}
          onDismiss={clearError}
        />
      </div>
    </ErrorBoundary>
  );
};

export default SceneComponentOptimized;
