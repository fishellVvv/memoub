import type { LocalNoteSnapshot, Note, SyncConflict, SyncState } from "./types";
import { NoteRepository } from "./note-repository";

export function nowIsoString(): string {
  return new Date().toISOString();
}

export function createEmptyNote(userId: string): Note {
  return {
    id: crypto.randomUUID(),
    userId,
    content: "",
    updatedAt: nowIsoString()
  };
}

export function choosePreferredNote(localNote: Note | null, remoteNote: Note | null): Note | null {
  if (localNote && remoteNote) {
    return new Date(localNote.updatedAt).getTime() >= new Date(remoteNote.updatedAt).getTime() ? localNote : remoteNote;
  }

  return localNote ?? remoteNote;
}

function hasRemoteChangedSince(lastSyncedAt: string | null, remoteNote: Note | null): boolean {
  if (!remoteNote) {
    return false;
  }

  if (!lastSyncedAt) {
    return true;
  }

  return new Date(remoteNote.updatedAt).getTime() > new Date(lastSyncedAt).getTime();
}

export function createDebouncedTask(task: () => Promise<void>, delayMs: number) {
  let timer: number | null = null;

  const schedule = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
    }

    timer = window.setTimeout(() => {
      timer = null;
      void task();
    }, delayMs);
  };

  const cancel = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  return { schedule, cancel };
}

function buildSnapshot(note: Note, pendingChanges: boolean, lastSyncedAt: string | null): LocalNoteSnapshot {
  return {
    userId: note.userId,
    note,
    pendingChanges,
    lastSyncedAt
  };
}

export class SyncEngine {
  private currentNote: Note | null = null;
  private syncState: SyncState = {
    status: "idle",
    lastSyncedAt: null,
    hasPendingChanges: false,
    message: null,
    conflict: null
  };

  constructor(
    private readonly repository: Pick<NoteRepository, "loadLocal" | "saveLocal" | "fetchRemote" | "upsertRemote">,
    private readonly userId: string,
    private readonly updateNote: (note: Note) => void,
    private readonly updateState: (state: SyncState) => void
  ) {}

  async bootstrap(isOnline: boolean): Promise<Note> {
    this.setState({
      status: "loading",
      message: null
    });

    const localSnapshot = await this.repository.loadLocal(this.userId);
    if (localSnapshot) {
      this.currentNote = localSnapshot.note;
      this.setState({
        hasPendingChanges: localSnapshot.pendingChanges,
        lastSyncedAt: localSnapshot.lastSyncedAt
      });
      this.updateNote(localSnapshot.note);
    }

    if (!isOnline) {
      const fallback = localSnapshot?.note ?? createEmptyNote(this.userId);
      this.currentNote = fallback;
      this.updateNote(fallback);
      this.setState({
        status: "offline",
        hasPendingChanges: localSnapshot?.pendingChanges ?? false,
        message: "Usando la copia local.",
        conflict: null
      });
      return fallback;
    }

    const remoteNote = await this.repository.fetchRemote(this.userId);
    const preferredNote = choosePreferredNote(localSnapshot?.note ?? null, remoteNote) ?? createEmptyNote(this.userId);

    if (localSnapshot?.pendingChanges && localSnapshot.note) {
      if (!hasRemoteChangedSince(localSnapshot.lastSyncedAt, remoteNote)) {
        const syncedNote = await this.repository.upsertRemote(localSnapshot.note);
        await this.repository.saveLocal(buildSnapshot(syncedNote, false, syncedNote.updatedAt));
        this.currentNote = syncedNote;
        this.updateNote(syncedNote);
        this.setState({
          status: "saved",
          hasPendingChanges: false,
          lastSyncedAt: syncedNote.updatedAt,
          message: "Cambios locales sincronizados.",
          conflict: null
        });
        return syncedNote;
      }

      this.currentNote = localSnapshot.note;
      this.updateNote(localSnapshot.note);
      this.raiseConflict(localSnapshot.note, remoteNote!, localSnapshot.lastSyncedAt);
      return localSnapshot.note;
    }

    this.currentNote = preferredNote;
    this.updateNote(preferredNote);
    await this.repository.saveLocal(buildSnapshot(preferredNote, false, remoteNote?.updatedAt ?? localSnapshot?.lastSyncedAt ?? null));
    this.setState({
      status: "saved",
      hasPendingChanges: false,
      lastSyncedAt: remoteNote?.updatedAt ?? localSnapshot?.lastSyncedAt ?? null,
      message: remoteNote ? "Sincronizado con la nube." : "Preparado para sincronizar.",
      conflict: null
    });
    return preferredNote;
  }

  async stageLocalEdit(content: string, isOnline: boolean): Promise<Note> {
    const base = this.currentNote ?? createEmptyNote(this.userId);
    const updatedNote: Note = {
      ...base,
      content,
      updatedAt: nowIsoString()
    };

    this.currentNote = updatedNote;
    this.updateNote(updatedNote);
    await this.repository.saveLocal(buildSnapshot(updatedNote, true, this.syncState.lastSyncedAt));
    this.setState({
      status: isOnline ? "idle" : "offline",
      hasPendingChanges: true,
      message: isOnline ? "Cambios pendientes de sincronizar." : "Sin conexion. Guardado en local.",
      conflict: null
    });

    return updatedNote;
  }

  async syncNow(isOnline: boolean): Promise<Note | null> {
    if (!this.currentNote) {
      return null;
    }

    if (!isOnline) {
      this.setState({
        status: "offline",
        hasPendingChanges: true,
        message: "Sin conexion. Reintentaremos cuando vuelva la red.",
        conflict: null
      });
      return this.currentNote;
    }

    this.setState({
      status: "saving",
      message: null,
      conflict: null
    });

    try {
      const remoteNote = await this.repository.fetchRemote(this.userId);
      const preferredNote = choosePreferredNote(this.currentNote, remoteNote);
      if (!preferredNote) {
        return null;
      }

      if (this.syncState.hasPendingChanges && hasRemoteChangedSince(this.syncState.lastSyncedAt, remoteNote)) {
        this.raiseConflict(this.currentNote, remoteNote!, this.syncState.lastSyncedAt);
        return this.currentNote;
      }

      if (preferredNote !== this.currentNote) {
        this.currentNote = preferredNote;
        this.updateNote(preferredNote);
        await this.repository.saveLocal(buildSnapshot(preferredNote, false, preferredNote.updatedAt));
        this.setState({
          status: "saved",
          hasPendingChanges: false,
          lastSyncedAt: preferredNote.updatedAt,
          message: "La version remota era mas reciente.",
          conflict: null
        });
        return preferredNote;
      }

      const syncedNote = await this.repository.upsertRemote(this.currentNote);
      this.currentNote = syncedNote;
      this.updateNote(syncedNote);
      await this.repository.saveLocal(buildSnapshot(syncedNote, false, syncedNote.updatedAt));
      this.setState({
        status: "saved",
        hasPendingChanges: false,
        lastSyncedAt: syncedNote.updatedAt,
        message: "Todo sincronizado.",
        conflict: null
      });
      return syncedNote;
    } catch (error) {
      const isOfflineLike = error instanceof Error && /network|fetch/i.test(error.message);
      this.setState({
        status: isOfflineLike ? "offline" : "error",
        hasPendingChanges: true,
        message: error instanceof Error ? error.message : "No se pudo sincronizar.",
        conflict: null
      });
      return this.currentNote;
    }
  }

  async refreshFromRemote(isOnline: boolean): Promise<Note | null> {
    if (!isOnline || this.syncState.hasPendingChanges) {
      return this.currentNote;
    }

    const remoteNote = await this.repository.fetchRemote(this.userId);
    if (!remoteNote) {
      return this.currentNote;
    }

    if (!this.currentNote) {
      this.currentNote = remoteNote;
      this.updateNote(remoteNote);
      await this.repository.saveLocal(buildSnapshot(remoteNote, false, remoteNote.updatedAt));
      this.setState({
        status: "saved",
        hasPendingChanges: false,
        lastSyncedAt: remoteNote.updatedAt,
        message: "Nota remota cargada.",
        conflict: null
      });
      return remoteNote;
    }

    const preferredNote = choosePreferredNote(this.currentNote, remoteNote);
    if (preferredNote !== remoteNote) {
      return this.currentNote;
    }

    this.currentNote = remoteNote;
    this.updateNote(remoteNote);
    await this.repository.saveLocal(buildSnapshot(remoteNote, false, remoteNote.updatedAt));
    this.setState({
      status: "saved",
      hasPendingChanges: false,
      lastSyncedAt: remoteNote.updatedAt,
      message: "Actualizado desde otra sesion.",
      conflict: null
    });
    return remoteNote;
  }

  async resolveConflict(choice: "local" | "remote"): Promise<Note | null> {
    const conflict = this.syncState.conflict;
    if (!conflict) {
      return this.currentNote;
    }

    if (choice === "remote") {
      this.currentNote = conflict.remoteNote;
      this.updateNote(conflict.remoteNote);
      await this.repository.saveLocal(buildSnapshot(conflict.remoteNote, false, conflict.remoteNote.updatedAt));
      this.setState({
        status: "saved",
        hasPendingChanges: false,
        lastSyncedAt: conflict.remoteNote.updatedAt,
        message: "Se ha mantenido la version remota.",
        conflict: null
      });
      return conflict.remoteNote;
    }

    this.setState({
      status: "saving",
      message: "Guardando tu version local...",
      conflict
    });

    const syncedNote = await this.repository.upsertRemote(conflict.localNote);
    this.currentNote = syncedNote;
    this.updateNote(syncedNote);
    await this.repository.saveLocal(buildSnapshot(syncedNote, false, syncedNote.updatedAt));
    this.setState({
      status: "saved",
      hasPendingChanges: false,
      lastSyncedAt: syncedNote.updatedAt,
      message: "Se ha mantenido tu version local.",
      conflict: null
    });
    return syncedNote;
  }

  private raiseConflict(localNote: Note, remoteNote: Note, lastSyncedAt: string | null): void {
    const conflict: SyncConflict = {
      localNote,
      remoteNote
    };

    this.setState({
      status: "conflict",
      hasPendingChanges: true,
      lastSyncedAt,
      message: "Hay cambios distintos en otro dispositivo. Elige que version mantener.",
      conflict
    });
  }

  private setState(partial: Partial<SyncState>): void {
    this.syncState = {
      ...this.syncState,
      ...partial
    };
    this.updateState(this.syncState);
  }
}
