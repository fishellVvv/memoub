import type { Locale, LocaleMessages } from "../lib/i18n";

const LOCALE_OPTIONS = [
  { id: "es", label: "Español", code: "ES" },
  { id: "en", label: "English", code: "EN" },
] as const;

type LocaleSelectorProps = {
  copy: LocaleMessages;
  locale: Locale;
  onSelectLocale: (locale: Locale) => void;
};

export function LocaleSelector({
  copy,
  locale,
  onSelectLocale,
}: LocaleSelectorProps) {
  return (
    <section
      className="theme-modal"
      role="dialog"
      aria-modal="true"
      aria-label={copy.languageSelectorLabel}
    >
      <div
        className="theme-selector"
        role="list"
        aria-label={copy.languageSelectorLabel}
      >
        {LOCALE_OPTIONS.map((option) => {
          const isActive = locale === option.id;

          return (
            <div
              key={option.id}
              className={`theme-option ${isActive ? "theme-option-active" : ""}`}
            >
              <button
                className="theme-option-main"
                type="button"
                onClick={() => onSelectLocale(option.id)}
              >
                <span className="theme-option-copy">
                  <span className="theme-option-label">{option.label}</span>
                  {isActive ? (
                    <span className="theme-option-mark">{copy.active}</span>
                  ) : null}
                </span>
              </button>
              <button
                className="theme-option-preview-button"
                type="button"
                onClick={() => onSelectLocale(option.id)}
              >
                <span className="theme-option-preview" aria-hidden="true">
                  <span className="theme-option-preview-top" />
                  <span className="theme-option-preview-note">{option.code}</span>
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
