import { useEffect, useState } from "react";

const UI_SCALE_STORAGE_KEY = "memoub.ui-scale";
const DEFAULT_UI_SCALE = 1;
const MIN_UI_SCALE = 0.7;
const MAX_UI_SCALE = 1.1;

function clampUiScale(value: number): number {
  if (Number.isNaN(value)) {
    return DEFAULT_UI_SCALE;
  }

  return Math.min(MAX_UI_SCALE, Math.max(MIN_UI_SCALE, value));
}

function readStoredUiScale(): number {
  if (typeof window === "undefined") {
    return DEFAULT_UI_SCALE;
  }

  const rawValue = window.localStorage.getItem(UI_SCALE_STORAGE_KEY);

  if (!rawValue) {
    return DEFAULT_UI_SCALE;
  }

  return clampUiScale(Number(rawValue));
}

function writeStoredUiScale(value: number): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(UI_SCALE_STORAGE_KEY, String(clampUiScale(value)));
}

function applyUiScale(value: number): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.style.setProperty("--ui-font-size-scale", String(clampUiScale(value)));
}

export function useUiScale() {
  const [uiScale, setUiScaleState] = useState(() => readStoredUiScale());

  useEffect(() => {
    applyUiScale(uiScale);
  }, [uiScale]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== UI_SCALE_STORAGE_KEY) {
        return;
      }

      setUiScaleState(readStoredUiScale());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setUiScale = (value: number) => {
    const nextValue = clampUiScale(value);
    setUiScaleState(nextValue);
    writeStoredUiScale(nextValue);
    applyUiScale(nextValue);
  };

  return {
    uiScale,
    setUiScale
  };
}
