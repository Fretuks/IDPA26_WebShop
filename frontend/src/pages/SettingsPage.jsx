import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { initialAddressForm, normalizeAddress, normalizePhone, validateAddress, validatePhone } from '../utils/profileValidation';

function getAddressLabel(address) {
  return `${address.street} ${address.houseNumber}, ${address.zip} ${address.city}, ${address.country}`;
}

function SettingsPage() {
  const { isAuthenticated, user, updateStoredUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    phone: user?.phone || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [addressBook, setAddressBook] = useState({ addresses: [], defaultShippingAddressId: null, defaultBillingAddressId: null });
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [addressMessage, setAddressMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setProfileForm({
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      phone: user?.phone || ''
    });
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let ignore = false;

    async function loadData() {
      setIsLoading(true);
      setError('');

      try {
        const [freshUser, addresses] = await Promise.all([api.getMe(), api.getMyAddresses()]);
        if (ignore) {
          return;
        }

        updateStoredUser(freshUser);
        setProfileForm({
          firstname: freshUser.firstname || '',
          lastname: freshUser.lastname || '',
          phone: freshUser.phone || ''
        });
        setAddressBook(addresses);
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

    loadData();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  const primaryAddress = useMemo(() => {
    return (
      addressBook.addresses.find((address) => address.id === addressBook.defaultShippingAddressId) ||
      addressBook.addresses.find((address) => address.id === addressBook.defaultBillingAddressId) ||
      null
    );
  }, [addressBook]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/settings' }} />;
  }

  function resetMessages() {
    setProfileMessage('');
    setPasswordMessage('');
    setAddressMessage('');
    setError('');
  }

  function updateProfileField(event) {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  }

  function updatePasswordField(event) {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  }

  function updateAddressField(field, value) {
    setAddressForm((current) => ({ ...current, [field]: value }));
  }

  function startEditingAddress(address) {
    resetMessages();
    setEditingAddressId(address.id);
    setAddressForm({
      street: address.street,
      houseNumber: address.houseNumber,
      zip: address.zip,
      city: address.city,
      country: address.country
    });
  }

  function resetAddressEditor() {
    setEditingAddressId(null);
    setAddressForm(initialAddressForm);
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    resetMessages();

    const phoneError = validatePhone(profileForm.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    try {
      const updatedUser = await api.updateMe({
        firstname: profileForm.firstname.trim(),
        lastname: profileForm.lastname.trim(),
        phone: normalizePhone(profileForm.phone) || null
      });
      updateStoredUser(updatedUser);
      setProfileMessage('Profil wurde gespeichert.');
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    resetMessages();

    if (passwordForm.newPassword.length < 8) {
      setError('Das neue Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Neues Passwort und Bestätigung stimmen nicht überein.');
      return;
    }

    try {
      await api.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordMessage('Passwort wurde aktualisiert.');
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleAddressSubmit(event) {
    event.preventDefault();
    resetMessages();

    const addressError = validateAddress(addressForm);
    if (addressError) {
      setError(addressError);
      return;
    }

    const payload = normalizeAddress(addressForm);

    try {
      if (editingAddressId) {
        const updatedAddress = await api.updateAddress(editingAddressId, payload);
        setAddressBook((current) => ({
          ...current,
          addresses: current.addresses.map((address) => (address.id === editingAddressId ? updatedAddress : address))
        }));
        setAddressMessage('Adresse wurde aktualisiert.');
      } else {
        const createdAddress = await api.createAddress(payload);
        const needsDefaults = !addressBook.defaultShippingAddressId && !addressBook.defaultBillingAddressId;

        setAddressBook((current) => ({
          ...current,
          addresses: [createdAddress, ...current.addresses]
        }));

        if (needsDefaults) {
          await Promise.all([api.setDefaultShippingAddress(createdAddress.id), api.setDefaultBillingAddress(createdAddress.id)]);
          setAddressBook((current) => ({
            ...current,
            defaultShippingAddressId: createdAddress.id,
            defaultBillingAddressId: createdAddress.id
          }));
        }

        setAddressMessage('Adresse wurde hinzugefügt.');
      }

      resetAddressEditor();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleDeleteAddress(addressId) {
    resetMessages();

    try {
      await api.deleteAddress(addressId);
      setAddressBook((current) => ({
        addresses: current.addresses.filter((address) => address.id !== addressId),
        defaultShippingAddressId: current.defaultShippingAddressId === addressId ? null : current.defaultShippingAddressId,
        defaultBillingAddressId: current.defaultBillingAddressId === addressId ? null : current.defaultBillingAddressId
      }));

      if (editingAddressId === addressId) {
        resetAddressEditor();
      }

      setAddressMessage('Adresse wurde entfernt.');
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleSetDefault(type, addressId) {
    resetMessages();

    try {
      if (type === 'shipping') {
        await api.setDefaultShippingAddress(addressId);
        setAddressBook((current) => ({ ...current, defaultShippingAddressId: addressId }));
      } else {
        await api.setDefaultBillingAddress(addressId);
        setAddressBook((current) => ({ ...current, defaultBillingAddressId: addressId }));
      }

      setAddressMessage('Standardadresse wurde aktualisiert.');
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <div className="min-h-screen">
      <Header title="Einstellungen" description="Verwalte Profil, Passwort und gespeicherte Adressen." />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6">
          <Link to="/" className="text-sm font-semibold text-brand transition hover:text-ink">
            Zurück zur Startseite
          </Link>
        </div>

        {error ? <div className="mb-6 rounded-[1.75rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}

        {isLoading ? (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-[2rem] bg-white shadow-card" />
            <div className="h-72 animate-pulse rounded-[2rem] bg-white shadow-card" />
            <div className="h-96 animate-pulse rounded-[2rem] bg-white shadow-card lg:col-span-2" />
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={handleProfileSubmit} className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Profil</p>
              <h2 className="mt-3 text-2xl font-extrabold text-ink">Persönliche Daten</h2>
              <div className="mt-6 grid gap-5">
                <div>
                  <label htmlFor="firstname" className="mb-2 block text-sm font-semibold text-slate-700">
                    Vorname
                  </label>
                  <input
                    id="firstname"
                    name="firstname"
                    value={profileForm.firstname}
                    onChange={updateProfileField}
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
                    value={profileForm.lastname}
                    onChange={updateProfileField}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-slate-700">
                    Telefon
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={updateProfileField}
                    placeholder="+41 79 123 45 67"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                </div>
              </div>
              {profileMessage ? <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{profileMessage}</p> : null}
              <button type="submit" className="mt-6 w-full rounded-2xl bg-ink px-5 py-4 text-sm font-bold text-white transition hover:bg-brand">
                Profil speichern
              </button>
            </form>

            <form onSubmit={handlePasswordSubmit} className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Sicherheit</p>
              <h2 className="mt-3 text-2xl font-extrabold text-ink">Passwort ändern</h2>
              <div className="mt-6 grid gap-5">
                <div>
                  <label htmlFor="currentPassword" className="mb-2 block text-sm font-semibold text-slate-700">
                    Aktuelles Passwort
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={updatePasswordField}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="mb-2 block text-sm font-semibold text-slate-700">
                    Neues Passwort
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={updatePasswordField}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-700">
                    Neues Passwort bestätigen
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={updatePasswordField}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                </div>
              </div>
              {passwordMessage ? <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{passwordMessage}</p> : null}
              <button type="submit" className="mt-6 w-full rounded-2xl bg-ink px-5 py-4 text-sm font-bold text-white transition hover:bg-brand">
                Passwort speichern
              </button>
            </form>

            <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card sm:p-8 lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Adressen</p>
                  <h2 className="mt-3 text-2xl font-extrabold text-ink">Adressbuch</h2>
                  <p className="mt-3 text-sm text-slate-600">
                    {primaryAddress ? `Aktive Hauptadresse: ${getAddressLabel(primaryAddress)}` : 'Noch keine Adresse hinterlegt.'}
                  </p>
                </div>
                {editingAddressId ? (
                  <button
                    type="button"
                    onClick={resetAddressEditor}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Neue Adresse erfassen
                  </button>
                ) : null}
              </div>

              {addressMessage ? <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{addressMessage}</p> : null}

              <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-4">
                  {addressBook.addresses.length ? (
                    addressBook.addresses.map((address) => (
                      <div key={address.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-ink">{getAddressLabel(address)}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          {addressBook.defaultShippingAddressId === address.id ? 'Standard Versand' : ''}
                          {addressBook.defaultShippingAddressId === address.id && addressBook.defaultBillingAddressId === address.id ? ' | ' : ''}
                          {addressBook.defaultBillingAddressId === address.id ? 'Standard Rechnung' : ''}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditingAddress(address)}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Bearbeiten
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetDefault('shipping', address.id)}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Als Versand setzen
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetDefault('billing', address.id)}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Als Rechnung setzen
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                      Noch keine Adresse gespeichert. Erfasse rechts deine erste Adresse.
                    </div>
                  )}
                </div>

                <form onSubmit={handleAddressSubmit} className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
                  <h3 className="text-lg font-extrabold text-ink">{editingAddressId ? 'Adresse bearbeiten' : 'Neue Adresse'}</h3>
                  <div className="mt-5 grid gap-4">
                    <div>
                      <label htmlFor="address-street" className="mb-2 block text-sm font-semibold text-slate-700">
                        Strasse
                      </label>
                      <input
                        id="address-street"
                        value={addressForm.street}
                        onChange={(event) => updateAddressField('street', event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="address-houseNumber" className="mb-2 block text-sm font-semibold text-slate-700">
                        Hausnummer
                      </label>
                      <input
                        id="address-houseNumber"
                        value={addressForm.houseNumber}
                        onChange={(event) => updateAddressField('houseNumber', event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="address-zip" className="mb-2 block text-sm font-semibold text-slate-700">
                        PLZ
                      </label>
                      <input
                        id="address-zip"
                        value={addressForm.zip}
                        onChange={(event) => updateAddressField('zip', event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="address-city" className="mb-2 block text-sm font-semibold text-slate-700">
                        Ort
                      </label>
                      <input
                        id="address-city"
                        value={addressForm.city}
                        onChange={(event) => updateAddressField('city', event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="address-country" className="mb-2 block text-sm font-semibold text-slate-700">
                        Land
                      </label>
                      <input
                        id="address-country"
                        maxLength="2"
                        value={addressForm.country}
                        onChange={(event) => updateAddressField('country', event.target.value.toUpperCase())}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm uppercase text-ink outline-none transition focus:border-brand focus:bg-white"
                      />
                    </div>
                  </div>
                  <button type="submit" className="mt-6 w-full rounded-2xl bg-ink px-5 py-4 text-sm font-bold text-white transition hover:bg-brand">
                    {editingAddressId ? 'Adresse speichern' : 'Adresse hinzufügen'}
                  </button>
                </form>
              </div>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}

export default SettingsPage;
