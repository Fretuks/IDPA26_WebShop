const test = require('node:test');
const assert = require('node:assert/strict');

const { param } = require('express-validator');
const validateRequest = require('./validateRequest');

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

test('validateRequest returns 400 with error details when validation fails', async () => {
  const req = {
    params: {
      id: 'not-a-number'
    }
  };
  const res = createResponse();
  let nextCalled = false;

  await param('id', 'Invalid id').isInt().run(req);

  validateRequest(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    error: 'Validation failed',
    details: [
      {
        type: 'field',
        value: 'not-a-number',
        msg: 'Invalid id',
        path: 'id',
        location: 'params'
      }
    ]
  });
  assert.equal(nextCalled, false);
});

test('validateRequest delegates to next when validation passes', async () => {
  const req = {
    params: {
      id: '42'
    }
  };
  const res = createResponse();
  let nextCalled = false;

  await param('id', 'Invalid id').isInt().run(req);

  validateRequest(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});
