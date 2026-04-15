import './style.css';
import 'leaflet/dist/leaflet.css';
import { MapRenderer } from './map/renderer';
import { getVersions, type MCVersion } from './versions';
import { getStructuresForVersion } from './structures/structureData';
import { stringToSeed, randomSeed } from './biomes/generator';
import { getBiome } from './biomes/biomeData';

// ===== DOM Elements =====
const editionSelect = document.getElementById('edition-select') as HTMLSelectElement;
const versionSelect = document.getElementById('version-select') as HTMLSelectElement;
const seedInput = document.getElementById('seed-input') as HTMLInputElement;
const loadBtn = document.getElementById('load-btn') as HTMLButtonElement;
const randomBtn = document.getElementById('random-btn') as HTMLButtonElement;
const structureToggles = document.getElementById('structure-toggles') as HTMLDivElement;
const showBiomesCheckbox = document.getElementById('show-biomes') as HTMLInputElement;
const showGridCheckbox = document.getElementById('show-grid') as HTMLInputElement;
const showCoordsCheckbox = document.getElementById('show-coords') as HTMLInputElement;
const coordsDisplay = document.getElementById('coords-display') as HTMLDivElement;
const infoPanel = document.getElementById('info-panel') as HTMLDivElement;

// ===== State =====
let currentEdition: 'java' | 'bedrock' = 'java';
let currentVersion: MCVersion | null = null;
let mapRenderer: MapRenderer;

// ===== Initialize =====
function init() {
  mapRenderer = new MapRenderer('map');

  // Populate versions
  populateVersions();

  // Set up structure toggles
  updateStructureToggles();

  // Event listeners
  editionSelect.addEventListener('change', () => {
    currentEdition = editionSelect.value as 'java' | 'bedrock';
    populateVersions();
    updateStructureToggles();
  });

  versionSelect.addEventListener('change', () => {
    const versions = getVersions(currentEdition);
    currentVersion = versions.find(v => v.id === versionSelect.value) || versions[0];
    updateStructureToggles();
  });

  loadBtn.addEventListener('click', loadSeed);
  randomBtn.addEventListener('click', () => {
    const seed = randomSeed();
    seedInput.value = seed.toString();
    loadSeed();
  });

  seedInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loadSeed();
  });

  // Display toggles
  showBiomesCheckbox.addEventListener('change', () => {
    mapRenderer.setShowBiomes(showBiomesCheckbox.checked);
  });

  showGridCheckbox.addEventListener('change', () => {
    mapRenderer.setShowGrid(showGridCheckbox.checked);
  });

  showCoordsCheckbox.addEventListener('change', () => {
    coordsDisplay.style.display = showCoordsCheckbox.checked ? 'block' : 'none';
  });

  // Map callbacks
  mapRenderer.setOnCoordsChange((x, z) => {
    coordsDisplay.textContent = `X: ${x}, Z: ${z}`;
  });

  mapRenderer.setOnBiomeHover((name, id, x, z) => {
    const biome = getBiome(id);
    infoPanel.innerHTML = `
      <div class="biome-name">${name}</div>
      <div style="margin-top:6px;">
        <span style="display:inline-block;width:10px;height:10px;background:${biome.color};border:1px solid rgba(255,255,255,0.3);vertical-align:middle;margin-right:4px;"></span>
        ID: ${id}
      </div>
      <div>Temp: ${biome.temperature}</div>
      <div>Rain: ${biome.rainfall}</div>
      <div style="margin-top:4px;">Pos: ${x}, ${z}</div>
    `;
  });

  // Load a default random seed
  const seed = randomSeed();
  seedInput.value = seed.toString();
  loadSeed();
}

function populateVersions() {
  const versions = getVersions(currentEdition);
  versionSelect.innerHTML = '';
  for (const v of versions) {
    const option = document.createElement('option');
    option.value = v.id;
    option.textContent = v.name;
    versionSelect.appendChild(option);
  }
  currentVersion = versions[0];
}

function updateStructureToggles() {
  if (!currentVersion) return;

  const structures = getStructuresForVersion(currentVersion.worldGenVersion, currentEdition);
  structureToggles.innerHTML = '';

  for (const structure of structures) {
    // Skip mineshaft by default (too dense)
    const defaultEnabled = !['mineshaft', 'slime_chunk'].includes(structure.id);

    const item = document.createElement('div');
    item.className = 'toggle-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `struct-${structure.id}`;
    checkbox.checked = defaultEnabled;

    const colorBox = document.createElement('span');
    colorBox.className = 'structure-color';
    colorBox.style.backgroundColor = structure.color;

    const label = document.createElement('label');
    label.htmlFor = `struct-${structure.id}`;
    label.textContent = `${structure.icon} ${structure.name}`;
    label.style.fontSize = '7px';

    checkbox.addEventListener('change', () => {
      mapRenderer.setStructureEnabled(structure.id, checkbox.checked);
    });

    item.appendChild(checkbox);
    item.appendChild(colorBox);
    item.appendChild(label);
    structureToggles.appendChild(item);

    // Set initial state
    mapRenderer.setStructureEnabled(structure.id, defaultEnabled);
  }
}

function loadSeed() {
  if (!currentVersion) return;

  const seedStr = seedInput.value.trim();
  if (!seedStr) return;

  const seed = stringToSeed(seedStr);
  mapRenderer.loadSeed(seed, currentVersion.worldGenVersion, currentEdition);
}

// Start
init();
