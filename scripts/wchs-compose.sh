#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

if docker compose version >/dev/null 2>&1; then
  exec docker compose "$@"
fi
if command -v docker-compose >/dev/null 2>&1; then
  exec docker-compose "$@"
fi
echo "error: Docker Compose not found. Install the Compose v2 plugin (e.g. sudo apt install docker-compose-plugin) or install docker-compose on PATH." >&2
exit 1
