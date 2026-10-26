// Dedicated one-shot demo process. Default deny; the sender rechecks authorization before opening egress.
const https = require('node:https'), net = require('node:net'), tls = require('node:tls'), dns = require('node:dns');
const originalRequest = https.request, originalConnect = net.Socket.prototype.connect, originalTls = tls.connect, originalLookup = dns.lookup;
const host = 'generativelanguage.googleapis.com';
let active = false, spent = false;
const deny = () => { throw Error('DEMO_NETWORK_DENIED'); };
const allowed = a => active && a && !a.path && a.host === host && Number(a.port) === 443;
net.Socket.prototype.connect = function (...args) {
  const values = Array.isArray(args[0]) ? args[0] : args;
  if (!allowed(values[0])) return deny();
  return originalConnect.apply(this, args);
};
tls.connect = function (...args) {
  if (!allowed(args[0]) || args[0].servername && args[0].servername !== host) return deny();
  return originalTls.apply(this, args);
};
dns.lookup = function (name, ...args) { if (!active || name !== host) return deny(); return originalLookup.call(this, name, ...args); };
globalThis.fetch = deny;
for (const [mod, names] of Object.entries({ 'node:https': ['request', 'get', 'createServer'], 'node:http': ['request', 'get', 'createServer'],
  'node:http2': ['connect'], 'node:net': ['createConnection', 'connect', 'createServer'], 'node:dgram': ['createSocket'],
  'node:child_process': ['spawn', 'spawnSync', 'exec', 'execSync', 'execFile', 'execFileSync', 'fork'], 'node:worker_threads': ['Worker'] })) {
  for (const name of names) require(mod)[name] = deny;
}
require('node:module').syncBuiltinESMExports();
exports.sender = verify => async ({ body, key, signal }) => {
  verify();
  if (spent) throw Error('DEMO_REQUEST_ALREADY_SPENT');
  spent = true; active = true;
  try {
    return await new Promise((resolve, reject) => {
      const req = originalRequest('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent', {
        method: 'POST', agent: false, signal, headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'x-goog-api-key': key },
      }, res => {
        const chunks = []; let size = 0;
        res.on('data', c => { size += c.length; if (size > 262144) req.destroy(Error('RESPONSE_LIMIT')); else chunks.push(c); });
        res.on('error', reject); res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
      });
      req.on('error', reject); req.end(body);
    });
  } finally { active = false; }
};
