import type { SyncState } from "./types";

export type DesktopPreviewSnapshot = {
  message: string;
  footerLine: string;
  status: SyncState["status"];
  theme: {
    background: string;
    text: string;
    mutedText: string;
    fontFamily: string;
    uiScale: number;
  };
};

export function isTauriDesktop(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function isTrayPreviewWindow(): boolean {
  return typeof window !== "undefined" && window.location.hash === "#tray-preview";
}
