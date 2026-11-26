import { CanvasOverlayHelpers } from '../../../types';
import { defineExperiment } from './defineExperiment';

const WALL_X = 40;
const WALL_HEIGHT = 15;
const TARGET_X = 80;
const TARGET_TOLERANCE = 3;

function drawWallAndTarget(
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
) {
  const baseY = h.toScreenY(0);
  const wx = h.toScreenX(WALL_X);
  const wyTop = h.toScreenY(WALL_HEIGHT);
  ctx.save();
  ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
  ctx.strokeStyle = '#fb7185';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.rect(wx - 6, wyTop, 12, Math.max(4, baseY - wyTop));
  ctx.fill();
  ctx.stroke();

  ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = '#fda4af';
  ctx.textAlign = 'center';
  ctx.fillText(`Muro ${WALL_HEIGHT}m`, wx, wyTop - 8);

  const txLeft = h.toScreenX(TARGET_X - TARGET_TOLERANCE);
  const txRight = h.toScreenX(TARGET_X + TARGET_TOLERANCE);
  const txCenter = h.toScreenX(TARGET_X);
  ctx.fillStyle = 'rgba(52, 211, 153, 0.35)';
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.rect(txLeft, baseY - 10, Math.max(10, txRight - txLeft), 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#6ee7b7';
  ctx.fillText(`Alvo ${TARGET_X}m`, txCenter, baseY - 16);
  ctx.restore();
}

export const projectile = defineExperiment({
  id: 'projectile',
  year: 1,
  group: 'Cinemática',
  title: 'Lançamento Oblíquo (Projétil)',
  shortTitle: 'Projétil (2D)',
  summary:
    'Combina MRU na horizontal com MRUV na vertical sob gravidade g. Ajuste a velocidade inicial v0 e o ângulo (rad) para observar alcance R e altura máxima H.',
  keyFormulaTex:
    'x(t) = v_0\\cos(\\theta)t, \\quad y(t) = v_0\\sin(\\theta)t - \\tfrac{1}{2}gt^2',
  legendItems: [
    { label: 'Trajetória & Partícula', color: '#38bdf8' },
    { label: 'Vetor Velocidade v', color: '#fbbf24' },
    { label: 'Altura Máx (H) & Alcance (R)', color: '#34d399' },
  ],
  formulas: [
    {
      raw: 'p(t) = (v0 * cos(ang) * t, v0 * sin(ang) * t - 0.5 * g * t^2)',
      color: '#38bdf8',
    },
    { raw: 'y <= 0', color: '#334155' },
  ],
  parameters: {
    v0: { value: 12, min: 3, max: 35, step: 0.5 },
    ang: { value: 0.9, min: 0.15, max: 1.45, step: 0.05 },
    g: { value: 9.8, min: 1.6, max: 20, step: 0.2 },
  },
  viewport: { centerX: 6.5, centerY: 3.2, scale: 38 },
  theory: {
    intuition: [
      'No lançamento oblíquo (sem resistência do ar), o movimento em 2D se decompõe em dois movimentos independentes: MU na horizontal e MUV na vertical sob gravidade g.',
      'A combinação gera uma parábola perfeita cujo alcance máximo ocorre em 45° (π/4 ≈ 0,785 rad).',
    ],
    equations: [
      {
        latex: 'x(t) = v_0\\cos(\\theta)\\,t, \\quad y(t) = v_0\\sin(\\theta)\\,t - \\tfrac{1}{2}gt^2',
        note: 'Equações paramétricas do lançamento oblíquo.',
      },
      {
        latex: 'H_{\\max} = \\frac{(v_0\\sin\\theta)^2}{2g}, \\quad R = \\frac{v_0^2\\sin(2\\theta)}{g}',
        note: 'Altura máxima e alcance horizontal no mesmo nível.',
      },
    ],
    variables: [
      { symbol: 'v0', name: 'Velocidade inicial de lançamento', unit: 'm/s' },
      { symbol: 'ang', name: 'Ângulo de lançamento θ', unit: 'rad' },
      { symbol: 'g', name: 'Aceleração da gravidade', unit: 'm/s²' },
    ],
    observations: [
      'O vetor velocidade amarelo é sempre tangente à curva e fica horizontal no topo.',
      'Ângulos complementares (ex: 30° e 60°) geram o mesmo alcance R.',
    ],
    scenarios: [
      {
        id: 'proj-45',
        label: 'Ângulo de 45° (Alcance Máximo)',
        description: 'Define ang ≈ 0.785 rad com g = 9.8 m/s².',
        params: { v0: 12, ang: 0.785, g: 9.8 },
        resetTime: true,
      },
      {
        id: 'proj-moon',
        label: 'Gravidade Lunar (1.6 m/s²)',
        description: 'Veja como o alcance e a altura crescem na Lua.',
        params: { v0: 8, ang: 0.785, g: 1.6 },
        resetTime: true,
      },
    ],
    commonPitfall:
      'Na altura máxima, vy = 0, mas a velocidade total NÃO é zero (resta vx = v0·cos θ) e a aceleração continua sendo g para baixo!',
  },
  draw(ctx, h, vals) {
    const v0 = vals.v0;
    const ang = vals.ang;
    const g = Math.max(0.1, vals.g);

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
  },
  restartAt(vals) {
    const g = Math.max(0.1, vals.g);
    const tFlight = (2 * vals.v0 * Math.sin(vals.ang)) / g;
    return tFlight > 0.2 ? tFlight + 0.6 : null;
  },
  challenge: {
    viewport: { centerX: 44, centerY: 16, scale: 8.5 },
    draw: drawWallAndTarget,
  },
});
