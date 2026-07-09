import { useEffect } from 'react';

/** Closes a dropdown/menu on an outside click or Escape — shared by any dismissable panel. */
export function useClickOutside(ref, onDismiss, active = true) {
  useEffect(() => {
    if (!active) return undefined;

    const handlePointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onDismiss();
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') onDismiss();
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, onDismiss, active]);
}
