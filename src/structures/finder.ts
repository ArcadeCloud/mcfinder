/**
 * Structure finder using Minecraft's placement algorithm.
 * Structures use a grid-based system with randomized offset per region.
 */

import type { StructureType } from './structureData';

class JavaRandom {
  private seed: bigint;

  constructor(seed: bigint) {
    this.seed = (seed ^ 0x5DEECE66Dn) & 0xFFFFFFFFFFFFn;
  }

  next(bits: number): number {
    this.seed = (this.seed * 0x5DEECE66Dn + 0xBn) & 0xFFFFFFFFFFFFn;
    return Number(this.seed >> BigInt(48 - bits));
  }

  nextInt(bound: number): number {
    if (bound <= 0) return 0;
    if ((bound & (bound - 1)) === 0) {
      return Number((BigInt(bound) * BigInt(this.next(31))) >> 31n);
    }
    let bits: number, val: number;
    do {
      bits = this.next(31);
      val = bits % bound;
    } while (bits - val + (bound - 1) < 0);
    return val;
  }
}

export interface StructureLocation {
  chunkX: number;
  chunkZ: number;
  blockX: number;
  blockZ: number;
  structureId: string;
}

/**
 * Find structure positions within a region using MC's placement algorithm.
 * The algorithm works as follows:
 * 1. Divide world into regions (spacing x spacing chunks)
 * 2. For each region, use seed + salt to find a random position
 * 3. The structure spawns at (regionX * spacing + offsetX, regionZ * spacing + offsetZ)
 */
function getStructureInRegion(
  worldSeed: bigint,
  regionX: number,
  regionZ: number,
  structure: StructureType
): { chunkX: number; chunkZ: number } | null {
  if (structure.spacing <= 1) return null;

  const spacing = structure.spacing;
  const separation = structure.separation;
  const salt = BigInt(structure.salt);

  // Calculate position seed
  const regionSeed = BigInt(regionX) * 341873128712n +
                     BigInt(regionZ) * 132897987541n +
                     worldSeed + salt;
  const rng = new JavaRandom(regionSeed);

  const offsetRange = spacing - separation;
  const offsetX = rng.nextInt(offsetRange);
  const offsetZ = rng.nextInt(offsetRange);

  const chunkX = regionX * spacing + offsetX;
  const chunkZ = regionZ * spacing + offsetZ;

  return { chunkX, chunkZ };
}

/**
 * Find stronghold positions (special ring-based placement)
 */
function findStrongholds(worldSeed: bigint, count: number = 128): { chunkX: number; chunkZ: number }[] {
  const positions: { chunkX: number; chunkZ: number }[] = [];
  const rng = new JavaRandom(worldSeed);

  let angle = rng.nextInt(360) * (Math.PI / 180);
  const rings = [3, 6, 10, 15, 21, 28, 36, 9]; // structures per ring
  const ringDistances = [1408, 4480, 7552, 10624, 13696, 16768, 19840, 22912]; // block distances

  let totalPlaced = 0;
  for (let ring = 0; ring < rings.length && totalPlaced < count; ring++) {
    const numInRing = rings[ring];
    const distance = ringDistances[ring];

    for (let i = 0; i < numInRing && totalPlaced < count; i++) {
      const x = Math.round(Math.cos(angle) * distance);
      const z = Math.round(Math.sin(angle) * distance);
      positions.push({
        chunkX: (x >> 4),
        chunkZ: (z >> 4),
      });
      angle += (2 * Math.PI) / numInRing;
      totalPlaced++;
    }
  }

  return positions;
}

/**
 * Check if a chunk is a slime chunk
 */
function isSlimeChunk(worldSeed: bigint, chunkX: number, chunkZ: number): boolean {
  const seed = worldSeed +
    BigInt(chunkX * chunkX * 0x4c1906) +
    BigInt(chunkX * 0x5ac0db) +
    BigInt(chunkZ * chunkZ) * 0x4307a7n +
    BigInt(chunkZ * 0x5f24f) ^
    0x3AD8025Fn;
  const rng = new JavaRandom(seed);
  return rng.nextInt(10) === 0;
}

/**
 * Check if a chunk qualifies for mineshaft generation
 */
function isMineshaftChunk(worldSeed: bigint, chunkX: number, chunkZ: number): boolean {
  const seed = worldSeed ^ (BigInt(chunkX) * 341873128712n + BigInt(chunkZ) * 132897987541n);
  const rng = new JavaRandom(seed);
  return rng.nextInt(100) < 4; // ~4% chance
}

/**
 * Find all structures of a given type within the visible area
 */
export function findStructures(
  worldSeed: bigint,
  structure: StructureType,
  minChunkX: number,
  minChunkZ: number,
  maxChunkX: number,
  maxChunkZ: number,
  biomeChecker?: (chunkX: number, chunkZ: number) => number
): StructureLocation[] {
  const locations: StructureLocation[] = [];

  // Strongholds - special case
  if (structure.id === 'stronghold') {
    const strongholds = findStrongholds(worldSeed, 128);
    for (const sh of strongholds) {
      if (sh.chunkX >= minChunkX && sh.chunkX <= maxChunkX &&
          sh.chunkZ >= minChunkZ && sh.chunkZ <= maxChunkZ) {
        locations.push({
          chunkX: sh.chunkX,
          chunkZ: sh.chunkZ,
          blockX: sh.chunkX * 16 + 8,
          blockZ: sh.chunkZ * 16 + 8,
          structureId: structure.id,
        });
      }
    }
    return locations;
  }

  // Slime chunks
  if (structure.id === 'slime_chunk') {
    for (let cx = minChunkX; cx <= maxChunkX; cx++) {
      for (let cz = minChunkZ; cz <= maxChunkZ; cz++) {
        if (isSlimeChunk(worldSeed, cx, cz)) {
          locations.push({
            chunkX: cx,
            chunkZ: cz,
            blockX: cx * 16 + 8,
            blockZ: cz * 16 + 8,
            structureId: structure.id,
          });
        }
      }
    }
    return locations;
  }

  // Mineshafts - high density, limit display
  if (structure.id === 'mineshaft') {
    for (let cx = minChunkX; cx <= maxChunkX; cx += 2) {
      for (let cz = minChunkZ; cz <= maxChunkZ; cz += 2) {
        if (isMineshaftChunk(worldSeed, cx, cz)) {
          locations.push({
            chunkX: cx,
            chunkZ: cz,
            blockX: cx * 16 + 8,
            blockZ: cz * 16 + 8,
            structureId: structure.id,
          });
        }
      }
    }
    return locations;
  }

  // Standard grid-based structures
  if (structure.spacing <= 1) return locations;

  const minRegionX = Math.floor(minChunkX / structure.spacing) - 1;
  const maxRegionX = Math.floor(maxChunkX / structure.spacing) + 1;
  const minRegionZ = Math.floor(minChunkZ / structure.spacing) - 1;
  const maxRegionZ = Math.floor(maxChunkZ / structure.spacing) + 1;

  for (let rx = minRegionX; rx <= maxRegionX; rx++) {
    for (let rz = minRegionZ; rz <= maxRegionZ; rz++) {
      const pos = getStructureInRegion(worldSeed, rx, rz, structure);
      if (!pos) continue;

      if (pos.chunkX < minChunkX || pos.chunkX > maxChunkX ||
          pos.chunkZ < minChunkZ || pos.chunkZ > maxChunkZ) continue;

      // Biome check
      if (structure.validBiomes && biomeChecker) {
        const biome = biomeChecker(pos.chunkX, pos.chunkZ);
        if (!structure.validBiomes.includes(biome)) continue;
      }

      locations.push({
        chunkX: pos.chunkX,
        chunkZ: pos.chunkZ,
        blockX: pos.chunkX * 16 + 8,
        blockZ: pos.chunkZ * 16 + 8,
        structureId: structure.id,
      });
    }
  }

  return locations;
}
