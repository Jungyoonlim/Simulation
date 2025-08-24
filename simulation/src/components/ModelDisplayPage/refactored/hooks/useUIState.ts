import { useState, useCallback } from 'react';
import { UIState, UseUIStateReturn } from '../types';

const initialState: UIState = {
  isAnnotationMode: true,
  annotationType: 'general',
  aiSnapEnabled: true,
  showAISuggestions: true,
  error: null
};

export function useUIState(defaultState: Partial<UIState> = {}): UseUIStateReturn {
  const [state, setState] = useState<UIState>({
    ...initialState,
    ...defaultState
  });

  const setAnnotationMode = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, isAnnotationMode: enabled }));
  }, []);

  const setAnnotationType = useCallback((type: AnnotationType) => {
    setState(prev => ({ ...prev, annotationType: type }));
  }, []);

  const setAiSnapEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, aiSnapEnabled: enabled }));
  }, []);

  const setShowAISuggestions = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showAISuggestions: show }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const toggleAnnotationMode = useCallback(() => {
    setState(prev => ({ ...prev, isAnnotationMode: !prev.isAnnotationMode }));
  }, []);

  const toggleAiSnap = useCallback(() => {
    setState(prev => ({ ...prev, aiSnapEnabled: !prev.aiSnapEnabled }));
  }, []);

  return {
    ...state,
    setAnnotationMode,
    setAnnotationType,
    setAiSnapEnabled,
    setShowAISuggestions,
    setError,
    clearError,
    toggleAnnotationMode,
    toggleAiSnap
  };
}
