#!/usr/bin/env bash
# Sync the React app's content into python-server/ so it's inside the
# Docker build context. Run this before `fly deploy` in python-server/.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_ROOT/src/content"
DEST="$REPO_ROOT/python-server/content"

if [ ! -d "$SRC" ]; then
  echo "error: $SRC not found" >&2
  exit 1
fi

rm -rf "$DEST"
cp -r "$SRC" "$DEST"
echo "Copied $SRC -> $DEST"
