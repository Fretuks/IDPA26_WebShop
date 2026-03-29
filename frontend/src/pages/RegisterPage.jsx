import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { initialAddressForm, normalizeAddress, normalizePhone, validateAddress, validatePhone } from '../utils/profileValidation';

const initialForm = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  address: initialAddressForm,
  acceptTerms: false,
  marketingEmails: false
};

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function updateAddressField(field, value) {
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        [field]: value
      }
    }));
  }

  function validateForm() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.firstname.trim() || !form.lastname.trim()) {
      return 'Vorname und Nachname sind Pflichtfelder.';
    }

    if (!emailRegex.test(form.email)) {
      return 'Bitte gib eine gueltige E-Mail-Adresse ein.';
    }

    if (form.password.length < 8) {
      return 'Das Passwort muss mindestens 8 Zeichen lang sein.';
    }

    if (form.password !== form.confirmPassword) {
      return 'Passwort und Passwortbestaetigung stimmen nicht ueberein.';
    }

    const phoneError = validatePhone(form.phone);
    if (phoneError) {
      return phoneError;
    }

    const addressError = validateAddress(form.address);
    if (addressError) {
      return addressError;
    }

    if (!form.acceptTerms) {
      return 'Bitte akzeptiere die Nutzungsbedingungen.';
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateForm();
    setError(validationError);
    setSuccess('');

    if (validationError) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        ...form,
        phone: normalizePhone(form.phone),
        address: normalizeAddress(form.address)
      });
      setSuccess('Dein Kundenkonto wurde erfolgreich erstellt. Du wirst jetzt weitergeleitet.');
      navigate('/', { replace: true });
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
      <Header title="Konto erstellen" description="Erstelle dein Kundenkonto fuer schnelleren Checkout und einen gespeicherten Warenkorb." />

      <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Neues Konto</p>
          <h2 className="mt-3 text-3xl font-extrabold text-ink">Konto erstellen</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Lege dein Kundenkonto an, um Bestellungen schneller abzuschliessen und deinen Warenkorb bequem zu verwalten.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="firstname" className="mb-2 block text-sm font-semibold text-slate-700">
                  Vorname
                </label>
                <input
                  id="firstname"
                  name="firstname"
                  value={form.firstname}
                  onChange={updateField}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="lastname" className="mb-2 block text-sm font-semibold text-slate-700">
                  Nachname
                </label>
                <input
                  id="lastname"
                  name="lastname"
                  value={form.lastname}
                  onChange={updateField}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
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
                <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-slate-700">
                  Telefon (optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={updateField}
                  placeholder="+41 79 123 45 67"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Passwort
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={updateField}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-700">
                  Passwort bestaetigen
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={updateField}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="street" className="mb-2 block text-sm font-semibold text-slate-700">
                  Strasse
                </label>
                <input
                  id="street"
                  value={form.address.street}
                  onChange={(event) => updateAddressField('street', event.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="houseNumber" className="mb-2 block text-sm font-semibold text-slate-700">
                  Hausnummer
                </label>
                <input
                  id="houseNumber"
                  value={form.address.houseNumber}
                  onChange={(event) => updateAddressField('houseNumber', event.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="zip" className="mb-2 block text-sm font-semibold text-slate-700">
                  PLZ
                </label>
                <input
                  id="zip"
                  value={form.address.zip}
                  onChange={(event) => updateAddressField('zip', event.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="city" className="mb-2 block text-sm font-semibold text-slate-700">
                  Ort
                </label>
                <input
                  id="city"
                  value={form.address.city}
                  onChange={(event) => updateAddressField('city', event.target.value)}
                  required
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
                  value={form.address.country}
                  onChange={(event) => updateAddressField('country', event.target.value.toUpperCase())}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm uppercase text-ink outline-none transition focus:border-brand focus:bg-white"
                />
                <p className="mt-2 text-xs text-slate-500">Bitte als ISO-2 Code angeben, z.B. CH oder DE.</p>
              </div>
            </div>

            <div className="space-y-3 rounded-[1.75rem] bg-slate-50 p-5">
              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input
                  name="acceptTerms"
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={updateField}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                Nutzungsbedingungen akzeptieren
              </label>

              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input
                  name="marketingEmails"
                  type="checkbox"
                  checked={form.marketingEmails}
                  onChange={updateField}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                E-Mail-Benachrichtigungen erhalten
              </label>
            </div>

            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
            {success ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-ink px-5 py-4 text-sm font-bold text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? 'Registrierung laeuft...' : 'Konto erstellen'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Du hast bereits ein Kundenkonto?{' '}
            <Link to="/login" className="font-semibold text-brand transition hover:text-ink">
              Jetzt anmelden
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default RegisterPage;
