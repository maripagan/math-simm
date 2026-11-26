import { drawBadge } from './draw';
import { defineExperiment } from './defineExperiment';

export const lorentzMagnetism = defineExperiment({
  id: 'lorentz-magnetism',
  year: 3,
  group: 'Magnetismo',
  title: 'Força Magnética de Lorentz (Movimento Ciclotrônico)',
  shortTitle: 'Força de Lorentz',
  summary:
    'Uma carga q lançada perpendicularmente a um campo magnético uniforme B descreve um círculo de raio R = mv/(|q|B) com frequência ciclotrônica ω = qB/m.',
  keyFormulaTex:
    'F_B = |q|vB, \\quad R = \\frac{m v}{|q| B}, \\quad \\omega_c = \\frac{q B}{m}',
  legendItems: [
    { label: 'Órbita Ciclotrônica z(t)', color: '#38bdf8' },
    { label: 'Campo Magnético B (⊗ / ⊙)', color: '#64748b' },
    { label: 'Força Magnética FB', color: '#f472b6' },
  ],
  formulas: [
    { raw: 'Rc = (m * v) / (abs(q) * B)', color: '#94a3b8' },
    { raw: 'wc = (q * B) / m', color: '#94a3b8' },
    { raw: 'z(t) = Rc * e^(i * wc * t)', color: '#38bdf8' },
  ],
  parameters: {
    q: { value: 1, min: -3, max: 3, step: 0.5 },
    m: { value: 1.5, min: 0.5, max: 5, step: 0.2 },
    v: { value: 2.5, min: 0.5, max: 6, step: 0.2 },
    B: { value: 1.2, min: 0.4, max: 4, step: 0.2 },
  },
  viewport: { centerX: 0, centerY: 0, scale: 62 },
  theory: {
    intuition: [
      'A Força Magnética (F = q·v×B) é sempre perpendicular à velocidade da partícula. Por isso, ela NÃO realiza trabalho nem altera o módulo da velocidade — apenas curva a trajetória em um círculo perfeito (princípio dos aceleradores cíclotrons e espectrômetros de massa)!',
      'Inverter o sinal da carga q (de positiva para negativa) inverte imediatamente o sentido de rotação.',
    ],
    equations: [
      {
        latex: 'F_B = |q| v B \\sin\\theta',
        note: 'Módulo da força magnética sobre carga em movimento.',
      },
      {
        latex: 'R = \\frac{m v}{|q| B}, \\quad T = \\frac{2\\pi m}{|q| B}',
        note: 'Raio da órbita e período ciclotrônico (independe da velocidade v!).',
      },
    ],
    variables: [
      { symbol: 'q', name: 'Carga da partícula (sinal define sentido)', unit: 'C' },
      { symbol: 'm', name: 'Massa da partícula', unit: 'kg' },
      { symbol: 'v', name: 'Velocidade de entrada', unit: 'm/s' },
      { symbol: 'B', name: 'Campo magnético uniforme', unit: 'T' },
    ],
    observations: [
      'Mude q de +1 para -1 e observe o sentido da órbita inverter pela Regra da Mão Direita!',
      'Aumente o campo B e note o raio Rc encolher enquanto a partícula gira mais rápido.',
    ],
    scenarios: [
      {
        id: 'lor-pos',
        label: 'Próton (q > 0, sentido anti-horário)',
        description: 'Carga positiva curvada pelo campo magnético.',
        params: { q: 1, m: 1.5, v: 2.5, B: 1.2 },
        resetTime: true,
      },
      {
        id: 'lor-neg',
        label: 'Elétron (q < 0, inverte rotação)',
        description: 'Carga negativa gira no sentido oposto com raio menor.',
        params: { q: -1.5, m: 0.8, v: 2.5, B: 1.2 },
        resetTime: true,
      },
    ],
    commonPitfall:
      'A força magnética NUNCA acelera ou freia uma partícula em módulo (trabalho = 0); além disso, se a carga estiver parada (v = 0), a força magnética é zero!',
  },
  draw(ctx, h, vals) {
    const q = vals.q;
    const B = vals.B;
    const Rc =
      q !== 0 && B !== 0 ? (vals.m * vals.v) / (Math.abs(q) * B) : Infinity;

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
      `B = ${B.toFixed(1)}T (⊗) · q ${q >= 0 ? '> 0 (anti-horário)' : '< 0 (horário)'} · Rc = ${Number.isFinite(Rc) ? Rc.toFixed(2) : '∞'}m`,
      q >= 0 ? '#38bdf8' : '#f472b6',
    );
    ctx.restore();
  },
});
