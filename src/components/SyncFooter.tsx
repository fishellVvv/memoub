import type { LocaleMessages } from "../lib/i18n";
import type { SyncState } from "../lib/types";

type SyncFooterProps = {
  copy: LocaleMessages;
  syncState: SyncState;
  statusLabel: string;
  footerDetail: string;
};

function formatFooterDate(value: string | null, copy: LocaleMessages): string {
  if (!value) {
    return copy.noSyncYet;
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} | ${hours}:${minutes}:${seconds}`;
}

export function formatPreviewFooterDate(
  value: string | null,
  copy?: LocaleMessages,
): string {
  if (!value) {
    return copy?.noSyncYet ?? "Aun sin sincronizar";
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} | ${hours}:${minutes}:${seconds}`;
}

export function SyncFooter({
  copy,
  syncState,
  statusLabel,
  footerDetail,
}: SyncFooterProps) {
  return (
    <footer className={`mobile-footer footer-${syncState.status}`}>
      <div className="footer-status-block">
        <span
          className={`status-orb status-orb-${syncState.status}`}
          title={statusLabel}
          aria-label={statusLabel}
        />
        <div className="footer-copy">
          <div className="footer-inline">
            <span className="footer-secondary">
              {formatFooterDate(syncState.lastSyncedAt, copy)}
            </span>
            <span className="footer-tertiary">{footerDetail}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
