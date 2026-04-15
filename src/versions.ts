export interface MCVersion {
  id: string;
  name: string;
  edition: 'java' | 'bedrock';
  worldGenVersion: number; // internal generation algorithm version
}

export const JAVA_VERSIONS: MCVersion[] = [
  // 1.21.x - Trail & Tales Update Part 2
  { id: 'j1.21', name: '1.21.x', edition: 'java', worldGenVersion: 21 },
  // 1.20.x - Trail & Tales
  { id: 'j1.20', name: '1.20.x', edition: 'java', worldGenVersion: 20 },
  // 1.19.x - The Wild Update
  { id: 'j1.19', name: '1.19.x', edition: 'java', worldGenVersion: 19 },
  // 1.18.x - Caves & Cliffs Part 2 (MAJOR world gen overhaul)
  { id: 'j1.18', name: '1.18.x', edition: 'java', worldGenVersion: 18 },
  // 1.17.x - Caves & Cliffs Part 1
  { id: 'j1.17', name: '1.17.x', edition: 'java', worldGenVersion: 17 },
  // 1.16.x - Nether Update
  { id: 'j1.16', name: '1.16.x', edition: 'java', worldGenVersion: 16 },
  // 1.15.x - Buzzy Bees
  { id: 'j1.15', name: '1.15.x', edition: 'java', worldGenVersion: 15 },
  // 1.14.x - Village & Pillage
  { id: 'j1.14', name: '1.14.x', edition: 'java', worldGenVersion: 14 },
  // 1.13.x - Update Aquatic
  { id: 'j1.13', name: '1.13.x', edition: 'java', worldGenVersion: 13 },
  // 1.12.x and below - Legacy generation
  { id: 'j1.12', name: '1.12.x', edition: 'java', worldGenVersion: 12 },
  { id: 'j1.11', name: '1.11.x', edition: 'java', worldGenVersion: 11 },
  { id: 'j1.10', name: '1.10.x', edition: 'java', worldGenVersion: 10 },
  { id: 'j1.9', name: '1.9.x', edition: 'java', worldGenVersion: 9 },
  { id: 'j1.8', name: '1.8.x', edition: 'java', worldGenVersion: 8 },
  { id: 'j1.7', name: '1.7.x', edition: 'java', worldGenVersion: 7 },
  { id: 'j1.6', name: '1.6.x', edition: 'java', worldGenVersion: 6 },
  { id: 'j1.5', name: '1.5.x', edition: 'java', worldGenVersion: 5 },
  { id: 'j1.4', name: '1.4.x', edition: 'java', worldGenVersion: 4 },
  { id: 'j1.3', name: '1.3.x', edition: 'java', worldGenVersion: 3 },
  { id: 'j1.2', name: '1.2.x', edition: 'java', worldGenVersion: 2 },
  { id: 'j1.1', name: '1.1', edition: 'java', worldGenVersion: 1 },
  { id: 'j1.0', name: '1.0', edition: 'java', worldGenVersion: 0 },
];

export const BEDROCK_VERSIONS: MCVersion[] = [
  { id: 'b1.21', name: '1.21.x', edition: 'bedrock', worldGenVersion: 21 },
  { id: 'b1.20', name: '1.20.x', edition: 'bedrock', worldGenVersion: 20 },
  { id: 'b1.19', name: '1.19.x', edition: 'bedrock', worldGenVersion: 19 },
  { id: 'b1.18', name: '1.18.x', edition: 'bedrock', worldGenVersion: 18 },
  { id: 'b1.17', name: '1.17.x', edition: 'bedrock', worldGenVersion: 17 },
  { id: 'b1.16', name: '1.16.x', edition: 'bedrock', worldGenVersion: 16 },
  { id: 'b1.14', name: '1.14.x', edition: 'bedrock', worldGenVersion: 14 },
  { id: 'b1.12', name: '1.12.x', edition: 'bedrock', worldGenVersion: 12 },
  { id: 'b1.10', name: '1.10.x', edition: 'bedrock', worldGenVersion: 10 },
  { id: 'b1.8', name: '1.8.x', edition: 'bedrock', worldGenVersion: 8 },
  { id: 'b1.6', name: '1.6.x', edition: 'bedrock', worldGenVersion: 6 },
  { id: 'b1.4', name: '1.4.x', edition: 'bedrock', worldGenVersion: 4 },
  { id: 'b1.2', name: '1.2.x', edition: 'bedrock', worldGenVersion: 2 },
];

export function getVersions(edition: 'java' | 'bedrock'): MCVersion[] {
  return edition === 'java' ? JAVA_VERSIONS : BEDROCK_VERSIONS;
}
