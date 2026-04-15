import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase";

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
}
