#!/bin/bash
set -e
rm -rf dist

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

# Copy index.html and fix script path
sed 's|/src/main.ts|./main.js|g' index.html > dist/index.html
# Remove leaflet CSS link (bundled via esbuild)
sed -i '/unpkg.com\/leaflet/d' dist/index.html
# Add bundled CSS
sed -i 's|</head>|    <link rel="stylesheet" href="./main.css" />\n  </head>|' dist/index.html

cp -r public/* dist/ 2>/dev/null || true
echo "Build complete!"
