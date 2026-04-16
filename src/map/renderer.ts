/**
 * Leaflet-based map renderer for Minecraft world visualization.
 * Uses a custom CRS (coordinate reference system) for MC block coordinates.
 */

import L from 'leaflet';
import { BiomeGenerator } from '../biomes/generator';
import { getBiome, getBiomeColor } from '../biomes/biomeData';
import { findStructures } from '../structures/finder';
import { getStructuresForVersion } from '../structures/structureData';

// Minecraft uses a simple XZ plane, not geographic coords
// Transformation(1/16, 0, 1/16, 0) maps block coords to lat/lng by dividing by 16
// So lat/lng values ≈ chunk coordinates
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
  private enabledStructures: Set<string> = new Set();
  private showBiomes: boolean = true;
  private showGrid: boolean = false;
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

    // Custom tile layer for biome rendering
    this.setupBiomeTileLayer();

    // Mouse events
    this.map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const blockX = Math.floor(e.latlng.lng * 16);
      const blockZ = Math.floor(e.latlng.lat * 16);

      if (this.onCoordsChange) {
        this.onCoordsChange(blockX, blockZ);
      }

      if (this.biomeGenerator && this.onBiomeHover) {
        const biomeId = this.biomeGenerator.getBiomeAt(blockX, blockZ);
        const biome = getBiome(biomeId);
        this.onBiomeHover(biome.name, biomeId, blockX, blockZ);
      }
    });

    this.map.on('moveend', () => {
      this.updateStructures();
    });

    this.map.on('zoomend', () => {
      this.updateStructures();
    });
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
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(0, 0, tileSize, tileSize);
          return canvas;
        }

        // Render biomes on this tile
        const ctx = canvas.getContext('2d')!;
        const scale = Math.pow(2, coords.z);
        const blocksPerPixel = 16 / scale;
        const startBlockX = coords.x * tileSize * blocksPerPixel / 16 * 16;
        const startBlockZ = coords.y * tileSize * blocksPerPixel / 16 * 16;

        // Adaptive resolution based on zoom
        const pixelStep = Math.max(1, Math.floor(4 / scale));

        for (let px = 0; px < tileSize; px += pixelStep) {
          for (let py = 0; py < tileSize; py += pixelStep) {
            const blockX = Math.floor(startBlockX + (px * blocksPerPixel));
            const blockZ = Math.floor(startBlockZ + (py * blocksPerPixel));

            // Sample biome at reduced resolution for performance
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

    new BiomeTileLayer({
      tileSize: 256,
      noWrap: true,
    }).addTo(this.biomeLayer);
  }

  private updateStructures() {
    if (!this.biomeGenerator) return;

    this.structureLayer.clearLayers();

    // Re-add spawn marker if it exists
    if (this.spawnMarker) {
      this.spawnMarker.addTo(this.structureLayer);
    }

    const bounds = this.map.getBounds();
    let minChunkX = Math.floor(bounds.getWest());
    let maxChunkX = Math.ceil(bounds.getEast());
    let minChunkZ = Math.floor(bounds.getSouth());
    let maxChunkZ = Math.ceil(bounds.getNorth());

    // Clamp search area to max 500 chunks from center instead of skipping entirely
    const maxRange = 500;
    if (maxChunkX - minChunkX > maxRange || maxChunkZ - minChunkZ > maxRange) {
      const centerX = Math.floor((minChunkX + maxChunkX) / 2);
      const centerZ = Math.floor((minChunkZ + maxChunkZ) / 2);
      const halfRange = Math.floor(maxRange / 2);
      minChunkX = centerX - halfRange;
      maxChunkX = centerX + halfRange;
      minChunkZ = centerZ - halfRange;
      maxChunkZ = centerZ + halfRange;
    }

    const structures = getStructuresForVersion(this.worldGenVersion, this.edition);

    for (const structure of structures) {
      if (!this.enabledStructures.has(structure.id)) continue;

      // Skip high-density structures at low zoom
      if ((structure.id === 'slime_chunk' || structure.id === 'mineshaft') &&
          this.map.getZoom() < -1) continue;

      const locations = findStructures(
        this.worldSeed,
        structure,
        minChunkX,
        minChunkZ,
        maxChunkX,
        maxChunkZ,
        (cx, cz) => this.biomeGenerator!.getBiomeForChunk(cx, cz)
      );

      for (const loc of locations) {
        if (structure.id === 'slime_chunk') {
          const rect = L.rectangle(
            [[loc.chunkZ, loc.chunkX], [loc.chunkZ + 1, loc.chunkX + 1]],
            {
              color: '#00FF00',
              fillColor: '#00FF00',
              fillOpacity: 0.2,
              weight: 1,
            }
          );
          rect.bindPopup(`<b>Slime Chunk</b><br>Chunk: ${loc.chunkX}, ${loc.chunkZ}`);
          rect.addTo(this.structureLayer);
        } else {
          const icon = L.divIcon({
            className: 'structure-marker',
            html: `<span style="font-size:20px;filter:drop-shadow(1px 1px 2px rgba(0,0,0,0.8))">${structure.icon}</span>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([loc.chunkZ + 0.5, loc.chunkX + 0.5], { icon });
          marker.bindPopup(
            `<b>${structure.name}</b><br>` +
            `Block: ${loc.blockX}, ${loc.blockZ}<br>` +
            `Chunk: ${loc.chunkX}, ${loc.chunkZ}`
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

    // Refresh map
    this.biomeLayer.clearLayers();
    this.setupBiomeTileLayer();
    this.updateStructures();
  }

  setStructureEnabled(structureId: string, enabled: boolean) {
    if (enabled) {
      this.enabledStructures.add(structureId);
    } else {
      this.enabledStructures.delete(structureId);
    }
    this.updateStructures();
  }

  setShowBiomes(show: boolean) {
    this.showBiomes = show;
    this.biomeLayer.clearLayers();
    this.setupBiomeTileLayer();
  }

  setShowGrid(show: boolean) {
    this.showGrid = show;
    if (show) {
      this.gridLayer.addTo(this.map);
    } else {
      this.gridLayer.remove();
    }
  }

  setOnBiomeHover(callback: (biomeName: string, biomeId: number, x: number, z: number) => void) {
    this.onBiomeHover = callback;
  }

  setOnCoordsChange(callback: (x: number, z: number) => void) {
    this.onCoordsChange = callback;
  }

  goToCoords(blockX: number, blockZ: number, zoom?: number) {
    this.map.setView([blockZ / 16, blockX / 16], zoom ?? this.map.getZoom());
  }

  goToSpawn() {
    if (this.biomeGenerator) {
      const spawn = this.biomeGenerator.findSpawnPoint();

      // Remove old spawn marker
      if (this.spawnMarker) {
        this.spawnMarker.remove();
      }

      // Add spawn marker
      const icon = L.divIcon({
        className: 'structure-marker',
        html: '<span style="font-size:24px;filter:drop-shadow(1px 1px 2px rgba(0,0,0,0.8))">🛏️</span>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      this.spawnMarker = L.marker([spawn.z / 16, spawn.x / 16], { icon });
      this.spawnMarker.bindPopup(`<b>Spawn Point</b><br>X: ${spawn.x}, Z: ${spawn.z}`);
      this.spawnMarker.addTo(this.structureLayer);

      this.goToCoords(spawn.x, spawn.z, 0);
    } else {
      this.goToCoords(0, 0, 0);
    }
  }

  getMapPosition(): { x: number; z: number; zoom: number } {
    const center = this.map.getCenter();
    return {
      x: Math.floor(center.lng * 16),
      z: Math.floor(center.lat * 16),
      zoom: this.map.getZoom(),
    };
  }
}
