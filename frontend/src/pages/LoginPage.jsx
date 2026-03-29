import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

function resolveRedirectTarget(locationState) {
  if (typeof locationState?.from === 'string' && locationState.from.startsWith('/')) {
    return locationState.from;
  }

  return '/';
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberMe: true
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email: form.email, password: form.password });
      navigate(resolveRedirectTarget(location.state), { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Anmelden"
        description="Melde dich an, um deinen Warenkorb zu verwalten und schneller einzukaufen."
      />

      <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full max-w-lg rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Account</p>
          <h2 className="mt-3 text-3xl font-extrabold text-ink">Anmelden</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Willkommen zurück. Melde dich mit deiner E-Mail-Adresse und deinem Passwort an.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                E-Mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={updateField}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={updateField}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-3 text-sm text-slate-600">
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={updateField}
                  className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                Angemeldet bleiben
              </label>

              <span className="text-sm text-slate-400">Passwort vergessen?</span>
            </div>

            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-ink px-5 py-4 text-sm font-bold text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? 'Anmeldung läuft...' : 'Jetzt anmelden'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm font-bold text-ink transition hover:bg-slate-50"
              >
                Als Gast weiter einkaufen
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Noch kein Kundenkonto?{' '}
            <Link to="/register" className="font-semibold text-brand transition hover:text-ink">
              Jetzt registrieren
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
