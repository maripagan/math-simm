import { YEAR1_EXPERIMENTS } from './curriculum/year1';
import { YEAR2_EXPERIMENTS } from './curriculum/year2';
import { YEAR3_EXPERIMENTS } from './curriculum/year3';
import { PhysicsExperiment } from './types';

export type { PhysicsExperiment, PhysicsExperimentId } from './types';

export const PHYSICS_EXPERIMENTS: PhysicsExperiment[] = [
  ...YEAR1_EXPERIMENTS,
  ...YEAR2_EXPERIMENTS,
  ...YEAR3_EXPERIMENTS,
];
