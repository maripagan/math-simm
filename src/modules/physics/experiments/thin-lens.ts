import { drawBadge, drawVectorArrow } from './draw';
import { defineExperiment } from './defineExperiment';

export const thinLens = defineExperiment({
  id: 'thin-lens',
  year: 2,
  group: 'Óptica',
  title: 'Lentes Esféricas (Equação de Gauss)',
  shortTitle: 'Lentes (Gauss)',
  summary:
    'Mova o objeto (p) e a distância focal (f) para ver os raios notáveis desenharem a imagem real/virtual, invertida/direita e o aumento linear transversal A.',
  keyFormulaTex:
    '\\frac{1}{f} = \\frac{1}{p} + \\frac{1}{p\'}, \\quad A = -\\frac{p\'}{p}',
  legendItems: [
    { label: 'Objeto (altura h)', color: '#34d399' },
    { label: 'Imagem formada', color: '#f472b6' },
    { label: 'Raios Notáveis', color: '#fbbf24' },
  ],
  formulas: [
    { raw: 'x = 0', color: '#38bdf8' },
    { raw: 'pImg = (p * f) / (p - f)', color: '#94a3b8' },
    { raw: 'A = -pImg / p', color: '#f472b6' },
  ],
  parameters: {
    f: { value: 2.0, min: -4.0, max: 4.0, step: 0.2 },
    p: { value: 4.2, min: 0.6, max: 7.5, step: 0.2 },
    hObj: { value: 1.6, min: 0.5, max: 3.0, step: 0.1 },
  },
  viewport: { centerX: 0, centerY: 0, scale: 62 },
  theory: {
    intuition: [
      'Lentes convergentes (f > 0) concentram raios paralelos no foco F′. Dependendo da distância p do objeto até a lente, a imagem pode ser real e invertida (p > f) ou virtual, direita e ampliada — como em uma lupa (p < f)!',
      'Lentes divergentes (f < 0) sempre formam imagens virtuais, direitas e menores que o objeto.',
    ],
    equations: [
      {
        latex: '\\frac{1}{f} = \\frac{1}{p} + \\frac{1}{p\'} \\implies p\' = \\frac{p \\cdot f}{p - f}',
        note: 'Equação de Gauss para lentes delgadas.',
      },
      {
        latex: 'A = \\frac{i}{o} = -\\frac{p\'}{p}',
        note: 'Aumento linear transversal (negativo = imagem invertida).',
      },
    ],
    variables: [
      { symbol: 'f', name: 'Distância focal (>0 convergente, <0 divergente)', unit: 'm' },
      { symbol: 'p', name: 'Distância do objeto à lente', unit: 'm' },
      { symbol: 'hObj', name: 'Altura do objeto', unit: 'm' },
    ],
    observations: [
      'Aproxime o objeto p para dentro do foco (p < f) e veja a imagem virar virtual (tracejada do mesmo lado) e ampliada!',
    ],
    scenarios: [
      {
        id: 'lens-real',
        label: 'Imagem Real Invertida (p > 2f)',
        description: 'Objeto longe da lente convergente: imagem menor e invertida.',
        params: { f: 2.0, p: 5.2, hObj: 1.6 },
      },
      {
        id: 'lens-lupa',
        label: 'Modo Lupa (p < f)',
        description: 'Objeto entre o foco e a lente: imagem virtual, direita e ampliada.',
        params: { f: 2.5, p: 1.4, hObj: 1.2 },
      },
      {
        id: 'lens-div',
        label: 'Lente Divergente (f < 0)',
        description: 'Sempre forma imagem virtual, direita e reduzida.',
        params: { f: -2.2, p: 3.5, hObj: 1.8 },
      },
    ],
    commonPitfall:
      'Quando p = f (objeto exatamente sobre o foco), os raios saem paralelos e a imagem é imprópria (formada no infinito)!',
  },
  draw(ctx, h, vals) {
    const fRaw = vals.f;
    const f = Math.abs(fRaw) < 0.15 ? 0.15 : fRaw;
    const p = Math.max(0.2, vals.p);
    const hObj = vals.hObj;

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
  },
  drag(wx, wy, phase) {
    if (phase === 'down' && wx > -0.4) return null;
    return { p: -wx, hObj: wy };
  },
});
