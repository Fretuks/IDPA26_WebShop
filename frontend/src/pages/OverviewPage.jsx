import { Link, useLocation } from 'react-router-dom';
import Header from '../components/Header';

const highlights = [
  {
    title: 'Produkte ansehen',
    text: 'Hier findest du alle Produkte im Shop.'
  },
  {
    title: 'Details prüfen',
    text: 'Auf der Produktseite siehst du Preis, Beschreibung und Lagerbestand.'
  },
  {
    title: 'Mit Konto bestellen',
    text: 'Mit einem Konto kannst du Produkte in den Warenkorb legen.'
  }
];

function OverviewPage() {
  const location = useLocation();
  const addressNotice = location.state?.addressNotice || '';

  return (
    <div className="min-h-screen">
      <Header
        title="Willkommen"
        description="Willkommen im Shop. Hier kannst du Produkte ansehen und direkt bestellen."
        showHero
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {addressNotice ? (
          <div className="mb-6 rounded-[1.75rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-card">
            {addressNotice}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Startseite</p>
            <h2 className="mt-3 text-3xl font-extrabold text-ink sm:text-4xl">Willkommen</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Du kannst direkt durch das Sortiment gehen oder dich anmelden, wenn du den Warenkorb nutzen möchtest.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <article key={item.title} className="rounded-[1.75rem] bg-slate-50 p-5">
                  <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Weiter geht's</p>
            <h2 className="mt-3 text-2xl font-extrabold text-ink">So kannst du loslegen</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Wähle einfach, was du als Nächstes machen möchtest.
            </p>

            <div className="mt-8 space-y-3">
              <Link
                to="/products"
                className="block rounded-2xl bg-ink px-5 py-4 text-center text-sm font-bold text-white transition hover:bg-brand"
              >
                Zu den Produkten
              </Link>
              <Link
                to="/login"
                className="block rounded-2xl border border-slate-200 px-5 py-4 text-center text-sm font-bold text-ink transition hover:bg-slate-50"
              >
                Anmelden
              </Link>
              <Link
                to="/register"
                className="block rounded-2xl border border-slate-200 px-5 py-4 text-center text-sm font-bold text-ink transition hover:bg-slate-50"
              >
                Konto erstellen
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default OverviewPage;
