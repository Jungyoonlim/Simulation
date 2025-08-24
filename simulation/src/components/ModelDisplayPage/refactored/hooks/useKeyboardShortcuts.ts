import { useEffect, useCallback } from 'react';
import { ShortcutHandler, UseKeyboardShortcutsOptions } from '../types';

export function useKeyboardShortcuts(
  shortcuts: ShortcutHandler[],
  options: UseKeyboardShortcutsOptions = {}
): void {
  const { enabled = true } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
      const shiftMatch = shortcut.shift ? event.shiftKey : true;
      const altMatch = shortcut.alt ? event.altKey : true;
      const metaMatch = shortcut.meta ? event.metaKey : true;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        event.preventDefault();
        shortcut.handler();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, enabled]);
}

// Common keyboard shortcuts for 3D annotation tools
export const DEFAULT_SHORTCUTS = {
  TOGGLE_ANNOTATION_MODE: { key: 'a', description: 'Toggle annotation mode' },
  DELETE_ANNOTATION: { key: 'Delete', description: 'Delete selected annotation' },
  EXPORT_ANNOTATIONS: { key: 'e', ctrl: true, description: 'Export annotations' },
  CLEAR_SELECTION: { key: 'Escape', description: 'Clear selection' },
  UNDO: { key: 'z', ctrl: true, description: 'Undo last action' },
  REDO: { key: 'z', ctrl: true, shift: true, description: 'Redo last action' },
  ZOOM_FIT: { key: 'f', description: 'Fit model to view' },
  TOGGLE_AI_SNAP: { key: 's', description: 'Toggle AI snap' },
  CYCLE_ANNOTATION_TYPE: { key: 'Tab', description: 'Cycle annotation type' },
  SAVE_PROJECT: { key: 's', ctrl: true, description: 'Save project' }
};
