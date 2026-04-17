const TRAY_TOOLTIP_EVENT = "desktop://tray-tooltip";

export function isTauriDesktop(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function updateDesktopTrayTooltip(tooltip: string): Promise<void> {
  if (!isTauriDesktop()) {
    return;
  }

  try {
    const { emit } = await import("@tauri-apps/api/event");
    await emit(TRAY_TOOLTIP_EVENT, tooltip);
  } catch {
    // Ignore desktop shell sync failures so the app keeps behaving like the web version.
  }
}
