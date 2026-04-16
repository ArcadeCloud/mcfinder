import L from 'leaflet';
import { BiomeGenerator } from '../biomes/generator';
import { getBiome, getBiomeColor } from '../biomes/biomeData';
import { findStructures } from '../structures/finder';
import { getStructuresForVersion } from '../structures/structureData';

const MinecraftCRS = L.Util.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1 / 16, 0, 1 / 16, 0),
});

export class MapRenderer {
  private map: L.Map;
  private biomeLayer: L.LayerGroup;
  private structureLayer: L.LayerGroup;
  private gridLayer: L.LayerGroup;
  private spawnMarker: L.Marker | null = null;
  private biomeGenerator: BiomeGenerator | null = null;
  private worldSeed: bigint = 0n;
  private worldGenVersion: number = 21;
  private edition: 'java' | 'bedrock' = 'java';
  private dimension: string = 'overworld';
  private enabledStructures: Set<string> = new Set();
  private showBiomes: boolean = true;
  private onBiomeHover: ((biomeName: string, biomeId: number, x: number, z: number) => void) | null = null;
  private onCoordsChange: ((x: number, z: number) => void) | null = null;

  constructor(containerId: string) {
    this.map = L.map(containerId, {
      crs: MinecraftCRS,
      minZoom: -6,
      maxZoom: 4,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      attributionControl: false,
    }).setView([0, 0], -2);

    this.biomeLayer = L.layerGroup().addTo(this.map);
    this.structureLayer = L.layerGroup().addTo(this.map);
    this.gridLayer = L.layerGroup();

    this.setupBiomeTileLayer();

    this.map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const blockX = Math.floor(e.latlng.lng * 16);
      const blockZ = Math.floor(e.latlng.lat * 16);
      if (this.onCoordsChange) this.onCoordsChange(blockX, blockZ);
      if (this.biomeGenerator && this.onBiomeHover) {
        const biomeId = this.biomeGenerator.getBiomeAt(blockX, blockZ);
        const biome = getBiome(biomeId);
        this.onBiomeHover(biome.name, biomeId, blockX, blockZ);
      }
    });

    this.map.on('moveend', () => this.updateStructures());
    this.map.on('zoomend', () => this.updateStructures());
  }

  private setupBiomeTileLayer() {
    const renderer = this;
    const BiomeTileLayer = L.GridLayer.extend({
      createTile(coords: L.Coords) {
        const canvas = document.createElement('canvas');
        const tileSize = 256;
        canvas.width = tileSize;
        canvas.height = tileSize;

        if (!renderer.biomeGenerator || !renderer.showBiomes) {
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#111';
          ctx.fillRect(0, 0, tileSize, tileSize);
          return canvas;
        }

        const ctx = canvas.getContext('2d')!;
        const scale = Math.pow(2, coords.z);
        const blocksPerPixel = 16 / scale;
        const startBlockX = coords.x * tileSize * blocksPerPixel / 16 * 16;
        const startBlockZ = coords.y * tileSize * blocksPerPixel / 16 * 16;
        const pixelStep = Math.max(1, Math.floor(4 / scale));

        for (let px = 0; px < tileSize; px += pixelStep) {
          for (let py = 0; py < tileSize; py += pixelStep) {
            const blockX = Math.floor(startBlockX + (px * blocksPerPixel));
            const blockZ = Math.floor(startBlockZ + (py * blocksPerPixel));
            const sampleX = Math.floor(blockX / 4) * 4;
            const sampleZ = Math.floor(blockZ / 4) * 4;
            const biomeId = renderer.biomeGenerator!.getBiomeAt(sampleX, sampleZ);
            ctx.fillStyle = getBiomeColor(biomeId);
            ctx.fillRect(px, py, pixelStep, pixelStep);
          }
        }
        return canvas;
      },
    });

    new BiomeTileLayer({ tileSize: 256, noWrap: true }).addTo(this.biomeLayer);
  }

  private updateStructures() {
    if (!this.biomeGenerator) return;

    this.structureLayer.clearLayers();

    // Re-add spawn marker
    if (this.spawnMarker) this.spawnMarker.addTo(this.structureLayer);

    const bounds = this.map.getBounds();
    let minCX = Math.floor(bounds.getWest());
    let maxCX = Math.ceil(bounds.getEast());
    let minCZ = Math.floor(bounds.getSouth());
    let maxCZ = Math.ceil(bounds.getNorth());

    // Clamp to max 500 chunks from center
    const maxRange = 500;
    if (maxCX - minCX > maxRange || maxCZ - minCZ > maxRange) {
      const cx = Math.floor((minCX + maxCX) / 2);
      const cz = Math.floor((minCZ + maxCZ) / 2);
      const half = Math.floor(maxRange / 2);
      minCX = cx - half; maxCX = cx + half;
      minCZ = cz - half; maxCZ = cz + half;
    }

    const structures = getStructuresForVersion(this.worldGenVersion, this.edition, this.dimension);

    for (const structure of structures) {
      if (!this.enabledStructures.has(structure.id)) continue;

      // Skip dense structures at low zoom
      if (['slime_chunk', 'mineshaft', 'buried_treasure'].includes(structure.id) &&
          this.map.getZoom() < -1) continue;

      // Skip structures with no placement algorithm
      if (['end_gateway'].includes(structure.id)) continue;

      const locations = findStructures(
        this.worldSeed, structure, minCX, minCZ, maxCX, maxCZ,
        (cx, cz) => this.biomeGenerator!.getBiomeForChunk(cx, cz)
      );

      for (const loc of locations) {
        if (structure.id === 'slime_chunk') {
          const rect = L.rectangle(
            [[loc.chunkZ, loc.chunkX], [loc.chunkZ + 1, loc.chunkX + 1]],
            { color: '#32CD32', fillColor: '#32CD32', fillOpacity: 0.15, weight: 1 }
          );
          rect.bindPopup(`<div class="popup-title">Slime Chunk</div><div class="popup-detail">Chunk: ${loc.chunkX}, ${loc.chunkZ}</div>`);
          rect.addTo(this.structureLayer);
        } else {
          const size = structure.icon.length > 1 ? 24 : 18;
          const icon = L.divIcon({
            className: '',
            html: `<div class="map-marker" style="background:${structure.color};width:${size}px;height:${size}px;font-size:${structure.icon.length > 1 ? 8 : 10}px">${structure.icon}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          const marker = L.marker([loc.chunkZ + 0.5, loc.chunkX + 0.5], { icon });
          marker.bindPopup(
            `<div class="popup-title">${structure.name}</div>` +
            `<div class="popup-detail">Block: ${loc.blockX}, ${loc.blockZ}<br>Chunk: ${loc.chunkX}, ${loc.chunkZ}</div>`
          );
          marker.addTo(this.structureLayer);
        }
      }
    }
  }

  // ===== Public API =====

  loadSeed(seed: bigint, worldGenVersion: number, edition: 'java' | 'bedrock') {
    this.worldSeed = seed;
    this.worldGenVersion = worldGenVersion;
    this.edition = edition;
    this.biomeGenerator = new BiomeGenerator(seed, worldGenVersion, edition);
    this.spawnMarker = null;
    this.biomeLayer.clearLayers();
    this.setupBiomeTileLayer();
    this.updateStructures();
  }

  setDimension(dimension: string) {
    this.dimension = dimension;
    this.updateStructures();
  }

  setStructureEnabled(id: string, enabled: boolean) {
    if (enabled) this.enabledStructures.add(id);
    else this.enabledStructures.delete(id);
    this.updateStructures();
  }

  setShowBiomes(show: boolean) {
    this.showBiomes = show;
    this.biomeLayer.clearLayers();
    this.setupBiomeTileLayer();
  }

  setShowGrid(show: boolean) {
    if (show) this.gridLayer.addTo(this.map);
    else this.gridLayer.remove();
  }

  setOnBiomeHover(cb: (name: string, id: number, x: number, z: number) => void) { this.onBiomeHover = cb; }
  setOnCoordsChange(cb: (x: number, z: number) => void) { this.onCoordsChange = cb; }

  goToCoords(blockX: number, blockZ: number, zoom?: number) {
    this.map.setView([blockZ / 16, blockX / 16], zoom ?? this.map.getZoom());
  }

  goToSpawn() {
    if (!this.biomeGenerator) { this.goToCoords(0, 0, 0); return; }
    const spawn = this.biomeGenerator.findSpawnPoint();
    if (this.spawnMarker) this.spawnMarker.remove();

    const icon = L.divIcon({
      className: '',
      html: '<div class="map-marker-spawn"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    this.spawnMarker = L.marker([spawn.z / 16, spawn.x / 16], { icon });
    this.spawnMarker.bindPopup(
      `<div class="popup-title">Spawn Point</div><div class="popup-detail">X: ${spawn.x}, Z: ${spawn.z}</div>`
    );
    this.spawnMarker.addTo(this.structureLayer);
    this.goToCoords(spawn.x, spawn.z, 0);
  }
}
