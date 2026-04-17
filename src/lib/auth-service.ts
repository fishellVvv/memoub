import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";
import { getSupabaseClient } from "./supabase";
import { appConfig } from "./config";

let nativeGoogleInitialization: Promise<void> | null = null;

export class AuthService {
  async getSession(): Promise<Session | null> {
    const client = getSupabaseClient();
    if (!client) {
      return null;
    }

    const { data, error } = await client.auth.getSession();
    if (error) {
      throw error;
    }

    return data.session;
  }

  async signInWithGoogle(): Promise<void> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error("Supabase no esta configurado.");
    }

    if (this.isAndroidNativePlatform()) {
      await this.signInWithNativeGoogle(client);
      return;
    }

    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    const client = getSupabaseClient();
    if (!client) {
      return;
    }

    if (this.isAndroidNativePlatform() && appConfig.googleWebClientId) {
      try {
        await this.ensureNativeGoogleInitialized();
        await SocialLogin.logout({ provider: "google" });
      } catch {
        // If native Google session is already gone, the Supabase logout is still enough.
      }
    }

    const { error } = await client.auth.signOut();
    if (error) {
      throw error;
    }
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): () => void {
    const client = getSupabaseClient();
    if (!client) {
      return () => undefined;
    }

    const { data } = client.auth.onAuthStateChange(callback);
    return () => {
      data.subscription.unsubscribe();
    };
  }

  getUser(session: Session | null): User | null {
    return session?.user ?? null;
  }

  private isAndroidNativePlatform(): boolean {
    return Capacitor.getPlatform() === "android";
  }

  private async ensureNativeGoogleInitialized(): Promise<void> {
    if (!appConfig.googleWebClientId) {
      throw new Error("Falta configurar VITE_GOOGLE_WEB_CLIENT_ID para el login nativo de Android.");
    }

    if (!nativeGoogleInitialization) {
      nativeGoogleInitialization = SocialLogin.initialize({
        google: {
          webClientId: appConfig.googleWebClientId,
          mode: "online"
        }
      });
    }

    await nativeGoogleInitialization;
  }

  private async signInWithNativeGoogle(client: NonNullable<ReturnType<typeof getSupabaseClient>>): Promise<void> {
    await this.ensureNativeGoogleInitialized();

    const { result } = await SocialLogin.login({
      provider: "google",
      options: {}
    });

    if (result.responseType !== "online" || !result.idToken) {
      throw new Error("Google no devolvio un idToken valido en Android.");
    }

    const { error } = await client.auth.signInWithIdToken({
      provider: "google",
      token: result.idToken,
      access_token: result.accessToken?.token
    });

    if (error) {
      throw error;
    }
  }
}
