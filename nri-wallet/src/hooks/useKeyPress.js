import { useState, useEffect, useCallback } from 'react';

/**
 * Detects keyboard shortcut presses
 * @param {string} targetKey - The key to listen for (e.g., 'Escape', 'Enter')
 * @param {object} options - Options like ctrl, shift, alt, meta modifiers
 * @returns {boolean} Whether the key combination is pressed
 */
export function useKeyPress(targetKey, options = {}) {
  const { ctrl = false, shift = false, alt = false, meta = false } = options;
  const [keyPressed, setKeyPressed] = useState(false);

  const downHandler = useCallback((e) => {
    const modifiersMatch = 
      (ctrl ? e.ctrlKey : !e.ctrlKey) &&
      (shift ? e.shiftKey : !e.shiftKey) &&
      (alt ? e.altKey : !e.altKey) &&
      (meta ? e.metaKey : !e.metaKey);

    if (e.key === targetKey && modifiersMatch) {
      setKeyPressed(true);
    }
  }, [targetKey, ctrl, shift, alt, meta]);

  const upHandler = useCallback((e) => {
    if (e.key === targetKey) {
      setKeyPressed(false);
    }
  }, [targetKey]);

  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [downHandler, upHandler]);

  return keyPressed;
}

/**
 * Registers a keyboard shortcut with callback
 * @param {string} key - The key to listen for
 * @param {function} callback - Function to call when key is pressed
 * @param {object} options - Options like ctrl, shift, alt, meta modifiers
 */
export function useKeyboardShortcut(key, callback, options = {}) {
  const { ctrl = false, shift = false, alt = false, meta = false } = options;

  useEffect(() => {
    const handler = (e) => {
      const modifiersMatch = 
        (ctrl ? e.ctrlKey : !e.ctrlKey) &&
        (shift ? e.shiftKey : !e.shiftKey) &&
        (alt ? e.altKey : !e.altKey) &&
        (meta ? e.metaKey : !e.metaKey);

      if (e.key === key && modifiersMatch) {
        e.preventDefault();
        callback(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, ctrl, shift, alt, meta]);
}

export default useKeyPress;
