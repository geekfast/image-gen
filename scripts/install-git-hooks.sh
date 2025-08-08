#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"

echo "Setting core.hooksPath to .githooks in this repo..."
git -C "$repo_root" config core.hooksPath .githooks

echo "Making hooks executable..."
chmod +x "$repo_root/.githooks"/* || true

echo "Done. Pre-commit hook installed for this repo."

