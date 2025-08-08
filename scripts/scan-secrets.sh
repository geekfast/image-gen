#!/usr/bin/env bash
set -euo pipefail

# Lightweight secret scanner for the working tree (not history)
# Excludes common build/vendor dirs and .env files

root_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root_dir"

exclude_dirs=(
  "--exclude-dir=.git"
  "--exclude-dir=node_modules"
  "--exclude-dir=dist"
  "--exclude-dir=uploads"
)

exclude_files=(
  "--exclude=*.env"
  "--exclude=.env"
  "--exclude=.env.*"
)

patterns=(
  'BEGIN RSA PRIVATE KEY'
  'BEGIN OPENSSH PRIVATE KEY'
  'AKIA[0-9A-Z]{16}'
  'ASIA[0-9A-Z]{16}'
  'aws_secret_access_key\s*[:=]\s*[A-Za-z0-9/+=]{20,}'
  'OPENAI_API_KEY\s*[:=]\s*sk-[A-Za-z0-9]{20,}'
  'xox[baprs]-[0-9A-Za-z-]+'
  'GITHUB_TOKEN\s*[:=]\s*[A-Za-z0-9_]{20,}'
  'GH_TOKEN\s*[:=]\s*[A-Za-z0-9_]{20,}'
  'AZURE_?[A-Z0-9_]*KEY\s*[:=]\s*[A-Za-z0-9/+=]{20,}'
)

echo "Scanning repo for potential secrets..."
found=0
for pat in "${patterns[@]}"; do
  if grep -RInE ${exclude_dirs[@]} ${exclude_files[@]} -- "$pat" . > /dev/null 2>&1; then
    echo "- Pattern matched: $pat"
    grep -RInE ${exclude_dirs[@]} ${exclude_files[@]} -- "$pat" . | sed 's/\(.\{0,120\}\).*/\1.../'
    found=$((found+1))
  fi
done

if [ "$found" -eq 0 ]; then
  echo "No potential secrets found in working tree."
else
  echo "\nReview the above matches and remediate as needed."
  exit 1
fi

