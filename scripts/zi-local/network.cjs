// Preload only in the isolated dev process. No Supabase or Gemini transport.
const net = require('node:net');
const tls = require('node:tls');
const { syncBuiltinESMExports } = require('node:module');
const loopback = new Set(['localhost', '127.0.0.1', '::1']);
const frontend = process.env.ZI_LOCAL_CLERK_FRONTEND;
if (!/^[a-z0-9-]+\.clerk\.accounts\.dev$/.test(frontend || '')) throw Error('Missing reviewed Clerk frontend');
const clerk = new Set(['api.clerk.com', frontend]);
const allow = host => loopback.has(host) || clerk.has(host);
const connect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const normalized = Array.isArray(args[0]) ? args[0] : args;
  const a = normalized[0];
  const path = typeof a === 'object' ? a.path : typeof a === 'string' && !/^\d+$/.test(a) ? a : null;
  if (path) throw Error('LOCAL_MOCK_SOCKET_TRANSPORT_DENIED'); // SQL uses guarded psql subprocess, not Node sockets.
  const host = typeof a === 'object' ? a.host || 'localhost' : typeof normalized[1] === 'string' ? normalized[1] : 'localhost';
  if (!allow(host)) throw Error('LOCAL_MOCK_EXTERNAL_SOCKET_DENIED');
  return connect.apply(this, args);
};
const secure = tls.connect;
tls.connect = function (...args) {
  const a = typeof args[0] === 'object' ? args[0] : args.find(x => x && typeof x === 'object') || {};
  const host = a.host || (typeof args[1] === 'string' ? args[1] : 'localhost');
  if (!clerk.has(host) || a.servername && a.servername !== host) throw Error('LOCAL_MOCK_TLS_DENIED');
  return secure.apply(this, args);
};
const fetch = globalThis.fetch;
globalThis.fetch = function (input, options = {}) {
  const u = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (!(u.protocol === 'http:' && loopback.has(u.hostname) || u.protocol === 'https:' && clerk.has(u.hostname) && (!u.port || u.port === '443'))) throw Error('LOCAL_MOCK_EXTERNAL_FETCH_DENIED');
  // Never follow a permitted Clerk URL into another service.
  return fetch(input, { ...options, redirect: 'error' });
};
syncBuiltinESMExports();
