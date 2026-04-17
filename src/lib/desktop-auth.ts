import type { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { openUrl } from "@tauri-apps/plugin-opener";
import { isTauriDesktop } from "./desktop";

const DESKTOP_AUTH_SCHEME = "com.fishellvvv.memoub";
const DESKTOP_AUTH_HOST = "auth";
const DESKTOP_AUTH_PATH = "/callback";
const DESKTOP_AUTH_REDIRECT_URL = `${DESKTOP_AUTH_SCHEME}://${DESKTOP_AUTH_HOST}${DESKTOP_AUTH_PATH}`;

export type DesktopAuthCallback =
  | {
      kind: "code";
      code: string;
    }
  | {
      kind: "error";
      error: string;
      errorDescription: string | null;
    };

const handledDesktopAuthUrls = new Set<string>();

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  const trimmed = pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;

  return trimmed || "/";
}

function parseDesktopAuthCallback(url: string): DesktopAuthCallback | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== `${DESKTOP_AUTH_SCHEME}:`) {
      return null;
    }

    if (parsed.hostname !== DESKTOP_AUTH_HOST) {
      return null;
    }

    if (normalizePathname(parsed.pathname) !== DESKTOP_AUTH_PATH) {
      return null;
    }

    const error = parsed.searchParams.get("error");
    if (error) {
      return {
        kind: "error",
        error,
        errorDescription: parsed.searchParams.get("error_description"),
      };
    }

    const code = parsed.searchParams.get("code");
    if (!code) {
      return null;
    }

    return {
      kind: "code",
      code,
    };
  } catch {
    return null;
  }
}

function consumeDesktopAuthCallback(urls: string[]): DesktopAuthCallback | null {
  for (const url of urls) {
    if (handledDesktopAuthUrls.has(url)) {
      continue;
    }

    const callback = parseDesktopAuthCallback(url);
    if (!callback) {
      continue;
    }

    handledDesktopAuthUrls.add(url);
    return callback;
  }

  return null;
}

export function getDesktopAuthRedirectUrl(): string {
  return DESKTOP_AUTH_REDIRECT_URL;
}

export async function openDesktopOAuthUrl(url: string): Promise<void> {
  if (!isTauriDesktop()) {
    throw new Error("El flujo OAuth de escritorio solo esta disponible en Tauri.");
  }

  await openUrl(url);
}

export async function getDesktopOAuthCallback(): Promise<DesktopAuthCallback | null> {
  if (!isTauriDesktop()) {
    return null;
  }

  const urls = await getCurrent();
  if (!urls?.length) {
    return null;
  }

  return consumeDesktopAuthCallback(urls);
}

export async function listenToDesktopOAuthCallbacks(
  handler: (callback: DesktopAuthCallback) => void | Promise<void>,
): Promise<UnlistenFn> {
  if (!isTauriDesktop()) {
    return () => undefined;
  }

  return onOpenUrl((urls) => {
    const callback = consumeDesktopAuthCallback(urls);
    if (!callback) {
      return;
    }

    void handler(callback);
  });
}
