export interface BiomeInfo {
  id: number;
  name: string;
  color: string;
  temperature: number;
  rainfall: number;
  category: string;
}

// Minecraft biome colors - matching the game's biome map colors
export const BIOMES: Record<number, BiomeInfo> = {
  0:  { id: 0,  name: 'Ocean',                color: '#000070', temperature: 0.5,  rainfall: 0.5,  category: 'ocean' },
  1:  { id: 1,  name: 'Plains',               color: '#8DB360', temperature: 0.8,  rainfall: 0.4,  category: 'plains' },
  2:  { id: 2,  name: 'Desert',               color: '#FA9418', temperature: 2.0,  rainfall: 0.0,  category: 'desert' },
  3:  { id: 3,  name: 'Mountains',            color: '#606060', temperature: 0.2,  rainfall: 0.3,  category: 'extreme_hills' },
  4:  { id: 4,  name: 'Forest',               color: '#056621', temperature: 0.7,  rainfall: 0.8,  category: 'forest' },
  5:  { id: 5,  name: 'Taiga',                color: '#0B6659', temperature: 0.25, rainfall: 0.8,  category: 'taiga' },
  6:  { id: 6,  name: 'Swamp',                color: '#07F9B2', temperature: 0.8,  rainfall: 0.9,  category: 'swamp' },
  7:  { id: 7,  name: 'River',                color: '#0000FF', temperature: 0.5,  rainfall: 0.5,  category: 'river' },
  8:  { id: 8,  name: 'Nether Wastes',        color: '#BF3B3B', temperature: 2.0,  rainfall: 0.0,  category: 'nether' },
  9:  { id: 9,  name: 'The End',              color: '#8080FF', temperature: 0.5,  rainfall: 0.5,  category: 'the_end' },
  10: { id: 10, name: 'Frozen Ocean',          color: '#7070D6', temperature: 0.0,  rainfall: 0.5,  category: 'ocean' },
  11: { id: 11, name: 'Frozen River',          color: '#A0A0FF', temperature: 0.0,  rainfall: 0.5,  category: 'river' },
  12: { id: 12, name: 'Snowy Plains',          color: '#FFFFFF', temperature: 0.0,  rainfall: 0.5,  category: 'icy' },
  13: { id: 13, name: 'Snowy Mountains',       color: '#A0A0A0', temperature: 0.0,  rainfall: 0.5,  category: 'icy' },
  14: { id: 14, name: 'Mushroom Fields',       color: '#FF00FF', temperature: 0.9,  rainfall: 1.0,  category: 'mushroom' },
  15: { id: 15, name: 'Mushroom Field Shore',  color: '#A000FF', temperature: 0.9,  rainfall: 1.0,  category: 'mushroom' },
  16: { id: 16, name: 'Beach',                color: '#FADE55', temperature: 0.8,  rainfall: 0.4,  category: 'beach' },
  17: { id: 17, name: 'Desert Hills',          color: '#D25F12', temperature: 2.0,  rainfall: 0.0,  category: 'desert' },
  18: { id: 18, name: 'Wooded Hills',          color: '#22551C', temperature: 0.7,  rainfall: 0.8,  category: 'forest' },
  19: { id: 19, name: 'Taiga Hills',           color: '#163933', temperature: 0.25, rainfall: 0.8,  category: 'taiga' },
  20: { id: 20, name: 'Mountain Edge',         color: '#72789A', temperature: 0.2,  rainfall: 0.3,  category: 'extreme_hills' },
  21: { id: 21, name: 'Jungle',               color: '#537B09', temperature: 0.95, rainfall: 0.9,  category: 'jungle' },
  22: { id: 22, name: 'Jungle Hills',          color: '#2C4205', temperature: 0.95, rainfall: 0.9,  category: 'jungle' },
  23: { id: 23, name: 'Jungle Edge',           color: '#628B17', temperature: 0.95, rainfall: 0.8,  category: 'jungle' },
  24: { id: 24, name: 'Deep Ocean',            color: '#000030', temperature: 0.5,  rainfall: 0.5,  category: 'ocean' },
  25: { id: 25, name: 'Stone Shore',           color: '#A2A284', temperature: 0.2,  rainfall: 0.3,  category: 'none' },
  26: { id: 26, name: 'Snowy Beach',           color: '#FAF0C0', temperature: 0.05, rainfall: 0.3,  category: 'beach' },
  27: { id: 27, name: 'Birch Forest',          color: '#307444', temperature: 0.6,  rainfall: 0.6,  category: 'forest' },
  28: { id: 28, name: 'Birch Forest Hills',    color: '#1F5F32', temperature: 0.6,  rainfall: 0.6,  category: 'forest' },
  29: { id: 29, name: 'Dark Forest',           color: '#40511A', temperature: 0.7,  rainfall: 0.8,  category: 'forest' },
  30: { id: 30, name: 'Snowy Taiga',           color: '#31554A', temperature: -0.5, rainfall: 0.4,  category: 'taiga' },
  31: { id: 31, name: 'Snowy Taiga Hills',     color: '#243F36', temperature: -0.5, rainfall: 0.4,  category: 'taiga' },
  32: { id: 32, name: 'Giant Tree Taiga',      color: '#596651', temperature: 0.3,  rainfall: 0.8,  category: 'taiga' },
  33: { id: 33, name: 'Giant Tree Taiga Hills', color: '#454F3E', temperature: 0.3, rainfall: 0.8,  category: 'taiga' },
  34: { id: 34, name: 'Wooded Mountains',      color: '#507050', temperature: 0.2,  rainfall: 0.3,  category: 'extreme_hills' },
  35: { id: 35, name: 'Savanna',               color: '#BDB25F', temperature: 1.2,  rainfall: 0.0,  category: 'savanna' },
  36: { id: 36, name: 'Savanna Plateau',       color: '#A79D64', temperature: 1.0,  rainfall: 0.0,  category: 'savanna' },
  37: { id: 37, name: 'Badlands',              color: '#D94515', temperature: 2.0,  rainfall: 0.0,  category: 'mesa' },
  38: { id: 38, name: 'Wooded Badlands',       color: '#B09765', temperature: 2.0,  rainfall: 0.0,  category: 'mesa' },
  39: { id: 39, name: 'Badlands Plateau',      color: '#CA8C65', temperature: 2.0,  rainfall: 0.0,  category: 'mesa' },
  // 1.13+ Ocean variants
  44: { id: 44, name: 'Warm Ocean',            color: '#0000AC', temperature: 0.5,  rainfall: 0.5,  category: 'ocean' },
  45: { id: 45, name: 'Lukewarm Ocean',        color: '#000090', temperature: 0.5,  rainfall: 0.5,  category: 'ocean' },
  46: { id: 46, name: 'Cold Ocean',            color: '#202070', temperature: 0.5,  rainfall: 0.5,  category: 'ocean' },
  47: { id: 47, name: 'Deep Warm Ocean',       color: '#000050', temperature: 0.5,  rainfall: 0.5,  category: 'ocean' },
  48: { id: 48, name: 'Deep Lukewarm Ocean',   color: '#000040', temperature: 0.5,  rainfall: 0.5,  category: 'ocean' },
  49: { id: 49, name: 'Deep Cold Ocean',       color: '#202038', temperature: 0.5,  rainfall: 0.5,  category: 'ocean' },
  50: { id: 50, name: 'Deep Frozen Ocean',     color: '#404090', temperature: 0.5,  rainfall: 0.5,  category: 'ocean' },
  // 1.16 Nether biomes
  170: { id: 170, name: 'Soul Sand Valley',     color: '#5E3830', temperature: 2.0,  rainfall: 0.0,  category: 'nether' },
  171: { id: 171, name: 'Crimson Forest',       color: '#DD0808', temperature: 2.0,  rainfall: 0.0,  category: 'nether' },
  172: { id: 172, name: 'Warped Forest',        color: '#49907B', temperature: 2.0,  rainfall: 0.0,  category: 'nether' },
  173: { id: 173, name: 'Basalt Deltas',        color: '#403636', temperature: 2.0,  rainfall: 0.0,  category: 'nether' },
  // 1.17+ new biomes
  174: { id: 174, name: 'Dripstone Caves',      color: '#836644', temperature: 0.8,  rainfall: 0.4,  category: 'cave' },
  175: { id: 175, name: 'Lush Caves',           color: '#4A7A32', temperature: 0.5,  rainfall: 0.5,  category: 'cave' },
  // 1.18+ new biomes
  177: { id: 177, name: 'Meadow',               color: '#75AC42', temperature: 0.5,  rainfall: 0.8,  category: 'mountain' },
  178: { id: 178, name: 'Grove',                color: '#5B7352', temperature: -0.2, rainfall: 0.8,  category: 'mountain' },
  179: { id: 179, name: 'Snowy Slopes',         color: '#C4C4C4', temperature: -0.3, rainfall: 0.9,  category: 'mountain' },
  180: { id: 180, name: 'Frozen Peaks',         color: '#BCBCBC', temperature: -0.7, rainfall: 0.9,  category: 'mountain' },
  181: { id: 181, name: 'Jagged Peaks',         color: '#969696', temperature: -0.7, rainfall: 0.9,  category: 'mountain' },
  182: { id: 182, name: 'Stony Peaks',          color: '#7A7A7A', temperature: 1.0,  rainfall: 0.3,  category: 'mountain' },
  // 1.19+ new biomes
  183: { id: 183, name: 'Deep Dark',            color: '#0A2130', temperature: 0.8,  rainfall: 0.4,  category: 'cave' },
  184: { id: 184, name: 'Mangrove Swamp',       color: '#67A042', temperature: 0.8,  rainfall: 0.9,  category: 'swamp' },
  // 1.20+
  185: { id: 185, name: 'Cherry Grove',         color: '#EEA4BE', temperature: 0.5,  rainfall: 0.8,  category: 'mountain' },
};

export function getBiome(id: number): BiomeInfo {
  return BIOMES[id] || { id, name: `Unknown (${id})`, color: '#808080', temperature: 0.5, rainfall: 0.5, category: 'none' };
}

export function getBiomeColor(id: number): string {
  return BIOMES[id]?.color || '#808080';
}
