import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

const placeholder = encodeURI(
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 700'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop stop-color='%230f172a'/><stop offset='1' stop-color='%230f766e'/></linearGradient></defs><rect width='900' height='700' fill='url(%23g)'/><circle cx='720' cy='140' r='112' fill='%23ffffff15'/><circle cx='210' cy='560' r='148' fill='%23ffffff12'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='44'>Produktbild</text></svg>"
);

function formatPrice(price) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF'
  }).format(price);
}

function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    let ignore = false;

    async function loadProduct() {
      setIsLoading(true);
      setError('');

      try {
        const nextProduct = await api.getProductById(Number(id));
        if (!ignore) {
          setProduct(nextProduct);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();
    return () => {
      ignore = true;
    };
  }, [id]);

  const specs = useMemo(() => {
    if (!product) {
      return [];
    }

    return [
      { label: 'Kategorie', value: product.categoryName || 'Nicht zugeordnet' },
      { label: 'Lagerbestand', value: `${product.stock}` },
      { label: 'Artikelnummer', value: `#${product.id}` }
    ];
  }, [product]);

  const shortInfo = useMemo(() => {
    if (!product?.description) {
      return 'Zu diesem Artikel liegt aktuell keine Kurzinfo vor.';
    }

    return product.description.length > 180
      ? `${product.description.slice(0, 177).trim()}...`
      : product.description;
  }, [product]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback({ type: '', message: '' });

    const nextQuantity = Number(quantity);
    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      setFeedback({ type: 'error', message: 'Bitte gib eine gültige Menge ab 1 ein.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await addToCart(product.id, nextQuantity);
      setFeedback({ type: 'success', message: `${product.name} wurde ${nextQuantity}x in deinen Warenkorb gelegt.` });
    } catch (submitError) {
      setFeedback({ type: 'error', message: submitError.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        feedback={feedback}
        title={product?.name || 'Produktdetails'}
        description="Alle wichtigen Produktinformationen auf einen Blick, inklusive Mengenwahl und direkter Bestellmöglichkeit."
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6">
          <Link to="/products" className="text-sm font-semibold text-brand transition hover:text-ink">
            Zurück zur Produktübersicht
          </Link>
        </div>

        {isLoading ? (
          <section className="grid gap-8 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card lg:grid-cols-2">
            <div className="h-[420px] animate-pulse rounded-[1.75rem] bg-slate-100" />
            <div className="space-y-4">
              <div className="h-8 animate-pulse rounded bg-slate-100" />
              <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
              <div className="h-24 animate-pulse rounded bg-slate-100" />
              <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </section>
        ) : error ? (
          <section className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-10 text-center text-rose-700 shadow-card">
            <h2 className="text-xl font-bold">Produkt konnte nicht geladen werden</h2>
            <p className="mt-3 text-sm">{error}</p>
          </section>
        ) : (
          <section>
            <div className="grid gap-8 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card lg:grid-cols-[1.05fr_0.95fr]">
              <div className="overflow-hidden rounded-[1.75rem] bg-slate-100">
                <img
                  src={product.imageUrl || placeholder}
                  alt={product.name}
                  className="h-full min-h-[360px] w-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">
                      {product.categoryName || 'Produkt'}
                    </p>
                    <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">{product.name}</h2>
                  </div>

                  <p className="text-3xl font-extrabold text-ink">{formatPrice(product.price)}</p>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Kurzinfo</p>
                    <p className="mt-2 text-base leading-7 text-slate-600">{shortInfo}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {specs.map((item) => (
                      <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                        <p className="mt-1 text-sm font-semibold text-ink">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-end">
                    <div>
                      <label htmlFor="quantity" className="mb-2 block text-sm font-semibold text-slate-700">
                        Menge
                      </label>
                      <input
                        id="quantity"
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || product.stock < 1}
                      className="rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {product.stock < 1 ? 'Ausverkauft' : isSubmitting ? 'Wird hinzugefügt...' : 'In den Warenkorb'}
                    </button>
                  </div>

                  {feedback.message ? (
                    <p
                      className={`mt-4 text-sm font-medium ${
                        feedback.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {feedback.message}
                    </p>
                  ) : null}
                </form>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default ProductDetailPage;
