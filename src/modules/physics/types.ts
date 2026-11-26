export type YearLevel = 1 | 2 | 3;

export type PhysicsGroup =
  | 'Cinemática'
  | 'Dinâmica'
  | 'Hidrostática'
  | 'Gravitação'
  | 'Termologia'
  | 'Óptica'
  | 'Ondulatória'
  | 'Eletrostática'
  | 'Circuitos DC'
  | 'Circuitos AC'
  | 'Magnetismo'
  | 'Física Moderna';

export const PHYSICS_EXPERIMENT_IDS = [
  'mruv',
  'projectile',
  'rotational',
  'inclined-plane',
  'energy-conservation',
  'hydrostatics',
  'kepler',
  'ideal-gas',
  'snell-optics',
  'thin-lens',
  'doppler-wave',
  'coulomb-electrostatics',
  'dc-rc',
  'ac-rlc',
  'lorentz-magnetism',
  'faraday-induction',
  'photoelectric',
  'radioactive-decay',
  'relativity-lorentz',
] as const;

export type PhysicsExperimentId = (typeof PHYSICS_EXPERIMENT_IDS)[number];

export interface VariableGlossaryItem {
  symbol: string;
  name: string;
  unit: string;
}

export interface GuidedScenario {
  id: string;
  label: string;
  description: string;
  params: Record<string, number>;
  resetTime?: boolean;
}

export interface ExperimentTheory {
  intuition: string[];
  equations: Array<{ latex: string; note: string }>;
  variables: VariableGlossaryItem[];
  observations: string[];
  scenarios: GuidedScenario[];
  commonPitfall: string;
}
