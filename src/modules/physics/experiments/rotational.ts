import { drawVectorArrow } from './draw';
import { defineExperiment } from './defineExperiment';

export const rotational = defineExperiment({
  id: 'rotational',
  year: 1,
  group: 'Cinemática',
  title: 'Movimento Rotacional (MCU & MCUV)',
  shortTitle: 'Rotacional (MCU)',
  summary:
    'Um ponto gira em um disco de raio R com velocidade angular w0 e aceleração angular alpha. Veja o arco θ(t), a velocidade tangencial v e a aceleração centrípeta ac.',
  keyFormulaTex:
    '\\theta(t) = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2, \\quad z(t) = R\\,e^{i\\theta(t)}',
  legendItems: [
    { label: 'Raio & Posição z(t)', color: '#38bdf8' },
    { label: 'Velocidade Tangencial v', color: '#34d399' },
    { label: 'Aceleração Centrípeta ac', color: '#f472b6' },
  ],
  formulas: [
    { raw: 'theta = w0 * t + 0.5 * alpha * t^2', color: '#94a3b8' },
    { raw: 'z(t) = R * e^(i * theta)', color: '#38bdf8' },
    { raw: 'y = R * sin(w0 * x)', color: '#34d399' },
  ],
  parameters: {
    R: { value: 2.6, min: 0.8, max: 5, step: 0.1 },
    w0: { value: 1.4, min: 0, max: 5, step: 0.1 },
    alpha: { value: 0.2, min: -1.5, max: 1.5, step: 0.05 },
  },
  viewport: { centerX: 0, centerY: 0, scale: 68 },
  theory: {
    intuition: [
      'No Movimento Circular, mesmo com rapidez constante (α = 0), a direção da velocidade muda continuamente — exigindo a aceleração centrípeta ac apontando sempre para o centro.',
    ],
    equations: [
      {
        latex: '\\theta(t) = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2',
        note: 'Posição angular em radianos.',
      },
      {
        latex: 'v = \\omega R, \\quad a_c = \\frac{v^2}{R} = \\omega^2 R',
        note: 'Velocidade tangencial e aceleração centrípeta.',
      },
    ],
    variables: [
      { symbol: 'R', name: 'Raio da trajetória', unit: 'm' },
      { symbol: 'w0', name: 'Velocidade angular inicial ω₀', unit: 'rad/s' },
      { symbol: 'alpha', name: 'Aceleração angular α', unit: 'rad/s²' },
    ],
    observations: [
      'A seta verde (v) é sempre perpendicular ao raio; a rosa (ac) aponta sempre para o centro.',
    ],
    scenarios: [
      {
        id: 'rot-mcu',
        label: 'MCU Puro (α = 0)',
        description: 'Velocidade angular constante.',
        params: { R: 2.6, w0: 1.8, alpha: 0 },
        resetTime: true,
      },
      {
        id: 'rot-accel',
        label: 'Partida Acelerada (α > 0)',
        description: 'Parte do repouso ganhando rapidez angular.',
        params: { R: 2.8, w0: 0, alpha: 0.6 },
        resetTime: true,
      },
    ],
    commonPitfall:
      'A aceleração centrípeta NÃO muda o módulo da velocidade; ela muda apenas sua direção!',
  },
  draw(ctx, h, vals) {
    const R = Math.max(0.1, vals.R);
    const w0 = vals.w0;
    const alpha = vals.alpha;
    const t = vals.t;
    const theta = w0 * t + 0.5 * alpha * t * t;
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
  },
});
