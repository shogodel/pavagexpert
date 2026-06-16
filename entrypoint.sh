#!/bin/sh
set -e

mkdir -p /data
chown nextjs:nodejs /data

# Run database migration (connects to PostgreSQL, seeds admin if empty)
node /app/db/migrate.mjs

# Seed auth.json from environment (fallback for existing JSON operations)
cd /app
node -e "
const fs = require('fs');
const crypto = require('crypto');
const p = '/data/auth.json';
var needsReseed = false;
if (fs.existsSync(p)) {
  try {
    var existing = JSON.parse(fs.readFileSync(p, 'utf-8'));
    if (existing.admin && existing.admin.passwordHash && existing.admin.passwordHash.startsWith('\$2b\$')) {
      needsReseed = true;
      console.log('[entrypoint] detected bcrypt format, re-seeding with scrypt');
    }
  } catch(e) { needsReseed = true; }
} else { needsReseed = true; }

if (needsReseed) {
  var salt = crypto.randomBytes(16).toString('hex');
  var u = process.env.ADMIN_USERNAME || 'admin';
  var pw = process.env.ADMIN_PASSWORD || 'P@55word';
  var hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  fs.writeFileSync(p, JSON.stringify({
    admin: { username: u, passwordHash: salt + ':' + hash },
    contractors: [],
  }, null, 2));
  console.log('[entrypoint] auth.json seeded from env (' + u + ')');
}
"

if [ -f /data/auth.json ]; then chown nextjs:nodejs /data/auth.json; fi

# Generate VAPID push notification keys using Node crypto if missing
if [ -z "$NEXT_PUBLIC_VAPID_PUBLIC_KEY" ] || [ -z "$VAPID_PRIVATE_KEY" ]; then
  if [ ! -f /data/vapid-keys.json ]; then
    echo "[entrypoint] generating VAPID keys..."
    node -e "
const c = require('crypto');
const e = c.createECDH('prime256v1');
e.generateKeys();
let pub = e.getPublicKey(null, 'uncompressed');
let priv = e.getPrivateKey();
if (priv.length < 32) { const pad = Buffer.alloc(32 - priv.length); pad.fill(0); priv = Buffer.concat([pad, priv]); }
if (pub.length < 65) { const pad = Buffer.alloc(65 - pub.length); pad.fill(0); pub = Buffer.concat([pad, pub]); }
const k = { publicKey: pub.toString('base64url'), privateKey: priv.toString('base64url') };
require('fs').writeFileSync('/data/vapid-keys.json', JSON.stringify(k));
console.log('[entrypoint] VAPID keys saved to /data/vapid-keys.json');
"
  fi
  if [ -f /data/vapid-keys.json ]; then
    eval "$(node -e "
const k = JSON.parse(require('fs').readFileSync('/data/vapid-keys.json','utf-8'));
console.log('export NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + k.publicKey);
console.log('export VAPID_PRIVATE_KEY=' + k.privateKey);
")"
  fi
fi
if [ -f /data/vapid-keys.json ]; then chown nextjs:nodejs /data/vapid-keys.json; fi

exec su-exec nextjs:nodejs node server.js
