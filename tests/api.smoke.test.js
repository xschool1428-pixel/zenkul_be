import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';

before(async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDatabase();
  }
});

after(async () => {
  if (process.env.CI !== 'true') {
    await disconnectDatabase();
  }
});

test('GET / returns running message', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.match(res.body.message, /running/i);
});

test('GET /health includes database check', async () => {
  const res = await request(app).get('/health');
  assert.ok([200, 503].includes(res.status));
  assert.ok(res.body.checks?.database);
});

test('POST /api/auth/login rejects invalid credentials', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'nobody@example.com', password: 'wrong-password-xyz' });
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('protected route requires auth', async () => {
  const res = await request(app).get('/api/students');
  assert.equal(res.status, 401);
});
