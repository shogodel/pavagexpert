#!/bin/sh
set -e
cd "$(dirname "$0")"

echo "=== Pulling latest code ==="
git pull

echo "=== Building fresh image ==="
docker build --no-cache -t pavagexpert:local .

echo "=== Stopping old container ==="
docker rm -f pavagexpert 2>/dev/null || true

echo "=== Starting new container ==="
docker run -d \
  --name pavagexpert \
  --env-file .env \
  --network apps_default \
  pavagexpert:local

echo "=== Waiting for health check ==="
for i in $(seq 1 30); do
  docker exec pavagexpert curl -sf http://localhost:3000/api/health > /dev/null 2>&1 && break
  sleep 2
done

echo "=== Fixing SWAG nginx config ==="
docker exec swag sh -c "sed -i '/resolver 127.0.0.11/d; /set \$upstream_pavagexpert/d; s|proxy_pass http://\\\$upstream_pavagexpert|proxy_pass http://pavagexpert:3000|' /config/nginx/site-confs/default.conf" 2>/dev/null || true
docker exec swag nginx -s reload 2>/dev/null || true
docker restart swag 2>/dev/null || true

echo "=== Done ==="
