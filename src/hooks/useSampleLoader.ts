import React from "react";
import { DIRTY_SAMPLES } from "../data/samples";

export const useSampleLoader = (
  input: string,
  setInput: (value: string, pushHistory?: boolean) => void
) => {
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const lastSampleIndexRef = React.useRef(-1);

  const loadRandomSample = React.useCallback(() => {
    if (DIRTY_SAMPLES.length === 0) {
      return;
    }
    let nextIndex = 0;
    if (DIRTY_SAMPLES.length === 1) {
      nextIndex = 0;
    } else {
      do {
        nextIndex = Math.floor(Math.random() * DIRTY_SAMPLES.length);
      } while (nextIndex === lastSampleIndexRef.current);
    }
    lastSampleIndexRef.current = nextIndex;
    setInput(DIRTY_SAMPLES[nextIndex], true);
  }, [setInput]);

  const handleLoadSample = React.useCallback(() => {
    if (input.trim()) {
      setIsConfirmOpen(true);
      return;
    }
    loadRandomSample();
  }, [input, loadRandomSample]);

  const confirmLoadSample = React.useCallback(() => {
    setIsConfirmOpen(false);
    loadRandomSample();
  }, [loadRandomSample]);

  const cancelLoadSample = React.useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  return {
    isConfirmOpen,
    handleLoadSample,
    confirmLoadSample,
    cancelLoadSample
  };
};
