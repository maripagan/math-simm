import { defineExperiment } from './defineExperiment';

export const photoelectric = defineExperiment({
  id: 'photoelectric',
  year: 3,
  group: 'Física Moderna',
  title: 'Efeito Fotoelétrico (Einstein & Quanta de Luz)',
  shortTitle: 'Fotoelétrico',
  summary:
    'A energia cinética máxima dos elétrons ejetados cresce linearmente com a frequência f da luz (Ec = h·f − φ), mas só há emissão acima da frequência de corte f0 = φ/h.',
  keyFormulaTex:
    'E_c = \\max(0,\\; h f - \\phi), \\quad f_0 = \\frac{\\phi}{h}',
  legendItems: [
    { label: 'Energia Cinética Ec(f) [eV]', color: '#38bdf8' },
    { label: 'Frequência de Corte f0', color: '#f472b6' },
    { label: 'Frequência da Luz f', color: '#fbbf24' },
  ],
  formulas: [
    { raw: 'f0 = phi / h', color: '#94a3b8' },
    { raw: 'y = max(0, h * x - phi)', color: '#38bdf8' },
    { raw: 'x = f0', color: '#f472b6' },
    { raw: 'x = fLight', color: '#fbbf24' },
  ],
  parameters: {
    h: { value: 4.14, min: 4.14, max: 4.14, step: 0.01 },
    phi: { value: 2.3, min: 1.0, max: 5.5, step: 0.1 },
    fLight: { value: 0.85, min: 0.2, max: 2.0, step: 0.05 },
  },
  viewport: { centerX: 1.0, centerY: 2.2, scale: 110 },
  theory: {
    intuition: [
      'Einstein explicou o Efeito Fotoelétrico propondo que a luz é composta por pacotes de energia chamados fótons (E = h·f). Cada elétron absorve um único fóton.',
      'Se a energia do fóton for menor que a função trabalho φ do metal (f < f0), NENHUM elétron é arrancado — mesmo com luz muito intensa! Acima de f0, o excesso de energia vira energia cinética Ec.',
    ],
    equations: [
      {
        latex: 'E_{\\text{fóton}} = h f, \\quad E_c = h f - \\phi',
        note: 'Equação fotoelétrica de Einstein (em eV com f em 10¹⁵ Hz).',
      },
      {
        latex: 'f_0 = \\frac{\\phi}{h}',
        note: 'Frequência mínima (de corte) para arrancar elétrons.',
      },
    ],
    variables: [
      { symbol: 'phi', name: 'Função trabalho do metal φ', unit: 'eV' },
      { symbol: 'fLight', name: 'Frequência da luz incidente', unit: '10¹⁵ Hz' },
      { symbol: 'f0', name: 'Frequência de corte do metal', unit: '10¹⁵ Hz' },
    ],
    observations: [
      'Mova fLight para a esquerda da linha rosa f0 e veja o indicador mudar para "Sem emissão"! Passe para a direita e os elétrons são ejetados.',
    ],
    scenarios: [
      {
        id: 'pe-blocked',
        label: 'Abaixo do Corte (Luz Vermelha)',
        description: 'f < f0: fótons sem energia suficiente (Ec = 0).',
        params: { h: 4.14, phi: 2.3, fLight: 0.45 },
      },
      {
        id: 'pe-uv',
        label: 'Ultravioleta (Emissão Forte)',
        description: 'f >> f0: elétrons arrancados com alta energia cinética.',
        params: { h: 4.14, phi: 2.3, fLight: 1.35 },
      },
    ],
    commonPitfall:
      'Aumentar a INTENSIDADE (brilho) de uma luz abaixo da frequência de corte NÃO arranca elétrons; intensidade aumenta o número de fótons, não a energia de cada fóton!',
  },
  draw(ctx, _h, vals) {
    const hPl = vals.h;
    const phi = vals.phi;
    const fLight = vals.fLight;
    const t = vals.t;
    const f0 = phi / hPl;
    const ec = hPl * fLight - phi;
    const emitting = ec > 0;

    // Map frequency (0.3 .. 1.6) to approximate photon color (red -> green -> blue -> violet)
    const hue = Math.min(285, Math.max(0, ((fLight - 0.35) / 1.1) * 285));
    const photonColor = `hsl(${hue}, 90%, 62%)`;

    const bx = 16;
    const by = 16;
    const bw = 266;
    const bh = 112;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = emitting ? '#34d399' : '#fb7185';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 10);
    ctx.fill();
    ctx.stroke();

    // Metal plate
    ctx.fillStyle = '#64748b';
    ctx.fillRect(bx + 18, by + 84, 150, 12);

    // Incoming animated photons hitting the metal plate
    for (let k = 0; k < 4; k++) {
      const u = ((t * 0.9 + k * 0.25) % 1);
      const px = bx + 26 + k * 24 + u * 26;
      const py = by + 34 + u * 50;
      ctx.fillStyle = photonColor;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ejected electrons when f > f0 (speed proportional to sqrt(Ec))
    if (emitting) {
      const eSpeed = 0.6 + Math.sqrt(ec) * 0.55;
      for (let k = 0; k < 4; k++) {
        const u = ((t * eSpeed + k * 0.25) % 1);
        const ex = bx + 95 + k * 14 + u * 75;
        const ey = by + 82 - u * 44;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(ex, ey, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.font = '600 10.5px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = emitting ? '#34d399' : '#fb7185';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(
      emitting
        ? `EMISSÃO ATIVA · Ec = ${ec.toFixed(2)} eV`
        : `BLOQUEADO (f=${fLight.toFixed(2)} < f₀=${f0.toFixed(2)})`,
      bx + 12,
      by + 10,
    );
    ctx.restore();
  },
});
