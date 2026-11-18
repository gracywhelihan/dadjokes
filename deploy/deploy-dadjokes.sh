#!/bin/bash
# Updates the dad jokes code to match origin/main.
#
# Installed on the server as /usr/local/bin/deploy-dadjokes and run as the `deploy` user.
# The GitHub Actions key for this repo is locked to this one command in
# ~deploy/.ssh/authorized_keys, so even if that key leaks, all it can do is redeploy main.
#
# Only updates code. Changes to the systemd files in deploy/ still need a manual
# `sudo install` + `systemctl daemon-reload` (deploy has no sudo, on purpose).
set -euo pipefail

cd /var/www/dadjokes
git fetch --quiet origin main
# reset (not pull) so the server always mirrors main exactly
git reset --quiet --hard origin/main
echo "Deployed: $(git log --oneline -1)"
