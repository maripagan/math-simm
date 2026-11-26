import { drawVectorArrow } from './draw';
import { defineExperiment } from './defineExperiment';

export const coulombElectrostatics = defineExperiment({
  id: 'coulomb-electrostatics',
  year: 3,
  group: 'Eletrostática',
  title: 'Lei de Coulomb & Potencial Elétrico',
  shortTitle: 'Lei de Coulomb',
  summary:
    'Veja a força eletrostática F(r) cair com 1/r² e observe as cargas q1 e q2 se atraindo (sinais opostos) ou repelindo (mesmo sinal) no diagrama ao vivo.',
  keyFormulaTex:
    'F(r) = k\\frac{|q_1 q_2|}{r^2}, \\quad V(r) = \\frac{k q_1}{r}',
  legendItems: [
    { label: 'Força F(r) (k·|q1·q2|/x²)', color: '#38bdf8' },
    { label: 'Potencial V(x) de q1', color: '#f472b6' },
    { label: 'Distância atual d', color: '#fbbf24' },
  ],
  formulas: [
    { raw: 'y = (9 * abs(q1 * q2)) / (x^2)', color: '#38bdf8' },
    { raw: 'y = (9 * q1) / abs(x)', color: '#f472b6' },
    { raw: 'x = d', color: '#fbbf24' },
  ],
  parameters: {
    q1: { value: 2, min: -5, max: 5, step: 0.5 },
    q2: { value: -2, min: -5, max: 5, step: 0.5 },
    d: { value: 2.5, min: 0.8, max: 6, step: 0.1 },
  },
  viewport: { centerX: 2.5, centerY: 3, scale: 52 },
  theory: {
    intuition: [
      'A Lei de Coulomb descreve a interação entre cargas elétricas em repouso: cargas de mesmo sinal se repelem e cargas de sinais opostos se atraem.',
      'Assim como a gravitação, a força cai com o inverso do quadrado da distância (1/r²): dobrar a distância reduz a força a 1/4 do valor original!',
    ],
    equations: [
      {
        latex: 'F = k_0\\frac{|q_1 q_2|}{d^2}',
        note: 'Lei de Coulomb (k₀ ≈ 9×10⁹ N·m²/C² no vácuo).',
      },
      {
        latex: 'E = \\frac{k_0 |q|}{d^2}, \\quad V = \\frac{k_0 q}{d}',
        note: 'Campo elétrico (vetorial) e Potencial elétrico (escalar).',
      },
    ],
    variables: [
      { symbol: 'q1', name: 'Carga elétrica 1 (em μC)', unit: 'μC' },
      { symbol: 'q2', name: 'Carga elétrica 2 (em μC)', unit: 'μC' },
      { symbol: 'd', name: 'Distância entre as cargas', unit: 'm' },
    ],
    observations: [
      'Inverta o sinal de q2 (de negativo para positivo) e veja as setas no card visual mudarem de Atração para Repulsão!',
    ],
    scenarios: [
      {
        id: 'coul-attract',
        label: 'Atração (Dipolo +2 / -2)',
        description: 'Cargas opostas se puxam com forças iguais e contrárias.',
        params: { q1: 2, q2: -2, d: 2.2 },
      },
      {
        id: 'coul-repel',
        label: 'Repulsão Forte (+4 / +3)',
        description: 'Mesmo sinal: setas apontam para fora e força dispara de perto.',
        params: { q1: 4, q2: 3, d: 1.5 },
      },
    ],
    commonPitfall:
      'Mesmo que q1 seja 10 vezes maior que q2, a força que q1 faz em q2 tem EXATAMENTE o mesmo módulo da força que q2 faz em q1 (3ª Lei de Newton)!',
  },
  draw(ctx, _h, vals) {
    const q1 = vals.q1;
    const q2 = vals.q2;
    const d = Math.max(0.2, vals.d);
    const F = (9 * Math.abs(q1 * q2)) / (d * d);
    const attract = q1 * q2 < 0;

    const bx = 16;
    const by = 16;
    const bw = 256;
    const bh = 96;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#334155';
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
  },
});
