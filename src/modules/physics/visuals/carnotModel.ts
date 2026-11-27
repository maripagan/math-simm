export type CarnotStageId =
  | 'iso-expand'
  | 'adia-expand'
  | 'iso-compress'
  | 'adia-compress';

export interface CarnotState {
  stage: CarnotStageId;
  stageLabel: string;
  V: number;
  P: number;
  T: number;
  V1: number;
  V2: number;
  V3: number;
  V4: number;
  vMin: number;
  vMax: number;
  heatMode: 'hot' | 'cold' | 'insulated';
  etaPct: number;
}

const GAMMA = 5 / 3; // Monoatomic ideal gas (γ - 1 = 2/3)

/**
 * Evaluates the exact analytical 4-stage Carnot cycle at time t (8s per full cycle).
 */
export function evaluateCarnotState(
  n: number,
  TQ: number,
  TF: number,
  t: number,
): CarnotState {
  const safeTQ = Math.max(150, TQ);
  const safeTF = Math.min(safeTQ - 10, Math.max(80, TF));
  const Rk = (n * 8.314) / 1000; // kPa·m³ / K

  // Anchor volumes of the 4 vertices of the Carnot cycle
  const V1 = 1.4;
  const V2 = 3.0;
  const adiaFactor = Math.pow(safeTQ / safeTF, 1 / (GAMMA - 1));
  const V3 = V2 * adiaFactor;
  const V4 = V1 * (V3 / V2);

  const cycleT = 8;
  const phase = (((t % cycleT) + cycleT) % cycleT) / cycleT; // 0..1

  let stage: CarnotStageId;
  let stageLabel: string;
  let heatMode: 'hot' | 'cold' | 'insulated';
  let V: number;
  let T: number;

  if (phase < 0.25) {
    const u = phase / 0.25;
    stage = 'iso-expand';
    stageLabel = '1. Expansão Isotérmica (TQ)';
    heatMode = 'hot';
    V = V1 + (V2 - V1) * u;
    T = safeTQ;
  } else if (phase < 0.5) {
    const u = (phase - 0.25) / 0.25;
    stage = 'adia-expand';
    stageLabel = '2. Expansão Adiabática (Q = 0)';
    heatMode = 'insulated';
    V = V2 + (V3 - V2) * u;
    T = safeTQ * Math.pow(V2 / V, GAMMA - 1);
    T = Math.max(safeTF, Math.min(safeTQ, T));
  } else if (phase < 0.75) {
    const u = (phase - 0.5) / 0.25;
    stage = 'iso-compress';
    stageLabel = '3. Compressão Isotérmica (TF)';
    heatMode = 'cold';
    V = V3 + (V4 - V3) * u;
    T = safeTF;
  } else {
    const u = (phase - 0.75) / 0.25;
    stage = 'adia-compress';
    stageLabel = '4. Compressão Adiabática (Q = 0)';
    heatMode = 'insulated';
    V = V4 + (V1 - V4) * u;
    T = safeTF * Math.pow(V4 / V, GAMMA - 1);
    T = Math.max(safeTF, Math.min(safeTQ, T));
  }

  const P = (Rk * T) / V;
  const etaPct = Math.max(0, (1 - safeTF / safeTQ) * 100);

  return {
    stage,
    stageLabel,
    V,
    P,
    T,
    V1,
    V2,
    V3,
    V4,
    vMin: V1,
    vMax: V3,
    heatMode,
    etaPct,
  };
}
