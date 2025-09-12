import { analytics } from '../services/analyticsService';

/**
 * Performance monitoring utilities for the 3D annotation system
 */

// Performance observer for monitoring long tasks
export function setupPerformanceMonitoring() {
  if ('PerformanceObserver' in window) {
    // Monitor long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Log tasks that take more than 50ms
        if (entry.duration > 50) {
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          });
          
          analytics.trackTiming('performance', 'long_task', Math.round(entry.duration));
        }
      }
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('Long task monitoring not supported');
    }

    // Monitor frame rate
    let lastTime = performance.now();
    let frames = 0;
    let fps = 0;

    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime));
        
        // Log if FPS drops below 30
        if (fps < 30 && fps > 0) {
          console.warn(`Low FPS detected: ${fps}`);
          analytics.trackEvent('performance_issue', { 
            type: 'low_fps', 
            value: fps 
          });
        }
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    measureFPS();
  }
}

// Debounce utility for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for rate-limiting
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memory usage monitoring
export function getMemoryUsage(): { usedJSHeapSize: number; totalJSHeapSize: number } | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize
    };
  }
  return null;
}

// Profile function execution time
export function profileFunction<T extends (...args: any[]) => any>(
  name: string,
  func: T
): T {
  return function profiledFunction(...args: Parameters<T>): ReturnType<T> {
    const start = performance.now();
    try {
      const result = func(...args);
      const duration = performance.now() - start;
      
      if (duration > 16) { // Log if takes more than one frame (16ms)
        console.log(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  } as T;
}
