import { drawBadge } from './draw';
import { defineExperiment } from './defineExperiment';

export const kepler = defineExperiment({
  id: 'kepler',
  year: 1,
  group: 'Gravitação',
  title: 'Lei Gravitacional — Órbitas de Kepler',
  shortTitle: 'Órbitas (Kepler)',
  summary:
    'Solução analítica das órbitas gravitacionais com o Sol no foco (0, 0). Altere a excentricidade ecc: 0 = círculo, 0..1 = elipse, >1 = hipérbole.',
  keyFormulaTex:
    'r(\\theta) = \\frac{a(1 - \\varepsilon^2)}{1 + \\varepsilon\\cos\\theta}',
  legendItems: [
    { label: 'Órbita & Planeta', color: '#38bdf8' },
    { label: 'Estrela / Foco (0, 0)', color: '#fbbf24' },
    { label: 'Periélio & Afélio', color: '#34d399' },
  ],
  formulas: [
    { raw: 'p = a * abs(1 - ecc^2)', color: '#94a3b8' },
    { raw: 'z(t) = (p / (1 + ecc * cos(t))) * e^(i * t)', color: '#38bdf8' },
  ],
  parameters: {
    a: { value: 3.4, min: 1.2, max: 6, step: 0.1 },
    ecc: { value: 0.58, min: 0, max: 1.35, step: 0.04 },
  },
  viewport: { centerX: -1.2, centerY: 0, scale: 60 },
  theory: {
    intuition: [
      'A 1ª Lei de Kepler afirma que planetas descrevem órbitas elípticas com o Sol em um dos focos. Newton provou que isso decorre da força gravitacional cair com 1/r².',
    ],
    equations: [
      {
        latex: 'F = G\\frac{Mm}{r^2}, \\quad r(\\theta) = \\frac{p}{1 + \\varepsilon\\cos\\theta}',
        note: 'Gravitação Universal e equação polar das cônicas.',
      },
    ],
    variables: [
      { symbol: 'a', name: 'Semieixo maior da órbita', unit: 'UA' },
      { symbol: 'ecc', name: 'Excentricidade orbital ε', unit: 'adim.' },
    ],
    observations: [
      'Veja o Sol em (0, 0) ficar fora do centro da elipse conforme ecc aumenta.',
    ],
    scenarios: [
      {
        id: 'kep-circle',
        label: 'Órbita Circular (ε = 0)',
        description: 'Periélio e Afélio ficam iguais ao raio a.',
        params: { a: 3.0, ecc: 0 },
      },
      {
        id: 'kep-comet',
        label: 'Elipse Excêntrica (ε = 0.72)',
        description: 'Órbita alongada típica de cometas periódicos.',
        params: { a: 3.6, ecc: 0.72 },
      },
      {
        id: 'kep-hyper',
        label: 'Passagem Hiperbólica (ε = 1.25)',
        description: 'Trajetória aberta de escape.',
        params: { a: 2.5, ecc: 1.25 },
      },
    ],
    commonPitfall:
      'As estações do ano na Terra NÃO vêm da distância ao Sol, mas da inclinação de 23,5° do eixo terrestre!',
  },
  draw(ctx, h, vals) {
    const a = Math.max(0.2, vals.a);
    const ecc = Math.max(0, vals.ecc);
    const p = a * Math.abs(1 - ecc * ecc);

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

    const rPeri = p / (1 + ecc);
    const sxPeri = h.toScreenX(rPeri);
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(sxPeri, oy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Periélio (${rPeri.toFixed(2)})`, sxPeri + 6, oy + 8);

    if (ecc < 0.98) {
      const rAph = p / (1 - ecc);
      const sxAph = h.toScreenX(-rAph);
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(sxAph, oy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = 'right';
      ctx.fillText(`Afélio (${rAph.toFixed(2)})`, sxAph - 6, oy + 8);
    }

    let orbitType = 'Elipse (0 < ε < 1)';
    if (ecc < 0.03) orbitType = 'Círculo (ε ≈ 0)';
    else if (Math.abs(ecc - 1) <= 0.03) orbitType = 'Parábola (ε ≈ 1)';
    else if (ecc > 1.03) orbitType = 'Hipérbole (ε > 1)';
    drawBadge(ctx, 14, 14, `Órbita: ${orbitType}`);
    ctx.restore();
  },
});
