/**
 * useSearchKeyboard Hook
 * Handles keyboard shortcuts and navigation within search
 */

import { useEffect, useCallback } from 'react';
import { KEYBOARD_KEYS, SEARCH_CONFIG } from '../SearchCommand/constants';

interface UseSearchKeyboardProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelectNext: () => void;
  onSelectPrev: () => void;
  onConfirm: () => void;
}

export function useSearchKeyboard({
  isOpen,
  onOpen,
  onClose,
  onSelectNext,
  onSelectPrev,
  onConfirm,
}: UseSearchKeyboardProps) {
  // Global keyboard shortcut (Cmd/Ctrl + K)
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    if (modifier && e.key.toLowerCase() === SEARCH_CONFIG.KEYBOARD_SHORTCUT) {
      e.preventDefault();
      if (isOpen) {
        onClose();
      } else {
        onOpen();
      }
    }
  }, [isOpen, onOpen, onClose]);

  // Navigation within search dialog
  const handleSearchKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case KEYBOARD_KEYS.ARROW_DOWN:
        e.preventDefault();
        onSelectNext();
        break;
      case KEYBOARD_KEYS.ARROW_UP:
        e.preventDefault();
        onSelectPrev();
        break;
      case KEYBOARD_KEYS.ENTER:
        e.preventDefault();
        onConfirm();
        break;
      case KEYBOARD_KEYS.ESCAPE:
        e.preventDefault();
        onClose();
        break;
      case KEYBOARD_KEYS.TAB:
        // Allow tab to cycle through filters
        break;
    }
  }, [isOpen, onSelectNext, onSelectPrev, onConfirm, onClose]);

  // Register global shortcut
  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  // Register search navigation
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleSearchKeyDown);
      return () => {
        document.removeEventListener('keydown', handleSearchKeyDown);
      };
    }
  }, [isOpen, handleSearchKeyDown]);

  return {
    handleSearchKeyDown,
  };
}
