import * as THREE from 'three';

// Scene configuration
export const SCENE_CONFIG = {
  backgroundColor: 0x0a0a0a,
  camera: {
    fov: 50,
    near: 0.1,
    far: 2000,
    initialPosition: { x: 0, y: 0, z: 5 }
  },
  renderer: {
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    shadowMap: {
      enabled: true,
      type: THREE.PCFSoftShadowMap
    },
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.2
  },
  controls: {
    enableDamping: true,
    dampingFactor: 0.05,
    screenSpacePanning: false,
    minDistance: 0.1,
    maxDistance: 100
  },
  lights: {
    ambient: { color: 0xffffff, intensity: 0.4 },
    main: {
      color: 0xffffff,
      intensity: 0.8,
      position: { x: 5, y: 5, z: 5 },
      shadow: {
        near: 0.1,
        far: 50,
        left: -10,
        right: 10,
        top: 10,
        bottom: -10
      }
    },
    fill: {
      color: 0xffffff,
      intensity: 0.3,
      position: { x: -5, y: 0, z: -5 }
    }
  },
  grid: {
    size: 10,
    divisions: 10,
    colorCenterLine: 0x444444,
    colorGrid: 0x222222
  }
};

// Annotation configuration
export const ANNOTATION_CONFIG = {
  marker: {
    radius: 0.003,
    segments: 32,
    colors: {
      default: 0x00e676,
      selected: 0xff3d00,
      hovered: 0x2979ff,
      pending: 0x2196f3
    }
  },
  glow: {
    radius: 0.008,
    opacity: 0.3
  },
  ring: {
    innerRadius: 0.015,
    outerRadius: 0.02,
    segments: 64,
    opacity: 0.6
  },
  crosshair: {
    size: 0.01,
    opacity: 0.8
  },
  label: {
    offset: { x: 0, y: 0.03, z: 0 }
  },
  pending: {
    markerRadius: 0.008,
    opacity: 1,
    labelOffset: { x: 0, y: 0.04, z: 0 }
  }
};

// UI configuration
export const UI_CONFIG = {
  toolbar: {
    height: 48,
    background: 'rgba(20, 20, 20, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  sidebar: {
    width: 320,
    background: 'rgba(20, 20, 20, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  statusBar: {
    height: 24,
    background: 'rgba(20, 20, 20, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  colors: {
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      muted: 'rgba(255, 255, 255, 0.5)',
      disabled: 'rgba(255, 255, 255, 0.3)'
    },
    button: {
      primary: '#2196f3',
      primaryHover: '#1976d2',
      danger: '#ef4444',
      dangerHover: '#dc2626',
      success: '#4caf50',
      successHover: '#45a049'
    }
  },
  fonts: {
    primary: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'SF Mono', Monaco, 'Cascadia Code', monospace"
  }
};

// Material configuration
export const MATERIAL_CONFIG = {
  default: {
    color: 0xc0c0c0,
    metalness: 0.7,
    roughness: 0.3,
    clearcoat: 0.1,
    clearcoatRoughness: 0.1
  }
};

// File configuration
export const FILE_CONFIG = {
  acceptedFormats: '.obj,.ply,.pcd',
  loaders: {
    obj: 'OBJLoader'
  }
};

// Animation configuration
export const ANIMATION_CONFIG = {
  snapIndicator: {
    duration: 500,
    color: 0x00ff00,
    innerRadius: 0.02,
    outerRadius: 0.03,
    segments: 16,
    opacity: 0.8
  }
};

// Error messages
export const ERROR_MESSAGES = {
  modelLoadFailed: 'Failed to load model. Please check the file format.',
  annotationSaveFailed: 'Failed to save annotation to cloud',
  fileFormatInvalid: 'Invalid file format. Please use .obj, .ply, or .pcd files.'
};
