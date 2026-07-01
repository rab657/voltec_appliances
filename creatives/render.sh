#!/bin/bash
# Renders each Voltec post HTML to a pixel-exact 2x PNG via headless Chrome.
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p out
render(){ # name  W  H
  "$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --window-size=$2,$3 --virtual-time-budget=9000 \
    --screenshot="out/$1.png" "file://$PWD/posts/$1.html" >/dev/null 2>&1
  echo "  $1  →  $2×$3 @2x  ($(du -h out/$1.png 2>/dev/null | cut -f1))"
}
echo "Rendering Voltec posts…"
render b1-benefit-square     1080 1080
render b2-promo-square       1080 1080
render b3-product-portrait   1080 1350
render b4-comparison-portrait 1080 1350
render b5-range-story        1080 1920
render b6-ad-landscape       1200 628
# AC heat-wave campaign (2026)
render ac-lifestyle         1080 1080
render ac-retail-portrait    1080 1080
render ac-range-portrait     1080 1080
render ac-wholesale-portrait 1080 1080
echo "Done → creatives/out/"
