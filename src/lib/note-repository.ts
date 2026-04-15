import { getSupabaseClient } from "./supabase";
import { deleteFromStore, readFromStore, writeToStore } from "./indexed-db";
import type { LocalNoteSnapshot, Note } from "./types";

type NoteRow = {
  id: string;
  user_id: string;
  content: string;
  updated_at: string;
};

const LOCAL_NOTE_KEY_PREFIX = "note:";

function noteKey(userId: string): string {
  return `${LOCAL_NOTE_KEY_PREFIX}${userId}`;
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    content: row.content,
    updatedAt: row.updated_at
  };
}

function noteToRow(note: Note): NoteRow {
  return {
    id: note.id,
    user_id: note.userId,
    content: note.content,
    updated_at: note.updatedAt
  };
}

export class NoteRepository {
  async loadLocal(userId: string): Promise<LocalNoteSnapshot | null> {
    return readFromStore<LocalNoteSnapshot>(noteKey(userId));
  }

  async saveLocal(snapshot: LocalNoteSnapshot): Promise<void> {
    await writeToStore(noteKey(snapshot.userId), snapshot);
  }

  async clearLocal(userId: string): Promise<void> {
    await deleteFromStore(noteKey(userId));
  }

  async fetchRemote(userId: string): Promise<Note | null> {
    const client = getSupabaseClient();
    if (!client) {
      return null;
    }

    const { data, error } = await client
      .from("notes")
      .select("id,user_id,content,updated_at")
      .eq("user_id", userId)
      .maybeSingle<NoteRow>();

    if (error) {
      throw error;
    }

    return data ? rowToNote(data) : null;
  }

  async upsertRemote(note: Note): Promise<Note> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error("Supabase no esta configurado.");
    }

    const { data, error } = await client
      .from("notes")
      .upsert(noteToRow(note), { onConflict: "user_id" })
      .select("id,user_id,content,updated_at")
      .single<NoteRow>();

    if (error) {
      throw error;
    }

    return rowToNote(data);
  }
}
