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
  --public-path=/

# Copy and adapt HTML
cat > dist/index.html << 'HTMLEOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MCFinder - Minecraft Seed Map</title>
    <link rel="stylesheet" href="/main.css" />
  </head>
  <body>
    <div id="app">
      <header id="header">
        <div class="header-left">
          <h1 class="logo">MCFinder</h1>
          <span class="tagline">Seed Map Explorer</span>
        </div>
        <div class="header-controls">
          <div class="mc-select-group">
            <label for="edition-select">Edition</label>
            <select id="edition-select" class="mc-select">
              <option value="java">Java Edition</option>
              <option value="bedrock">Bedrock Edition</option>
            </select>
          </div>
          <div class="mc-select-group">
            <label for="version-select">Version</label>
            <select id="version-select" class="mc-select"></select>
          </div>
          <div class="mc-input-group">
            <label for="seed-input">Seed</label>
            <input type="text" id="seed-input" class="mc-input" placeholder="Enter seed..." />
          </div>
          <button id="load-btn" class="mc-btn">Load</button>
          <button id="random-btn" class="mc-btn mc-btn-secondary">Random</button>
        </div>
      </header>

      <div id="main-container">
        <aside id="sidebar">
          <div class="sidebar-section">
            <h3 class="sidebar-title">Structures</h3>
            <div id="structure-toggles" class="toggle-list"></div>
          </div>
          <div class="sidebar-section">
            <h3 class="sidebar-title">Display</h3>
            <div class="toggle-item">
              <input type="checkbox" id="show-biomes" checked />
              <label for="show-biomes">Biomes</label>
            </div>
            <div class="toggle-item">
              <input type="checkbox" id="show-grid" />
              <label for="show-grid">Chunk Grid</label>
            </div>
            <div class="toggle-item">
              <input type="checkbox" id="show-coords" checked />
              <label for="show-coords">Coordinates</label>
            </div>
          </div>
          <div class="sidebar-section">
            <h3 class="sidebar-title">Info</h3>
            <div id="info-panel" class="info-panel">
              <p>Hover over the map to see biome info</p>
            </div>
          </div>
        </aside>

        <div id="map-container">
          <div id="map"></div>
          <div id="coords-display" class="coords-display">X: 0, Z: 0</div>
        </div>
      </div>
    </div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
HTMLEOF

# Copy public files
cp -r public/* dist/ 2>/dev/null || true

echo "Build complete! Output in dist/"
ls -la dist/
