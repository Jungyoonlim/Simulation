import React from 'react';
import { StatusBarProps } from '../types';
import styles from '../styles/StatusBar.module.css';

export const StatusBar: React.FC<StatusBarProps> = ({
  isAnnotationMode,
  annotationCount,
  hoveredAnnotation,
  annotations,
  isLoading
}) => {
  return (
    <div className={styles.statusBar}>
      <span className={styles.statusItem}>
        Mode: {isAnnotationMode ? 'Annotation' : 'View'}
      </span>
      
      <span className={styles.separator}>|</span>
      
      <span className={styles.statusItem}>
        Annotations: {annotationCount}
      </span>
      
      {hoveredAnnotation !== null && annotations[hoveredAnnotation] && (
        <>
          <span className={styles.separator}>|</span>
          <span className={styles.statusItem}>
            Hovering: {annotations[hoveredAnnotation].name}
          </span>
        </>
      )}
      
      {isLoading && (
        <>
          <span className={styles.separator}>|</span>
          <span className={styles.statusItem}>
            Loading...
          </span>
        </>
      )}
      
      <div className={styles.shortcuts}>
        <span className={styles.shortcut}>A: Toggle Mode</span>
        <span className={styles.shortcut}>S: AI Snap</span>
        <span className={styles.shortcut}>Ctrl+E: Export</span>
        <span className={styles.shortcut}>ESC: Clear Selection</span>
      </div>
    </div>
  );
};
