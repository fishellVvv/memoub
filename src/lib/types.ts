export type Note = {
  id: string;
  userId: string;
  content: string;
  updatedAt: string;
};

export type SyncStatus = "idle" | "loading" | "saving" | "saved" | "offline" | "error";

export type SyncState = {
  status: SyncStatus;
  lastSyncedAt: string | null;
  hasPendingChanges: boolean;
  message: string | null;
};

export type LocalNoteSnapshot = {
  userId: string;
  note: Note;
  pendingChanges: boolean;
  lastSyncedAt: string | null;
};
