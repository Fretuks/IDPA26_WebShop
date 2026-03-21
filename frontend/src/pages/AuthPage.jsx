import { Link } from 'react-router-dom';
import Header from '../components/Header';

function AuthPage() {
  return (
    <div className="min-h-screen">
      <Header
        title="Login / Register"
        description="Diese Seite ist der separate Einstieg für Anmeldung und Registrierung. Die Produktseite bleibt dadurch bewusst einfacher."
      />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Login</p>
            <h2 className="mt-3 text-2xl font-extrabold text-ink">Bereits ein Konto?</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Melde dich hier an, wenn du schon registriert bist. Die eigentliche Auth-Form kann später hier
              eingebaut werden.
            </p>
            <button
              type="button"
              className="mt-8 w-full rounded-2xl bg-ink px-5 py-4 text-sm font-bold text-white transition hover:bg-brand"
            >
              Login
            </button>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Register</p>
            <h2 className="mt-3 text-2xl font-extrabold text-ink">Neu hier?</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Erstelle ein neues Konto, um später den Warenkorb und weitere Funktionen zu nutzen.
            </p>
            <button
              type="button"
              className="mt-8 w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm font-bold text-ink transition hover:bg-slate-50"
            >
              Registrieren
            </button>
          </article>
        </section>

        <div className="mt-6 text-center">
          <Link to="/products" className="text-sm font-semibold text-brand transition hover:text-ink">
            Direkt zur Produktseite
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AuthPage;
