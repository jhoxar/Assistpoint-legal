#!/usr/bin/env bash
set -u
cd "$(dirname "$0")/.."
node --env-file=.env scripts/kie.mjs upload ref-hospital Assets/web-16x9/web/hospital-rural-ward.jpg
node --env-file=.env scripts/kie.mjs upload ref-infusion Assets/web-16x9/web/infusion-center.jpg
node --env-file=.env scripts/kie.mjs image hospital-rural-ward-9x16 prompts/hospital-rural-ward-9x16.txt \
  --model=nano-banana-pro --aspect=9:16 --res=2K ref-hospital
node --env-file=.env scripts/kie.mjs image infusion-center-3x4 prompts/infusion-center-3x4.txt \
  --model=nano-banana-pro --aspect=3:4 --res=2K ref-infusion
echo "=== DONE ==="
