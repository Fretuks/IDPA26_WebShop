export const phoneRegex = /^[+()\d\s/-]{6,40}$/;
export const zipRegex = /^[A-Za-z0-9\- ]{3,12}$/;
export const countryRegex = /^[A-Za-z]{2}$/;

export const initialAddressForm = {
  street: '',
  houseNumber: '',
  zip: '',
  city: '',
  country: 'CH'
};

export function validatePhone(phone, { required = false } = {}) {
  const normalized = phone.trim();

  if (!normalized) {
    return required ? 'Bitte gib eine Telefonnummer ein.' : '';
  }

  if (!phoneRegex.test(normalized)) {
    return 'Bitte gib eine gueltige Telefonnummer ein.';
  }

  return '';
}

export function validateAddress(address, { required = true } = {}) {
  const street = address.street.trim();
  const houseNumber = address.houseNumber.trim();
  const zip = address.zip.trim();
  const city = address.city.trim();
  const country = address.country.trim().toUpperCase();

  if (!street && !houseNumber && !zip && !city && !country) {
    return required ? 'Bitte gib eine Adresse ein.' : '';
  }

  if (!street || !houseNumber) {
    return 'Bitte gib Strasse und Hausnummer an.';
  }

  if (!zipRegex.test(zip)) {
    return 'Bitte gib eine gueltige PLZ ein.';
  }

  if (!city) {
    return 'Bitte gib einen Ort ein.';
  }

  if (!countryRegex.test(country)) {
    return 'Bitte gib einen zweistelligen Laendercode ein, z.B. CH.';
  }

  return '';
}

export function normalizeAddress(address) {
  return {
    street: address.street.trim(),
    houseNumber: address.houseNumber.trim(),
    zip: address.zip.trim(),
    city: address.city.trim(),
    country: address.country.trim().toUpperCase()
  };
}

export function normalizePhone(phone) {
  const normalized = phone.trim();
  return normalized || '';
}
