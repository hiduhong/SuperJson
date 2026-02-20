import { useState, useCallback, useRef, useEffect } from "react";

export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<{
    past: T[];
    present: T;
    future: T[];
  }>({
    past: [],
    present: initialState,
    future: [],
  });

  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    lastUpdateRef.current = Date.now();
  }, []);

  const undo = useCallback(() => {
    setState((currentState) => {
      const { past, present, future } = currentState;
      if (past.length === 0) return currentState;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((currentState) => {
      const { past, present, future } = currentState;
      if (future.length === 0) return currentState;

      const next = future[0];
      const newFuture = future.slice(1);

      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const set = useCallback((newPresent: T, forceSnapshot: boolean = false) => {
    const now = Date.now();
    
    setState((currentState) => {
      const { past, present } = currentState;

      if (newPresent === present) return currentState;
      
      const timeSinceLastUpdate = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      // Determine if we should create a snapshot based on content change (word boundary)
      let isWordBreak = false;
      let isEmptyStart = false;
      if (typeof newPresent === 'string' && typeof present === 'string') {
          if (present === '') {
            isEmptyStart = true;
          }
          const lastChar = newPresent.slice(-1);
          const separators = /[\s.,;:{}[\]"']/;
          
          // If current char is a separator
          if (separators.test(lastChar)) {
             const prevLastChar = present.slice(-1);
             // And previous char was NOT a separator (meaning we just finished a word)
             if (!separators.test(prevLastChar)) {
                 isWordBreak = true;
             }
          }
      }

      // If we are forcing a snapshot, or enough time has passed (1s),
      // or we hit a word boundary, or we are starting from a clean history,
      // or we are starting from an empty state.
      if (forceSnapshot || timeSinceLastUpdate > 1000 || isWordBreak || past.length === 0 || isEmptyStart) {
        return {
          past: [...past, present],
          present: newPresent,
          future: [],
        };
      } else {
        // Just update present (simulating typing within a word)
        return {
          past,
          present: newPresent,
          future: [],
        };
      }
    });
  }, []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    historyState: state
  };
}
