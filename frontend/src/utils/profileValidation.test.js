import test from 'node:test';
import assert from 'node:assert/strict';

import {
  initialAddressForm,
  normalizeAddress,
  normalizePhone,
  validateAddress,
  validatePhone
} from './profileValidation.js';

test('initialAddressForm defaults country to CH', () => {
  assert.equal(initialAddressForm.country, 'CH');
});

test('validatePhone accepts optional empty input', () => {
  assert.equal(validatePhone('   '), '');
});

test('validatePhone rejects malformed numbers', () => {
  assert.equal(validatePhone('abc'), 'Bitte gib eine gültige Telefonnummer ein.');
});

test('validatePhone enforces required phone input', () => {
  assert.equal(validatePhone('   ', { required: true }), 'Bitte gib eine Telefonnummer ein.');
});

test('validateAddress rejects an entirely empty required address', () => {
  assert.equal(
    validateAddress({
      street: '',
      houseNumber: '',
      zip: '',
      city: '',
      country: ''
    }),
    'Bitte gib eine Adresse ein.'
  );
});

test('validateAddress requires street and house number when partially filled', () => {
  assert.equal(
    validateAddress({
      street: 'Bahnhofstrasse',
      houseNumber: '',
      zip: '',
      city: '',
      country: 'ch'
    }),
    'Bitte gib Strasse und Hausnummer an.'
  );
});

test('validateAddress normalizes and accepts a valid address', () => {
  assert.equal(
    validateAddress({
      street: ' Bahnhofstrasse ',
      houseNumber: ' 12A ',
      zip: ' 8001 ',
      city: ' Zürich ',
      country: ' ch '
    }),
    ''
  );
});

test('validateAddress rejects invalid country codes', () => {
  assert.equal(
    validateAddress({
      street: 'Bahnhofstrasse',
      houseNumber: '12A',
      zip: '8001',
      city: 'Zürich',
      country: 'Switzerland'
    }),
    'Bitte gib einen zweistelligen Ländercode ein, z.B. CH.'
  );
});

test('normalizeAddress trims fields and uppercases country', () => {
  assert.deepEqual(
    normalizeAddress({
      street: ' Bahnhofstrasse ',
      houseNumber: ' 12A ',
      zip: ' 8001 ',
      city: ' Zürich ',
      country: ' ch '
    }),
    {
      street: 'Bahnhofstrasse',
      houseNumber: '12A',
      zip: '8001',
      city: 'Zürich',
      country: 'CH'
    }
  );
});

test('normalizePhone trims and returns an empty string for blank input', () => {
  assert.equal(normalizePhone('  +41 44 555 55 55  '), '+41 44 555 55 55');
  assert.equal(normalizePhone('   '), '');
});
