#!/bin/sh
set -e

mkdir -p /data
chown nextjs:nodejs /data

# Seed auth.json from environment on first start.
cd /app
node -e "
const fs = require('fs');
const p = '/data/auth.json';
if (!fs.existsSync(p)) {
  try {
    const bcrypt = require('bcryptjs');
    const u = process.env.ADMIN_USERNAME || 'admin';
    const pw = process.env.ADMIN_PASSWORD || 'admin';
    fs.writeFileSync(p, JSON.stringify({
      admin: { username: u, passwordHash: bcrypt.hashSync(pw, 10) },
      contractors: [],
    }, null, 2));
    console.log('[entrypoint] auth.json seeded from env (' + u + ')');
  } catch (e) {
    console.error('[entrypoint] seed failed:', e.message);
  }
}
"

exec su-exec nextjs:nodejs node server.js
