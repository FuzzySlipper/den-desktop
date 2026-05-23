#!/usr/bin/env bash
# Quick update script for Den Desktop AppImage
# Usage: ./scripts/update-den-desktop.sh
# Downloads the latest AppImage release to ~/applications/DenDesktop

set -euo pipefail

REPO="${REPO:-FuzzySlipper/den-desktop}"
DEST_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
DEST="${DEST_DIR}/DenDesktop"

# Fallback if ~/applications exists (user's preference from memory)
if [ -d "$HOME/applications" ]; then
  DEST_DIR="$HOME/applications"
  DEST="${DEST_DIR}/DenDesktop"
fi

echo "→ Checking latest release from $REPO ..."

# Fetch release metadata from GitHub API
RELEASE_JSON="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest")"

# Extract the tag for logging
TAG="$(echo "$RELEASE_JSON" | jq -r '.tag_name')"
echo "  Latest tag: ${TAG}"

# Find the AppImage asset URL
ASSET_URL="$(echo "$RELEASE_JSON" | jq -r '.assets[] | select(.name | endswith(".AppImage")) | .browser_download_url')"

if [ -z "$ASSET_URL" ]; then
  echo "✗ No AppImage asset found in latest release!"
  exit 1
fi

ASSET_NAME="$(basename "$ASSET_URL")"
echo "  Asset: ${ASSET_NAME}"
echo ""

# Download to temp
TMP="$(mktemp -d)"
TARGET="${TMP}/${ASSET_NAME}"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

echo "→ Downloading to ${TARGET} ..."
curl -fsSL "$ASSET_URL" -o "$TARGET"
chmod +x "$TARGET"
echo "  ✓ Downloaded ($(du -h "$TARGET" | cut -f1))"

# Remove old binary
if [ -f "$DEST" ]; then
  echo "→ Removing old binary at ${DEST} ..."
  rm -f "$DEST"
fi

# Ensure target dir exists
mkdir -p "$DEST_DIR"

# Rename and move
echo "→ Installing to ${DEST} ..."
mv "$TARGET" "$DEST"

echo ""
echo "✓ Den Desktop updated to ${TAG}"
echo "  Binary: ${DEST}"
