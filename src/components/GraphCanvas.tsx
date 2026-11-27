import { useEffect, useRef, useState } from 'react';
import {
  ActiveCurve,
  AuxDef,
  buildScopeWithDefs,
  findNotablePoints,
} from '../engine/evaluator';
import {
  evaluateCompiled,
  evaluateComplex,
  formatComplex,
} from '../engine/parser';
import {
  computeGridStep,
  formatAxisNumber,
  screenToWorldX,
  screenToWorldY,
  worldToScreenX,
  worldToScreenY,
} from '../engine/viewport';
import { NotablePoint, Viewport } from '../types';

export interface CanvasOverlayHelpers {
  width: number;
  height: number;
  viewport: Viewport;
  scope: Record<string, unknown>;
  toScreenX: (wx: number) => number;
  toScreenY: (wy: number) => number;
}

interface CanvasPoint {
  x: number;
  y: number;
}

export type CanvasDragTarget = (helpers: CanvasOverlayHelpers) => CanvasPoint;

interface GraphCanvasProps {
  curves: ActiveCurve[];
  defs: AuxDef[];
  scope: Record<string, unknown>;
  viewport: Viewport;
  defaultViewport?: Viewport;
  fitWidth?: number;
  highContrast?: boolean;
  label?: string;
  dragTarget?: CanvasDragTarget;
  onViewportChange: (vp: Viewport) => void;
  renderOverlay?: (
    ctx: CanvasRenderingContext2D,
    helpers: CanvasOverlayHelpers,
  ) => void;
  onDragWorld?: (wx: number, wy: number) => void;
}

interface HoverSnap {
  sx: number;
  sy: number;
  wx: number;
  wy: number;
  label: string;
  color: string;
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  const headLen = Math.min(12, Math.max(6, len * 0.25));

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  if (len > 4) {
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLen * Math.cos(angle - Math.PI / 6),
      y2 - headLen * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      x2 - headLen * Math.cos(angle + Math.PI / 6),
      y2 - headLen * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

const DEFAULT_VIEWPORT = { centerX: 0, centerY: 0, scale: 60 };

export function GraphCanvas({
  curves,
  defs,
  scope,
  viewport: sceneViewport,
  defaultViewport = DEFAULT_VIEWPORT,
  fitWidth,
  highContrast,
  label,
  dragTarget,
  onViewportChange,
  renderOverlay,
  onDragWorld,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [mousePos, setMousePos] = useState<{ sx: number; sy: number } | null>(
    null,
  );
  const dragRef = useRef<{
    active: boolean;
    mode: 'pan' | 'interact';
    startX: number;
    startY: number;
    origCenterX: number;
    origCenterY: number;
  } | null>(null);

  const scaleFactor = fitWidth ? Math.min(1, size.width / fitWidth) : 1;
  const viewport = { ...sceneViewport, scale: sceneViewport.scale * scaleFactor };
  const getHelpers = (): CanvasOverlayHelpers => ({
    ...size,
    viewport,
    scope,
    toScreenX: (wx) => worldToScreenX(wx, viewport, size.width),
    toScreenY: (wy) => worldToScreenY(wy, viewport, size.height),
  });
  const handlePoint = dragTarget?.(getHelpers());
  const isOverHandle = (sx: number, sy: number) =>
    handlePoint !== undefined && Math.hypot(sx - handlePoint.x, sy - handlePoint.y) <= 20;
  const overHandle = mousePos && isOverHandle(mousePos.sx, mousePos.sy);

  // Observe container resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Draw frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = size;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const xMin = screenToWorldX(0, viewport, width);
    const xMax = screenToWorldX(width, viewport, width);
    const yMin = screenToWorldY(height, viewport, height);
    const yMax = screenToWorldY(0, viewport, height);

    const majorStep = computeGridStep(viewport.scale);
    const minorStep = majorStep / 5;

    // Minor grid
    ctx.strokeStyle = 'rgba(22, 32, 51, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startMinorX = Math.floor(xMin / minorStep) * minorStep;
    for (let wx = startMinorX; wx <= xMax; wx += minorStep) {
      const sx = worldToScreenX(wx, viewport, width);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }
    const startMinorY = Math.floor(yMin / minorStep) * minorStep;
    for (let wy = startMinorY; wy <= yMax; wy += minorStep) {
      const sy = worldToScreenY(wy, viewport, height);
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // Major grid
    ctx.strokeStyle = 'rgba(22, 32, 51, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startMajorX = Math.floor(xMin / majorStep) * majorStep;
    for (let wx = startMajorX; wx <= xMax; wx += majorStep) {
      const sx = worldToScreenX(wx, viewport, width);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }
    const startMajorY = Math.floor(yMin / majorStep) * majorStep;
    for (let wy = startMajorY; wy <= yMax; wy += majorStep) {
      const sy = worldToScreenY(wy, viewport, height);
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // Main Axes
    const originX = worldToScreenX(0, viewport, width);
    const originY = worldToScreenY(0, viewport, height);
    ctx.strokeStyle = highContrast ? '#0f172a' : 'rgba(22, 32, 51, 0.42)';
    ctx.lineWidth = highContrast ? 2 : 1.5;
    ctx.beginPath();
    if (originX >= 0 && originX <= width) {
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
    }
    if (originY >= 0 && originY <= height) {
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
    }
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = highContrast ? '#0f172a' : '#4b5b75';
    ctx.font = `${highContrast ? 14 : 11}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labelY = Math.min(Math.max(originY + 6, 6), height - 18);
    for (let wx = startMajorX; wx <= xMax; wx += majorStep) {
      if (Math.abs(wx) < majorStep * 1e-4) continue;
      const sx = worldToScreenX(wx, viewport, width);
      ctx.fillText(formatAxisNumber(wx), sx, labelY);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const labelX = Math.min(Math.max(originX - 6, 36), width - 6);
    for (let wy = startMajorY; wy <= yMax; wy += majorStep) {
      if (Math.abs(wy) < majorStep * 1e-4) continue;
      const sy = worldToScreenY(wy, viewport, height);
      ctx.fillText(formatAxisNumber(wy), labelX, sy);
    }

    // Axis name indicators (Re / Im when Argand-Gauss z-curves are present)
    const hasZCurves = curves.some((c) => c.axis === 'z');
    ctx.fillStyle = hasZCurves ? '#38bdf8' : '#64748b';
    ctx.font = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      hasZCurves ? 'Re (x)' : 'x',
      width - 10,
      Math.min(Math.max(originY - 6, 20), height - 10),
    );
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(
      hasZCurves ? 'Im (y)' : 'y',
      Math.min(Math.max(originX + 8, 10), width - 54),
      10,
    );

    const zSnapPoints: Array<{
      sx: number;
      sy: number;
      wx: number;
      wy: number;
      label: string;
      color: string;
    }> = [];

    const anyDefUsesTime = defs.some((d) => d.usesTime);
    const scopeAtTime = (tau: number) =>
      anyDefUsesTime
        ? buildScopeWithDefs({ ...scope, t: tau }, defs)
        : { ...scope, t: tau };

    // Plot curves, inequality regions, parametric trajectories, and Argand-Gauss vectors
    const pixelStep = 1.5;
    for (const curve of curves) {
      const isStrict = curve.relation === '>' || curve.relation === '<';
      const isGreater = curve.relation === '>' || curve.relation === '>=';
      const isLess = curve.relation === '<' || curve.relation === '<=';

      // --- PARAMETRIC 2D CURVE: (x(t), y(t)) ---
      if (curve.axis === 'parametric' && curve.compiledY) {
        const isDynamic = curve.usesTime || anyDefUsesTime;
        const tNow = typeof scope.t === 'number' ? scope.t : 0;

        if (isDynamic) {
          const tEnd = Math.max(6, tNow);
          const tStart = Math.max(0, tEnd - 12);
          const steps = 260;

          ctx.save();
          ctx.strokeStyle = curve.color;
          ctx.lineWidth = 2.2;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          let started = false;
          for (let k = 0; k <= steps; k++) {
            const tau = tStart + ((tEnd - tStart) * k) / steps;
            const s = scopeAtTime(tau);
            const wx = evaluateCompiled(curve.compiled, s);
            const wy = evaluateCompiled(curve.compiledY, s);
            if (wx === null || wy === null) {
              started = false;
              continue;
            }
            const sx = worldToScreenX(wx, viewport, width);
            const sy = worldToScreenY(wy, viewport, height);
            if (!started) {
              ctx.moveTo(sx, sy);
              started = true;
            } else {
              ctx.lineTo(sx, sy);
            }
          }
          ctx.stroke();
          ctx.restore();
        }

        const wx = evaluateCompiled(curve.compiled, scope);
        const wy = evaluateCompiled(curve.compiledY, scope);
        if (wx !== null && wy !== null) {
          const sx = worldToScreenX(wx, viewport, width);
          const sy = worldToScreenY(wy, viewport, height);

          // Velocity tangent vector via finite difference when animated
          if (isDynamic) {
            const eps = 0.01;
            const s1 = scopeAtTime(tNow + eps);
            const s0 = scopeAtTime(Math.max(0, tNow - eps));
            const dt = tNow + eps - Math.max(0, tNow - eps);
            const x1 = evaluateCompiled(curve.compiled, s1);
            const y1 = evaluateCompiled(curve.compiledY, s1);
            const x0 = evaluateCompiled(curve.compiled, s0);
            const y0 = evaluateCompiled(curve.compiledY, s0);
            if (
              dt > 0 &&
              x1 !== null &&
              y1 !== null &&
              x0 !== null &&
              y0 !== null
            ) {
              const vx = (x1 - x0) / dt;
              const vy = (y1 - y0) / dt;
              const speed = Math.hypot(vx, vy);
              if (speed > 1e-4) {
                const arrowScale = Math.min(48, Math.max(18, speed * 5));
                const vxPx = (vx / speed) * arrowScale;
                const vyPx = (-vy / speed) * arrowScale;
                drawArrow(ctx, sx, sy, sx + vxPx, sy + vyPx, '#fbbf24');
              }
            }
          }

          ctx.fillStyle = curve.color;
          ctx.beginPath();
          ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          const prefix = curve.labelName ? `${curve.labelName} ` : '';
          const ptLabel = `${prefix}(${wx.toFixed(2)}, ${wy.toFixed(2)})`;
          ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.fillStyle = '#162033';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText(ptLabel, sx + 8, sy - 6);

          zSnapPoints.push({
            sx,
            sy,
            wx,
            wy,
            label: ptLabel,
            color: curve.color,
          });
        }
        continue;
      }

      // --- MODE 2: Argand-Gauss complex plane (z = ... or z(t) = ...) ---
      if (curve.axis === 'z') {
        const isDynamic = curve.usesTime || anyDefUsesTime;
        if (isDynamic) {
          const tNow = typeof scope.t === 'number' ? scope.t : 0;
          const tEnd = Math.max(2 * Math.PI, tNow);
          const tStart = Math.max(0, tEnd - 4 * Math.PI);
          const steps = 260;

          ctx.save();
          ctx.strokeStyle = curve.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.65;
          ctx.beginPath();
          let started = false;
          for (let k = 0; k <= steps; k++) {
            const tau = tStart + ((tEnd - tStart) * k) / steps;
            const val = evaluateComplex(curve.compiled, scopeAtTime(tau));
            if (!val) {
              started = false;
              continue;
            }
            const sx = worldToScreenX(val.re, viewport, width);
            const sy = worldToScreenY(val.im, viewport, height);
            if (!started) {
              ctx.moveTo(sx, sy);
              started = true;
            } else {
              ctx.lineTo(sx, sy);
            }
          }
          ctx.stroke();
          ctx.restore();
        }

        const current = evaluateComplex(curve.compiled, scope);
        if (current) {
          const sx = worldToScreenX(current.re, viewport, width);
          const sy = worldToScreenY(current.im, viewport, height);

          // Projection lines to Re / Im axes for static z vectors
          if (!isDynamic) {
            ctx.save();
            ctx.strokeStyle = curve.color;
            ctx.globalAlpha = 0.35;
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx, originY);
            ctx.moveTo(sx, sy);
            ctx.lineTo(originX, sy);
            ctx.stroke();
            ctx.restore();
          }

          drawArrow(ctx, originX, originY, sx, sy, curve.color);

          ctx.fillStyle = curve.color;
          ctx.beginPath();
          ctx.arc(sx, sy, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Compact inline label
          const namePrefix =
            curve.labelName && curve.labelName !== 'z'
              ? `${curve.labelName}: `
              : '';
          ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.fillStyle = '#162033';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText(
            `${namePrefix}${formatComplex(current.re, current.im)}`,
            sx + 8,
            sy - 6,
          );

          const mod = Math.hypot(current.re, current.im);
          const deg = (Math.atan2(current.im, current.re) * 180) / Math.PI;
          zSnapPoints.push({
            sx,
            sy,
            wx: current.re,
            wy: current.im,
            label: `${curve.labelName ?? 'z'} = ${formatComplex(current.re, current.im)}  (|z|=${mod.toFixed(2)}, θ=${deg.toFixed(0)}°)`,
            color: curve.color,
          });
        }
        continue;
      }

      // --- Vertical x = expr or half-plane x > expr / x < expr ---
      if (curve.axis === 'x') {
        const wx = evaluateCompiled(curve.compiled, { ...scope });
        if (wx === null) continue;
        const sx = worldToScreenX(wx, viewport, width);

        if (isGreater || isLess) {
          ctx.save();
          ctx.fillStyle = curve.color;
          ctx.globalAlpha = 0.2;
          if (isGreater) {
            const xStart = Math.max(0, sx);
            if (xStart < width) ctx.fillRect(xStart, 0, width - xStart, height);
          } else {
            const xEnd = Math.min(width, sx);
            if (xEnd > 0) ctx.fillRect(0, 0, xEnd, height);
          }
          ctx.restore();
        }

        if (sx >= -2 && sx <= width + 2) {
          ctx.save();
          ctx.strokeStyle = curve.color;
          ctx.lineWidth = 2.4;
          if (isStrict) ctx.setLineDash([7, 5]);
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx, height);
          ctx.stroke();
          ctx.restore();
        }
        continue;
      }

      // --- MODE 1: y = f(x) (Real part solid, Imaginary part dotted when im != 0) ---
      const reSegments: Array<Array<{ sx: number; sy: number }>> = [];
      let curReSeg: Array<{ sx: number; sy: number }> = [];
      let prevReSy: number | null = null;

      const imSegments: Array<Array<{ sx: number; sy: number }>> = [];
      let curImSeg: Array<{ sx: number; sy: number }> = [];
      let prevImSy: number | null = null;
      let hasImaginary = false;

      for (let sx = 0; sx <= width; sx += pixelStep) {
        const wx = screenToWorldX(sx, viewport, width);
        const val = evaluateComplex(curve.compiled, { ...scope, x: wx });
        if (val === null) {
          if (curReSeg.length > 0) {
            reSegments.push(curReSeg);
            curReSeg = [];
          }
          if (curImSeg.length > 0) {
            imSegments.push(curImSeg);
            curImSeg = [];
          }
          prevReSy = null;
          prevImSy = null;
          continue;
        }

        const reSy = worldToScreenY(val.re, viewport, height);
        if (prevReSy !== null && Math.abs(reSy - prevReSy) > height * 0.85) {
          if (curReSeg.length > 0) {
            reSegments.push(curReSeg);
            curReSeg = [];
          }
        }
        curReSeg.push({ sx, sy: reSy });
        prevReSy = reSy;

        if (Math.abs(val.im) > 1e-7) {
          hasImaginary = true;
          const imSy = worldToScreenY(val.im, viewport, height);
          if (prevImSy !== null && Math.abs(imSy - prevImSy) > height * 0.85) {
            if (curImSeg.length > 0) {
              imSegments.push(curImSeg);
              curImSeg = [];
            }
          }
          curImSeg.push({ sx, sy: imSy });
          prevImSy = imSy;
        } else {
          if (curImSeg.length > 0) {
            imSegments.push(curImSeg);
            curImSeg = [];
          }
          prevImSy = null;
        }
      }
      if (curReSeg.length > 0) reSegments.push(curReSeg);
      if (curImSeg.length > 0) imSegments.push(curImSeg);

      // Fill area for inequalities (y > f(x) -> shade to top; y < f(x) -> shade to bottom)
      if (isGreater || isLess) {
        const edgeY = isGreater ? 0 : height;
        ctx.save();
        ctx.fillStyle = curve.color;
        ctx.globalAlpha = 0.2;
        for (const seg of reSegments) {
          if (seg.length < 2) continue;
          ctx.beginPath();
          ctx.moveTo(seg[0].sx, edgeY);
          for (const pt of seg) {
            ctx.lineTo(pt.sx, Math.min(Math.max(pt.sy, -height), height * 2));
          }
          ctx.lineTo(seg[seg.length - 1].sx, edgeY);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Stroke Real curve
      ctx.save();
      ctx.strokeStyle = curve.color;
      ctx.lineWidth = 2.4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      if (isStrict) ctx.setLineDash([7, 5]);
      ctx.beginPath();
      for (const seg of reSegments) {
        if (seg.length === 0) continue;
        ctx.moveTo(seg[0].sx, seg[0].sy);
        for (let i = 1; i < seg.length; i++) {
          ctx.lineTo(seg[i].sx, seg[i].sy);
        }
      }
      ctx.stroke();
      ctx.restore();

      // Stroke Imaginary curve (dotted) when present
      if (hasImaginary && imSegments.length > 0) {
        ctx.save();
        ctx.strokeStyle = curve.color;
        ctx.globalAlpha = 0.78;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        for (const seg of imSegments) {
          if (seg.length === 0) continue;
          ctx.moveTo(seg[0].sx, seg[0].sy);
          for (let i = 1; i < seg.length; i++) {
            ctx.lineTo(seg[i].sx, seg[i].sy);
          }
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    // Optional module-specific visual overlay (e.g. Physics annotations, Sun, cannon, vectors)
    if (renderOverlay) {
      ctx.save();
      renderOverlay(ctx, {
        width,
        height,
        viewport,
        scope,
        toScreenX: (wx: number) => worldToScreenX(wx, viewport, width),
        toScreenY: (wy: number) => worldToScreenY(wy, viewport, height),
      });
      ctx.restore();
    }

    // Notable points (roots & intersections)
    const notable: NotablePoint[] = findNotablePoints(
      curves,
      scope,
      xMin,
      xMax,
      yMin,
      yMax,
    );

    for (const pt of notable) {
      const sx = worldToScreenX(pt.x, viewport, width);
      const sy = worldToScreenY(pt.y, viewport, height);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Inspector hover snap
    if (mousePos) {
      let bestSnap: HoverSnap | null = null;
      let bestDist = 22;

      // Priority 1: snap to Argand-Gauss z points & parametric particles
      for (const zp of zSnapPoints) {
        const dist = Math.hypot(zp.sx - mousePos.sx, zp.sy - mousePos.sy);
        if (dist < bestDist) {
          bestDist = dist;
          bestSnap = {
            sx: zp.sx,
            sy: zp.sy,
            wx: zp.wx,
            wy: zp.wy,
            label: zp.label,
            color: zp.color,
          };
        }
      }

      // Priority 2: snap to notable points
      if (!bestSnap) {
        for (const pt of notable) {
          const sx = worldToScreenX(pt.x, viewport, width);
          const sy = worldToScreenY(pt.y, viewport, height);
          const dist = Math.hypot(sx - mousePos.sx, sy - mousePos.sy);
          if (dist < bestDist) {
            bestDist = dist;
            bestSnap = {
              sx,
              sy,
              wx: pt.x,
              wy: pt.y,
              label: pt.label,
              color: pt.color,
            };
          }
        }
      }

      // Priority 3: snap to nearest y = f(x) curve (Real or Imaginary branch)
      if (!bestSnap) {
        const wx = screenToWorldX(mousePos.sx, viewport, width);
        for (const curve of curves) {
          if (curve.axis !== 'y') continue;
          const val = evaluateComplex(curve.compiled, { ...scope, x: wx });
          if (!val) continue;

          const reSy = worldToScreenY(val.re, viewport, height);
          const imSy = worldToScreenY(val.im, viewport, height);
          const distRe = Math.abs(reSy - mousePos.sy);
          const distIm =
            Math.abs(val.im) > 1e-7 ? Math.abs(imSy - mousePos.sy) : Infinity;

          const minDist = Math.min(distRe, distIm);
          if (minDist < bestDist) {
            bestDist = minDist;
            const snapSy = distRe <= distIm ? reSy : imSy;
            const snapWy = distRe <= distIm ? val.re : val.im;

            let label: string;
            if (Math.abs(val.im) > 1e-6) {
              const mod = Math.hypot(val.re, val.im);
              const deg = (Math.atan2(val.im, val.re) * 180) / Math.PI;
              label = `x=${wx.toFixed(2)} → ${formatComplex(val.re, val.im)}  (|z|=${mod.toFixed(2)}, θ=${deg.toFixed(0)}°)`;
            } else {
              label = `(${wx.toFixed(3)}, ${val.re.toFixed(3)})`;
            }

            bestSnap = {
              sx: mousePos.sx,
              sy: snapSy,
              wx,
              wy: snapWy,
              label,
              color: curve.color,
            };
          }
        }
      }

      if (bestSnap) {
        // Crosshair guide
        ctx.strokeStyle = 'rgba(22, 32, 51, 0.22)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bestSnap.sx, 0);
        ctx.lineTo(bestSnap.sx, height);
        ctx.moveTo(0, bestSnap.sy);
        ctx.lineTo(width, bestSnap.sy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Point highlight
        ctx.fillStyle = bestSnap.color;
        ctx.beginPath();
        ctx.arc(bestSnap.sx, bestSnap.sy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tooltip pill
        ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
        const textW = ctx.measureText(bestSnap.label).width;
        const boxW = textW + 16;
        const boxH = 26;
        const boxX = Math.min(Math.max(bestSnap.sx + 12, 8), width - boxW - 8);
        const boxY = Math.max(bestSnap.sy - 34, 8);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
        ctx.strokeStyle = bestSnap.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#162033';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(bestSnap.label, boxX + 8, boxY + boxH / 2);
      }
    }
    if (handlePoint) {
      ctx.beginPath();
      ctx.arc(handlePoint.x, handlePoint.y, overHandle ? 9 : 7, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [curves, defs, scope, sceneViewport, scaleFactor, size, mousePos, renderOverlay, dragTarget, highContrast]);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const wxBefore = screenToWorldX(sx, viewport, size.width);
    const wyBefore = screenToWorldY(sy, viewport, size.height);

    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const nextScale = Math.min(Math.max(viewport.scale * factor, 4), 2000);

    const nextCenterX = wxBefore - (sx - size.width / 2) / nextScale;
    const nextCenterY = wyBefore + (sy - size.height / 2) / nextScale;

    onViewportChange({
      centerX: nextCenterX,
      centerY: nextCenterY,
      scale: nextScale / scaleFactor,
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 || !e.isPrimary) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mode = isOverHandle(e.clientX - rect.left, e.clientY - rect.top) ? 'interact' : 'pan';
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origCenterX: viewport.centerX,
      origCenterY: viewport.centerY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!e.isPrimary) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    setMousePos({ sx, sy });

    const drag = dragRef.current;
    if (!drag?.active) return;
    if (drag.mode === 'interact' && onDragWorld) {
      onDragWorld(screenToWorldX(sx, viewport, size.width), screenToWorldY(sy, viewport, size.height));
      return;
    }
    onViewportChange({
      ...sceneViewport,
      centerX: drag.origCenterX - (e.clientX - drag.startX) / viewport.scale,
      centerY: drag.origCenterY + (e.clientY - drag.startY) / viewport.scale,
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas
        ref={canvasRef}
        className={`graph-canvas${dragTarget ? ' has-drag-target' : ''}${overHandle ? ' over-drag-target' : ''}`}
        role={label ? 'img' : undefined}
        aria-label={label}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onPointerLeave={() => setMousePos(null)}
      />
      <button
        className="reset-view-btn"
        onClick={() => onViewportChange(defaultViewport)}
      >
        Restaurar vista
      </button>
    </div>
  );
}
