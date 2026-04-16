import './style.css';
import 'leaflet/dist/leaflet.css';
import { MapRenderer } from './map/renderer';
import { getVersions, type MCVersion } from './versions';
import { getStructuresForVersion } from './structures/structureData';
import { stringToSeed, randomSeed } from './biomes/generator';
import { getBiome } from './biomes/biomeData';

// DOM
const editionSelect = document.getElementById('edition-select') as HTMLSelectElement;
const versionSelect = document.getElementById('version-select') as HTMLSelectElement;
const dimensionSelect = document.getElementById('dimension-select') as HTMLSelectElement;
const seedInput = document.getElementById('seed-input') as HTMLInputElement;
const loadBtn = document.getElementById('load-btn') as HTMLButtonElement;
const randomBtn = document.getElementById('random-btn') as HTMLButtonElement;
const spawnBtn = document.getElementById('spawn-btn') as HTMLButtonElement;
const gotoX = document.getElementById('goto-x') as HTMLInputElement;
const gotoZ = document.getElementById('goto-z') as HTMLInputElement;
const gotoBtn = document.getElementById('goto-btn') as HTMLButtonElement;
const structureToggles = document.getElementById('structure-toggles') as HTMLDivElement;
const showBiomesCheckbox = document.getElementById('show-biomes') as HTMLInputElement;
const showGridCheckbox = document.getElementById('show-grid') as HTMLInputElement;
const showCoordsCheckbox = document.getElementById('show-coords') as HTMLInputElement;
const coordsDisplay = document.getElementById('coords-display') as HTMLDivElement;
const infoPanel = document.getElementById('info-panel') as HTMLDivElement;

// State
let currentEdition: 'java' | 'bedrock' = 'java';
let currentVersion: MCVersion | null = null;
let currentDimension = 'overworld';
let mapRenderer: MapRenderer;

function init() {
  mapRenderer = new MapRenderer('map');
  populateVersions();
  updateStructureToggles();

  // Edition change
  editionSelect.addEventListener('change', () => {
    currentEdition = editionSelect.value as 'java' | 'bedrock';
    populateVersions();
    updateStructureToggles();
  });

  // Version change
  versionSelect.addEventListener('change', () => {
    const versions = getVersions(currentEdition);
    currentVersion = versions.find(v => v.id === versionSelect.value) || versions[0];
    updateStructureToggles();
  });

  // Dimension change
  dimensionSelect.addEventListener('change', () => {
    currentDimension = dimensionSelect.value;
    mapRenderer.setDimension(currentDimension);
    updateStructureToggles();
  });

  // Seed controls
  loadBtn.addEventListener('click', loadSeed);
  randomBtn.addEventListener('click', () => {
    seedInput.value = randomSeed().toString();
    loadSeed();
  });
  seedInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadSeed(); });

  // Navigation
  spawnBtn.addEventListener('click', () => mapRenderer.goToSpawn());
  gotoBtn.addEventListener('click', goToCoords);
  gotoX.addEventListener('keydown', (e) => { if (e.key === 'Enter') goToCoords(); });
  gotoZ.addEventListener('keydown', (e) => { if (e.key === 'Enter') goToCoords(); });

  // Display toggles
  showBiomesCheckbox.addEventListener('change', () => mapRenderer.setShowBiomes(showBiomesCheckbox.checked));
  showGridCheckbox.addEventListener('change', () => mapRenderer.setShowGrid(showGridCheckbox.checked));
  showCoordsCheckbox.addEventListener('change', () => {
    coordsDisplay.style.display = showCoordsCheckbox.checked ? 'block' : 'none';
  });

  // Map callbacks
  mapRenderer.setOnCoordsChange((x, z) => {
    coordsDisplay.textContent = `X: ${x}, Z: ${z}`;
  });

  mapRenderer.setOnBiomeHover((name, id, x, z) => {
    const biome = getBiome(id);
    infoPanel.innerHTML =
      `<div class="info-biome">${name}</div>` +
      `<div class="info-detail">` +
      `<span style="display:inline-block;width:10px;height:10px;background:${biome.color};border-radius:2px;vertical-align:middle;margin-right:4px;border:1px solid rgba(255,255,255,0.15)"></span>` +
      `ID: ${id} &middot; Temp: ${biome.temperature} &middot; Rain: ${biome.rainfall}</div>` +
      `<div class="info-detail">Pos: ${x}, ${z}</div>`;
  });

  // URL params
  const params = new URLSearchParams(window.location.search);
  const urlSeed = params.get('seed');
  if (urlSeed) {
    seedInput.value = urlSeed;
    const urlEd = params.get('edition');
    if (urlEd === 'java' || urlEd === 'bedrock') {
      editionSelect.value = urlEd;
      currentEdition = urlEd;
      populateVersions();
    }
    const urlVer = params.get('version');
    if (urlVer) {
      versionSelect.value = urlVer;
      const versions = getVersions(currentEdition);
      currentVersion = versions.find(v => v.id === urlVer) || versions[0];
    }
    const urlDim = params.get('dimension');
    if (urlDim) {
      dimensionSelect.value = urlDim;
      currentDimension = urlDim;
    }
    updateStructureToggles();
    loadSeed();
  } else {
    seedInput.value = randomSeed().toString();
    loadSeed();
  }

  setTimeout(() => mapRenderer.goToSpawn(), 100);
}

function populateVersions() {
  const versions = getVersions(currentEdition);
  versionSelect.innerHTML = '';
  for (const v of versions) {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = v.name;
    versionSelect.appendChild(opt);
  }
  currentVersion = versions[0];
}

function updateStructureToggles() {
  if (!currentVersion) return;
  const structures = getStructuresForVersion(currentVersion.worldGenVersion, currentEdition, currentDimension);
  structureToggles.innerHTML = '';

  for (const s of structures) {
    const defaultOn = !['mineshaft', 'slime_chunk', 'buried_treasure'].includes(s.id);

    const label = document.createElement('label');
    label.className = 'feature-toggle';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = defaultOn;

    const swatch = document.createElement('span');
    swatch.className = 'toggle-swatch';
    swatch.style.background = s.color;

    const text = document.createElement('span');
    text.textContent = s.name;

    cb.addEventListener('change', () => mapRenderer.setStructureEnabled(s.id, cb.checked));

    label.appendChild(cb);
    label.appendChild(swatch);
    label.appendChild(text);
    structureToggles.appendChild(label);

    mapRenderer.setStructureEnabled(s.id, defaultOn);
  }
}

function loadSeed() {
  if (!currentVersion) return;
  const seedStr = seedInput.value.trim();
  if (!seedStr) return;

  const seed = stringToSeed(seedStr);
  mapRenderer.loadSeed(seed, currentVersion.worldGenVersion, currentEdition);
  mapRenderer.setDimension(currentDimension);

  // Update URL
  const params = new URLSearchParams();
  params.set('seed', seedStr);
  params.set('edition', currentEdition);
  params.set('version', currentVersion.id);
  params.set('dimension', currentDimension);
  history.replaceState(null, '', `?${params.toString()}`);

  setTimeout(() => mapRenderer.goToSpawn(), 50);
}

function goToCoords() {
  mapRenderer.goToCoords(parseInt(gotoX.value) || 0, parseInt(gotoZ.value) || 0);
}

init();
