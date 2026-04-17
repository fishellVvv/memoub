import { isTauriDesktop } from "./desktop";

async function unregisterServiceWorkers(): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );
  } catch {
    // Ignore cleanup failures on desktop.
  }
}

async function clearRuntimeCaches(): Promise<void> {
  if (!("caches" in window)) {
    return;
  }

  try {
    const cacheKeys = await window.caches.keys();
    await Promise.all(cacheKeys.map((cacheKey) => window.caches.delete(cacheKey)));
  } catch {
    // Ignore cleanup failures on desktop.
  }
}

export async function prepareDesktopRuntime(): Promise<void> {
  if (!isTauriDesktop()) {
    return;
  }

  await unregisterServiceWorkers();
  await clearRuntimeCaches();
}
