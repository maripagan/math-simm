import { drawBadge, drawLightPulses, drawVectorArrow } from './draw';
import { defineExperiment } from './defineExperiment';

export const snellOptics = defineExperiment({
  id: 'snell-optics',
  year: 2,
  group: 'Óptica',
  title: 'Óptica Geométrica — Lei de Snell & Reflexão Total',
  shortTitle: 'Refração (Snell)',
  summary:
    'Arraste o laser diretamente no gráfico para mudar o ângulo θ1 ou inverter a direção (de cima para baixo ou de baixo para cima). Observe o cone crítico e os pulsos de luz mudando de velocidade!',
  keyFormulaTex:
    'n_1\\sin\\theta_1 = n_2\\sin\\theta_2, \\quad \\sin\\theta_L = \\frac{n_{\\text{menor}}}{n_{\\text{maior}}}',
  legendItems: [
    { label: 'Raio Incidente (Arraste!)', color: '#fbbf24' },
    { label: 'Raio Refratado', color: '#38bdf8' },
    { label: 'Refletido / Cone Crítico', color: '#f472b6' },
  ],
  formulas: [{ raw: 'y <= 0', color: '#1e3a5f' }],
  parameters: {
    n1: { value: 1.0, min: 1.0, max: 2.4, step: 0.05 },
    n2: { value: 1.5, min: 1.0, max: 2.4, step: 0.05 },
    ang1: { value: 0.65, min: 0.05, max: 1.48, step: 0.03 },
    dir: { value: 1, min: -1, max: 1, step: 2 },
  },
  viewport: { centerX: 0, centerY: 0, scale: 68 },
  theory: {
    intuition: [
      'Quando a luz muda de meio óptico (ex: ar para água ou vidro para ar), sua velocidade muda e o raio desvia conforme a Lei de Snell-Descartes.',
      'Ao passar de um meio mais refringente (n1 > n2) para um menos refringente, o raio se afasta da normal. Se o ângulo de incidência ultrapassar o ângulo limite θL, toda a luz é refletida de volta — princípio das fibras ópticas!',
    ],
    equations: [
      {
        latex: 'n_1\\sin\\theta_1 = n_2\\sin\\theta_2',
        note: 'Lei de Snell-Descartes da refração.',
      },
      {
        latex: '\\theta_L = \\arcsin\\left(\\frac{n_2}{n_1}\\right) \\quad (n_1 > n_2)',
        note: 'Ângulo limite para ocorrer Reflexão Interna Total.',
      },
    ],
    variables: [
      { symbol: 'n1', name: 'Índice de refração do meio superior', unit: 'adim.' },
      { symbol: 'n2', name: 'Índice de refração do meio inferior', unit: 'adim.' },
      { symbol: 'ang1', name: 'Ângulo de incidência θ₁ (com a normal)', unit: 'rad' },
    ],
    observations: [
      'Os ângulos são sempre medidos em relação à reta Normal (vertical tracejada), nunca em relação à superfície!',
      'Com n1 = 1.5 (vidro) e n2 = 1.0 (ar), o ângulo limite é ≈ 41.8° (0.73 rad). Passe disso e veja o raio refratado desaparecer!',
    ],
    scenarios: [
      {
        id: 'snell-air-water',
        label: 'De Cima → Baixo: Ar para Água (n1=1, n2=1.33)',
        description: 'Luz desacelera ao entrar na água e se aproxima da normal.',
        params: { n1: 1.0, n2: 1.33, ang1: 0.85, dir: 1 },
      },
      {
        id: 'snell-underwater',
        label: 'De Baixo → Cima: Mergulhador olhando o céu',
        description: 'Luz sai da água (n2=1.33) para o ar (n1=1.0) e se afasta da normal.',
        params: { n1: 1.0, n2: 1.33, ang1: 0.55, dir: -1 },
      },
      {
        id: 'snell-tir',
        label: 'Reflexão Interna Total (Baixo → Cima)',
        description: 'Vidro (1.5) → Ar (1.0) acima do cone crítico θL ≈ 41.8°.',
        params: { n1: 1.0, n2: 1.5, ang1: 0.95, dir: -1 },
      },
    ],
    commonPitfall:
      'Reflexão Interna Total SÓ pode acontecer quando a luz tenta passar de um meio de MAIOR índice (n1) para um de MENOR índice (n2).',
  },
  draw(ctx, h, vals) {
    const n1 = Math.max(1, vals.n1);
    const n2 = Math.max(1, vals.n2);
    const ang1 = Math.min(1.5, Math.max(0.03, vals.ang1));
    const dir = vals.dir >= 0 ? 1 : -1; // 1: top->bottom, -1: bottom->top
    const t = vals.t;

    const nInc = dir === 1 ? n1 : n2;
    const nTrans = dir === 1 ? n2 : n1;

    const ox = h.toScreenX(0);
    const oy = h.toScreenY(0);
    const rayLen = Math.min(h.width, h.height) * 0.42;

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

    // Draggable laser handle at incident tip
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(ix, iy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Reflected ray
    const rx = ox + Math.sin(ang1) * rayLen;
    const ry = oy - dir * Math.cos(ang1) * rayLen;

    const sin2 = (nInc / nTrans) * Math.sin(ang1);
    const deg1 = (ang1 * 180) / Math.PI;
    const dirLabel = dir === 1 ? 'Cima→Baixo' : 'Baixo→Cima';

    if (Math.abs(sin2) > 1) {
      drawVectorArrow(ctx, ox, oy, rx, ry, '#f472b6', 'Reflexão Total!');
      drawLightPulses(ctx, ox, oy, rx, ry, t, 110 / nInc, '#fbcfe8');
      const critDeg = (Math.asin(nTrans / nInc) * 180) / Math.PI;
      drawBadge(
        ctx,
        14,
        14,
        `${dirLabel} · REFLEXÃO TOTAL · θ₁=${deg1.toFixed(1)}° > θL=${critDeg.toFixed(1)}°`,
        '#f472b6',
      );
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
      drawBadge(
        ctx,
        14,
        14,
        `${dirLabel} · θ₁=${deg1.toFixed(1)}° → θ₂=${deg2.toFixed(1)}° (arraste o ponto amarelo)`,
        '#38bdf8',
      );
    }
    ctx.restore();
  },
  drag(wx, wy) {
    if (wx > -0.1) return null;
    return { ang1: Math.atan2(-wx, Math.abs(wy)), dir: wy >= 0 ? 1 : -1 };
  },
});
