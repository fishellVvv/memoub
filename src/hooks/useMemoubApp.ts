import { useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthService } from "../lib/auth-service";
import { appConfig } from "../lib/config";
import {
  getDesktopOAuthCallback,
  type DesktopAuthCallback,
  listenToDesktopOAuthCallbacks,
} from "../lib/desktop-auth";
import { NoteRepository } from "../lib/note-repository";
import { createDebouncedTask, createEmptyNote, SyncEngine } from "../lib/sync-engine";
import type { Note, SyncState } from "../lib/types";

const DEFAULT_SYNC_STATE: SyncState = {
  status: "idle",
  lastSyncedAt: null,
  hasPendingChanges: false,
  message: null,
  conflict: null
};

type AuthState = "loading" | "anonymous" | "authenticated";
const REMOTE_REFRESH_INTERVAL_MS = 4000;

export function useMemoubApp() {
  const authService = useMemo(() => new AuthService(), []);
  const noteRepository = useMemo(() => new NoteRepository(), []);
  const [authState, setAuthState] = useState<AuthState>(appConfig.isSupabaseConfigured ? "loading" : "anonymous");
  const [user, setUser] = useState<User | null>(null);
  const [noteContent, setNoteContentState] = useState("");
  const [syncState, setSyncState] = useState<SyncState>(DEFAULT_SYNC_STATE);
  const syncEngineRef = useRef<SyncEngine | null>(null);
  const syncTaskRef = useRef(createDebouncedTask(async () => undefined, 700));
  const syncStateRef = useRef<SyncState>(DEFAULT_SYNC_STATE);

  useEffect(() => {
    syncStateRef.current = syncState;
  }, [syncState]);

  useEffect(() => {
    if (!appConfig.isSupabaseConfigured) {
      return;
    }

    let active = true;
    let removeDesktopAuthListener = () => {};

    const handleDesktopAuthCallback = async (
      callback: DesktopAuthCallback | null,
    ) => {
      if (!callback || !active) {
        return;
      }

      if (callback.kind === "error") {
        setAuthState("anonymous");
        setSyncState({
          ...DEFAULT_SYNC_STATE,
          status: "error",
          message: callback.errorDescription
            ? `Google devolvio un error: ${callback.errorDescription}`
            : `Google devolvio un error: ${callback.error}`,
        });
        return;
      }

      setAuthState("loading");

      try {
        await authService.completeDesktopAuthCode(callback.code);
      } catch (error) {
        if (!active) {
          return;
        }

        setAuthState("anonymous");
        setSyncState({
          ...DEFAULT_SYNC_STATE,
          status: "error",
          message: error instanceof Error
            ? error.message
            : "No se pudo completar el login de Windows.",
        });
      }
    };

    const bootstrap = async () => {
      try {
        await handleDesktopAuthCallback(await getDesktopOAuthCallback());
        if (!active) {
          return;
        }

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
    void listenToDesktopOAuthCallbacks(async (callback) => {
      await handleDesktopAuthCallback(callback);
    }).then((unlisten) => {
      removeDesktopAuthListener = unlisten;
    });

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
      removeDesktopAuthListener();
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
        message: error instanceof Error ? error.message : "No se pudo cargar la nota.",
        conflict: null
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

  useEffect(() => {
    if (!user) {
      return;
    }

    const refreshRemoteNote = async () => {
      const currentSyncState = syncStateRef.current;

      if (!syncEngineRef.current || !window.navigator.onLine) {
        return;
      }

      if (currentSyncState.hasPendingChanges || currentSyncState.status === "saving" || currentSyncState.status === "loading") {
        return;
      }

      try {
        await syncEngineRef.current.refreshFromRemote(true);
      } catch {
        return;
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshRemoteNote();
      }
    }, REMOTE_REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshRemoteNote();
      }
    };

    const handleFocus = () => {
      void refreshRemoteNote();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user]);

  const setNoteContent = async (content: string) => {
    if (syncStateRef.current.conflict) {
      return;
    }

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

  const keepLocalConflictVersion = async () => {
    if (syncEngineRef.current) {
      await syncEngineRef.current.resolveConflict("local");
    }
  };

  const useRemoteConflictVersion = async () => {
    if (syncEngineRef.current) {
      await syncEngineRef.current.resolveConflict("remote");
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
    keepLocalConflictVersion,
    useRemoteConflictVersion,
    userEmail: user?.email ?? "",
    isConfigured: appConfig.isSupabaseConfigured
  };
}
