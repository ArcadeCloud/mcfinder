export interface StructureType {
  id: string;
  name: string;
  icon: string;       // Short letter/symbol for map marker
  color: string;      // Marker background color
  spacing: number;
  separation: number;
  salt: number;
  validBiomes?: number[];
  minVersion?: number;
  editions: ('java' | 'bedrock')[];
  dimension: 'overworld' | 'nether' | 'end';
}

export const STRUCTURES: StructureType[] = [
  // ===== OVERWORLD =====
  {
    id: 'village', name: 'Village', icon: 'V', color: '#8B4513',
    spacing: 34, separation: 8, salt: 10387312,
    validBiomes: [1, 2, 5, 35, 30, 177],
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'desert_temple', name: 'Desert Temple', icon: 'DT', color: '#D2691E',
    spacing: 32, separation: 8, salt: 14357617,
    validBiomes: [2, 17],
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'jungle_temple', name: 'Jungle Temple', icon: 'JT', color: '#556B2F',
    spacing: 32, separation: 8, salt: 14357619,
    validBiomes: [21, 22, 23],
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'witch_hut', name: 'Witch Hut', icon: 'W', color: '#6A0DAD',
    spacing: 32, separation: 8, salt: 14357620,
    validBiomes: [6],
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'igloo', name: 'Igloo', icon: 'Ig', color: '#B0E0E6',
    spacing: 32, separation: 8, salt: 14357618,
    validBiomes: [12, 30],
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'ocean_monument', name: 'Ocean Monument', icon: 'M', color: '#00CED1',
    spacing: 32, separation: 5, salt: 10387313,
    validBiomes: [24, 47, 48, 49, 50],
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'woodland_mansion', name: 'Woodland Mansion', icon: 'WM', color: '#8B0000',
    spacing: 80, separation: 20, salt: 10387319,
    validBiomes: [29],
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'ocean_ruin', name: 'Ocean Ruin', icon: 'OR', color: '#2F4F4F',
    spacing: 20, separation: 8, salt: 14357621,
    validBiomes: [0, 10, 24, 44, 45, 46, 47, 48, 49, 50],
    minVersion: 13,
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'shipwreck', name: 'Shipwreck', icon: 'S', color: '#8B6914',
    spacing: 24, separation: 4, salt: 165745295,
    validBiomes: [0, 10, 16, 24, 26, 44, 45, 46, 47, 48, 49, 50],
    minVersion: 13,
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'buried_treasure', name: 'Buried Treasure', icon: 'BT', color: '#FFD700',
    spacing: 1, separation: 0, salt: 10387320,
    validBiomes: [16, 26],
    minVersion: 13,
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'pillager_outpost', name: 'Pillager Outpost', icon: 'P', color: '#696969',
    spacing: 32, separation: 8, salt: 165745296,
    validBiomes: [1, 2, 5, 35, 30, 12],
    minVersion: 14,
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'ruined_portal_ow', name: 'Ruined Portal', icon: 'RP', color: '#9400D3',
    spacing: 40, separation: 15, salt: 34222645,
    minVersion: 16,
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'stronghold', name: 'Stronghold', icon: 'SH', color: '#555555',
    spacing: 0, separation: 0, salt: 0,
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'mineshaft', name: 'Mineshaft', icon: 'MS', color: '#8B6914',
    spacing: 1, separation: 0, salt: 0,
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'ancient_city', name: 'Ancient City', icon: 'AC', color: '#0A2130',
    spacing: 24, separation: 8, salt: 20083232,
    validBiomes: [183],
    minVersion: 19,
    editions: ['java'], dimension: 'overworld',
  },
  {
    id: 'trail_ruins', name: 'Trail Ruins', icon: 'TR', color: '#C19A6B',
    spacing: 34, separation: 8, salt: 83469867,
    validBiomes: [5, 30, 32, 4, 27, 21],
    minVersion: 20,
    editions: ['java'], dimension: 'overworld',
  },
  {
    id: 'trial_chambers', name: 'Trial Chambers', icon: 'TC', color: '#B87333',
    spacing: 34, separation: 12, salt: 94251327,
    minVersion: 21,
    editions: ['java'], dimension: 'overworld',
  },
  {
    id: 'geode', name: 'Amethyst Geode', icon: 'G', color: '#9966CC',
    spacing: 24, separation: 6, salt: 20000001,
    minVersion: 17,
    editions: ['java'], dimension: 'overworld',
  },
  {
    id: 'desert_well', name: 'Desert Well', icon: 'DW', color: '#F4A460',
    spacing: 32, separation: 8, salt: 14357622,
    validBiomes: [2, 17],
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },
  {
    id: 'slime_chunk', name: 'Slime Chunk', icon: 'SC', color: '#32CD32',
    spacing: 1, separation: 0, salt: 0,
    editions: ['java', 'bedrock'], dimension: 'overworld',
  },

  // ===== NETHER =====
  {
    id: 'fortress', name: 'Nether Fortress', icon: 'NF', color: '#8B0000',
    spacing: 30, separation: 4, salt: 30084232,
    editions: ['java', 'bedrock'], dimension: 'nether',
  },
  {
    id: 'bastion_remnant', name: 'Bastion Remnant', icon: 'B', color: '#1C1C1C',
    spacing: 27, separation: 4, salt: 30084232,
    minVersion: 16,
    editions: ['java'], dimension: 'nether',
  },
  {
    id: 'ruined_portal_nether', name: 'Ruined Portal', icon: 'RP', color: '#9400D3',
    spacing: 25, separation: 10, salt: 34222645,
    minVersion: 16,
    editions: ['java', 'bedrock'], dimension: 'nether',
  },

  // ===== END =====
  {
    id: 'end_city', name: 'End City', icon: 'EC', color: '#C8A2C8',
    spacing: 20, separation: 11, salt: 10387313,
    editions: ['java', 'bedrock'], dimension: 'end',
  },
  {
    id: 'end_gateway', name: 'End Gateway', icon: 'EG', color: '#000033',
    spacing: 0, separation: 0, salt: 0,
    editions: ['java', 'bedrock'], dimension: 'end',
  },
];

export function getStructuresForVersion(
  worldGenVersion: number,
  edition: 'java' | 'bedrock',
  dimension: string = 'overworld'
): StructureType[] {
  return STRUCTURES.filter(s => {
    if (!s.editions.includes(edition)) return false;
    if (s.minVersion && worldGenVersion < s.minVersion) return false;
    if (s.dimension !== dimension) return false;
    return true;
  });
}
