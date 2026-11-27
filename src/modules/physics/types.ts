import { Viewport } from '../../types';

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

export type PhysicsExperimentId =
  // 1º Ano
  | 'mruv'
  | 'projectile'
  | 'rotational'
  | 'inclined-plane'
  | 'energy-conservation'
  | 'hydrostatics'
  | 'kepler'
  // 2º Ano
  | 'ideal-gas'
  | 'snell-optics'
  | 'thin-lens'
  | 'doppler-wave'
  // 3º Ano
  | 'coulomb-electrostatics'
  | 'dc-rc'
  | 'ac-rlc'
  | 'lorentz-magnetism'
  | 'faraday-induction'
  | 'photoelectric'
  | 'radioactive-decay'
  | 'relativity-lorentz';

export type PhysicsVisualCardType =
  | 'dc-rc'
  | 'ac-rlc'
  | 'energy'
  | 'hydrostatics'
  | 'carnot';

export interface VariableGlossaryItem {
  symbol: string;
  name: string;
  unit: string;
  choices?: Array<{ value: number; label: string }>;
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

export interface PhysicsExperiment {
  id: PhysicsExperimentId;
  year: YearLevel;
  group: PhysicsGroup;
  title: string;
  shortTitle: string;
  summary: string;
  keyFormulaTex: string;
  legendItems: Array<{ label: string; color: string }>;
  formulas: Array<{ raw: string; color: string }>;
  parameters: Record<
    string,
    { value: number; min: number; max: number; step: number }
  >;
  viewport: Viewport;
  visualCard?: PhysicsVisualCardType;
  theory: ExperimentTheory;
}
