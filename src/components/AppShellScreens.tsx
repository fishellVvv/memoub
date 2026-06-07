import type { LocaleMessages } from "../lib/i18n";

type ConfigScreenProps = {
  copy: LocaleMessages;
};

type AuthScreenProps = {
  copy: LocaleMessages;
  onSignIn: () => void;
};

export function ConfigScreen({ copy }: ConfigScreenProps) {
  return (
    <main className="shell">
      <section className="card hero-card">
        <p className="eyebrow">{copy.configEyebrow}</p>
        <h1>{copy.configTitle}</h1>
        <p className="lead">
          {copy.configLeadBefore}
          <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>
          {copy.configLeadAfter}
        </p>
        <p className="helper">{copy.configHelper}</p>
      </section>
    </main>
  );
}

export function AuthScreen({ copy, onSignIn }: AuthScreenProps) {
  return (
    <main className="shell">
      <section className="card hero-card">
        <p className="eyebrow">{copy.authEyebrow}</p>
        <h1>{copy.authTitle}</h1>
        <p className="lead">{copy.authLead}</p>
        <button className="primary-button" onClick={onSignIn}>
          {copy.signInWithGoogle}
        </button>
      </section>
    </main>
  );
}
