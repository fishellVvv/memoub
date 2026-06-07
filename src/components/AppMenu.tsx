import type { LocaleMessages } from "../lib/i18n";

type AppMenuProps = {
  copy: LocaleMessages;
  open: boolean;
  userEmail: string;
  onChangeTheme: () => void;
  onChangeLanguage: () => void;
  onRetrySync: () => void;
  onSignOut: () => void;
};

export function AppMenu({
  copy,
  open,
  userEmail,
  onChangeTheme,
  onChangeLanguage,
  onRetrySync,
  onSignOut,
}: AppMenuProps) {
  return (
    <aside className={`menu-sheet ${open ? "menu-sheet-open" : ""}`}>
      <div className="menu-group">
        <div className="menu-account">
          <span className="menu-item-detail">{userEmail || copy.noEmail}</span>
        </div>
      </div>
      <div className="menu-group">
        <button
          className="menu-item-button menu-item-button-split"
          type="button"
          onClick={onChangeTheme}
        >
          <span>{copy.changeTheme}</span>
        </button>
        <button className="menu-item-button" type="button" onClick={onChangeLanguage}>
          {copy.changeLanguage}
        </button>
      </div>
      <div className="menu-group">
        <button className="menu-item-button" type="button" onClick={onRetrySync}>
          {copy.forceSync}
        </button>
        <button
          className="menu-item-button menu-item-button-danger"
          type="button"
          onClick={onSignOut}
        >
          {copy.signOut}
        </button>
      </div>
    </aside>
  );
}
