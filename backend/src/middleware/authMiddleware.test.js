const test = require('node:test');
const assert = require('node:assert/strict');

const jwt = require('jsonwebtoken');

const originalVerify = jwt.verify;

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

test.afterEach(() => {
  jwt.verify = originalVerify;
});

test('authMiddleware rejects missing bearer headers', async () => {
  const authMiddleware = require('./authMiddleware');
  const req = { headers: {} };
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: 'Authentication required' });
  assert.equal(nextCalled, false);
});

test('authMiddleware attaches the verified jwt payload to req.user', async () => {
  const authMiddleware = require('./authMiddleware');
  const req = {
    headers: {
      authorization: 'Bearer signed-token'
    }
  };
  const res = createResponse();
  const payload = { sub: 7, role: 'ADMIN' };
  let nextCalled = false;

  jwt.verify = (token) => {
    assert.equal(token, 'signed-token');
    return payload;
  };

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, payload);
  assert.equal(res.statusCode, null);
});

test('authMiddleware rejects invalid tokens', async () => {
  const authMiddleware = require('./authMiddleware');
  const req = {
    headers: {
      authorization: 'Bearer invalid-token'
    }
  };
  const res = createResponse();
  let nextCalled = false;

  jwt.verify = () => {
    throw new Error('invalid token');
  };

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: 'Invalid or expired token' });
  assert.equal(nextCalled, false);
});
