// Main component exports
export { SceneComponent as default } from './SceneComponent';
export { SceneComponentOptimized } from './SceneComponentOptimized';

// Component exports
export { Toolbar } from './components/Toolbar';
export { Sidebar } from './components/Sidebar';
export { Viewport } from './components/Viewport';
export { StatusBar } from './components/StatusBar';
export { ErrorToast } from './components/ErrorToast';
export { ErrorBoundary } from './components/ErrorBoundary';
export { AnnotationRenderer } from './components/AnnotationRenderer';

// Optimized component exports
export {
  MemoizedToolbar,
  MemoizedSidebar,
  MemoizedStatusBar,
  MemoizedErrorToast
} from './components/OptimizedComponents';

// Hook exports
export { useThreeScene } from './hooks/useThreeScene';
export { useAnnotations } from './hooks/useAnnotations';
export { useUIState } from './hooks/useUIState';
export { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from './hooks/useKeyboardShortcuts';

// Service exports
export { threeService } from './services/threeService';
export { annotationService } from './services/annotationService';
export { analytics } from './services/analyticsService';

// Type exports
export type {
  Annotation,
  AnnotationType,
  AISuggestion,
  PendingAnnotation,
  SceneComponentProps,
  ServiceResponse,
  AnnotationCreateData,
  UIState,
  SceneRefs,
  ExportData
} from './types';

// Constant exports
export {
  SCENE_CONFIG,
  ANNOTATION_CONFIG,
  UI_CONFIG,
  MATERIAL_CONFIG,
  FILE_CONFIG,
  ANIMATION_CONFIG,
  ERROR_MESSAGES
} from './constants';

// Utility exports
export {
  setupPerformanceMonitoring,
  debounce,
  throttle,
  getMemoryUsage,
  profileFunction
} from './utils/performance';
