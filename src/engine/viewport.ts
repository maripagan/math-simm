import { Viewport } from '../types';

export function worldToScreenX(wx: number, vp: Viewport, width: number): number {
  return width / 2 + (wx - vp.centerX) * vp.scale;
}

export function worldToScreenY(wy: number, vp: Viewport, height: number): number {
  return height / 2 - (wy - vp.centerY) * vp.scale;
}

export function screenToWorldX(sx: number, vp: Viewport, width: number): number {
  return vp.centerX + (sx - width / 2) / vp.scale;
}

export function screenToWorldY(sy: number, vp: Viewport, height: number): number {
  return vp.centerY - (sy - height / 2) / vp.scale;
}

/**
 * Picks a clean 1 / 2 / 5 * 10^n step size so major grid lines stay ~75-140px apart.
 */
export function computeGridStep(scale: number, targetPx = 90): number {
  const rawStep = targetPx / scale;
  const pow10 = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / pow10;
  if (norm < 1.5) return 1 * pow10;
  if (norm < 3.5) return 2 * pow10;
  if (norm < 7.5) return 5 * pow10;
  return 10 * pow10;
}

export function formatAxisNumber(val: number): string {
  if (Math.abs(val) < 1e-10) return '0';
  if (Math.abs(val) >= 10000 || (Math.abs(val) > 0 && Math.abs(val) < 0.001)) {
    return val.toExponential(1);
  }
  return Number(val.toPrecision(6)).toString();
}
