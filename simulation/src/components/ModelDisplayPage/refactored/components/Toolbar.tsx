import React, { useRef } from 'react';
import { ToolbarProps } from '../types';
import styles from '../styles/Toolbar.module.css';

export const Toolbar: React.FC<ToolbarProps> = ({
  isAnnotationMode,
  annotationType,
  aiSnapEnabled,
  onToggleAnnotationMode,
  onAnnotationTypeChange,
  onToggleAISnap,
  onExport,
  onFileLoad
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileLoad(file);
    }
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.toolbar}>
      {/* Logo/Brand */}
      <div className={styles.brand}>
        RoboMap Validator
      </div>
      
      {/* Tools */}
      <div className={styles.tools}>
        <button
          className={`${styles.toolButton} ${isAnnotationMode ? styles.active : ''}`}
          onClick={onToggleAnnotationMode}
          title="Toggle Annotation Mode (A)"
        >
          <span className={styles.icon}>📍</span>
          Annotation Mode
        </button>
        
        {/* Annotation Type Selector */}
        <select
          className={styles.typeSelector}
          value={annotationType}
          onChange={(e) => onAnnotationTypeChange(e.target.value as AnnotationType)}
          disabled={!isAnnotationMode}
        >
          <option value="general">General</option>
          <option value="navigation_waypoint">Navigation Waypoint</option>
          <option value="obstacle">Obstacle</option>
          <option value="path">Path Segment</option>
        </select>
        
        {/* AI Snap Toggle */}
        <button
          className={`${styles.toolButton} ${aiSnapEnabled ? styles.aiActive : ''}`}
          onClick={onToggleAISnap}
          disabled={!isAnnotationMode}
          title="Toggle AI Auto-Snap (S)"
        >
          <span className={styles.icon}>🤖</span>
          AI Auto-Snap
        </button>
        
        <div className={styles.separator} />
        
        <button
          className={styles.toolButton}
          onClick={onExport}
          title="Export Annotations (Ctrl+E)"
        >
          Export
        </button>
      </div>
      
      {/* File Upload */}
      <button
        className={styles.loadButton}
        onClick={handleLoadClick}
      >
        Load SLAM Mesh
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept=".obj,.ply,.pcd"
        style={{ display: 'none' }}
      />
    </div>
  );
};
