import type { LocaleMessages } from "../lib/i18n";
import type { UpdateCheckResult } from "../lib/updates/types";

type UpdateSheetProps = {
  copy: LocaleMessages;
  checking: boolean;
  result: UpdateCheckResult | null;
  onOpenUpdate: () => void;
  onClose: () => void;
};

function getUpdateCopy(
  copy: LocaleMessages,
  checking: boolean,
  result: UpdateCheckResult | null,
) {
  if (checking) {
    return {
      title: copy.checkingUpdates,
      body: null
    };
  }

  switch (result?.status) {
    case "available":
      return {
        title: copy.updateAvailableTitle,
        body: copy.updateAvailableBody
      };
    case "up-to-date":
      return {
        title: copy.updateNotAvailableTitle,
        body: copy.updateNotAvailableBody
      };
    case "unsupported":
      return {
        title: copy.updateUnsupportedTitle,
        body: copy.updateUnsupportedBody
      };
    case "error":
    default:
      return {
        title: copy.updateErrorTitle,
        body: copy.updateErrorBody
      };
  }
}

export function UpdateSheet({
  copy,
  checking,
  result,
  onOpenUpdate,
  onClose,
}: UpdateSheetProps) {
  const updateCopy = getUpdateCopy(copy, checking, result);
  const availableResult = result?.status === "available" ? result : null;

  return (
    <section
      className="theme-modal update-sheet"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label={updateCopy.title}
    >
      <div className="update-sheet-copy">
        <h2>{updateCopy.title}</h2>
        {updateCopy.body ? <p>{updateCopy.body}</p> : null}
      </div>

      {availableResult ? (
        <div className="update-version-list">
          <p>
            <span>{copy.currentVersionLabel}</span>
            <strong>{availableResult.currentVersion}</strong>
          </p>
          <p>
            <span>{copy.availableVersionLabel}</span>
            <strong>{availableResult.latestRelease.version}</strong>
          </p>
        </div>
      ) : null}

      <div className="update-sheet-actions">
        {availableResult ? (
          <button className="primary-button" type="button" onClick={onOpenUpdate}>
            {copy.openUpdate}
          </button>
        ) : null}
        <button
          className="ghost-button"
          type="button"
          onClick={onClose}
          disabled={checking}
        >
          {copy.closeUpdatePanel}
        </button>
      </div>
    </section>
  );
}
