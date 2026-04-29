#!/usr/bin/env bash
# Stage backend artifacts into a Hugging Face Space repo and push.
# Usage: ./deploy-space.sh <hf-username> <space-name>
# Example: ./deploy-space.sh moriaelakaya neuroscan-inference
#
# Prereqs:
#   1. Run `hf auth login` first (paste a write token from
#      https://huggingface.co/settings/tokens).
#   2. Create the Space at https://huggingface.co/new-space — pick "Docker" SDK.

set -euo pipefail

HF_USER="${1:?usage: ./deploy-space.sh <hf-username> <space-name>}"
SPACE_NAME="${2:?usage: ./deploy-space.sh <hf-username> <space-name>}"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
MODEL_FILE="$REPO_ROOT/models/cassandra_v1.pth"

[ -f "$MODEL_FILE" ] || { echo "✗ model not found at $MODEL_FILE"; exit 1; }
[ -f "$BACKEND_DIR/Dockerfile" ] || { echo "✗ Dockerfile missing"; exit 1; }

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

echo "→ staging Space contents in $STAGE"
git clone "https://huggingface.co/spaces/$HF_USER/$SPACE_NAME" "$STAGE/space"

cp -R "$BACKEND_DIR/app" "$STAGE/space/"
cp "$BACKEND_DIR/requirements.txt" "$STAGE/space/"
cp "$BACKEND_DIR/Dockerfile" "$STAGE/space/"
cp "$BACKEND_DIR/space-readme.md" "$STAGE/space/README.md"
cp "$MODEL_FILE" "$STAGE/space/cassandra_v1.pth"

cd "$STAGE/space"
git lfs install --local || true
git lfs track "*.pth"
git add .gitattributes 2>/dev/null || true

git add .
git -c user.email="deploy@neuroscan" -c user.name="NeuroScan Deploy" \
    commit -m "Deploy backend to HF Space" || echo "(nothing to commit)"

echo "→ pushing to https://huggingface.co/spaces/$HF_USER/$SPACE_NAME"
git push origin main

echo "✓ pushed. watch the build at: https://huggingface.co/spaces/$HF_USER/$SPACE_NAME"
echo "  once green, your URL is: https://${HF_USER}-${SPACE_NAME}.hf.space"
