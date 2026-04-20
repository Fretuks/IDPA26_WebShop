const test = require('node:test');
const assert = require('node:assert/strict');

const roleMiddleware = require('./roleMiddleware');
const { UserRole } = require('../models/enums');

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

test('roleMiddleware rejects requests without a matching user role', async () => {
  const middleware = roleMiddleware(UserRole.ADMIN);
  const req = { user: { role: UserRole.CUSTOMER } };
  const res = createResponse();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { error: 'Forbidden' });
  assert.equal(nextCalled, false);
});

test('roleMiddleware allows requests with an allowed role', async () => {
  const middleware = roleMiddleware('INVALID_ROLE', UserRole.ADMIN);
  const req = { user: { role: UserRole.ADMIN } };
  const res = createResponse();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});
