import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';

function MetricCard({ label, value, hint }) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-card">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-ink">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </article>
  );
}

function AdminLayout({ activeSection, onSectionChange, user, stats, children }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Admin Bereich</p>
              <h1 className="mt-2 text-3xl font-extrabold text-ink">Admin Panel</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Verwalte Produkte, Kategorien, Bestellungen und Benutzer mit der bestehenden REST-API.
              </p>
              <Link
                to="/"
                className="mt-4 inline-flex rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Zurück zur Startseite
              </Link>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
              <p className="font-semibold text-ink">
                {user?.firstname} {user?.lastname}
              </p>
              <p className="mt-1">Rolle: {user?.role}</p>
              <p className="mt-1 text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Produkte" value={stats.products} hint="Gesamtzahl inkl. inaktiv" />
            <MetricCard label="Kategorien" value={stats.categories} hint="Verfügbare Shop-Struktur" />
            <MetricCard label="Bestellungen" value={stats.orders} hint="Alle Bestellungen im System" />
            <MetricCard label="Benutzer" value={stats.users} hint="Registrierte Konten" />
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <Sidebar activeSection={activeSection} onSelect={onSectionChange} />
          <section>{children}</section>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
