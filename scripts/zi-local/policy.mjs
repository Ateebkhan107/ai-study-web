import { realpathSync, statSync } from 'node:fs';

export const origin = 'http://localhost:3463';
export function clerkConfiguration(text) {
  const values = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY|CLERK_SECRET_KEY)\s*=\s*(["']?)([^\s"'#]+)\2\s*$/);
    if (match) values[match[1]] = match[3];
  }
  if (!values.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_') || !values.CLERK_SECRET_KEY?.startsWith('sk_test_')) throw Error('Local mock requires existing Clerk TEST keys; no other credentials are loaded');
  const frontend = Buffer.from(values.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.slice(8), 'base64').toString().replace(/\$$/, '');
  if (!/^[a-z0-9-]+\.clerk\.accounts\.dev$/.test(frontend)) throw Error('Unrecognized Clerk development frontend; stop for review');
  return { values, frontend };
}
export function actors(value) {
  const ids = [...new Set((value || '').split(',').map(s => s.trim()).filter(Boolean))];
  if (!ids.length || ids.length > 2 || ids.some(id => !/^user_[a-zA-Z0-9]{6,100}$/.test(id))) throw Error('Set ZI_LOCAL_CLERK_USERS to one or two existing Clerk test user IDs. No fake authentication is provided.');
  return ids;
}
export function assertLaunch(env, dir) {
  if (env.NODE_ENV === 'production' || env.VERCEL || env.VERCEL_ENV || env.CI || env.NETLIFY || env.RENDER || env.FLY_APP_NAME) throw Error('Mock launcher is unavailable in builds, CI and hosted environments');
  if (dir) {
    if (!/^\/private\/tmp\/prepzii-zi-local-[A-Za-z0-9]+$/.test(dir) || realpathSync(dir) !== dir) throw Error('Not a local mock workspace');
    const s = statSync(dir);
    if (s.uid !== process.getuid() || (s.mode & 0o777) !== 0o700) throw Error('Unsafe local mock workspace ownership/mode');
  }
}
