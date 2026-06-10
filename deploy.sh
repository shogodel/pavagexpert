#!/bin/bash
# À exécuter SUR le droplet DigitalOcean, pas en local.
# 1. Cloner le repo (une seule fois)
# 2. Obtenir SSL (une seule fois)
# 3. Lancer l'app

set -e

REPO="https://github.com/shogodel/pavagexpert.git"
DOMAIN="pavagexpert.com"
EMAIL="ton-email@gmail.com"  # ← CHANGE MOI

echo "=== 1. Cloner le repo ==="
cd ~
git clone $REPO
cd pavagexpert

echo "=== 2. Premier SSL (Let's Encrypt) ==="
docker compose -f docker-compose.prod.yml up -d nginx
docker compose -f docker-compose.prod.yml run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN -d www.$DOMAIN

echo "=== 3. Relancer Nginx + app ==="
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

echo "=== Fait ! ==="
echo "L'app est en ligne sur https://$DOMAIN"
