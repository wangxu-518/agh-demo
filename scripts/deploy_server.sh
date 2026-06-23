#!/usr/bin/env bash
set -euo pipefail

release_tag="${RELEASE_TAG:-$(date +%Y%m%d-%H%M%S)}"
release="/opt/agh-demo-demo/releases/$release_tag"
sudo mkdir -p "$release" /opt/agh-demo-demo/bin /opt/agh-demo-demo/data
sudo chown -R ubuntu:ubuntu /opt/agh-demo-demo/data
sudo tar -xzf /tmp/agh-demo-dist.tar.gz -C "$release"
sudo install -m 755 /tmp/spa_server.py /opt/agh-demo-demo/bin/spa_server.py
sudo ln -sfn "$release" /opt/agh-demo-demo/current

cat <<'EOF' | sudo tee /etc/systemd/system/agh-demo.service >/dev/null
[Unit]
Description=AGH Cross-border Oncology Demo
After=network.target

[Service]
Type=simple
User=ubuntu
ExecStart=/usr/bin/python3 /opt/agh-demo-demo/bin/spa_server.py --host 0.0.0.0 --port 8789 --directory /opt/agh-demo-demo/current
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now agh-demo.service
sudo systemctl restart agh-demo.service
sudo systemctl --no-pager --full status agh-demo.service | head -18
curl --retry 5 --retry-delay 1 --retry-connrefused -fsS -o /dev/null -w 'Portal HTTP %{http_code}\n' http://127.0.0.1:8789/portal
