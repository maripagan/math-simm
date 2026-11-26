import { drawBadge } from './draw';
import { defineExperiment } from './defineExperiment';

export const dopplerWave = defineExperiment({
  id: 'doppler-wave',
  year: 2,
  group: 'Ondulatória',
  title: 'Ondulatória — Equação Fundamental & Efeito Doppler',
  shortTitle: 'Efeito Doppler',
  summary:
    'Uma fonte sonora se move com velocidade vs emitindo frentes de onda com rapidez v. Veja a compressão do comprimento de onda à frente (som mais agudo) e o alongamento atrás.',
  keyFormulaTex:
    'v = \\lambda f, \\quad f\' = f\\frac{v}{v \\mp v_s}',
  legendItems: [
    { label: 'Frentes de Onda', color: '#38bdf8' },
    { label: 'Fonte Móvel (vs)', color: '#fbbf24' },
    { label: 'Onda Harmônica', color: '#34d399' },
  ],
  formulas: [
    { raw: 'y = 0.6 * sin((2 * π * f0 / vWave) * x - 2 * π * f0 * t) - 3.2', color: '#34d399' },
  ],
  parameters: {
    vWave: { value: 3.0, min: 1.5, max: 6.0, step: 0.2 },
    vSource: { value: 1.4, min: 0, max: 3.8, step: 0.2 },
    f0: { value: 1.5, min: 0.5, max: 4.0, step: 0.1 },
  },
  viewport: { centerX: 0, centerY: -0.5, scale: 58 },
  theory: {
    intuition: [
      'Toda onda obedece à equação fundamental v = λ·f. Quando uma fonte sonora (como uma ambulância) se move, ela "corre atrás" das ondas que emitiu à frente, encurtando o comprimento de onda λ e aumentando a frequência percebida f′ (som mais agudo).',
      'Se a velocidade da fonte igualar ou ultrapassar a velocidade da onda (vs ≥ v, número de Mach ≥ 1), as frentes de onda se empilham formando um Cone de Mach (onda de choque)!',
    ],
    equations: [
      {
        latex: 'v = \\lambda \\cdot f',
        note: 'Equação fundamental da ondulatória.',
      },
      {
        latex: 'f_{\\text{aprox}} = f_0\\frac{v}{v - v_s}, \\quad f_{\\text{afast}} = f_0\\frac{v}{v + v_s}',
        note: 'Frequência aparente na aproximação e no afastamento da fonte.',
      },
    ],
    variables: [
      { symbol: 'vWave', name: 'Velocidade de propagação da onda v', unit: 'm/s' },
      { symbol: 'vSource', name: 'Velocidade da fonte emissora vs', unit: 'm/s' },
      { symbol: 'f0', name: 'Frequência natural da fonte', unit: 'Hz' },
    ],
    observations: [
      'Compare o espaçamento entre os círculos azuis à direita (aproximação) e à esquerda (afastamento) da fonte amarela.',
      'Teste aumentar vSource acima de vWave para visualizar o Cone de Mach supersônico!',
    ],
    scenarios: [
      {
        id: 'dop-static',
        label: 'Fonte Parada (vs = 0)',
        description: 'Frentes concêntricas simétricas: f′ = f0 em todas as direções.',
        params: { vWave: 3.0, vSource: 0, f0: 1.5 },
        resetTime: true,
      },
      {
        id: 'dop-sub',
        label: 'Ambulância Subsônica (vs = 1.6)',
        description: 'Clara compressão à frente e rarefação atrás.',
        params: { vWave: 3.0, vSource: 1.6, f0: 1.5 },
        resetTime: true,
      },
      {
        id: 'dop-mach',
        label: 'Supersônico — Cone de Mach (vs > v)',
        description: 'Fonte ultrapassa as próprias ondas formando onda de choque!',
        params: { vWave: 2.2, vSource: 3.2, f0: 1.8 },
        resetTime: true,
      },
    ],
    commonPitfall:
      'O Efeito Doppler NÃO altera a velocidade de propagação da onda no meio (v depende apenas do meio), mas sim o comprimento de onda λ e a frequência percebida f′!',
  },
  draw(ctx, h, vals) {
    const vWave = Math.max(0.5, vals.vWave);
    const vSource = Math.max(0, vals.vSource);
    const f0 = Math.max(0.2, vals.f0);
    const t = vals.t;

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
  },
});
