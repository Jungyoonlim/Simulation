import * as THREE from 'three';

// Core annotation types
export interface Annotation {
  id: string;
  name: string;
  type: AnnotationType;
  worldPosition: THREE.Vector3;
  localPosition?: THREE.Vector3;
  modelName?: string;
  createdAt: string;
  author: string;
  tags: string[];
  visibility: 'public' | 'private';
  aiConfidence?: number;
  aiSuggestion?: AISuggestion;
}

export type AnnotationType = 'general' | 'navigation_waypoint' | 'obstacle' | 'path';

export interface AISuggestion {
  primary: string;
  alternatives: string[];
  metadata: {
    type: string;
    confidence: number;
  };
}

export interface PendingAnnotation {
  position: THREE.Vector3;
  inputValue?: string;
  aiSuggestion?: AISuggestion;
  annotationType?: AnnotationType;
}

// Component props
export interface SceneComponentProps {
  modelPath: string;
  onObjectLoad?: (object: THREE.Object3D | null) => void;
  projectId?: string;
}

// Service response types
export interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface AnnotationCreateData {
  name: string;
  type: AnnotationType;
  position: {
    x: number;
    y: number;
    z: number;
  };
  metadata?: {
    modelPath: string;
    cameraPosition: number[];
    cameraTarget: number[];
  };
  aiConfidence?: number;
  aiSuggestion?: AISuggestion;
}

// UI State types
export interface UIState {
  isAnnotationMode: boolean;
  annotationType: AnnotationType;
  aiSnapEnabled: boolean;
  showAISuggestions: boolean;
  error: string | null;
}

// 3D Scene types
export interface SceneRefs {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  labelRenderer: any; // CSS2DRenderer
  controls: any; // OrbitControls
  currentObject: THREE.Object3D | null;
}

// Export data format
export interface ExportData {
  modelPath: string;
  timestamp: string;
  annotations: Array<{
    id: string;
    name: string;
    position: {
      x: number;
      y: number;
      z: number;
    };
    createdAt: string;
    author: string;
    tags: string[];
    visibility: string;
  }>;
}

// Component Props Interfaces
export interface ViewportProps {
  mountRef: React.RefObject<HTMLDivElement>;
  sceneRefs: SceneRefs;
  isAnnotationMode: boolean;
  annotationType: AnnotationType;
  aiSnapEnabled: boolean;
  onAnnotationClick: (annotation: PendingAnnotation) => void;
  onAnnotationMarkerClick: (index: number) => void;
  onAnnotationMarkerHover: (index: number | null) => void;
}

export interface ToolbarProps {
  isAnnotationMode: boolean;
  annotationType: AnnotationType;
  aiSnapEnabled: boolean;
  onToggleAnnotationMode: () => void;
  onAnnotationTypeChange: (type: AnnotationType) => void;
  onToggleAISnap: () => void;
  onExport: () => void;
  onFileLoad: (file: File) => void;
}

export interface SidebarProps {
  annotations: Annotation[];
  selectedAnnotation: number | null;
  hoveredAnnotation: number | null;
  modelPath: string;
  isAnnotationMode: boolean;
  onSelectAnnotation: (index: number | null) => void;
  onHoverAnnotation: (index: number | null) => void;
  onDeleteAnnotation: (id: string) => void;
}

export interface StatusBarProps {
  isAnnotationMode: boolean;
  annotationCount: number;
  hoveredAnnotation: number | null;
  annotations: Annotation[];
  isLoading: boolean;
}

export interface ErrorToastProps {
  error: string | null;
  onDismiss: () => void;
  autoHideDelay?: number;
}

export interface AnnotationRendererProps {
  sceneRefs: SceneRefs;
  annotations: Annotation[];
  selectedAnnotation: number | null;
  hoveredAnnotation: number | null;
  pendingAnnotation: PendingAnnotation | null;
  showAISuggestions: boolean;
  isAnnotationMode: boolean;
  onAnnotationSave: () => void;
  onAnnotationCancel: () => void;
  onInputChange: (value: string) => void;
}

// Hook Types
export interface UseAnnotationsOptions {
  projectId?: string;
  modelPath: string;
}

export interface UseAnnotationsReturn {
  annotations: Annotation[];
  selectedAnnotation: number | null;
  hoveredAnnotation: number | null;
  pendingAnnotation: PendingAnnotation | null;
  isLoading: boolean;
  error: string | null;
  createAnnotation: (annotation: AnnotationCreateData) => Promise<void>;
  updateAnnotation: (id: string, data: Partial<Annotation>) => Promise<void>;
  deleteAnnotation: (id: string) => Promise<void>;
  selectAnnotation: (index: number | null) => void;
  hoverAnnotation: (index: number | null) => void;
  setPendingAnnotation: (annotation: PendingAnnotation | null) => void;
  clearAnnotations: () => void;
  exportAnnotations: () => void;
}

export interface UseThreeSceneOptions {
  modelPath: string;
  onObjectLoad?: (object: THREE.Object3D | null) => void;
}

export interface UseThreeSceneReturn {
  mountRef: React.RefObject<HTMLDivElement>;
  sceneRefs: SceneRefs;
  isLoading: boolean;
  error: string | null;
  loadModel: (path: string) => void;
  loadModelFromFile: (file: File) => void;
  raycast: (mouse: THREE.Vector2, objects?: THREE.Object3D[]) => THREE.Intersection[];
}

export interface UseUIStateReturn {
  isAnnotationMode: boolean;
  annotationType: AnnotationType;
  aiSnapEnabled: boolean;
  showAISuggestions: boolean;
  error: string | null;
  setAnnotationMode: (enabled: boolean) => void;
  setAnnotationType: (type: AnnotationType) => void;
  setAiSnapEnabled: (enabled: boolean) => void;
  setShowAISuggestions: (show: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  toggleAnnotationMode: () => void;
  toggleAiSnap: () => void;
}

export interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  description?: string;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

// Service Types
export type EventData = Record<string, any>;

// Three.js Extended Types
export type { Intersection, Object3D, Mesh } from 'three';

// React Types
export type { RefObject } from 'react';
