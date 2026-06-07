import { App } from "@capacitor/app";
import { getVersion } from "@tauri-apps/api/app";
import { isTauriDesktop } from "./desktop";
import type { UpdatePlatform } from "./updates/types";

// Fallback only. Android and Windows should read their native app version at runtime.
export const FALLBACK_APP_VERSION = "1.1.0";

export async function getCurrentAppVersion(platform: UpdatePlatform): Promise<string> {
  if (platform === "android") {
    try {
      const info = await App.getInfo();
      return info.version || FALLBACK_APP_VERSION;
    } catch {
      return FALLBACK_APP_VERSION;
    }
  }

  if (platform === "windows" && isTauriDesktop()) {
    try {
      return await getVersion();
    } catch {
      return FALLBACK_APP_VERSION;
    }
  }

  return FALLBACK_APP_VERSION;
}
