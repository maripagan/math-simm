import { drawVectorArrow } from './draw';
import { defineExperiment } from './defineExperiment';

export const inclinedPlane = defineExperiment({
  id: 'inclined-plane',
  year: 1,
  group: 'Dinâmica',
  title: 'Plano Inclinado, Leis de Newton & Atrito',
  shortTitle: 'Plano Inclinado',
  summary:
    'Veja a decomposição do Peso (Px e Py), a Normal N e a força de atrito fat em um plano inclinado de ângulo ang, e a curva de deslocamento resultante s(x).',
  keyFormulaTex:
    'F_R = mg(\\sin\\theta - \\mu\\cos\\theta), \\quad a = g(\\sin\\theta - \\mu\\cos\\theta)',
  legendItems: [
    { label: 'Deslocamento s(x)', color: '#38bdf8' },
    { label: 'Peso P & Componentes', color: '#fbbf24' },
    { label: 'Normal N & Atrito fat', color: '#f472b6' },
  ],
  formulas: [
    { raw: 'aNet = max(0, g * (sin(ang) - mu * cos(ang)))', color: '#94a3b8' },
    { raw: 'y = 0.5 * aNet * x^2', color: '#38bdf8' },
  ],
  parameters: {
    m: { value: 4, min: 1, max: 15, step: 0.5 },
    ang: { value: 0.55, min: 0.1, max: 1.25, step: 0.05 },
    mu: { value: 0.25, min: 0, max: 1.0, step: 0.05 },
    g: { value: 9.8, min: 1.6, max: 15, step: 0.2 },
  },
  viewport: { centerX: 2.5, centerY: 2.5, scale: 52 },
  theory: {
    intuition: [
      'Em um plano inclinado de ângulo θ, o peso P = m·g se divide em duas componentes: Px = P·sen(θ) (que puxa o bloco rampa abaixo) e Py = P·cos(θ) (que pressiona o bloco contra a superfície e é equilibrada pela Normal N).',
      'O atrito se opõe ao escorregamento com força máxima fat = μ·N = μ·m·g·cos(θ). O bloco só desliza se tan(θ) > μ — note que a massa m se cancela na aceleração!',
    ],
    equations: [
      {
        latex: 'P_x = mg\\sin\\theta, \\quad N = P_y = mg\\cos\\theta',
        note: 'Decomposição do peso paralelo e perpendicular à rampa.',
      },
      {
        latex: 'f_{at} = \\mu N = \\mu mg\\cos\\theta',
        note: 'Força de atrito cinético/máximo estático.',
      },
      {
        latex: 'a = g(\\sin\\theta - \\mu\\cos\\theta)',
        note: 'Aceleração de descida pela 2ª Lei de Newton (F_R = m·a).',
      },
    ],
    variables: [
      { symbol: 'm', name: 'Massa do bloco', unit: 'kg' },
      { symbol: 'ang', name: 'Ângulo da rampa θ', unit: 'rad' },
      { symbol: 'mu', name: 'Coeficiente de atrito μ', unit: 'adim.' },
      { symbol: 'aNet', name: 'Aceleração resultante', unit: 'm/s²' },
    ],
    observations: [
      'Aumente μ até aNet zerar: o bloco fica em equilíbrio estático (tan θ ≤ μ).',
      'Altere a massa m e note que as forças crescem, mas a aceleração aNet não muda!',
    ],
    scenarios: [
      {
        id: 'inc-ice',
        label: 'Sem Atrito (Gelo, μ = 0)',
        description: 'Aceleração pura a = g·sen(θ).',
        params: { m: 4, ang: 0.52, mu: 0, g: 9.8 },
        resetTime: true,
      },
      {
        id: 'inc-stuck',
        label: 'Equilíbrio Estático (Trava)',
        description: 'Atrito alto impede o bloco de descer (aNet = 0).',
        params: { m: 4, ang: 0.35, mu: 0.6, g: 9.8 },
        resetTime: true,
      },
    ],
    commonPitfall:
      'A força Normal NÃO é sempre igual ao Peso! No plano inclinado, N = m·g·cos(θ), que é sempre menor que m·g.',
  },
  draw(ctx, _h, vals) {
    const m = vals.m;
    const ang = vals.ang;
    const mu = vals.mu;
    const g = vals.g;
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
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#334155';
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
    const t = vals.t;
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
  },
});
