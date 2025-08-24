import React, { memo } from 'react';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { ErrorToast } from './ErrorToast';

// Memoized Toolbar - only re-renders when props actually change
export const MemoizedToolbar = memo(Toolbar, (prevProps, nextProps) => {
  return (
    prevProps.isAnnotationMode === nextProps.isAnnotationMode &&
    prevProps.annotationType === nextProps.annotationType &&
    prevProps.aiSnapEnabled === nextProps.aiSnapEnabled
  );
});

// Memoized Sidebar - optimized for large annotation lists
export const MemoizedSidebar = memo(Sidebar, (prevProps, nextProps) => {
  return (
    prevProps.annotations.length === nextProps.annotations.length &&
    prevProps.selectedAnnotation === nextProps.selectedAnnotation &&
    prevProps.hoveredAnnotation === nextProps.hoveredAnnotation &&
    prevProps.modelPath === nextProps.modelPath &&
    prevProps.isAnnotationMode === nextProps.isAnnotationMode &&
    // Deep comparison for annotations array
    JSON.stringify(prevProps.annotations) === JSON.stringify(nextProps.annotations)
  );
});

// Memoized StatusBar
export const MemoizedStatusBar = memo(StatusBar);

// Memoized ErrorToast
export const MemoizedErrorToast = memo(ErrorToast, (prevProps, nextProps) => {
  return (
    prevProps.error === nextProps.error &&
    prevProps.autoHideDelay === nextProps.autoHideDelay
  );
});
