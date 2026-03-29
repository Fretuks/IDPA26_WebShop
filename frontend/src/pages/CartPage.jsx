import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import Header from '../components/Header';
import OrderSummary from '../components/OrderSummary';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const SHIPPING_COST = 0;

function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, total, isCartLoading, cartError, updateItem, removeItem, fetchCart } = useCart();
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [draftQuantities, setDraftQuantities] = useState({});
  const [pendingItemId, setPendingItemId] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    fetchCart().catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    setDraftQuantities((current) => {
      const nextDrafts = {};
      items.forEach((item) => {
        nextDrafts[item.id] = current[item.id] ?? String(item.quantity);
      });
      return nextDrafts;
    });
  }, [items]);

  const subtotal = useMemo(() => total, [total]);
  const grandTotal = subtotal + SHIPPING_COST;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/cart' }} />;
  }

  async function handleQuantityCommit(item) {
    const nextQuantity = Number(draftQuantities[item.id]);

    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      setDraftQuantities((current) => ({ ...current, [item.id]: String(item.quantity) }));
      setFeedback({ type: 'error', message: 'Bitte gib eine gültige Menge ab 1 ein.' });
      return;
    }

    if (nextQuantity === item.quantity) {
      return;
    }

    setPendingItemId(item.id);
    setFeedback({ type: '', message: '' });

    try {
      await updateItem(item.id, nextQuantity);
      setFeedback({ type: 'success', message: `${item.name} wurde auf ${nextQuantity} aktualisiert.` });
    } catch (error) {
      setDraftQuantities((current) => ({ ...current, [item.id]: String(item.quantity) }));
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setPendingItemId(null);
    }
  }

  async function handleRemove(item) {
    setRemovingItemId(item.id);
    setFeedback({ type: '', message: '' });

    try {
      await removeItem(item.id);
      setFeedback({ type: 'success', message: `${item.name} wurde aus dem Warenkorb entfernt.` });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setRemovingItemId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Warenkorb"
        description="Prüfe deine Auswahl, passe Mengen direkt an und gehe dann ohne Umwege zur Kasse."
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/products" className="text-sm font-semibold text-brand transition hover:text-ink">
            Weiter einkaufen
          </Link>
          <p className="text-sm text-slate-500">{items.length} Positionen im Warenkorb</p>
        </div>

        {feedback.message ? (
          <div
            className={`mb-6 rounded-[1.75rem] px-5 py-4 text-sm shadow-card ${
              feedback.type === 'success'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        {cartError && !feedback.message ? (
          <div className="mb-6 rounded-[1.75rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-card">
            {cartError}
          </div>
        ) : null}

        {isCartLoading ? (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_380px]">
            <div className="space-y-4">
              {[1, 2].map((key) => (
                <div key={key} className="h-36 animate-pulse rounded-[1.75rem] bg-white shadow-card" />
              ))}
            </div>
            <div className="h-96 animate-pulse rounded-[2rem] bg-white shadow-card" />
          </section>
        ) : items.length === 0 ? (
          <section className="rounded-[2rem] border border-slate-200/80 bg-white px-6 py-12 text-center shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Warenkorb</p>
            <h2 className="mt-3 text-3xl font-extrabold text-ink">Dein Warenkorb ist leer</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Füge Produkte hinzu, damit du hier deine Bestellung prüfen und danach zur Kasse gehen kannst.
            </p>
            <Link
              to="/products"
              className="mt-8 inline-flex rounded-2xl bg-ink px-5 py-4 text-sm font-bold text-white transition hover:bg-brand"
            >
              Produkte entdecken
            </Link>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_380px]">
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  quantity={draftQuantities[item.id] ?? String(item.quantity)}
                  onQuantityChange={(value) => {
                    setDraftQuantities((current) => ({ ...current, [item.id]: value }));
                  }}
                  onQuantityCommit={() => handleQuantityCommit(item)}
                  onRemove={() => handleRemove(item)}
                  isUpdating={pendingItemId === item.id}
                  isRemoving={removingItemId === item.id}
                />
              ))}
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={SHIPPING_COST}
                total={grandTotal}
                buttonLabel="Zur Kasse gehen"
                onButtonClick={() => navigate('/checkout')}
                note="Die finale Bestellung wird erst auf der Checkout-Seite abgeschickt."
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default CartPage;
