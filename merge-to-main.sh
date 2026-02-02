#!/bin/bash
set -e

cd /workspaces/crazypromo

echo "=== Fetch updates ==="
git fetch origin

echo "=== Checkout main ==="
git checkout main

echo "=== Pull main ==="
git pull origin main

echo "=== Merge branch ==="
git merge origin/copilot/vscode-ml4jqaqb-2ca9 --no-edit

echo "=== Push to main ==="
git push origin main

echo "=== Done! ==="
