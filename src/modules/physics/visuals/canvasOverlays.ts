import { CanvasDragTarget, CanvasOverlayHelpers } from '../../../components/GraphCanvas';
import { ParameterConfig } from '../../../types';
import { evaluateCarnotState } from './carnotModel';

function num(scope: Record<string, unknown>, key: string, fallback = 0): number {
  const v = scope[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function drawVectorArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  label?: string,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 3) return;
  const head = Math.min(11, Math.max(6, len * 0.25));

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - head * Math.cos(angle - Math.PI / 6),
    y2 - head * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    x2 - head * Math.cos(angle + Math.PI / 6),
    y2 - head * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fill();

  if (label) {
    ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x2 + 6, y2);
  }
  ctx.restore();
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  borderColor = '#2563eb',
) {
  ctx.save();
  ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
  const w = ctx.measureText(text).width + 20;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, 28, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#162033';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 10, y + 14);
  ctx.restore();
}

function renderProjectileOverlay(
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
) {
  const v0 = num(h.scope, 'v0', 12);
  const ang = num(h.scope, 'ang', 0.9);
  const g = Math.max(0.1, num(h.scope, 'g', 9.8));

  const ox = h.toScreenX(0);
  const oy = h.toScreenY(0);

  ctx.save();
  ctx.translate(ox, oy);
  ctx.rotate(-ang);
  ctx.fillStyle = '#64748b';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(0, -6, 30, 12, 4);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#334155';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(ox, oy, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const tFlight = (2 * v0 * Math.sin(ang)) / g;
  const hMax = (v0 * Math.sin(ang)) ** 2 / (2 * g);
  const xHalf = v0 * Math.cos(ang) * (tFlight / 2);
  const range = v0 * Math.cos(ang) * tFlight;

  const sxHalf = h.toScreenX(xHalf);
  const syHMax = h.toScreenY(hMax);
  const sxRange = h.toScreenX(range);

  ctx.save();
  ctx.strokeStyle = '#34d399';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(sxHalf, oy);
  ctx.lineTo(sxHalf, syHMax);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(sxHalf, syHMax, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`Hmax = ${hMax.toFixed(2)}m`, sxHalf, syHMax - 8);

  ctx.beginPath();
  ctx.arc(sxRange, oy, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.textBaseline = 'top';
  ctx.fillText(`Alcance R = ${range.toFixed(2)}m`, sxRange, oy + 10);
  ctx.restore();
}

function renderRotationalOverlay(
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
) {
  const R = Math.max(0.1, num(h.scope, 'R', 2.5));
  const w0 = num(h.scope, 'w0', 1.4);
  const alpha = num(h.scope, 'alpha', 0.2);
  const t = num(h.scope, 't', 0);
  const theta = num(h.scope, 'theta', w0 * t + 0.5 * alpha * t * t);
  const wNow = w0 + alpha * t;

  const ox = h.toScreenX(0);
  const oy = h.toScreenY(0);
  const radiusPx = R * h.viewport.scale;

  ctx.save();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(ox, oy, radiusPx, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const modTheta = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const arcR = Math.min(36, radiusPx * 0.4);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ox, oy, arcR, 0, -modTheta, true);
  ctx.stroke();

  const px = h.toScreenX(R * Math.cos(theta));
  const py = h.toScreenY(R * Math.sin(theta));

  const vDirX = -Math.sin(theta) * Math.sign(wNow || 1);
  const vDirY = Math.cos(theta) * Math.sign(wNow || 1);
  const vLen = Math.min(65, Math.max(24, Math.abs(wNow * R) * 14));
  drawVectorArrow(
    ctx,
    px,
    py,
    px + vDirX * vLen,
    py - vDirY * vLen,
    '#34d399',
    `v=${Math.abs(wNow * R).toFixed(1)}`,
  );

  const acLen = Math.min(
    radiusPx * 0.6,
    Math.max(20, Math.abs(wNow * wNow * R) * 6),
  );
  const dx = ox - px;
  const dy = oy - py;
  const d = Math.hypot(dx, dy) || 1;
  drawVectorArrow(
    ctx,
    px,
    py,
    px + (dx / d) * acLen,
    py + (dy / d) * acLen,
    '#f472b6',
    'ac',
  );
  ctx.restore();
}

function renderInclinedPlaneOverlay(
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
) {
  const m = num(h.scope, 'm', 4);
  const ang = num(h.scope, 'ang', 0.55);
  const mu = num(h.scope, 'mu', 0.25);
  const g = num(h.scope, 'g', 9.8);
  const P = m * g;
  const Px = P * Math.sin(ang);
  const N = P * Math.cos(ang);
  const fatMax = mu * N;
  const slides = Px > fatMax + 1e-6;
  const aNet = slides ? (Px - fatMax) / m : 0;

  // Draw free-body ramp inset in top-left corner
  const bx = 16;
  const by = 16;
  const bw = 250;
  const bh = 165;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 10);
  ctx.fill();
  ctx.stroke();

  // Ramp triangle
  const x0 = bx + 26;
  const y0 = by + bh - 26;
  const baseLen = 180;
  const rampH = Math.min(95, Math.tan(ang) * baseLen);
  const xTop = x0 + baseLen;
  const yTop = y0 - rampH;
  const actualAng = Math.atan2(rampH, baseLen);

  ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(xTop, y0);
  ctx.lineTo(xTop, yTop);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Animated sliding block along the ramp when slides === true
  const t = num(h.scope, 't', 0);
  let frac = 0.5;
  if (slides) {
    const travelDist = 0.5 * aNet * t * t;
    const cycleDist = 12;
    frac = 0.15 + ((travelDist % cycleDist) / cycleDist) * 0.72;
  }
  const mx = xTop + (x0 - xTop) * frac;
  const my = yTop + (y0 - yTop) * frac;
  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(-actualAng);
  ctx.fillStyle = '#38bdf8';
  ctx.strokeStyle = '#e0f2fe';
  ctx.lineWidth = 1.5;
  ctx.fillRect(-14, -20, 28, 20);
  ctx.strokeRect(-14, -20, 28, 20);
  ctx.restore();

  // Force center
  const cx = mx - Math.sin(actualAng) * 10;
  const cy = my - Math.cos(actualAng) * 10;

  // Weight P (straight down)
  drawVectorArrow(ctx, cx, cy, cx, cy + 40, '#fbbf24', 'P');
  // Normal N (perpendicular up-left)
  drawVectorArrow(
    ctx,
    cx,
    cy,
    cx - Math.sin(actualAng) * 34,
    cy - Math.cos(actualAng) * 34,
    '#34d399',
    'N',
  );
  // Friction fat (up the slope)
  if (mu > 0.01) {
    const fLen = Math.min(36, Math.max(14, (fatMax / Math.max(1, P)) * 55));
    drawVectorArrow(
      ctx,
      cx,
      cy,
      cx + Math.cos(actualAng) * fLen,
      cy - Math.sin(actualAng) * fLen,
      '#f472b6',
      'fat',
    );
  }

  ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = slides ? '#38bdf8' : '#34d399';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(
    slides
      ? `Deslizando: a = ${aNet.toFixed(2)} m/s²`
      : 'Equilíbrio Estático (a = 0)',
    bx + 12,
    by + 10,
  );
  ctx.restore();
}

function renderKeplerOverlay(
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
) {
  const q = num(h.scope, 'q', 1.4);
  const ecc = Math.max(0, num(h.scope, 'ecc', 0.58));
  const p = q * (1 + ecc);

  const ox = h.toScreenX(0);
  const oy = h.toScreenY(0);

  ctx.save();
  const grad = ctx.createRadialGradient(ox, oy, 2, ox, oy, 26);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.35, '#f59e0b');
  grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(ox, oy, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(ox, oy, 7, 0, Math.PI * 2);
  ctx.fill();

  const rPeri = q;
  const sxPeri = h.toScreenX(rPeri);
  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(sxPeri, oy, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Periélio (${rPeri.toFixed(2)})`, sxPeri + 6, oy + 8);

  if (ecc < 1) {
    const rAph = p / (1 - ecc);
    const sxAph = h.toScreenX(-rAph);
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(sxAph, oy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.textAlign = 'right';
    ctx.fillText(`Afélio (${rAph.toFixed(2)})`, sxAph - 6, oy + 8);
  }

  ctx.restore();
}

function drawLightPulses(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: number,
  speedPxPerSec: number,
  color: string,
) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 10) return;
  const spacing = 36;
  const offset = (t * speedPxPerSec) % spacing;

  ctx.save();
  ctx.fillStyle = color;
  for (let d = offset; d < len; d += spacing) {
    const u = d / len;
    const px = x1 + (x2 - x1) * u;
    const py = y1 + (y2 - y1) * u;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

const snellRayLength = (h: CanvasOverlayHelpers) => Math.min(h.width, h.height) * 0.38;

const snellDragTarget: CanvasDragTarget = (h) => {
  const angle = num(h.scope, 'ang1', 0.65);
  const direction = num(h.scope, 'dir', 1);
  const length = snellRayLength(h);
  return {
    x: h.toScreenX(0) - Math.sin(angle) * length,
    y: h.toScreenY(0) - direction * Math.cos(angle) * length,
  };
};

const lensDragTarget: CanvasDragTarget = (h) => ({
  x: h.toScreenX(-num(h.scope, 'p', 4.2)),
  y: h.toScreenY(num(h.scope, 'hObj', 1.6)),
});

export function getOpticsDrag(
  experimentId: string,
  scope: Record<string, unknown>,
  update: (name: string, patch: Partial<ParameterConfig>) => void,
) {
  if (experimentId === 'snell-optics') {
    return {
      target: snellDragTarget,
      onDrag: (x: number, y: number) => {
        const angle = Math.atan2(-x, Math.abs(y));
        update('ang1', { value: Math.min(1.48, Math.max(0.05, angle)), playing: false });
        if (y !== 0 && Math.sign(y) !== scope.dir) update('dir', { value: Math.sign(y) });
      },
    };
  }
  if (experimentId === 'thin-lens') {
    return {
      target: lensDragTarget,
      onDrag: (x: number, y: number) => {
        update('p', { value: Math.min(7.5, Math.max(0.6, -x)), playing: false });
        update('hObj', { value: Math.min(3.0, Math.max(0.5, y)), playing: false });
      },
    };
  }
  return {};
}

function renderSnellOverlay(
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
) {
  const n1 = Math.max(1, num(h.scope, 'n1', 1.0));
  const n2 = Math.max(1, num(h.scope, 'n2', 1.5));
  const ang1 = Math.min(1.5, Math.max(0.03, num(h.scope, 'ang1', 0.65)));
  const dir = num(h.scope, 'dir', 1) >= 0 ? 1 : -1; // 1: top->bottom, -1: bottom->top
  const t = num(h.scope, 't', 0);

  const nInc = dir === 1 ? n1 : n2;
  const nTrans = dir === 1 ? n2 : n1;

  const ox = h.toScreenX(0);
  const oy = h.toScreenY(0);
  const rayLen = snellRayLength(h);

  ctx.save();
  // Normal dashed line
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.4)';
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ox, 0);
  ctx.lineTo(ox, h.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Medium labels
  ctx.font = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText(`Meio Superior (n₁ = ${n1.toFixed(2)})`, 16, oy - 16);
  ctx.fillText(`Meio Inferior (n₂ = ${n2.toFixed(2)})`, 16, oy + 24);

  // Critical angle cone when going from higher n to lower n
  if (nInc > nTrans + 1e-4) {
    const crit = Math.asin(nTrans / nInc);
    ctx.save();
    ctx.fillStyle = 'rgba(244, 114, 182, 0.12)';
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.45)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    if (dir === 1) {
      ctx.arc(ox, oy, rayLen * 0.65, -Math.PI / 2 - crit, -Math.PI / 2 + crit);
    } else {
      ctx.arc(ox, oy, rayLen * 0.65, Math.PI / 2 - crit, Math.PI / 2 + crit);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Incident ray (upper-left if dir=1, lower-left if dir=-1)
  const ix = ox - Math.sin(ang1) * rayLen;
  const iy = oy - dir * Math.cos(ang1) * rayLen;
  drawVectorArrow(ctx, ix, iy, ox, oy, '#fbbf24');
  drawLightPulses(ctx, ix, iy, ox, oy, t, 110 / nInc, '#fef08a');

  // Reflected ray
  const rx = ox + Math.sin(ang1) * rayLen;
  const ry = oy - dir * Math.cos(ang1) * rayLen;

  const sin2 = (nInc / nTrans) * Math.sin(ang1);
  if (Math.abs(sin2) > 1) {
    drawVectorArrow(ctx, ox, oy, rx, ry, '#f472b6', 'Reflexão Total!');
    drawLightPulses(ctx, ox, oy, rx, ry, t, 110 / nInc, '#fbcfe8');
  } else {
    ctx.save();
    ctx.globalAlpha = 0.35;
    drawVectorArrow(ctx, ox, oy, rx, ry, '#f472b6');
    ctx.restore();

    const ang2 = Math.asin(sin2);
    const deg2 = (ang2 * 180) / Math.PI;
    const tx = ox + Math.sin(ang2) * rayLen;
    const ty = oy + dir * Math.cos(ang2) * rayLen;
    drawVectorArrow(ctx, ox, oy, tx, ty, '#38bdf8', `θ₂=${deg2.toFixed(1)}°`);
    drawLightPulses(ctx, ox, oy, tx, ty, t, 110 / nTrans, '#bae6fd');

  }
  ctx.restore();
}

function renderCarnotOverlay(
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
) {
  const n = num(h.scope, 'n', 2);
  const TQ = num(h.scope, 'TQ', 600);
  const TF = num(h.scope, 'TF', 300);
  const t = num(h.scope, 't', 0);

  // Sample closed 4-stage Carnot cycle polygon on P-V diagram
  ctx.save();
  ctx.beginPath();
  const samples = 120;
  for (let i = 0; i <= samples; i++) {
    const st = evaluateCarnotState(n, TQ, TF, (i / samples) * 8);
    const sx = h.toScreenX(st.V);
    const sy = h.toScreenY(st.P);
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(52, 211, 153, 0.22)';
  ctx.fill();
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Live glowing state dot along the Carnot cycle
  const cur = evaluateCarnotState(n, TQ, TF, t);
  const cx = h.toScreenX(cur.V);
  const cy = h.toScreenY(cur.P);
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function renderThinLensOverlay(
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
) {
  const fRaw = num(h.scope, 'f', 2.0);
  const f = Math.abs(fRaw) < 0.15 ? 0.15 : fRaw;
  const p = Math.max(0.2, num(h.scope, 'p', 4.2));
  const hObj = num(h.scope, 'hObj', 1.6);

  const ox = h.toScreenX(0);
  const oy = h.toScreenY(0);

  // Focal points F and F'
  const f1x = h.toScreenX(-Math.abs(f));
  const f2x = h.toScreenX(Math.abs(f));
  ctx.save();
  for (const [fx, lbl] of [
    [f1x, 'F'],
    [f2x, "F'"],
  ] as const) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(fx, oy, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(lbl, fx, oy + 8);
  }

  // Object arrow at x = -p
  const objX = h.toScreenX(-p);
  const objTopY = h.toScreenY(hObj);
  drawVectorArrow(ctx, objX, oy, objX, objTopY, '#34d399', 'Obj');

  // Image via Gauss: 1/f = 1/p + 1/p' -> p' = pf/(p - f)
  if (Math.abs(p - f) < 0.05) {
    drawBadge(ctx, 14, 14, 'Objeto no foco (p = f): imagem no infinito!', '#fbbf24');
    ctx.restore();
    return;
  }

  const pPrime = (p * f) / (p - f);
  const mag = -pPrime / p;
  const hImg = hObj * mag;
  const imgX = h.toScreenX(pPrime);
  const imgTopY = h.toScreenY(hImg);

  // Lens symbol caps (converging arrows out, diverging arrows in)
  const lensTop = Math.max(24, oy - 130);
  const lensBot = Math.min(h.height - 24, oy + 130);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(ox, lensTop);
  ctx.lineTo(ox, lensBot);
  if (f > 0) {
    ctx.moveTo(ox - 8, lensTop + 10);
    ctx.lineTo(ox, lensTop);
    ctx.lineTo(ox + 8, lensTop + 10);
    ctx.moveTo(ox - 8, lensBot - 10);
    ctx.lineTo(ox, lensBot);
    ctx.lineTo(ox + 8, lensBot - 10);
  } else {
    ctx.moveTo(ox - 8, lensTop - 6);
    ctx.lineTo(ox, lensTop + 4);
    ctx.lineTo(ox + 8, lensTop - 6);
    ctx.moveTo(ox - 8, lensBot + 6);
    ctx.lineTo(ox, lensBot - 4);
    ctx.lineTo(ox + 8, lensBot + 6);
  }
  ctx.stroke();

  // Ray 1 (parallel to axis -> refracted through focal point)
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(objX, objTopY);
  ctx.lineTo(ox, objTopY);
  if (pPrime > 0) {
    ctx.lineTo(imgX, imgTopY);
  } else {
    // Real outgoing ray to the right edge
    const rightWorldX = 10;
    const slope1 = -hObj / f;
    const rightY = h.toScreenY(hObj + slope1 * rightWorldX);
    ctx.lineTo(h.toScreenX(rightWorldX), rightY);
  }
  ctx.stroke();

  // Ray 2 (straight through optical center (0, 0))
  ctx.beginPath();
  ctx.moveTo(objX, objTopY);
  if (pPrime > 0) {
    ctx.lineTo(imgX, imgTopY);
  } else {
    const rightWorldX = 10;
    const slope2 = -hObj / p;
    ctx.lineTo(h.toScreenX(rightWorldX), h.toScreenY(slope2 * rightWorldX));
  }
  ctx.stroke();

  // Virtual dashed extensions back to the virtual image (when pPrime < 0, e.g. Lupa / Diverging)
  if (pPrime < 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(ox, objTopY);
    ctx.lineTo(imgX, imgTopY);
    ctx.moveTo(ox, oy);
    ctx.lineTo(imgX, imgTopY);
    ctx.stroke();
    ctx.restore();
  }

  // Image arrow (dashed if virtual)
  ctx.save();
  if (pPrime < 0) ctx.setLineDash([4, 3]);
  drawVectorArrow(ctx, imgX, oy, imgX, imgTopY, '#f472b6', 'Img');
  ctx.restore();

  const nature = pPrime > 0 ? 'Real' : 'Virtual';
  const orient = mag >= 0 ? 'Direita' : 'Invertida';
  drawBadge(
    ctx,
    14,
    14,
    `${f > 0 ? 'Convergente' : 'Divergente'} · ${nature}, ${orient} · p'=${pPrime.toFixed(2)} · A=${mag.toFixed(2)}× (arraste o Obj)`,
    '#f472b6',
  );
  ctx.restore();
}

function renderDopplerOverlay(
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
) {
  const vWave = Math.max(0.5, num(h.scope, 'vWave', 3.0));
  const vSource = Math.max(0, num(h.scope, 'vSource', 1.4));
  const f0 = Math.max(0.2, num(h.scope, 'f0', 1.5));
  const t = num(h.scope, 't', 0);

  const period = 1 / f0;
  const cycleLen = 6;
  const tCycle = t % cycleLen;
  const srcX = -4 + vSource * tCycle;
  const srcY = 0.8;

  ctx.save();
  // Draw emitted wavefront circles
  const maxPulses = 16;
  const latestIdx = Math.floor(tCycle / period);
  for (let k = Math.max(0, latestIdx - maxPulses); k <= latestIdx; k++) {
    const tEmit = k * period;
    const age = tCycle - tEmit;
    if (age < 0) continue;
    const emitX = -4 + vSource * tEmit;
    const radiusW = vWave * age;
    const sx = h.toScreenX(emitX);
    const sy = h.toScreenY(srcY);
    const rPx = radiusW * h.viewport.scale;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(sx, sy, rPx, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Moving source dot
  const sxNow = h.toScreenX(srcX);
  const syNow = h.toScreenY(srcY);
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(sxNow, syNow, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  const mach = vSource / vWave;
  if (mach >= 1) {
    drawBadge(
      ctx,
      14,
      14,
      `SUPERSÔNICO · Mach = ${mach.toFixed(2)} (Cone de Mach)`,
      '#f472b6',
    );
  } else {
    const fAprox = (f0 * vWave) / (vWave - vSource);
    const fAfast = (f0 * vWave) / (vWave + vSource);
    drawBadge(
      ctx,
      14,
      14,
      `f_aprox = ${fAprox.toFixed(2)}Hz  |  f0 = ${f0.toFixed(2)}Hz  |  f_afast = ${fAfast.toFixed(2)}Hz`,
      '#38bdf8',
    );
  }
  ctx.restore();
}

function renderCoulombOverlay(
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
) {
  const q1 = num(h.scope, 'q1', 2);
  const q2 = num(h.scope, 'q2', -2);
  const d = Math.max(0.2, num(h.scope, 'd', 2.5));
  const F = (9 * Math.abs(q1 * q2)) / (d * d);
  const attract = q1 * q2 < 0;

  const bx = 16;
  const by = 16;
  const bw = 256;
  const bh = 96;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 10);
  ctx.fill();
  ctx.stroke();

  const cy = by + 58;
  const c1x = bx + 66;
  const c2x = bx + bw - 66;

  // Force arrows
  if (q1 !== 0 && q2 !== 0) {
    const dir = attract ? 1 : -1;
    drawVectorArrow(ctx, c1x + dir * 18, cy, c1x + dir * 46, cy, '#fbbf24');
    drawVectorArrow(ctx, c2x - dir * 18, cy, c2x - dir * 46, cy, '#fbbf24');
  }

  for (const [cx, q, lbl] of [
    [c1x, q1, 'q1'],
    [c2x, q2, 'q2'],
  ] as const) {
    ctx.fillStyle = q > 0 ? '#fb7185' : q < 0 ? '#38bdf8' : '#64748b';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 13px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(q > 0 ? '+' : q < 0 ? '−' : '0', cx, cy);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(`${lbl}=${q.toFixed(1)}`, cx, cy + 23);
  }

  ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = attract ? '#34d399' : '#fb7185';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(
    `${attract ? 'ATRAÇÃO' : 'REPULSÃO'} · F = ${F.toFixed(2)} mN`,
    bx + 12,
    by + 10,
  );
  ctx.restore();
}

function renderLorentzOverlay(
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
) {
  const q = num(h.scope, 'q', 1);
  const B = num(h.scope, 'B', 1.2);
  const Rc = num(h.scope, 'Rc', 2.5);

  ctx.save();
  // Subtle magnetic field symbols ⊗ across canvas
  ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.font = '14px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const step = 74;
  for (let x = 40; x < h.width; x += step) {
    for (let y = 40; y < h.height; y += step) {
      ctx.fillText('⊗', x, y);
    }
  }

  drawBadge(
    ctx,
    14,
    14,
    `B = ${B.toFixed(1)}T (⊗) · q ${q >= 0 ? '> 0 (anti-horário)' : '< 0 (horário)'} · Rc = ${Rc.toFixed(2)}m`,
    q >= 0 ? '#38bdf8' : '#f472b6',
  );
  ctx.restore();
}

function renderFaradayOverlay(
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
) {
  const N = num(h.scope, 'N', 2);
  const B = num(h.scope, 'B', 1.2);
  const A = num(h.scope, 'A', 1.0);
  const w = num(h.scope, 'w', 1.8);
  const t = num(h.scope, 't', 0);

  const angle = w * t;
  const emf = N * B * A * w * Math.sin(angle);
  const maxEmf = Math.max(0.1, N * B * A * w);
  const glow = Math.abs(emf) / maxEmf;

  const bx = 16;
  const by = 16;
  const bw = 250;
  const bh = 114;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 10);
  ctx.fill();
  ctx.stroke();

  // Magnet poles N & S
  ctx.fillStyle = '#fb7185';
  ctx.fillRect(bx + 14, by + 34, 24, 52);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(bx + 126, by + 34, 24, 52);
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 13px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', bx + 26, by + 60);
  ctx.fillText('S', bx + 138, by + 60);

  // Rotating coil in 2.5D perspective
  const cx = bx + 82;
  const cy = by + 60;
  const rx = Math.max(4, Math.abs(Math.cos(angle)) * 28);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, 24, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Glowing bulb driven by |emf(t)|
  const lx = bx + 204;
  const ly = by + 56;
  const bulbGrad = ctx.createRadialGradient(lx, ly, 2, lx, ly, 26);
  bulbGrad.addColorStop(0, `rgba(253, 224, 71, ${0.25 + glow * 0.75})`);
  bulbGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
  ctx.fillStyle = bulbGrad;
  ctx.beginPath();
  ctx.arc(lx, ly, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = glow > 0.15 ? '#fde047' : '#475569';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(lx, ly, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = '600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Gerador AC · ε(t) = ${emf.toFixed(2)} V`, bx + 12, by + 10);
  ctx.restore();
}

function renderPhotoelectricOverlay(
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
) {
  const hPl = num(h.scope, 'h', 4.14);
  const phi = num(h.scope, 'phi', 2.3);
  const fLight = num(h.scope, 'fLight', 0.85);
  const t = num(h.scope, 't', 0);
  const f0 = phi / hPl;
  const ec = hPl * fLight - phi;
  const emitting = ec > 0;

  // Map frequency (0.3 .. 1.6) to approximate photon color (red -> green -> blue -> violet)
  const hue = Math.min(285, Math.max(0, ((fLight - 0.35) / 1.1) * 285));
  const photonColor = `hsl(${hue}, 90%, 62%)`;

  const bx = 16;
  const by = 16;
  const bw = 266;
  const bh = 112;

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.strokeStyle = emitting ? '#34d399' : '#fb7185';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 10);
  ctx.fill();
  ctx.stroke();

  // Metal plate
  ctx.fillStyle = '#64748b';
  ctx.fillRect(bx + 18, by + 84, 150, 12);

  // Incoming animated photons hitting the metal plate
  for (let k = 0; k < 4; k++) {
    const u = ((t * 0.9 + k * 0.25) % 1);
    const px = bx + 26 + k * 24 + u * 26;
    const py = by + 34 + u * 50;
    ctx.fillStyle = photonColor;
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ejected electrons when f > f0 (speed proportional to sqrt(Ec))
  if (emitting) {
    const eSpeed = 0.6 + Math.sqrt(ec) * 0.55;
    for (let k = 0; k < 4; k++) {
      const u = ((t * eSpeed + k * 0.25) % 1);
      const ex = bx + 95 + k * 14 + u * 75;
      const ey = by + 82 - u * 44;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(ex, ey, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.font = '600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = emitting ? '#34d399' : '#fb7185';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(
    emitting
      ? `EMISSÃO ATIVA · Ec = ${ec.toFixed(2)} eV`
      : `BLOQUEADO (f=${fLight.toFixed(2)} < f₀=${f0.toFixed(2)})`,
    bx + 12,
    by + 10,
  );
  ctx.restore();
}

export function getPhysicsOverlay(experimentId: string) {
  switch (experimentId) {
    case 'projectile':
      return renderProjectileOverlay;
    case 'rotational':
      return renderRotationalOverlay;
    case 'inclined-plane':
      return renderInclinedPlaneOverlay;
    case 'kepler':
      return renderKeplerOverlay;
    case 'ideal-gas':
      return renderCarnotOverlay;
    case 'snell-optics':
      return renderSnellOverlay;
    case 'thin-lens':
      return renderThinLensOverlay;
    case 'doppler-wave':
      return renderDopplerOverlay;
    case 'coulomb-electrostatics':
      return renderCoulombOverlay;
    case 'lorentz-magnetism':
      return renderLorentzOverlay;
    case 'faraday-induction':
      return renderFaradayOverlay;
    case 'photoelectric':
      return renderPhotoelectricOverlay;
    default:
      return undefined;
  }
}
