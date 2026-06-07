import { Capacitor } from "@capacitor/core";
import { isTauriDesktop } from "./desktop";
import type { UpdatePlatform } from "./updates/types";

function isWindowsUserAgent(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();

  return userAgent.includes("windows") || platform.includes("win");
}

export function getUpdatePlatform(): UpdatePlatform {
  if (Capacitor.getPlatform() === "android") {
    return "android";
  }

  if (isTauriDesktop() && isWindowsUserAgent()) {
    return "windows";
  }

  return "web";
}
