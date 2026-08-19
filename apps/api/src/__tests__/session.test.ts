/**
 * Session Controller Tests
 */
import request from 'supertest';
import { createApp } from '../server';

const app = createApp();

describe('Session API', () => {
  it('POST /api/v1/sessions - should create a new session', async () => {
    const res = await request(app)
      .post('/api/v1/sessions')
      .send({ nickname: 'TestUser' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('username');
    expect(res.body.data).toHaveProperty('sessionId');
  });

  it('POST /api/v1/sessions - should create session without nickname', async () => {
    const res = await request(app).post('/api/v1/sessions').send({});
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/health - should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});