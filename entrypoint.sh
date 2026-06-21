#!/bin/sh
set -e

mkdir -p /data
chown nextjs:nodejs /data

exec su-exec nextjs:nodejs node server.js
