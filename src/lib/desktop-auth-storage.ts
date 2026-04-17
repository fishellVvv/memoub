import { load } from "@tauri-apps/plugin-store";
import { isTauriDesktop } from "./desktop";

const AUTH_STORE_PATH = "auth.store.json";

type StorageValue = string | null;
type SupabaseStorageAdapter = {
  getItem(key: string): Promise<StorageValue> | StorageValue;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
};

let storePromise:
  | Promise<Awaited<ReturnType<typeof load>>>
  | null = null;

async function getDesktopAuthStore() {
  if (!storePromise) {
    storePromise = load(AUTH_STORE_PATH, {
      defaults: {},
    });
  }

  return storePromise;
}

export const desktopAuthStorage: SupabaseStorageAdapter = {
  async getItem(key) {
    if (!isTauriDesktop()) {
      return null;
    }

    const store = await getDesktopAuthStore();
    const value = await store.get<string>(key);
    return typeof value === "string" ? value : null;
  },

  async setItem(key, value) {
    if (!isTauriDesktop()) {
      return;
    }

    const store = await getDesktopAuthStore();
    await store.set(key, value);
    await store.save();
  },

  async removeItem(key) {
    if (!isTauriDesktop()) {
      return;
    }

    const store = await getDesktopAuthStore();
    await store.delete(key);
    await store.save();
  },
};
