import { Link } from 'react-router-dom';
import Header from '../components/Header';

const highlights = [
  {
    title: 'Produkte entdecken',
    text: 'Sieh dir das Sortiment an und finde schnell, was du suchst.'
  },
  {
    title: 'Einfach orientieren',
    text: 'Die Startseite zeigt zuerst die wichtigsten Wege durch den Shop.'
  },
  {
    title: 'Konto separat',
    text: 'Login und Registrierung haben einen eigenen Bereich und stoeren den Einkauf nicht.'
  }
];

function OverviewPage() {
  return (
    <div className="min-h-screen">
      <Header
        title="Willkommen"
        description="Auf dieser Startseite bekommst du einen kurzen Ueberblick ueber den Shop. Von hier aus kommst du direkt zu den Produkten oder zum Login/Register."
        showHero
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Startseite</p>
            <h2 className="mt-3 text-3xl font-extrabold text-ink sm:text-4xl">Alles Wichtige auf einen Blick</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Hier siehst du direkt, wo du Produkte findest und wo du dich anmelden oder registrieren kannst. So ist
              der Einstieg in den Shop einfach und uebersichtlich.
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
            <h2 className="mt-3 text-2xl font-extrabold text-ink">Waehle, wie du starten moechtest</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Du kannst direkt im Sortiment stoebern oder zuerst in den Bereich fuer Login und Registrierung gehen.
            </p>

            <div className="mt-8 space-y-3">
              <Link
                to="/products"
                className="block rounded-2xl bg-ink px-5 py-4 text-center text-sm font-bold text-white transition hover:bg-brand"
              >
                Zur Produktseite
              </Link>
              <Link
                to="/auth"
                className="block rounded-2xl border border-slate-200 px-5 py-4 text-center text-sm font-bold text-ink transition hover:bg-slate-50"
              >
                Zu Login / Register
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default OverviewPage;
