import { Browser } from "@capacitor/browser";
import { openUrl } from "@tauri-apps/plugin-opener";
import { isTauriDesktop } from "./desktop";
import type { UpdatePlatform } from "./updates/types";

export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "https:" && parsedUrl.href === url;
  } catch {
    return false;
  }
}

export async function openExternalUrl(url: string, platform: UpdatePlatform = "web"): Promise<void> {
  if (!isSafeExternalUrl(url)) {
    throw new Error("External URL must be a valid https URL.");
  }

  if (platform === "windows" && isTauriDesktop()) {
    await openUrl(url);
    return;
  }

  if (platform === "android") {
    await Browser.open({ url });
    return;
  }

  if (typeof window === "undefined") {
    throw new Error("No browser window is available to open the external URL.");
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
