import { useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthService } from "../lib/auth-service";
import { appConfig } from "../lib/config";
import { NoteRepository } from "../lib/note-repository";
import { createDebouncedTask, createEmptyNote, SyncEngine } from "../lib/sync-engine";
import type { Note, SyncState } from "../lib/types";

const DEFAULT_SYNC_STATE: SyncState = {
  status: "idle",
  lastSyncedAt: null,
  hasPendingChanges: false,
  message: null
};

type AuthState = "loading" | "anonymous" | "authenticated";

export function useMemoubApp() {
  const authService = useMemo(() => new AuthService(), []);
  const noteRepository = useMemo(() => new NoteRepository(), []);
  const [authState, setAuthState] = useState<AuthState>(appConfig.isSupabaseConfigured ? "loading" : "anonymous");
  const [user, setUser] = useState<User | null>(null);
  const [noteContent, setNoteContentState] = useState("");
  const [syncState, setSyncState] = useState<SyncState>(DEFAULT_SYNC_STATE);
  const syncEngineRef = useRef<SyncEngine | null>(null);
  const syncTaskRef = useRef(createDebouncedTask(async () => undefined, 700));

  useEffect(() => {
    if (!appConfig.isSupabaseConfigured) {
      return;
    }

    let active = true;

    const bootstrap = async () => {
      try {
        const session = await authService.getSession();
        if (!active) {
          return;
        }

        const nextUser = authService.getUser(session);
        setUser(nextUser);
        setAuthState(nextUser ? "authenticated" : "anonymous");
      } catch (error) {
        if (!active) {
          return;
        }

        setAuthState("anonymous");
        setSyncState({
          ...DEFAULT_SYNC_STATE,
          status: "error",
          message: error instanceof Error ? error.message : "No se pudo restaurar la sesion."
        });
      }
    };

    void bootstrap();

    const unsubscribe = authService.onAuthStateChange((_event, session) => {
      const nextUser = authService.getUser(session);
      setUser(nextUser);
      setAuthState(nextUser ? "authenticated" : "anonymous");
      if (!nextUser) {
        setNoteContentState("");
        setSyncState(DEFAULT_SYNC_STATE);
        syncEngineRef.current = null;
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [authService]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    const syncEngine = new SyncEngine(
      noteRepository,
      user.id,
      (note: Note) => {
        if (active) {
          setNoteContentState(note.content);
        }
      },
      (state: SyncState) => {
        if (active) {
          setSyncState(state);
        }
      }
    );

    syncEngineRef.current = syncEngine;
    syncTaskRef.current = createDebouncedTask(async () => {
      if (syncEngineRef.current) {
        await syncEngineRef.current.syncNow(window.navigator.onLine);
      }
    }, 700);

    void syncEngine.bootstrap(window.navigator.onLine).catch((error: unknown) => {
      if (!active) {
        return;
      }

      setSyncState({
        status: "error",
        hasPendingChanges: false,
        lastSyncedAt: null,
        message: error instanceof Error ? error.message : "No se pudo cargar la nota."
      });
      setNoteContentState(createEmptyNote(user.id).content);
    });

    return () => {
      active = false;
      syncTaskRef.current.cancel();
    };
  }, [noteRepository, user]);

  useEffect(() => {
    const handleOnline = () => {
      syncTaskRef.current.schedule();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const setNoteContent = async (content: string) => {
    setNoteContentState(content);
    if (!syncEngineRef.current) {
      return;
    }

    await syncEngineRef.current.stageLocalEdit(content, window.navigator.onLine);
    syncTaskRef.current.schedule();
  };

  const signIn = async () => {
    await authService.signInWithGoogle();
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const retrySync = async () => {
    if (syncEngineRef.current) {
      await syncEngineRef.current.syncNow(window.navigator.onLine);
    }
  };

  return {
    authState,
    syncState,
    noteContent,
    setNoteContent,
    signIn,
    signOut,
    retrySync,
    userEmail: user?.email ?? "Sin email",
    isConfigured: appConfig.isSupabaseConfigured
  };
}
