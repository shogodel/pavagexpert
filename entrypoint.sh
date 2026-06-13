#!/bin/sh
set -e

mkdir -p /data
chown nextjs:nodejs /data

# Seed auth.json from environment on first start using Node.js built-in crypto (no bcryptjs dep).
cd /app
node -e "
const fs = require('fs');
const crypto = require('crypto');
const p = '/data/auth.json';
var needsReseed = false;
if (fs.existsSync(p)) {
  try {
    var existing = JSON.parse(fs.readFileSync(p, 'utf-8'));
    // Detect old bcrypt hash ($$2b$$ prefix) and re-seed with scrypt
    if (existing.admin && existing.admin.passwordHash && existing.admin.passwordHash.startsWith('\$2b\$')) {
      needsReseed = true;
      console.log('[entrypoint] detected bcrypt format, re-seeding with scrypt');
    }
  } catch(e) { needsReseed = true; }
} else { needsReseed = true; }

if (needsReseed) {
  var salt = crypto.randomBytes(16).toString('hex');
  var u = process.env.ADMIN_USERNAME || 'admin';
  var pw = process.env.ADMIN_PASSWORD || 'admin';
  var hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  fs.writeFileSync(p, JSON.stringify({
    admin: { username: u, passwordHash: salt + ':' + hash },
    contractors: [],
  }, null, 2));
  console.log('[entrypoint] auth.json seeded from env (' + u + ')');
}
"

# Ensure the auth file is writable by the nextjs user (created by root above).
if [ -f /data/auth.json ]; then chown nextjs:nodejs /data/auth.json; fi

exec su-exec nextjs:nodejs node server.js
