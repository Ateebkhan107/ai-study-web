// Offline pilot only. No SDK, HTTP, DNS, database socket or subprocess transport.
const { syncBuiltinESMExports } = require('node:module');
const deny = () => { throw Error('OFFLINE_PILOT_TRANSPORT_DENIED'); };
globalThis.fetch = deny;
for (const [name, methods] of Object.entries({
  'node:net': ['connect', 'createConnection', 'createServer'],
  'node:tls': ['connect', 'createServer'],
  'node:http': ['request', 'get', 'createServer'],
  'node:https': ['request', 'get', 'createServer'],
  'node:http2': ['connect', 'createServer', 'createSecureServer'],
  'node:dgram': ['createSocket'],
  'node:child_process': ['spawn', 'spawnSync', 'exec', 'execSync', 'execFile', 'execFileSync', 'fork'],
  'node:worker_threads': ['Worker'],
})) for (const method of methods) require(name)[method] = deny;
require('node:net').Socket.prototype.connect = deny;
for (const method of ['lookup', 'resolve', 'resolve4', 'resolve6', 'reverse']) {
  require('node:dns')[method] = deny;
  require('node:dns').promises[method] = deny;
}
syncBuiltinESMExports();
