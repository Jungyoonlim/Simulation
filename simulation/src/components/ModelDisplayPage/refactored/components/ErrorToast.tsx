import React, { useEffect } from 'react';
import { ErrorToastProps } from '../types';
import styles from '../styles/ErrorToast.module.css';

export const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onDismiss,
  autoHideDelay = 5000
}) => {
  useEffect(() => {
    if (error && autoHideDelay > 0) {
      const timer = setTimeout(onDismiss, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [error, autoHideDelay, onDismiss]);

  if (!error) return null;

  return (
    <div className={styles.errorToast}>
      <span className={styles.icon}>⚠️</span>
      <span className={styles.message}>{error}</span>
      <button
        className={styles.dismissButton}
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  );
};
