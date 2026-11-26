import { EvalFunction } from 'mathjs';
import { NotablePoint } from '../types';
import {
  evaluateCompiled,
  evaluateRaw,
  RelationAxis,
  RelationOp,
} from './parser';

export interface ActiveCurve {
  id: string;
  color: string;
  compiled: EvalFunction;
  compiledY: EvalFunction | null;
  relation: RelationOp;
  axis: RelationAxis;
  usesTime: boolean;
  labelName: string | null;
}

export interface AuxDef {
  id: string;
  name: string;
  compiled: EvalFunction;
  usesTime: boolean;
}

export function buildScopeWithDefs(
  baseScope: Record<string, unknown>,
  defs: AuxDef[],
): Record<string, unknown> {
  if (defs.length === 0) return baseScope;
  const scope: Record<string, unknown> = { ...baseScope };
  for (const def of defs) {
    const val = evaluateRaw(def.compiled, scope);
    if (val !== null && val !== undefined) {
      scope[def.name] = val;
    }
  }
  return scope;
}

/**
 * Bisection refinement for roots f(x) = 0 or intersections f1(x) - f2(x) = 0.
 */
function refineZero(
  fn: (x: number) => number | null,
  a: number,
  b: number,
  iterations = 14,
): number | null {
  let fa = fn(a);
  let fb = fn(b);
  if (fa === null || fb === null) return null;
  if (Math.abs(fa) < 1e-9) return a;
  if (Math.abs(fb) < 1e-9) return b;
  if (fa * fb > 0) return null;

  let lo = a;
  let hi = b;
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    const fmid = fn(mid);
    if (fmid === null) return null;
    if (Math.abs(fmid) < 1e-9) return mid;
    if (fa * fmid <= 0) {
      hi = mid;
      fb = fmid;
    } else {
      lo = mid;
      fa = fmid;
    }
    void fb;
  }
  return (lo + hi) / 2;
}

export function findNotablePoints(
  curves: ActiveCurve[],
  baseScope: Record<string, unknown>,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  samples = 160,
): NotablePoint[] {
  const points: NotablePoint[] = [];
  const yCurves = curves.filter((c) => c.axis === 'y');
  if (yCurves.length === 0 || xMax <= xMin) return points;

  const dx = (xMax - xMin) / samples;
  const maxJump = (yMax - yMin) * 2;

  // Roots for each curve
  for (const curve of yCurves) {
    const evalFn = (x: number) => evaluateCompiled(curve.compiled, { ...baseScope, x });
    let prevX = xMin;
    let prevY = evalFn(prevX);

    for (let i = 1; i <= samples; i++) {
      const currX = xMin + i * dx;
      const currY = evalFn(currX);
      if (
        prevY !== null &&
        currY !== null &&
        Math.abs(currY - prevY) < maxJump &&
        prevY * currY <= 0
      ) {
        const rootX = refineZero(evalFn, prevX, currX);
        if (rootX !== null) {
          const dup = points.some(
            (p) => p.type === 'root' && p.color === curve.color && Math.abs(p.x - rootX) < dx * 0.5,
          );
          if (!dup) {
            points.push({
              x: rootX,
              y: 0,
              type: 'root',
              label: `Raiz (${rootX.toFixed(3)}, 0)`,
              color: curve.color,
            });
          }
        }
      }
      prevX = currX;
      prevY = currY;
    }
  }

  // Pairwise intersections
  for (let a = 0; a < yCurves.length; a++) {
    for (let b = a + 1; b < yCurves.length; b++) {
      const c1 = yCurves[a];
      const c2 = yCurves[b];
      const diffFn = (x: number) => {
        const y1 = evaluateCompiled(c1.compiled, { ...baseScope, x });
        const y2 = evaluateCompiled(c2.compiled, { ...baseScope, x });
        if (y1 === null || y2 === null) return null;
        return y1 - y2;
      };

      let prevX = xMin;
      let prevD = diffFn(prevX);
      for (let i = 1; i <= samples; i++) {
        const currX = xMin + i * dx;
        const currD = diffFn(currX);
        if (
          prevD !== null &&
          currD !== null &&
          Math.abs(currD - prevD) < maxJump &&
          prevD * currD <= 0
        ) {
          const ix = refineZero(diffFn, prevX, currX);
          if (ix !== null) {
            const iy = evaluateCompiled(c1.compiled, { ...baseScope, x: ix });
            if (iy !== null && iy >= yMin && iy <= yMax) {
              points.push({
                x: ix,
                y: iy,
                type: 'intersection',
                label: `Interseção (${ix.toFixed(3)}, ${iy.toFixed(3)})`,
                color: '#f59e0b',
              });
            }
          }
        }
        prevX = currX;
        prevD = currD;
      }
    }
  }

  return points.slice(0, 40);
}
