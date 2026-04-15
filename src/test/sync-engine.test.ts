import { beforeEach, describe, expect, it, vi } from "vitest";
import "fake-indexeddb/auto";
import { readFromStore, writeToStore } from "../lib/indexed-db";
import { choosePreferredNote, createDebouncedTask, SyncEngine } from "../lib/sync-engine";
import type { LocalNoteSnapshot, Note, SyncState } from "../lib/types";

function buildNote(overrides: Partial<Note> = {}): Note {
  return {
    id: overrides.id ?? "note-1",
    userId: overrides.userId ?? "user-1",
    content: overrides.content ?? "",
    updatedAt: overrides.updatedAt ?? "2026-04-15T10:00:00.000Z"
  };
}

describe("createDebouncedTask", () => {
  it("runs only once after consecutive schedules", async () => {
    vi.useFakeTimers();
    const task = vi.fn(async () => undefined);
    const debounced = createDebouncedTask(task, 250);

    debounced.schedule();
    debounced.schedule();
    debounced.schedule();

    await vi.advanceTimersByTimeAsync(249);
    expect(task).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(task).toHaveBeenCalledTimes(1);
  });
});

describe("indexed db helpers", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("restores a stored snapshot", async () => {
    const snapshot: LocalNoteSnapshot = {
      userId: "user-1",
      note: buildNote({ content: "cached note" }),
      pendingChanges: true,
      lastSyncedAt: "2026-04-15T10:00:00.000Z"
    };

    await writeToStore("note:user-1", snapshot);
    const restored = await readFromStore<LocalNoteSnapshot>("note:user-1");

    expect(restored).toEqual(snapshot);
  });
});

describe("choosePreferredNote", () => {
  it("prefers the newest note when both exist", () => {
    const local = buildNote({ updatedAt: "2026-04-15T10:00:00.000Z" });
    const remote = buildNote({ id: "note-2", updatedAt: "2026-04-15T10:00:01.000Z" });

    expect(choosePreferredNote(local, remote)).toEqual(remote);
  });
});

describe("SyncEngine", () => {
  it("marks sync as saved after a successful push", async () => {
    let latestState: SyncState | null = null;
    let latestNote: Note | null = null;

    const repository = {
      loadLocal: vi.fn(async () => null),
      saveLocal: vi.fn(async () => undefined),
      fetchRemote: vi.fn(async () => null),
      upsertRemote: vi.fn(async (note: Note) => note)
    };

    const engine = new SyncEngine(
      repository,
      "user-1",
      (note) => {
        latestNote = note;
      },
      (state) => {
        latestState = state;
      }
    );

    await engine.bootstrap(true);
    await engine.stageLocalEdit("hola", true);
    await engine.syncNow(true);

    expect(latestNote).not.toBeNull();
    if (!latestNote) {
      throw new Error("Expected a synced note.");
    }
    expect(latestNote.content).toBe("hola");
    expect(latestState).toMatchObject({
      status: "saved",
      hasPendingChanges: false
    });
  });

  it("keeps pending changes and reports offline state when sync cannot run", async () => {
    let latestState: SyncState | null = null;

    const repository = {
      loadLocal: vi.fn(async () => null),
      saveLocal: vi.fn(async () => undefined),
      fetchRemote: vi.fn(async () => {
        throw new Error("Network request failed");
      }),
      upsertRemote: vi.fn(async (note: Note) => note)
    };

    const engine = new SyncEngine(
      repository,
      "user-1",
      () => undefined,
      (state) => {
        latestState = state;
      }
    );

    await engine.bootstrap(true).catch(() => undefined);
    await engine.stageLocalEdit("pendiente", false);
    await engine.syncNow(false);

    expect(latestState).toMatchObject({
      status: "offline",
      hasPendingChanges: true
    });
  });

  it("applies a newer remote note during refresh", async () => {
    let latestNote: Note | null = null;
    let latestState: SyncState | null = null;

    const repository = {
      loadLocal: vi.fn(async () => null),
      saveLocal: vi.fn(async () => undefined),
      fetchRemote: vi
        .fn<() => Promise<Note | null>>()
        .mockResolvedValueOnce(
          buildNote({
            content: "nota inicial",
            updatedAt: "2026-04-15T10:00:00.000Z"
          })
        )
        .mockResolvedValueOnce(
          buildNote({
            content: "nota desde otra sesion",
            updatedAt: "2026-04-15T10:00:10.000Z"
          })
        ),
      upsertRemote: vi.fn(async (note: Note) => note)
    };

    const engine = new SyncEngine(
      repository,
      "user-1",
      (note) => {
        latestNote = note;
      },
      (state) => {
        latestState = state;
      }
    );

    await engine.bootstrap(true);
    await engine.refreshFromRemote(true);

    expect(latestNote).not.toBeNull();
    if (!latestNote) {
      throw new Error("Expected refreshed note.");
    }
    expect(latestNote.content).toBe("nota desde otra sesion");
    expect(latestState).toMatchObject({
      status: "saved",
      hasPendingChanges: false,
      message: "Actualizado desde otra sesion."
    });
  });

  it("does not replace local pending edits during remote refresh", async () => {
    let latestNote: Note | null = null;

    const repository = {
      loadLocal: vi.fn(async () => null),
      saveLocal: vi.fn(async () => undefined),
      fetchRemote: vi
        .fn<() => Promise<Note | null>>()
        .mockResolvedValueOnce(
          buildNote({
            content: "nota inicial",
            updatedAt: "2026-04-15T10:00:00.000Z"
          })
        )
        .mockResolvedValueOnce(
          buildNote({
            content: "cambio remoto",
            updatedAt: "2026-04-15T10:00:10.000Z"
          })
        ),
      upsertRemote: vi.fn(async (note: Note) => note)
    };

    const engine = new SyncEngine(
      repository,
      "user-1",
      (note) => {
        latestNote = note;
      },
      () => undefined
    );

    await engine.bootstrap(true);
    await engine.stageLocalEdit("edicion local pendiente", true);
    await engine.refreshFromRemote(true);

    expect(latestNote).not.toBeNull();
    if (!latestNote) {
      throw new Error("Expected local note to remain.");
    }
    expect(latestNote.content).toBe("edicion local pendiente");
    expect(repository.fetchRemote).toHaveBeenCalledTimes(1);
  });

  it("raises a conflict when a newer remote note exists while local changes are pending", async () => {
    let latestState: SyncState | null = null;
    let latestNote: Note | null = null;
    let localNoteId = "shared-id";

    const repository = {
      loadLocal: vi.fn(async () => null),
      saveLocal: vi.fn(async () => undefined),
      fetchRemote: vi.fn(async () =>
        buildNote({
          id: localNoteId,
          content: "remote wins",
          updatedAt: "3026-04-15T10:01:00.000Z"
        })
      ),
      upsertRemote: vi.fn(async (note: Note) => note)
    };

    const engine = new SyncEngine(
      repository,
      "user-1",
      (note) => {
        latestNote = note;
      },
      (state) => {
        latestState = state;
      }
    );

    await engine.bootstrap(false);
    await engine.stageLocalEdit("local older", true);
    if (!latestNote) {
      throw new Error("Expected a local note before syncing.");
    }
    localNoteId = latestNote.id;
    await engine.syncNow(true);

    expect(repository.upsertRemote).not.toHaveBeenCalled();
    expect(latestNote.content).toBe("local older");
    expect(latestState).toMatchObject({
      status: "conflict",
      hasPendingChanges: true,
      message: "Hay cambios distintos en otro dispositivo. Elige que version mantener."
    });
    expect(latestState?.conflict?.remoteNote.content).toBe("remote wins");
  });

  it("can keep the local version after a conflict", async () => {
    let latestNote: Note | null = null;
    let latestState: SyncState | null = null;

    const repository = {
      loadLocal: vi.fn(async () => ({
        userId: "user-1",
        note: buildNote({
          id: "shared-id",
          content: "local older",
          updatedAt: "2026-04-15T10:00:00.000Z"
        }),
        pendingChanges: true,
        lastSyncedAt: "2026-04-15T10:00:00.000Z"
      })),
      saveLocal: vi.fn(async () => undefined),
      fetchRemote: vi.fn(async () =>
        buildNote({
          id: "shared-id",
          content: "remote wins",
          updatedAt: "2026-04-15T10:01:00.000Z"
        })
      ),
      upsertRemote: vi.fn(async (note: Note) => ({
        ...note,
        updatedAt: "2026-04-15T10:02:00.000Z"
      }))
    };

    const engine = new SyncEngine(
      repository,
      "user-1",
      (note) => {
        latestNote = note;
      },
      (state) => {
        latestState = state;
      }
    );

    await engine.bootstrap(true);
    await engine.resolveConflict("local");

    expect(repository.upsertRemote).toHaveBeenCalledTimes(1);
    expect(latestNote).not.toBeNull();
    if (!latestNote) {
      throw new Error("Expected a resolved local note.");
    }
    expect(latestNote.content).toBe("local older");
    expect(latestState).toMatchObject({
      status: "saved",
      hasPendingChanges: false,
      message: "Se ha mantenido tu version local."
    });
    expect(latestState?.conflict).toBeNull();
  });

  it("can use the remote version after a conflict", async () => {
    let latestNote: Note | null = null;
    let latestState: SyncState | null = null;

    const remoteNewerRepository = {
      loadLocal: vi.fn(async () => ({
        userId: "user-1",
        note: buildNote({
          id: "shared-id",
          content: "local older",
          updatedAt: "2026-04-15T10:00:00.000Z"
        }),
        pendingChanges: true,
        lastSyncedAt: "2026-04-15T10:00:00.000Z"
      })),
      saveLocal: vi.fn(async () => undefined),
      fetchRemote: vi.fn(async () =>
        buildNote({
          id: "shared-id",
          content: "remote wins",
          updatedAt: "2026-04-15T10:01:00.000Z"
        })
      ),
      upsertRemote: vi.fn(async (note: Note) => note)
    };

    const engineWithPendingLocal = new SyncEngine(
      remoteNewerRepository,
      "user-1",
      (note) => {
        latestNote = note;
      },
      (state) => {
        latestState = state;
      }
    );

    await engineWithPendingLocal.bootstrap(true);
    await engineWithPendingLocal.resolveConflict("remote");

    expect(remoteNewerRepository.upsertRemote).not.toHaveBeenCalled();
    expect(latestNote).not.toBeNull();
    if (!latestNote) {
      throw new Error("Expected remote note to be chosen.");
    }
    expect(latestNote.content).toBe("remote wins");
    expect(latestState).toMatchObject({
      status: "saved",
      hasPendingChanges: false,
      message: "Se ha mantenido la version remota."
    });
    expect(latestState?.conflict).toBeNull();
  });
});
