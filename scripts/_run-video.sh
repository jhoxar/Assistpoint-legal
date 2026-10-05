#!/usr/bin/env bash
set -u
cd "$(dirname "$0")/.."
echo "=== upload 9:16 frames ==="
node --env-file=.env scripts/kie.mjs upload f9-A assets-src/kie/frame-A-exploded-9x16.png
node --env-file=.env scripts/kie.mjs upload f9-B assets-src/kie/frame-B-assembled-9x16.png
echo "=== kling 9:16 5s pro ==="
node --env-file=.env scripts/kie.mjs video hero-assembly-9x16 prompts/hero-video-9x16.txt 9:16 dur=5 mode=pro f9-A f9-B
echo "=== DONE ==="
