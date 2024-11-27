import { useEffect } from "react";

export function useSave(callback: () => void) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        callback();
      }
    });

    return () => {
      window.removeEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          callback();
        }
      });
    };
  });
}

export function deleteLocalStorage(key: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(key);
}