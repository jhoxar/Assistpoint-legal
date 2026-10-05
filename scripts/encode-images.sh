#!/usr/bin/env bash
# Masters -> web deliverables in public/media.
#  · 16:9 masters are 2752x1536; the site never shows them wider than ~1200
#    CSS px, so 1920 is the sensible cap.
#  · The vertical plates only ever appear on phones, where 1080 covers a
#    390px viewport at 2.5x. Anything larger is wasted bytes.
set -eu
cd "$(dirname "$0")/.."
mkdir -p public/media

echo "— 16:9 —"
for f in Assets/web-16x9/*.png; do
  b=$(basename "$f" .png)
  magick "$f" -resize 1920x -quality 82 -define webp:method=6 -strip "public/media/$b.webp"
  magick "$f" -resize 1920x -quality 86 -sampling-factor 4:2:0 -strip "public/media/$b.jpg"
  printf "  %-30s %s\n" "$b" "$(du -h "public/media/$b.webp" | cut -f1)"
done

echo "— vertical —"
magick assets-src/kie/hospital-rural-ward-9x16.png -resize 1080x -quality 82 \
  -define webp:method=6 -strip public/media/hospital-rural-ward-9x16.webp
magick assets-src/kie/hospital-rural-ward-9x16.png -resize 1080x -quality 86 \
  -sampling-factor 4:2:0 -strip public/media/hospital-rural-ward-9x16.jpg
magick assets-src/kie/infusion-center-3x4.png -resize 1080x -quality 82 \
  -define webp:method=6 -strip public/media/infusion-center-3x4.webp
magick assets-src/kie/infusion-center-3x4.png -resize 1080x -quality 86 \
  -sampling-factor 4:2:0 -strip public/media/infusion-center-3x4.jpg
for b in hospital-rural-ward-9x16 infusion-center-3x4; do
  printf "  %-30s %s\n" "$b" "$(du -h "public/media/$b.webp" | cut -f1)"
done
