const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const app = require('./app');

function createServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve(server);
    });
  });
}

function request(server, path, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: address.port,
        path,
        method,
        headers
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : null
          });
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

test('GET /health returns ok', async () => {
  const server = await createServer();

  try {
    const response = await request(server, '/health');

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { status: 'ok' });
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('GET /api/products/invalid-id is rejected by request validation', async () => {
  const server = await createServer();

  try {
    const response = await request(server, '/api/products/not-a-number');

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.error, 'Validation failed');
    assert.equal(response.body.details[0].msg, 'Invalid id');
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('unknown routes return 404', async () => {
  const server = await createServer();

  try {
    const response = await request(server, '/does-not-exist');

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.body, { error: 'Route not found' });
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
