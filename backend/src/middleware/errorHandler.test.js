const test = require('node:test');
const assert = require('node:assert/strict');

const errorHandler = require('./errorHandler');
const AppError = require('../utils/AppError');

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

test('errorHandler exposes operational errors to the client', async () => {
  const res = createResponse();

  errorHandler(new AppError('Category not found', 404), {}, res, () => {});

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { error: 'Category not found' });
});

test('errorHandler hides unexpected errors behind a generic 500 response', async () => {
  const res = createResponse();
  const originalConsoleError = console.error;
  const logged = [];

  console.error = (error) => {
    logged.push(error.message);
  };

  try {
    errorHandler(new Error('database connection failed'), {}, res, () => {});
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { error: 'Internal server error' });
  assert.deepEqual(logged, ['database connection failed']);
});
