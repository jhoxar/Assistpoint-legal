#!/usr/bin/env bash
# Generate the two 9:16 key frames. Images only — the video is a separate,
# larger spend and is only launched once these frames are inspected.
set -u
cd "$(dirname "$0")/.."
echo "=== frame A (exploded, 9:16) ==="
node --env-file=.env scripts/kie.mjs image frame-A-exploded-9x16 \
  prompts/frame-A-exploded-9x16.txt \
  --model=nano-banana-pro --aspect=9:16 --res=2K ref-A-16x9
echo "=== frame B (assembled, 9:16) ==="
node --env-file=.env scripts/kie.mjs image frame-B-assembled-9x16 \
  prompts/frame-B-assembled-9x16.txt \
  --model=nano-banana-pro --aspect=9:16 --res=2K ref-B-16x9
echo "=== DONE ==="
