import React from 'react';
import { SidebarProps } from '../types';
import styles from '../styles/Sidebar.module.css';

export const Sidebar: React.FC<SidebarProps> = ({
  annotations,
  selectedAnnotation,
  hoveredAnnotation,
  modelPath,
  isAnnotationMode,
  onSelectAnnotation,
  onHoverAnnotation,
  onDeleteAnnotation
}) => {
  const handleAnnotationClick = (index: number) => {
    onSelectAnnotation(selectedAnnotation === index ? null : index);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteAnnotation(id);
  };

  return (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>Annotations</h3>
        <p className={styles.subtitle}>
          {annotations.length} total • {modelPath ? 'Model loaded' : 'No model'}
        </p>
      </div>
      
      {/* Annotations List */}
      <div className={styles.content}>
        {annotations.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📍</div>
            <p className={styles.emptyTitle}>No annotations yet</p>
            <p className={styles.emptyDescription}>
              {isAnnotationMode ? 'Click on the model to add' : 'Enable annotation mode first'}
            </p>
          </div>
        ) : (
          <div className={styles.annotationList}>
            {annotations.map((annotation, idx) => (
              <div
                key={annotation.id}
                className={`
                  ${styles.annotationItem}
                  ${selectedAnnotation === idx ? styles.selected : ''}
                  ${hoveredAnnotation === idx ? styles.hovered : ''}
                `}
                onClick={() => handleAnnotationClick(idx)}
                onMouseEnter={() => onHoverAnnotation(idx)}
                onMouseLeave={() => onHoverAnnotation(null)}
              >
                <div className={styles.annotationHeader}>
                  <h4 className={styles.annotationName}>{annotation.name}</h4>
                  <div 
                    className={`
                      ${styles.annotationIndicator}
                      ${selectedAnnotation === idx ? styles.indicatorSelected : ''}
                      ${hoveredAnnotation === idx ? styles.indicatorHovered : ''}
                    `}
                  />
                </div>
                
                <div className={styles.annotationPosition}>
                  {`${annotation.worldPosition.x.toFixed(3)}, ${annotation.worldPosition.y.toFixed(3)}, ${annotation.worldPosition.z.toFixed(3)}`}
                </div>
                
                {annotation.createdAt && (
                  <div className={styles.annotationDate}>
                    {new Date(annotation.createdAt).toLocaleString()}
                  </div>
                )}
                
                {/* AI Confidence Badge */}
                {annotation.aiConfidence && (
                  <div className={styles.aiBadge}>
                    🤖 AI: {(annotation.aiConfidence * 100).toFixed(0)}%
                  </div>
                )}
                
                {/* Actions */}
                {selectedAnnotation === idx && (
                  <div className={styles.actions}>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => handleDelete(e, annotation.id)}
                      title="Delete annotation"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
