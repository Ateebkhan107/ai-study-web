// Requests only the fixed loopback development server; no cookies/tokens accepted.
import http from 'node:http';
import assert from 'node:assert/strict';
function request(path, headers = {}, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 3463, path, method, headers: { Host: 'localhost:3463', ...headers }, timeout: 20000 }, res => {
      res.resume(); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers }));
    });
    req.on('timeout', () => req.destroy(Error('Local request timed out'))); req.on('error', reject); req.end();
  });
}
for (const [name, path, headers, method, expected] of [
  ['foreign Host denied before auth', '/api/zi/generation-jobs', { Host: 'public.example' }, 'GET', 403],
  ['forwarded public Host denied', '/api/zi/generation-jobs', { 'x-forwarded-host': 'public.example' }, 'GET', 403],
  ['foreign POST origin denied', '/api/zi/generation-jobs', { Origin: 'https://public.example' }, 'POST', 403],
  ['missing POST origin denied', '/api/zi/generation-jobs', {}, 'POST', 403],
  ['signed-out job request denied', '/api/zi/generation-jobs', {}, 'GET', 401],
  ['real Clerk sign-in renders', '/sign-in', {}, 'GET', 200],
]) {
  const result = await request(path, headers, method);
  assert.equal(result.status, expected, `${name}: ${result.status}`);
  console.log(`PASS ${name}`);
}
