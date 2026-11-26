import { defineExperiment } from './defineExperiment';

export const faradayInduction = defineExperiment({
  id: 'faraday-induction',
  year: 3,
  group: 'Magnetismo',
  title: 'Indução Eletromagnética (Faraday-Neumann & Lenz)',
  shortTitle: 'Faraday & Lenz',
  summary:
    'Uma espira girando com velocidade angular w em um campo B gera fluxo magnético Φ(t) = BA·cos(wt) e força eletromotriz induzida ε(t) = NBAw·sin(wt) — o princípio dos geradores elétricos.',
  keyFormulaTex:
    '\\Phi(t) = BA\\cos(\\omega t), \\quad \\varepsilon(t) = -N\\frac{d\\Phi}{dt} = NBA\\omega\\sin(\\omega t)',
  legendItems: [
    { label: 'Fluxo Magnético Φ(x)', color: '#38bdf8' },
    { label: 'FEM Induzida ε(x)', color: '#fbbf24' },
  ],
  formulas: [
    { raw: 'y = B * A * cos(w * x - w * t)', color: '#38bdf8' },
    { raw: 'y = N * B * A * w * sin(w * x - w * t)', color: '#fbbf24' },
  ],
  parameters: {
    N: { value: 2, min: 1, max: 6, step: 1 },
    B: { value: 1.2, min: 0.2, max: 3, step: 0.1 },
    A: { value: 1.0, min: 0.2, max: 3, step: 0.1 },
    w: { value: 1.8, min: 0.4, max: 4.5, step: 0.1 },
  },
  viewport: { centerX: 0, centerY: 0, scale: 56 },
  theory: {
    intuition: [
      'A Lei de Faraday-Neumann revela que não basta haver campo magnético para gerar eletricidade: é preciso que o fluxo magnético VARIE no tempo! Girar uma espira dentro de um campo B faz o fluxo oscilar como um cosseno.',
      'Como a tensão induzida ε é a taxa de variação (derivada negativa) do fluxo, ela nasce como um seno defasado em 90°: quando o fluxo passa por zero (variando mais rápido), a tensão gerada é máxima!',
    ],
    equations: [
      {
        latex: '\\Phi(t) = B A \\cos(\\omega t)',
        note: 'Fluxo magnético atravessando cada espira.',
      },
      {
        latex: '\\varepsilon(t) = -N\\frac{d\\Phi}{dt} = N B A \\omega \\sin(\\omega t)',
        note: 'Tensão alternada gerada (Lei de Faraday-Lenz).',
      },
    ],
    variables: [
      { symbol: 'N', name: 'Número de espiras da bobina', unit: 'espiras' },
      { symbol: 'B', name: 'Campo magnético', unit: 'T' },
      { symbol: 'A', name: 'Área da espira', unit: 'm²' },
      { symbol: 'w', name: 'Velocidade de rotação ω', unit: 'rad/s' },
    ],
    observations: [
      'Repare que onde a curva azul Φ(x) cruza zero, a curva amarela ε(x) atinge seu pico máximo!',
      'Aumentar a velocidade de rotação w aumenta tanto a frequência quanto a amplitude da tensão gerada.',
    ],
    scenarios: [
      {
        id: 'far-fast',
        label: 'Turbina Rápida (w = 3.5 rad/s)',
        description: 'Dobrar a rotação dobra a tensão de pico induzida.',
        params: { N: 2, B: 1.2, A: 1.0, w: 3.5 },
      },
      {
        id: 'far-coil',
        label: 'Bobina com 5 Espiras',
        description: 'Multiplica a FEM induzida proporcionalmente a N.',
        params: { N: 5, B: 1.0, A: 1.0, w: 1.5 },
      },
    ],
    commonPitfall:
      'Um campo magnético muito forte, mas ESTÁTICO (sem variação de fluxo), induz tensão ZERO na espira!',
  },
  draw(ctx, _h, vals) {
    const N = vals.N;
    const B = vals.B;
    const A = vals.A;
    const w = vals.w;
    const t = vals.t;

    const angle = w * t;
    const emf = N * B * A * w * Math.sin(angle);
    const maxEmf = Math.max(0.1, N * B * A * w);
    const glow = Math.abs(emf) / maxEmf;

    const bx = 16;
    const by = 16;
    const bw = 250;
    const bh = 114;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#334155';
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
  },
});
