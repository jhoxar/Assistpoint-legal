#!/usr/bin/env python3
"""
Pull a real alpha channel off the green-screen hero plate, then encode the web
deliverables.

Why not `ffmpeg -vf chromakey`: the generated green is not constant. Measured
across the 16:9 plate it drifted between 96 and 102 "greenness", and a fixed
threshold against a drifting background is what produces crawling, flickering
edges. So the threshold is derived per frame from that frame's own background.

    python3 scripts/hero-alpha.py <src.mp4> <out-basename> <W> <H>
"""
import subprocess
import sys
import shutil
from pathlib import Path

import cv2
import numpy as np

src = Path(sys.argv[1])
base = sys.argv[2]
W, H = int(sys.argv[3]), int(sys.argv[4])

work = Path("assets-src/alpha-work")
raw, rgba = work / "raw", work / "rgba"
for d in (raw, rgba):
    if d.exists():
        shutil.rmtree(d)
    d.mkdir(parents=True)

out_dir = Path("public/media")
out_dir.mkdir(parents=True, exist_ok=True)


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"FAILED: {' '.join(cmd[:6])}...\n{r.stderr[-1500:]}")
    return r


print("1/5  extracting frames")
run(["ffmpeg", "-v", "error", "-y", "-i", str(src), str(raw / "%03d.png")])
frames = sorted(raw.glob("*.png"))
print(f"     {len(frames)} frames")

print("2/5  per-frame adaptive alpha + despill")
prev_alpha = None
max_delta = 0.0
for i, f in enumerate(frames, 1):
    bgr = cv2.imread(str(f))
    im = bgr[:, :, ::-1].astype(np.float32)          # -> RGB
    r, g, b = im[:, :, 0], im[:, :, 1], im[:, :, 2]

    greenness = g - np.maximum(r, b)
    sample = greenness[greenness > 40]
    if sample.size == 0:                              # no background at all
        gbg = 100.0
    else:
        gbg = float(np.median(sample))                # THIS frame's background

    lo, hi = gbg * 0.22, gbg * 0.60
    soft = np.clip((greenness - lo) / max(hi - lo, 1e-6), 0, 1)
    alpha = 1.0 - soft

    # Despill: green fringe survives the matte and reads as a halo.
    rgb = im.copy()
    spill = np.maximum(0.0, rgb[:, :, 1] - np.maximum(rgb[:, :, 0], rgb[:, :, 2]))
    rgb[:, :, 1] -= spill * 0.92

    # Flicker that matters is instability in pixels that are background in
    # BOTH frames. A moving object edge legitimately swings 0<->1, so a plain
    # max over the whole frame always reads 1.0 and tells you nothing.
    if prev_alpha is not None:
        bg = (alpha < 0.02) & (prev_alpha < 0.02)
        if bg.any():
            max_delta = max(max_delta, float(np.abs(alpha - prev_alpha)[bg].mean()))
    prev_alpha = alpha

    out = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)
    cv2.imwrite(str(rgba / f"{i:03d}.png"), out[:, :, [2, 1, 0, 3]])

print(f"     background alpha drift (mean per frame pair): {max_delta:.6f}  (threshold 0.008)")
if max_delta > 0.008:
    print("     WARNING: above threshold — edges may crawl")

# Kling ends on (almost) the first frame; keeping both shows it twice at the
# loop point.
keep = len(frames) - 1

VF = f"scale=-2:{H},pad={W}:{H}:(ow-iw)/2:0:color=0x00000000,format=yuva420p"
VF_FLAT = f"scale=-2:{H},pad={W}:{H}:(ow-iw)/2:0:color=0x00000000"

print("3/5  VP9 + alpha (one-shot)")
# -auto-alt-ref 0 is mandatory. With alt-ref on, libvpx silently writes a flat
# alpha channel and the matte is lost.
run(["ffmpeg", "-v", "error", "-y", "-framerate", "24", "-i", str(rgba / "%03d.png"),
     "-frames:v", str(keep), "-vf", VF,
     "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0",
     "-b:v", "0", "-crf", "34", "-row-mt", "1", "-cpu-used", "1",
     str(out_dir / f"{base}.webm")])

print("4/5  H.264 fallback composited on #f7fbff")
run(["ffmpeg", "-v", "error", "-y",
     "-f", "lavfi", "-i", f"color=c=0xf7fbff:s={W}x{H}:r=24:d=10",
     "-framerate", "24", "-i", str(rgba / "%03d.png"),
     "-frames:v", str(keep),
     "-filter_complex", f"[1:v]{VF_FLAT}[fg];[0:v][fg]overlay=0:0:format=auto,format=yuv420p[v]",
     "-map", "[v]", "-shortest",
     "-c:v", "libopenh264", "-b:v", "2600k", "-movflags", "+faststart",
     str(out_dir / f"{base}.mp4")])

print("5/5  poster (last frame, alpha preserved)")
run(["ffmpeg", "-v", "error", "-y", "-i", str(rgba / f"{keep:03d}.png"),
     "-vf", f"scale=-2:{H},pad={W}:{H}:(ow-iw)/2:0:color=0x00000000",
     str(out_dir / f"{base}-poster.png")])

print("\nwrote:")
for p in sorted(out_dir.glob(f"{base}*")):
    kb = p.stat().st_size / 1024
    flag = "  <-- OVER 3MB BUDGET" if kb > 3000 else ""
    print(f"  {p}  {kb:,.0f} KB{flag}")
