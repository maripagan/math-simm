import { acRlc } from './experiments/ac-rlc';
import { coulombElectrostatics } from './experiments/coulomb-electrostatics';
import { dcRc } from './experiments/dc-rc';
import { dopplerWave } from './experiments/doppler-wave';
import { energyConservation } from './experiments/energy-conservation';
import { faradayInduction } from './experiments/faraday-induction';
import { hydrostatics } from './experiments/hydrostatics';
import { idealGas } from './experiments/ideal-gas';
import { inclinedPlane } from './experiments/inclined-plane';
import { kepler } from './experiments/kepler';
import { lorentzMagnetism } from './experiments/lorentz-magnetism';
import { mruv } from './experiments/mruv';
import { photoelectric } from './experiments/photoelectric';
import { projectile } from './experiments/projectile';
import { radioactiveDecay } from './experiments/radioactive-decay';
import { relativityLorentz } from './experiments/relativity-lorentz';
import { rotational } from './experiments/rotational';
import { snellOptics } from './experiments/snell-optics';
import { thinLens } from './experiments/thin-lens';
import { PhysicsExperiment } from './experiments/defineExperiment';

export type { PhysicsExperiment } from './experiments/defineExperiment';
import { PhysicsExperimentId } from './types';

export type { PhysicsExperimentId } from './types';

export const EXPERIMENTS_BY_ID: Record<PhysicsExperimentId, PhysicsExperiment> = {
  mruv,
  projectile,
  rotational,
  'inclined-plane': inclinedPlane,
  'energy-conservation': energyConservation,
  hydrostatics,
  kepler,
  'ideal-gas': idealGas,
  'snell-optics': snellOptics,
  'thin-lens': thinLens,
  'doppler-wave': dopplerWave,
  'coulomb-electrostatics': coulombElectrostatics,
  'dc-rc': dcRc,
  'ac-rlc': acRlc,
  'lorentz-magnetism': lorentzMagnetism,
  'faraday-induction': faradayInduction,
  photoelectric,
  'radioactive-decay': radioactiveDecay,
  'relativity-lorentz': relativityLorentz,
};

export const PHYSICS_EXPERIMENTS: PhysicsExperiment[] = Object.values(EXPERIMENTS_BY_ID);
