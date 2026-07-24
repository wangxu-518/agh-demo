#!/usr/bin/env bash
set -euo pipefail

if ! command -v caddy >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | sudo gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  sudo chmod o+r /etc/apt/sources.list.d/caddy-stable.list
  sudo apt-get update
  sudo mkdir -p /etc/caddy
  sudo install -m 644 /tmp/Caddyfile.agh-care /etc/caddy/Caddyfile
  sudo apt-get -o Dpkg::Options::=--force-confold install -y caddy
fi

sudo install -m 644 /tmp/Caddyfile.agh-care /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl enable caddy
sudo systemctl restart caddy
sudo systemctl --no-pager --full status caddy
