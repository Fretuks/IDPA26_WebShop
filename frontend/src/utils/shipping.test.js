import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateShipping,
  FREE_SHIPPING_THRESHOLD,
  getFreeShippingRemaining,
  SHIPPING_COST
} from './shipping.js';

test('calculateShipping charges shipping below the free threshold', () => {
  assert.equal(calculateShipping(FREE_SHIPPING_THRESHOLD - 0.01), SHIPPING_COST);
});

test('calculateShipping is free at or above the threshold', () => {
  assert.equal(calculateShipping(FREE_SHIPPING_THRESHOLD), 0);
  assert.equal(calculateShipping(FREE_SHIPPING_THRESHOLD + 50), 0);
});

test('getFreeShippingRemaining never returns negative values', () => {
  assert.equal(getFreeShippingRemaining(FREE_SHIPPING_THRESHOLD + 1), 0);
});

test('getFreeShippingRemaining treats missing subtotals as zero', () => {
  assert.equal(getFreeShippingRemaining(undefined), FREE_SHIPPING_THRESHOLD);
});
