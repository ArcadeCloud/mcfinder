#!/bin/bash
set -e

# Clean
rm -rf dist

# Bundle JS + CSS
npx esbuild src/main.ts \
  --bundle \
  --outfile=dist/main.js \
  --format=esm \
  --target=es2020 \
  --minify \
  --loader:.png=file \
  --loader:.svg=file \
  --asset-names=assets/[name] \
  --public-path=./

# Copy index.html and fix paths for static hosting
sed 's|/src/main.ts|./main.js|g; s|href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"||g' index.html > dist/index.html
# Add CSS link (leaflet CSS is bundled by esbuild)
sed -i 's|<link rel="stylesheet" href="" />||g' dist/index.html
# Fix: add main.css link
sed -i 's|</head>|    <link rel="stylesheet" href="./main.css" />\n  </head>|' dist/index.html

# Copy public files
cp -r public/* dist/ 2>/dev/null || true

echo "Build complete! Output in dist/"
ls -la dist/
