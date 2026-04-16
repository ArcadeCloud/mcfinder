/**
 * Minecraft-like biome generation using simplified Perlin noise.
 * This replicates the core algorithm Minecraft uses for biome placement.
 *
 * For Java Edition: based on the actual MC algorithm (temperature + rainfall layers)
 * For Bedrock Edition: similar but with slightly different parameters
 */

// ===== Java Random (LCG) matching Minecraft's java.util.Random =====
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

  nextLong(): bigint {
    return (BigInt(this.next(32)) << 32n) + BigInt(this.next(32));
  }
}

// ===== Simplex-like noise for biome generation =====
class PerlinNoise {
  private perm: number[] = [];

  constructor(seed: bigint) {
    const rng = new JavaRandom(seed);
    this.perm = new Array(512);
    const p = new Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.abs(rng.nextInt(i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, z: number): number {
    const h = hash & 3;
    const u = h < 2 ? x : z;
    const v = h < 2 ? z : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise2D(x: number, z: number): number {
    const X = Math.floor(x) & 255;
    const Z = Math.floor(z) & 255;
    const xf = x - Math.floor(x);
    const zf = z - Math.floor(z);
    const u = this.fade(xf);
    const v = this.fade(zf);

    const aa = this.perm[this.perm[X] + Z];
    const ab = this.perm[this.perm[X] + Z + 1];
    const ba = this.perm[this.perm[X + 1] + Z];
    const bb = this.perm[this.perm[X + 1] + Z + 1];

    return this.lerp(
      this.lerp(this.grad(aa, xf, zf), this.grad(ba, xf - 1, zf), u),
      this.lerp(this.grad(ab, xf, zf - 1), this.grad(bb, xf - 1, zf - 1), u),
      v
    );
  }

  octaveNoise(x: number, z: number, octaves: number, scale: number): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.noise2D(x * frequency / scale, z * frequency / scale) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value / maxValue;
  }
}

// ===== Biome Assignment =====

// Biome IDs matching biomeData.ts
const BIOME_TABLE_LEGACY: Record<string, number> = {
  // temperature_category + rainfall_category -> biome
  'cold_dry':    12,  // Snowy Plains
  'cold_wet':    30,  // Snowy Taiga
  'cold_mid':    5,   // Taiga
  'mild_dry':    1,   // Plains
  'mild_wet':    4,   // Forest
  'mild_mid':    27,  // Birch Forest
  'warm_dry':    2,   // Desert
  'warm_wet':    21,  // Jungle
  'warm_mid':    35,  // Savanna
  'hot_dry':     37,  // Badlands
  'hot_wet':     6,   // Swamp
  'hot_mid':     29,  // Dark Forest
};

const BIOME_TABLE_MODERN: Record<string, number> = {
  'cold_dry':    12,  // Snowy Plains
  'cold_wet':    30,  // Snowy Taiga
  'cold_mid':    178, // Grove
  'mild_dry':    1,   // Plains
  'mild_wet':    4,   // Forest
  'mild_mid':    177, // Meadow
  'warm_dry':    2,   // Desert
  'warm_wet':    21,  // Jungle
  'warm_mid':    35,  // Savanna
  'hot_dry':     37,  // Badlands
  'hot_wet':     184, // Mangrove Swamp
  'hot_mid':     185, // Cherry Grove
};

function getTemperatureCategory(temp: number): string {
  if (temp < -0.3) return 'cold';
  if (temp < 0.3) return 'mild';
  if (temp < 0.7) return 'warm';
  return 'hot';
}

function getRainfallCategory(rain: number): string {
  if (rain < -0.2) return 'dry';
  if (rain > 0.2) return 'wet';
  return 'mid';
}

export class BiomeGenerator {
  private tempNoise: PerlinNoise;
  private rainNoise: PerlinNoise;
  private detailNoise: PerlinNoise;
  private riverNoise: PerlinNoise;
  private oceanNoise: PerlinNoise;
  private worldGenVersion: number;
  private edition: 'java' | 'bedrock';

  constructor(seed: bigint, worldGenVersion: number, edition: 'java' | 'bedrock' = 'java') {
    this.worldGenVersion = worldGenVersion;
    this.edition = edition;

    // Initialize noise layers with different seed offsets (matching MC algorithm)
    this.tempNoise = new PerlinNoise(seed);
    this.rainNoise = new PerlinNoise(seed + 1n);
    this.detailNoise = new PerlinNoise(seed + 2n);
    this.riverNoise = new PerlinNoise(seed + 3n);
    this.oceanNoise = new PerlinNoise(seed + 4n);
  }

  /**
   * Get biome at block coordinates
   */
  getBiomeAt(blockX: number, blockZ: number): number {
    // Scale factor changes with version
    const scale = this.edition === 'bedrock' ? 200 : 256;
    const oceanScale = scale * 1.5;

    // Ocean layer
    const oceanValue = this.oceanNoise.octaveNoise(blockX, blockZ, 4, oceanScale);

    if (oceanValue < -0.3) {
      // Deep ocean
      const coldness = this.tempNoise.octaveNoise(blockX, blockZ, 2, scale);
      if (coldness < -0.5) return 50; // Deep Frozen Ocean
      if (coldness < -0.2) return 49; // Deep Cold Ocean
      if (coldness > 0.5) return 47;  // Deep Warm Ocean
      if (coldness > 0.2) return 48;  // Deep Lukewarm Ocean
      return 24; // Deep Ocean
    }

    if (oceanValue < -0.05) {
      // Regular ocean
      const coldness = this.tempNoise.octaveNoise(blockX, blockZ, 2, scale);
      if (coldness < -0.5) return 10; // Frozen Ocean
      if (coldness < -0.2) return 46; // Cold Ocean
      if (coldness > 0.5) return 44;  // Warm Ocean
      if (coldness > 0.2) return 45;  // Lukewarm Ocean
      return 0; // Ocean
    }

    // River layer
    const riverValue = this.riverNoise.octaveNoise(blockX, blockZ, 6, scale * 0.5);
    if (Math.abs(riverValue) < 0.04) {
      const temp = this.tempNoise.octaveNoise(blockX, blockZ, 2, scale);
      if (temp < -0.4) return 11; // Frozen River
      return 7; // River
    }

    // Beach
    if (oceanValue < 0.05) {
      const temp = this.tempNoise.octaveNoise(blockX, blockZ, 2, scale);
      if (temp < -0.4) return 26; // Snowy Beach
      return 16; // Beach
    }

    // Land biomes
    const temperature = this.tempNoise.octaveNoise(blockX, blockZ, 6, scale);
    const rainfall = this.rainNoise.octaveNoise(blockX, blockZ, 6, scale);
    const detail = this.detailNoise.octaveNoise(blockX, blockZ, 4, scale * 0.3);

    // Mountain detection
    const mountainValue = this.detailNoise.octaveNoise(blockX, blockZ, 6, scale * 0.8);
    if (mountainValue > 0.55) {
      if (this.worldGenVersion >= 18) {
        // 1.18+ mountain biomes
        if (temperature < -0.3) return 180; // Frozen Peaks
        if (temperature < 0.0) return 181;  // Jagged Peaks
        if (temperature > 0.5) return 182;  // Stony Peaks
        return 179; // Snowy Slopes
      }
      if (detail > 0.2) return 34; // Wooded Mountains
      return 3; // Mountains
    }

    // Mushroom Island (rare)
    if (oceanValue < 0.12 && detail > 0.6) {
      return 14; // Mushroom Fields
    }

    // Standard biome selection
    const tempCat = getTemperatureCategory(temperature);
    const rainCat = getRainfallCategory(rainfall);
    const key = `${tempCat}_${rainCat}`;

    const table = this.worldGenVersion >= 18 ? BIOME_TABLE_MODERN : BIOME_TABLE_LEGACY;
    let biomeId = table[key] || 1;

    // Add variation with detail noise
    if (detail > 0.4) {
      // Hills variants
      if (biomeId === 1 && detail > 0.6) biomeId = 129; // Sunflower Plains (use plains)
      if (biomeId === 4) biomeId = 18;  // Wooded Hills
      if (biomeId === 5) biomeId = 19;  // Taiga Hills
      if (biomeId === 2) biomeId = 17;  // Desert Hills
      if (biomeId === 27) biomeId = 28; // Birch Forest Hills
      if (biomeId === 21) biomeId = 22; // Jungle Hills
      if (biomeId === 32) biomeId = 33; // Giant Tree Taiga Hills
    }

    // Fix fallback for invalid biome ids
    if (biomeId === 129) biomeId = 1;

    return biomeId;
  }

  /**
   * Get biome for a chunk (4x4 biome resolution in modern versions)
   */
  getBiomeForChunk(chunkX: number, chunkZ: number): number {
    return this.getBiomeAt(chunkX * 16 + 8, chunkZ * 16 + 8);
  }

  /**
   * Find spawn point by searching outward from 0,0 for a valid spawn biome.
   * Minecraft searches in a spiral for Plains, Forest, Taiga, etc.
   */
  findSpawnPoint(): { x: number; z: number } {
    const SPAWN_BIOMES = [1, 4, 5, 27, 29, 21, 35, 177, 178, 185]; // Plains, Forest, Taiga, Birch, Dark Forest, Jungle, Savanna, Meadow, Grove, Cherry
    // Spiral search from 0,0
    for (let radius = 0; radius <= 1024; radius += 16) {
      for (let x = -radius; x <= radius; x += 16) {
        for (const z of [-radius, radius]) {
          const biome = this.getBiomeAt(x, z);
          if (SPAWN_BIOMES.includes(biome)) return { x, z };
        }
      }
      for (let z = -radius + 16; z < radius; z += 16) {
        for (const x of [-radius, radius]) {
          const biome = this.getBiomeAt(x, z);
          if (SPAWN_BIOMES.includes(biome)) return { x, z };
        }
      }
    }
    return { x: 0, z: 0 };
  }
}

// ===== Seed utilities =====
export function stringToSeed(input: string): bigint {
  // If it's a number, use it directly
  const num = parseInt(input, 10);
  if (!isNaN(num) && String(num) === input.trim()) {
    return BigInt(num);
  }

  // Otherwise hash the string (matching Java's String.hashCode())
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return BigInt(hash);
}

export function randomSeed(): bigint {
  const high = BigInt(Math.floor(Math.random() * 0x7FFFFFFF));
  const low = BigInt(Math.floor(Math.random() * 0x7FFFFFFF));
  return (high << 32n) | low;
}
