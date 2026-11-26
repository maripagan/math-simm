import { NotablePoint, Viewport } from '../types';
import {
  ActiveCurve,
  AuxDef,
  buildScopeWithDefs,
  findNotablePoints,
} from './evaluator';
import { evaluateCompiled, evaluateComplex, formatComplex } from './parser';
import {
  screenToWorldX,
  screenToWorldY,
  worldToScreenX,
  worldToScreenY,
} from './viewport';

export interface Pt {
  sx: number;
  sy: number;
}

export interface Size {
  width: number;
  height: number;
}

export type PlotItem =
  | { kind: 'trail'; color: string; alpha: number; width: number; segments: Pt[][] }
  | {
      kind: 'particle';
      color: string;
      at: Pt;
      label: string;
      velocity: Pt | null;
    }
  | {
      kind: 'phasor';
      color: string;
      at: Pt;
      label: string;
      projection: boolean;
    }
  | {
      kind: 'vline';
      color: string;
      sx: number;
      strict: boolean;
      fill: 'left' | 'right' | null;
    }
  | {
      kind: 'function';
      color: string;
      strict: boolean;
      fill: 'above' | 'below' | null;
      re: Pt[][];
      im: Pt[][];
    };

export interface SnapTarget extends Pt {
  wx: number;
  wy: number;
  label: string;
  color: string;
}

export interface Plot {
  items: PlotItem[];
  snapTargets: SnapTarget[];
  notable: NotablePoint[];
  origin: Pt;
  hasZ: boolean;
}

const PIXEL_STEP = 1.5;
const TRAIL_STEPS = 260;

export function buildPlot(
  curves: ActiveCurve[],
  defs: AuxDef[],
  scope: Record<string, unknown>,
  viewport: Viewport,
  size: Size,
): Plot {
  const { width, height } = size;
  const toSx = (wx: number) => worldToScreenX(wx, viewport, width);
  const toSy = (wy: number) => worldToScreenY(wy, viewport, height);
  const origin = { sx: toSx(0), sy: toSy(0) };
  const items: PlotItem[] = [];
  const snapTargets: SnapTarget[] = [];

  const anyDefUsesTime = defs.some((d) => d.usesTime);
  const scopeAtTime = (tau: number) =>
    anyDefUsesTime
      ? buildScopeWithDefs({ ...scope, t: tau }, defs)
      : { ...scope, t: tau };
  const tNow = typeof scope.t === 'number' ? scope.t : 0;

  const trail = (
    tStart: number,
    tEnd: number,
    at: (s: Record<string, unknown>) => { x: number; y: number } | null,
  ): Pt[][] => {
    const segments: Pt[][] = [];
    let current: Pt[] = [];
    for (let k = 0; k <= TRAIL_STEPS; k++) {
      const p = at(scopeAtTime(tStart + ((tEnd - tStart) * k) / TRAIL_STEPS));
      if (!p) {
        if (current.length > 0) segments.push(current);
        current = [];
        continue;
      }
      current.push({ sx: toSx(p.x), sy: toSy(p.y) });
    }
    if (current.length > 0) segments.push(current);
    return segments;
  };

  for (const curve of curves) {
    const isStrict = curve.relation === '>' || curve.relation === '<';
    const isGreater = curve.relation === '>' || curve.relation === '>=';
    const isLess = curve.relation === '<' || curve.relation === '<=';
    const isDynamic = curve.usesTime || anyDefUsesTime;

    if (curve.axis === 'parametric' && curve.compiledY) {
      const compiledY = curve.compiledY;
      const pointAt = (s: Record<string, unknown>) => {
        const x = evaluateCompiled(curve.compiled, s);
        const y = evaluateCompiled(compiledY, s);
        return x === null || y === null ? null : { x, y };
      };
      if (isDynamic) {
        const tEnd = Math.max(6, tNow);
        items.push({
          kind: 'trail',
          color: curve.color,
          alpha: 0.7,
          width: 2.2,
          segments: trail(Math.max(0, tEnd - 12), tEnd, pointAt),
        });
      }
      const p = pointAt(scope);
      if (!p) continue;
      const at = { sx: toSx(p.x), sy: toSy(p.y) };
      let velocity: Pt | null = null;
      if (isDynamic) {
        const eps = 0.01;
        const t0 = Math.max(0, tNow - eps);
        const p1 = pointAt(scopeAtTime(tNow + eps));
        const p0 = pointAt(scopeAtTime(t0));
        const dt = tNow + eps - t0;
        if (dt > 0 && p1 && p0) {
          const vx = (p1.x - p0.x) / dt;
          const vy = (p1.y - p0.y) / dt;
          const speed = Math.hypot(vx, vy);
          if (speed > 1e-4) {
            const len = Math.min(48, Math.max(18, speed * 5));
            velocity = {
              sx: at.sx + (vx / speed) * len,
              sy: at.sy + (-vy / speed) * len,
            };
          }
        }
      }
      const prefix = curve.labelName ? `${curve.labelName} ` : '';
      const label = `${prefix}(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`;
      items.push({ kind: 'particle', color: curve.color, at, label, velocity });
      snapTargets.push({ ...at, wx: p.x, wy: p.y, label, color: curve.color });
      continue;
    }

    if (curve.axis === 'z') {
      if (isDynamic) {
        const tEnd = Math.max(2 * Math.PI, tNow);
        items.push({
          kind: 'trail',
          color: curve.color,
          alpha: 0.65,
          width: 2,
          segments: trail(Math.max(0, tEnd - 4 * Math.PI), tEnd, (s) => {
            const val = evaluateComplex(curve.compiled, s);
            return val ? { x: val.re, y: val.im } : null;
          }),
        });
      }
      const current = evaluateComplex(curve.compiled, scope);
      if (!current) continue;
      const at = { sx: toSx(current.re), sy: toSy(current.im) };
      const namePrefix =
        curve.labelName && curve.labelName !== 'z' ? `${curve.labelName}: ` : '';
      items.push({
        kind: 'phasor',
        color: curve.color,
        at,
        label: `${namePrefix}${formatComplex(current.re, current.im)}`,
        projection: !isDynamic,
      });
      const mod = Math.hypot(current.re, current.im);
      const deg = (Math.atan2(current.im, current.re) * 180) / Math.PI;
      snapTargets.push({
        ...at,
        wx: current.re,
        wy: current.im,
        label: `${curve.labelName ?? 'z'} = ${formatComplex(current.re, current.im)}  (|z|=${mod.toFixed(2)}, θ=${deg.toFixed(0)}°)`,
        color: curve.color,
      });
      continue;
    }

    if (curve.axis === 'x') {
      const wx = evaluateCompiled(curve.compiled, scope);
      if (wx === null) continue;
      items.push({
        kind: 'vline',
        color: curve.color,
        sx: toSx(wx),
        strict: isStrict,
        fill: isGreater ? 'right' : isLess ? 'left' : null,
      });
      continue;
    }

    const re: Pt[][] = [];
    const im: Pt[][] = [];
    let curRe: Pt[] = [];
    let curIm: Pt[] = [];
    let prevReSy: number | null = null;
    let prevImSy: number | null = null;
    const flush = () => {
      if (curRe.length > 0) re.push(curRe);
      curRe = [];
    };
    const flushIm = () => {
      if (curIm.length > 0) im.push(curIm);
      curIm = [];
    };
    const jump = height * 0.85;

    for (let sx = 0; sx <= width; sx += PIXEL_STEP) {
      const val = evaluateComplex(curve.compiled, {
        ...scope,
        x: screenToWorldX(sx, viewport, width),
      });
      if (val === null) {
        flush();
        flushIm();
        prevReSy = null;
        prevImSy = null;
        continue;
      }
      const reSy = toSy(val.re);
      if (prevReSy !== null && Math.abs(reSy - prevReSy) > jump) flush();
      curRe.push({ sx, sy: reSy });
      prevReSy = reSy;

      if (Math.abs(val.im) > 1e-7) {
        const imSy = toSy(val.im);
        if (prevImSy !== null && Math.abs(imSy - prevImSy) > jump) flushIm();
        curIm.push({ sx, sy: imSy });
        prevImSy = imSy;
      } else {
        flushIm();
        prevImSy = null;
      }
    }
    flush();
    flushIm();

    items.push({
      kind: 'function',
      color: curve.color,
      strict: isStrict,
      fill: isGreater ? 'above' : isLess ? 'below' : null,
      re,
      im,
    });
  }

  const notable = findNotablePoints(
    curves,
    scope,
    screenToWorldX(0, viewport, width),
    screenToWorldX(width, viewport, width),
    screenToWorldY(height, viewport, height),
    screenToWorldY(0, viewport, height),
  );

  return {
    items,
    snapTargets,
    notable,
    origin,
    hasZ: curves.some((c) => c.axis === 'z'),
  };
}

export function pickHover(
  plot: Plot,
  curves: ActiveCurve[],
  scope: Record<string, unknown>,
  viewport: Viewport,
  size: Size,
  mouse: Pt,
): SnapTarget | null {
  let best: SnapTarget | null = null;
  let bestDist = 22;
  const consider = (target: SnapTarget, dist: number) => {
    if (dist < bestDist) {
      bestDist = dist;
      best = target;
    }
  };

  for (const zp of plot.snapTargets) {
    consider(zp, Math.hypot(zp.sx - mouse.sx, zp.sy - mouse.sy));
  }
  if (best) return best;

  for (const pt of plot.notable) {
    const sx = worldToScreenX(pt.x, viewport, size.width);
    const sy = worldToScreenY(pt.y, viewport, size.height);
    consider(
      { sx, sy, wx: pt.x, wy: pt.y, label: pt.label, color: pt.color },
      Math.hypot(sx - mouse.sx, sy - mouse.sy),
    );
  }
  if (best) return best;

  const wx = screenToWorldX(mouse.sx, viewport, size.width);
  for (const curve of curves) {
    if (curve.axis !== 'y') continue;
    const val = evaluateComplex(curve.compiled, { ...scope, x: wx });
    if (!val) continue;
    const reSy = worldToScreenY(val.re, viewport, size.height);
    const imSy = worldToScreenY(val.im, viewport, size.height);
    const distRe = Math.abs(reSy - mouse.sy);
    const distIm =
      Math.abs(val.im) > 1e-7 ? Math.abs(imSy - mouse.sy) : Infinity;
    const useRe = distRe <= distIm;

    let label: string;
    if (Math.abs(val.im) > 1e-6) {
      const mod = Math.hypot(val.re, val.im);
      const deg = (Math.atan2(val.im, val.re) * 180) / Math.PI;
      label = `x=${wx.toFixed(2)} → ${formatComplex(val.re, val.im)}  (|z|=${mod.toFixed(2)}, θ=${deg.toFixed(0)}°)`;
    } else {
      label = `(${wx.toFixed(3)}, ${val.re.toFixed(3)})`;
    }
    consider(
      {
        sx: mouse.sx,
        sy: useRe ? reSy : imSy,
        wx,
        wy: useRe ? val.re : val.im,
        label,
        color: curve.color,
      },
      Math.min(distRe, distIm),
    );
  }
  return best;
}
