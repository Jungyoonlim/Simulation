# Professional 3D Annotation System - Refactored

A modern, professional-grade 3D annotation system designed for robotics SLAM mesh validation. This refactored version follows best practices in frontend engineering with TypeScript, React hooks, and modular architecture.

## 🏗 Architecture Overview

```
refactored/
├── components/          # React components
│   ├── Toolbar.tsx     # Top navigation bar
│   ├── Sidebar.tsx     # Annotation list sidebar
│   ├── Viewport.tsx    # 3D interaction area
│   ├── StatusBar.tsx   # Bottom status bar
│   ├── ErrorToast.tsx  # Error notifications
│   ├── ErrorBoundary.tsx # Error boundary wrapper
│   └── AnnotationRenderer.tsx # 3D annotation rendering
├── hooks/              # Custom React hooks
│   ├── useThreeScene.ts    # Three.js scene management
│   ├── useAnnotations.ts   # Annotation state & logic
│   ├── useUIState.ts       # UI state management
│   └── useKeyboardShortcuts.ts # Keyboard shortcuts
├── services/           # Business logic & APIs
│   ├── threeService.ts     # Three.js operations
│   ├── annotationService.ts # Annotation API
│   └── analyticsService.ts  # Analytics tracking
├── types/              # TypeScript definitions
├── constants/          # Configuration constants
├── utils/              # Utility functions
└── styles/            # CSS modules

```

## 🚀 Features

### Core Features
- **3D Model Visualization**: Load and display OBJ/PLY/PCD files
- **Interactive Annotations**: Click to place annotations on 3D models
- **AI Auto-Snap**: Intelligent snapping to relevant features
- **Real-time Collaboration**: Live annotation updates (when connected to backend)
- **Professional UI**: Modern, dark-themed interface with blur effects
- **Keyboard Shortcuts**: Productivity-focused keyboard controls
- **Export Functionality**: Export annotations as JSON

### Technical Features
- **TypeScript**: Full type safety and IntelliSense support
- **Modular Architecture**: Separation of concerns with hooks and services
- **Performance Optimized**: Memoization, throttling, and lazy loading
- **Error Boundaries**: Graceful error handling and recovery
- **CSS Modules**: Scoped styling with no global conflicts
- **Responsive Design**: Adapts to different screen sizes

## 📦 Installation

```bash
npm install three @types/three
```

## 🔧 Usage

### Basic Usage

```tsx
import SceneComponent from './refactored/SceneComponent';

function App() {
  return (
    <SceneComponent
      modelPath="/path/to/model.obj"
      projectId="project-123"
      onObjectLoad={(object) => console.log('Model loaded:', object)}
    />
  );
}
```

### With Error Boundary

```tsx
import SceneComponentOptimized from './refactored/SceneComponentOptimized';

function App() {
  return (
    <SceneComponentOptimized
      modelPath="/path/to/model.obj"
      projectId="project-123"
      onObjectLoad={(object) => console.log('Model loaded:', object)}
    />
  );
}
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `A` | Toggle annotation mode |
| `S` | Toggle AI auto-snap |
| `Delete` | Delete selected annotation |
| `Ctrl+E` | Export annotations |
| `Escape` | Clear selection |
| `Tab` | Cycle annotation types |
| `F` | Fit model to view |

## 🎨 Customization

### Theme Customization

Modify constants in `constants/index.ts`:

```typescript
export const UI_CONFIG = {
  colors: {
    button: {
      primary: '#2196f3',    // Change primary color
      success: '#4caf50',    // Change success color
    }
  }
};
```

### Adding New Annotation Types

1. Update the type definition:
```typescript
// types/index.ts
export type AnnotationType = 'general' | 'navigation_waypoint' | 'obstacle' | 'path' | 'your_new_type';
```

2. Add to the toolbar selector:
```tsx
// components/Toolbar.tsx
<option value="your_new_type">Your New Type</option>
```

## 🔌 API Integration

### Annotation Service

The annotation service is designed to work with your backend API. Update `services/annotationService.ts`:

```typescript
class AnnotationService {
  async list(projectId: string): Promise<ServiceResponse<Annotation[]>> {
    // Replace with your API call
    const response = await fetch(`/api/projects/${projectId}/annotations`);
    const data = await response.json();
    return { data, error: null };
  }
}
```

### Real-time Updates

For WebSocket support, modify the subscribe method:

```typescript
subscribe(projectId: string, callback: (payload: any) => void) {
  const ws = new WebSocket(`ws://your-api/projects/${projectId}`);
  ws.onmessage = (event) => callback(JSON.parse(event.data));
  return { unsubscribe: () => ws.close() };
}
```

## 🎯 Performance Optimization

### Memoization
Components are memoized to prevent unnecessary re-renders:

```tsx
export const MemoizedToolbar = memo(Toolbar, (prevProps, nextProps) => {
  // Custom comparison logic
});
```

### Throttling
Mouse events are throttled for better performance:

```tsx
const throttledHoverAnnotation = useMemo(
  () => throttle(hoverAnnotation, 50),
  [hoverAnnotation]
);
```

### Performance Monitoring
Enable performance monitoring in development:

```tsx
if (process.env.NODE_ENV === 'development') {
  setupPerformanceMonitoring();
}
```

## 🧪 Testing

### Unit Testing Example

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useAnnotations } from './hooks/useAnnotations';

describe('useAnnotations', () => {
  it('should add annotation', async () => {
    const { result } = renderHook(() => useAnnotations());
    
    await result.current.createAnnotation({
      position: new THREE.Vector3(0, 0, 0),
      inputValue: 'Test Annotation'
    });
    
    expect(result.current.annotations).toHaveLength(1);
  });
});
```

## 🔍 Debugging

### Enable Debug Mode

```typescript
// Add to window for debugging
if (process.env.NODE_ENV === 'development') {
  window.DEBUG = {
    scene: sceneRefs,
    annotations: annotations,
    ui: { isAnnotationMode, annotationType }
  };
}
```

### Performance Profiling

Use Chrome DevTools Performance tab or React DevTools Profiler to identify performance bottlenecks.

## 📝 Best Practices

1. **State Management**: Use hooks for local state, context for global state
2. **Error Handling**: Always wrap async operations in try-catch
3. **Type Safety**: Define interfaces for all data structures
4. **Performance**: Memoize expensive computations and callbacks
5. **Accessibility**: Add ARIA labels and keyboard navigation
6. **Code Splitting**: Lazy load heavy dependencies when needed

## 🤝 Contributing

1. Follow the existing code structure
2. Add TypeScript types for new features
3. Write unit tests for new hooks/services
4. Update documentation for API changes
5. Run performance tests for UI changes

## 📄 License

This refactored code maintains the same license as the original project.

---

Built with ❤️ by a professional design engineer
