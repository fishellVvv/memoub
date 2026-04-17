import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import type { UnlistenFn } from "@tauri-apps/api/event";
import type { DesktopPreviewSnapshot } from "./desktop";
import { isTauriDesktop } from "./desktop";

export const PREVIEW_SNAPSHOT_EVENT = "desktop://preview-snapshot";

export async function pushDesktopPreviewSnapshot(
  snapshot: DesktopPreviewSnapshot,
): Promise<void> {
  if (!isTauriDesktop()) {
    return;
  }

  await invoke("update_preview_snapshot", { snapshot });
}

export async function readDesktopPreviewSnapshot(): Promise<DesktopPreviewSnapshot | null> {
  if (!isTauriDesktop()) {
    return null;
  }

  return invoke<DesktopPreviewSnapshot | null>("get_preview_snapshot");
}

export async function listenToDesktopPreviewSnapshot(
  handler: (snapshot: DesktopPreviewSnapshot) => void,
): Promise<UnlistenFn> {
  if (!isTauriDesktop()) {
    return () => undefined;
  }

  return getCurrentWebviewWindow().listen<DesktopPreviewSnapshot>(
    PREVIEW_SNAPSHOT_EVENT,
    ({ payload }) => {
      handler(payload);
    },
  );
}

export async function syncDesktopPreviewWindow(height: number): Promise<void> {
  if (!isTauriDesktop()) {
    return;
  }

  await invoke("sync_preview_window", { height });
}
