import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import requireAuth from '../src/middleware/requireAuth.js';

process.env.JWT_SECRET = 'test-secret';

function runMiddleware(authorization) {
  let status; let body; let nextCalled = false;
  const request = { headers: { authorization } };
  const response = { status: (code) => { status = code; return { json: (value) => { body = value; } }; } };
  requireAuth(request, response, () => { nextCalled = true; });
  return { status, body, nextCalled, request };
}

test('admin middleware rejects missing tokens and accepts a valid JWT', () => {
  assert.equal(runMiddleware().status, 401);
  const result = runMiddleware(`Bearer ${jwt.sign({ sub: 'admin-id' }, process.env.JWT_SECRET)}`);
  assert.equal(result.nextCalled, true);
  assert.equal(result.request.admin.sub, 'admin-id');
});
