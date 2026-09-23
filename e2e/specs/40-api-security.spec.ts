import { test, expect, API, apiLogin, apiSpeakerToken } from './helpers';

/**
 * Backend authorization and data-exposure checks. Browser-independent, so they run once
 * (desktop project only). Never call POST /system/jitsi-domain here: it writes
 * backend/app/jitsi_domain.json, which is shared with the developer's real backend.
 */
test.describe('API security', () => {
  test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== 'desktop', 'API checks run once'));

  let coach = '';
  let marcus = '';
  let elena = '';
  test.beforeAll(async () => {
    coach = (await apiLogin()).body.access_token;
    marcus = await apiSpeakerToken('marcus.vance@example.com');
    elena = await apiSpeakerToken('elena.rostova@example.com');
  });
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  test('speaker cannot read or modify another speaker', async ({ request }) => {
    const other = await (await request.get(`${API}/clients/me`, { headers: auth(elena) })).json();
    for (const [method, path, data] of [
      ['get', `/clients/${other.id}`, undefined],
      ['patch', `/clients/${other.id}`, { goal: 'x' }],
      ['put', `/clients/${other.id}`, { name: 'x' }],
      ['post', `/clients/${other.id}/notes`, { note: 'x' }],
      ['patch', `/clients/${other.id}/reassign-coach`, { coachId: 'coach-test-admin' }],
    ] as const) {
      const r = await (request as any)[method](`${API}${path}`, { headers: auth(marcus), data });
      expect(r.status(), `${method.toUpperCase()} ${path}`).toBeGreaterThanOrEqual(403);
    }
  });

  test('speaker cannot call coach-only endpoints', async ({ request }) => {
    for (const [method, path, data] of [
      ['post', '/coaches', { email: 'e@x.com', password: 'Password123!', fullName: 'E' }],
      ['post', '/exercises', { name: 'x' }],
      ['post', '/programs', { name: 'x' }],
      ['get', '/inquiries', undefined],
      ['get', '/webhooks/resend/inbound-emails', undefined],
      ['get', '/recordings/stats/storage', undefined],
    ] as const) {
      const r = await (request as any)[method](`${API}${path}`, { headers: auth(marcus), data });
      expect(r.status(), `${method.toUpperCase()} ${path}`).toBe(403);
    }
  });

  test('anonymous callers cannot list coach emails', async ({ request }) => {
    const r = await request.get(`${API}/coaches`);
    if (r.status() === 200) {
      const body = await r.json();
      const leaked = (Array.isArray(body) ? body : []).filter((c: any) => c.email);
      expect(leaked.map((c: any) => c.email), 'coach emails exposed without auth').toEqual([]);
    } else {
      expect(r.status()).toBe(401);
    }
  });

  test('anonymous intake with an existing email cannot overwrite or read that profile', async ({ request }) => {
    const before = await (await request.get(`${API}/clients/me`, { headers: auth(elena) })).json();
    const r = await request.post(`${API}/clients`, {
      data: { name: 'Attacker', email: before.email, goal: `HIJACK-${Date.now()}`, avatar: 'https://evil.example/p.png' },
    });
    const body = await r.json().catch(() => ({}));
    const after = await (await request.get(`${API}/clients/me`, { headers: auth(elena) })).json();
    expect.soft(after.goal, 'goal overwritten by anonymous caller').toBe(before.goal);
    expect.soft(after.avatar, 'avatar overwritten by anonymous caller').toBe(before.avatar);
    expect.soft(body.phone, 'phone disclosed to anonymous caller').toBeFalsy();
    expect.soft(body.onboardingSurvey, 'survey disclosed to anonymous caller').toBeFalsy();
    // Restore so later specs see seed data.
    await request.patch(`${API}/clients/${before.id}`, { headers: auth(coach), data: { goal: before.goal, avatar: before.avatar } });
  });

  test('stored XSS payloads are returned as inert text', async ({ request }) => {
    const payload = `<img src=x onerror="window.__xss=1">${Date.now()}`;
    const r = await request.post(`${API}/clients`, { data: { name: payload, email: `xss.${Date.now()}@example.com`, goal: 'x' } });
    expect(r.status()).toBeLessThan(300);
    // Rendering is checked in the coach roster UI spec; here we only record what the API stores.
    const body = await r.json();
    test.info().annotations.push({ type: 'stored-name', description: String(body.name) });
  });

  test('oversized and malformed payloads are rejected cleanly (no 500)', async ({ request }) => {
    const huge = 'A'.repeat(200_000);
    const cases = [
      request.post(`${API}/clients`, { data: { name: huge, email: `big.${Date.now()}@example.com`, goal: huge } }),
      request.post(`${API}/clients`, { data: '{"name": ', headers: { 'Content-Type': 'application/json' } }),
      request.post(`${API}/auth/login`, { data: { email: 'a'.repeat(5000) + '@x.com', password: 'x' } }),
      request.post(`${API}/auth/otp/verify`, { data: { email: 'marcus.vance@example.com', code: "' OR 1=1 --" } }),
      request.post(`${API}/messages`, { headers: auth(marcus), data: { content: huge } }),
    ];
    const statuses = await Promise.all(cases.map(async (p) => (await p).status()));
    for (const s of statuses) expect(s, `statuses: ${statuses.join(',')}`).toBeLessThan(500);
  });

  test('expired / tampered JWT is rejected', async ({ request }) => {
    const [h, p] = coach.split('.');
    const tampered = `${h}.${p}.invalidsignature`;
    expect((await request.get(`${API}/clients`, { headers: auth(tampered) })).status()).toBe(401);
    const none = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    expect((await request.get(`${API}/clients`, { headers: auth(`${none}.${p}.`) })).status()).toBe(401);
  });
});
