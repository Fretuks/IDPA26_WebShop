import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import OrderSummary from '../components/OrderSummary';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { calculateShipping, getFreeShippingRemaining } from '../utils/shipping';

const initialAddressForm = {
  firstname: '',
  lastname: '',
  street: '',
  houseNumber: '',
  zip: '',
  city: '',
  country: 'CH'
};

const paymentOptions = [
  { value: 'INVOICE', label: 'Rechnung', description: 'Bezahlen nach Erhalt der Bestellung.' },
  { value: 'CREDIT_CARD', label: 'Kreditkarte', description: 'Schnell und direkt beim Abschluss.' },
  { value: 'PAYPAL', label: 'PayPal', description: 'Zahlung über dein PayPal-Konto.' }
];

function getAddressLabel(address) {
  return `${address.street} ${address.houseNumber}, ${address.zip} ${address.city}, ${address.country}`;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items, total, isCartLoading, clearCart, fetchCart } = useCart();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [addressFeedback, setAddressFeedback] = useState('');
  const [addressBook, setAddressBook] = useState({ addresses: [], defaultShippingAddressId: null, defaultBillingAddressId: null });
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressMode, setAddressMode] = useState('list');
  const [paymentMethod, setPaymentMethod] = useState('INVOICE');
  const [addressForm, setAddressForm] = useState(() => ({
    ...initialAddressForm,
    firstname: user?.firstname || '',
    lastname: user?.lastname || ''
  }));

  useEffect(() => {
    setAddressForm((current) => ({
      ...current,
      firstname: user?.firstname || current.firstname,
      lastname: user?.lastname || current.lastname
    }));
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let ignore = false;

    async function loadCheckoutData() {
      setIsPageLoading(true);
      setError('');

      try {
        const [cartPayload, addressPayload] = await Promise.all([fetchCart(), api.getMyAddresses()]);
        if (ignore) {
          return;
        }

        setAddressBook(addressPayload);

        const preferredAddressId =
          addressPayload.defaultShippingAddressId ||
          addressPayload.defaultBillingAddressId ||
          addressPayload.addresses[0]?.id ||
          '';

        setSelectedAddressId(preferredAddressId ? String(preferredAddressId) : '');
        setAddressMode(addressPayload.addresses.length === 0 ? 'new' : 'list');

        if (!cartPayload?.items?.length) {
          setError('Dein Warenkorb ist leer. Füge zuerst Produkte hinzu.');
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message);
        }
      } finally {
        if (!ignore) {
          setIsPageLoading(false);
        }
      }
    }

    loadCheckoutData();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  const subtotal = useMemo(() => total, [total]);
  const shippingCost = useMemo(() => calculateShipping(subtotal), [subtotal]);
  const freeShippingRemaining = useMemo(() => getFreeShippingRemaining(subtotal), [subtotal]);
  const shippingMessage =
    freeShippingRemaining > 0
      ? `Noch CHF ${freeShippingRemaining.toFixed(2)} bis kostenloser Versand`
      : 'Kostenloser Versand ist aktiviert.';
  const grandTotal = subtotal + shippingCost;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/checkout' }} />;
  }

  function updateAddressField(field, value) {
    setAddressForm((current) => ({ ...current, [field]: value }));
  }

  function validateForm() {
    if (!items.length) {
      return 'Dein Warenkorb ist leer.';
    }

    if (!paymentMethod) {
      return 'Bitte wähle eine Zahlungsmethode.';
    }

    if (addressMode === 'new') {
      if (!addressForm.firstname.trim() || !addressForm.lastname.trim()) {
        return 'Vorname und Nachname sind Pflichtfelder.';
      }
      if (!addressForm.street.trim() || !addressForm.houseNumber.trim()) {
        return 'Bitte gib Adresse und Hausnummer an.';
      }
      if (!/^[A-Za-z0-9\- ]{3,12}$/.test(addressForm.zip.trim())) {
        return 'Bitte gib eine gültige PLZ ein.';
      }
      if (!addressForm.city.trim()) {
        return 'Bitte gib einen Ort ein.';
      }
      if (!/^[A-Za-z]{2}$/.test(addressForm.country.trim())) {
        return 'Bitte gib einen zweistelligen Ländercode ein, z.B. CH.';
      }
      return '';
    }

    if (!selectedAddressId) {
      return 'Bitte wähle eine gespeicherte Adresse oder erfasse eine neue.';
    }

    return '';
  }

  async function ensureCheckoutAddress() {
    if (addressMode !== 'new') {
      return Number(selectedAddressId);
    }

    const newAddress = await api.createAddress({
      street: addressForm.street.trim(),
      houseNumber: addressForm.houseNumber.trim(),
      zip: addressForm.zip.trim(),
      city: addressForm.city.trim(),
      country: addressForm.country.trim().toUpperCase()
    });

    await Promise.all([
      api.setDefaultShippingAddress(newAddress.id),
      api.setDefaultBillingAddress(newAddress.id)
    ]);

    setAddressBook((current) => ({
      addresses: [newAddress, ...current.addresses],
      defaultShippingAddressId: newAddress.id,
      defaultBillingAddressId: newAddress.id
    }));
    setSelectedAddressId(String(newAddress.id));
    setAddressMode('list');
    setAddressFeedback('Neue Adresse gespeichert und automatisch ausgewählt.');

    return newAddress.id;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const addressId = await ensureCheckoutAddress();
      await api.checkout({
        paymentMethod,
        shippingAddressId: addressId,
        billingAddressId: addressId
      });

      clearCart();
      setSuccessMessage('Deine Bestellung wurde erfolgreich abgeschlossen.');
      setTimeout(() => {
        navigate('/', { replace: true, state: { checkoutSuccess: true } });
      }, 1200);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Checkout"
        description="Prüfe Lieferdaten und Zahlungsart. Die Bestellung wird direkt über das bestehende Backend abgeschlossen."
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6">
          <Link to="/cart" className="text-sm font-semibold text-brand transition hover:text-ink">
            Zurück zum Warenkorb
          </Link>
        </div>

        {successMessage ? (
          <div className="mb-6 rounded-[1.75rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-card">
            {successMessage}
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-[1.75rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-card">
            {error}
          </div>
        ) : null}

        {isPageLoading || isCartLoading ? (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_380px]">
            <div className="h-[720px] animate-pulse rounded-[2rem] bg-white shadow-card" />
            <div className="h-[480px] animate-pulse rounded-[2rem] bg-white shadow-card" />
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_380px]">
            <form
              id="checkout-form"
              onSubmit={handleSubmit}
              className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Lieferdaten</p>
                  <h2 className="mt-3 text-3xl font-extrabold text-ink">Checkout</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {addressMode === 'new' && addressBook.addresses.length ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAddressMode('list');
                        setAddressFeedback('');
                      }}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Zurück zur Adressliste
                    </button>
                  ) : null}
                  {addressMode !== 'new' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAddressMode('new');
                        setAddressFeedback('');
                      }}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Neue Adresse hinzufügen
                    </button>
                  ) : null}
                </div>
              </div>

              {addressFeedback ? (
                <div className="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                  {addressFeedback}
                </div>
              ) : null}

              {addressMode === 'list' && addressBook.addresses.length ? (
                <div className="mt-8 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700">Gespeicherte Adressen</p>
                    <p className="text-sm text-slate-500">{addressBook.addresses.length} verfügbar</p>
                  </div>

                  <div className="grid gap-4">
                    {addressBook.addresses.map((address) => {
                      const isSelected = selectedAddressId === String(address.id);

                      return (
                        <article
                          key={address.id}
                          className={`rounded-[1.5rem] border px-4 py-4 transition ${
                            isSelected
                              ? 'border-brand bg-teal-50'
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-ink">{getAddressLabel(address)}</p>
                              <p className="mt-2 text-xs text-slate-500">
                                {addressBook.defaultShippingAddressId === address.id ? 'Standard Versand' : ''}
                                {addressBook.defaultShippingAddressId === address.id && addressBook.defaultBillingAddressId === address.id
                                  ? ' | '
                                  : ''}
                                {addressBook.defaultBillingAddressId === address.id ? 'Standard Rechnung' : ''}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAddressId(String(address.id));
                                setAddressFeedback('Adresse ausgewählt.');
                              }}
                              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                isSelected
                                  ? 'bg-ink text-white'
                                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {isSelected ? 'Ausgewählt' : 'Adresse auswählen'}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {addressMode === 'new' ? (
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstname" className="mb-2 block text-sm font-semibold text-slate-700">
                      Vorname
                    </label>
                    <input
                      id="firstname"
                      value={addressForm.firstname}
                      onChange={(event) => updateAddressField('firstname', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastname" className="mb-2 block text-sm font-semibold text-slate-700">
                      Nachname
                    </label>
                    <input
                      id="lastname"
                      value={addressForm.lastname}
                      onChange={(event) => updateAddressField('lastname', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="street" className="mb-2 block text-sm font-semibold text-slate-700">
                      Adresse
                    </label>
                    <input
                      id="street"
                      value={addressForm.street}
                      onChange={(event) => updateAddressField('street', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="houseNumber" className="mb-2 block text-sm font-semibold text-slate-700">
                      Hausnummer
                    </label>
                    <input
                      id="houseNumber"
                      value={addressForm.houseNumber}
                      onChange={(event) => updateAddressField('houseNumber', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="zip" className="mb-2 block text-sm font-semibold text-slate-700">
                      PLZ
                    </label>
                    <input
                      id="zip"
                      value={addressForm.zip}
                      onChange={(event) => updateAddressField('zip', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="mb-2 block text-sm font-semibold text-slate-700">
                      Ort
                    </label>
                    <input
                      id="city"
                      value={addressForm.city}
                      onChange={(event) => updateAddressField('city', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="country" className="mb-2 block text-sm font-semibold text-slate-700">
                      Land
                    </label>
                    <input
                      id="country"
                      maxLength="2"
                      value={addressForm.country}
                      onChange={(event) => updateAddressField('country', event.target.value.toUpperCase())}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm uppercase text-ink outline-none transition focus:border-brand focus:bg-white"
                    />
                  </div>
                </div>
              ) : null}

              <div className="mt-10">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Zahlungsmethode</p>
                <div className="mt-4 space-y-3">
                  {paymentOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-[1.5rem] border px-4 py-4 transition ${
                        paymentMethod === option.value
                          ? 'border-brand bg-teal-50'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.value}
                        checked={paymentMethod === option.value}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                        className="mt-1 h-4 w-4 accent-brand"
                      />
                      <div>
                        <p className="text-sm font-semibold text-ink">{option.label}</p>
                        <p className="mt-1 text-sm text-slate-500">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </form>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={shippingCost}
                total={grandTotal}
                shippingMessage={shippingMessage}
                buttonLabel="Bestellung abschliessen"
                buttonType="submit"
                buttonDisabled={isSubmitting || !items.length}
                isSubmitting={isSubmitting}
                formId="checkout-form"
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default CheckoutPage;
