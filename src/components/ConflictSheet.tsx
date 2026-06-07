import type { Locale, LocaleMessages } from "../lib/i18n";
import type { SyncConflict } from "../lib/types";

type ConflictSheetProps = {
  conflict: SyncConflict;
  copy: LocaleMessages;
  locale: Locale;
  onKeepLocal: () => void;
  onUseRemote: () => void;
};

function formatConflictDate(
  value: string | null,
  locale: Locale,
  copy: LocaleMessages,
): string {
  if (!value) {
    return copy.noSyncYet;
  }

  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function previewConflictContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.length > 140 ? `${trimmed.slice(0, 140)}...` : trimmed;
}

export function ConflictSheet({
  conflict,
  copy,
  locale,
  onKeepLocal,
  onUseRemote,
}: ConflictSheetProps) {
  return (
    <section className="conflict-sheet">
      <div className="conflict-sheet-copy">
        <p className="eyebrow">{copy.conflictEyebrow}</p>
        <h2>{copy.conflictTitle}</h2>
        <p>{copy.conflictBody}</p>
      </div>
      <div className="conflict-grid">
        <article className="conflict-card">
          <p className="conflict-title">{copy.localVersion}</p>
          <p className="conflict-time">
            {formatConflictDate(conflict.localNote.updatedAt, locale, copy)}
          </p>
          <p className="conflict-preview">
            {previewConflictContent(conflict.localNote.content) || copy.noText}
          </p>
          <button className="primary-button" onClick={onKeepLocal}>
            {copy.keepLocalVersion}
          </button>
        </article>
        <article className="conflict-card">
          <p className="conflict-title">{copy.remoteVersion}</p>
          <p className="conflict-time">
            {formatConflictDate(conflict.remoteNote.updatedAt, locale, copy)}
          </p>
          <p className="conflict-preview">
            {previewConflictContent(conflict.remoteNote.content) || copy.noText}
          </p>
          <button className="ghost-button" onClick={onUseRemote}>
            {copy.useRemoteVersion}
          </button>
        </article>
      </div>
    </section>
  );
}
