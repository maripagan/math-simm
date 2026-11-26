import { defineExperiment } from './defineExperiment';

export const hydrostatics = defineExperiment({
  id: 'hydrostatics',
  year: 1,
  group: 'Hidrostática',
  title: 'Hidrostática — Stevin & Empuxo (Arquimedes)',
  shortTitle: 'Stevin & Empuxo',
  summary:
    'Veja a pressão crescer linearmente com a profundidade x (Teorema de Stevin) e compare as densidades do corpo e do fluido no tanque interativo de Empuxo.',
  keyFormulaTex:
    'P(h) = P_0 + \\rho_{\\text{f}} g h, \\quad E = \\rho_{\\text{f}} g V_{\\text{sub}}',
  legendItems: [
    { label: 'Pressão Hidrostática P(h) [kPa]', color: '#38bdf8' },
    { label: 'Pressão Atmosférica P0', color: '#94a3b8' },
  ],
  formulas: [
    { raw: 'y = P0 + (rhoF * g * x) / 1000', color: '#38bdf8' },
    { raw: 'y = P0', color: '#94a3b8' },
    { raw: 'x = h', color: '#fbbf24' },
  ],
  parameters: {
    P0: { value: 101, min: 80, max: 120, step: 1 },
    rhoF: { value: 1000, min: 600, max: 2000, step: 50 },
    rhoC: { value: 700, min: 200, max: 2200, step: 50 },
    h: { value: 4, min: 0.5, max: 15, step: 0.5 },
    g: { value: 9.8, min: 1.6, max: 15, step: 0.2 },
  },
  viewport: { centerX: 5, centerY: 130, scale: 6 },
  theory: {
    intuition: [
      'O Teorema de Stevin mostra que a pressão em um fluido em repouso cresce linearmente com a profundidade h (a cada 10 m de água, a pressão aumenta cerca de 1 atm ≈ 100 kPa).',
      'Já o Princípio de Arquimedes afirma que todo corpo imerso recebe um empuxo vertical para cima igual ao peso do fluido deslocado. Se ρ_corpo < ρ_fluido, ele flutua com fração submersa igual a ρ_corpo / ρ_fluido!',
    ],
    equations: [
      {
        latex: 'P(h) = P_0 + \\rho_f g h',
        note: 'Teorema de Stevin (pressão absoluta na profundidade h).',
      },
      {
        latex: 'E = \\rho_f g V_{\\text{sub}}, \\quad \\frac{V_{\\text{sub}}}{V} = \\frac{\\rho_c}{\\rho_f}',
        note: 'Empuxo e fração submersa para corpos que flutuam (ρ_c ≤ ρ_f).',
      },
    ],
    variables: [
      { symbol: 'P0', name: 'Pressão atmosférica na superfície', unit: 'kPa' },
      { symbol: 'rhoF', name: 'Densidade do fluido (água = 1000)', unit: 'kg/m³' },
      { symbol: 'rhoC', name: 'Densidade do corpo', unit: 'kg/m³' },
      { symbol: 'h', name: 'Profundidade analisada', unit: 'm' },
    ],
    observations: [
      'No tanque visual, teste ajustar rhoC acima e abaixo de rhoF para ver o bloco afundar ou flutuar!',
    ],
    scenarios: [
      {
        id: 'hyd-ice',
        label: 'Iceberg na Água (ρc = 900)',
        description: '90% do bloco fica submerso e apenas 10% acima da linha d’água!',
        params: { P0: 101, rhoF: 1000, rhoC: 900, h: 4, g: 9.8 },
      },
      {
        id: 'hyd-iron',
        label: 'Bloco Pesado Afundando (ρc = 1800)',
        description: 'Peso supera o empuxo máximo e o bloco vai para o fundo.',
        params: { P0: 101, rhoF: 1000, rhoC: 1800, h: 8, g: 9.8 },
      },
      {
        id: 'hyd-wood',
        label: 'Madeira Leve (ρc = 450)',
        description: 'Flutua com menos da metade do volume submerso.',
        params: { P0: 101, rhoF: 1000, rhoC: 450, h: 2, g: 9.8 },
      },
    ],
    commonPitfall:
      'A pressão hidrostática no fundo de um recipiente NÃO depende do formato ou da largura do tanque, apenas da profundidade h e da densidade do líquido!',
  },
  card(vals) {
    const rhoF = Math.max(100, vals.rhoF);
    const rhoC = Math.max(50, vals.rhoC);
    const g = Math.max(1, vals.g);
    const t = Math.max(0, vals.t);

    const ratio = rhoC / rhoF;
    const floats = ratio <= 1;
    const blockH = 34;
    const tankBottom = 118;
    const baseWaterY = 56;
    const startY = 16;

    // Analytical damped buoyancy motion (floats) vs accelerated sinking (sinks)
    let blockY: number;
    if (floats) {
      const targetSub = ratio;
      const eqY = baseWaterY - blockH * (1 - targetSub);
      const omega = Math.sqrt((g * rhoF) / Math.max(100, rhoC)) * 1.1;
      const zeta = 1.15;
      blockY = eqY + (startY - eqY) * Math.exp(-zeta * t) * Math.cos(omega * t);
    } else {
      const aApp = g * (1 - rhoF / rhoC);
      const fallDist = 0.5 * aApp * t * t * 18;
      blockY = Math.min(tankBottom - blockH - 2, startY + fallDist);
    }

    // Dynamic water rise proportional to instantaneous submerged fraction
    const approxSub = Math.min(
      1,
      Math.max(0, (blockY + blockH - baseWaterY) / blockH),
    );
    const waterY = baseWaterY - approxSub * 10;
    const actualSub = Math.min(
      1,
      Math.max(0, (blockY + blockH - waterY) / blockH),
    );

    // Weight P and Buoyancy E vector lengths
    const weightN = (rhoC / 1000) * g;
    const buoyN = (rhoF / 1000) * g * actualSub;
    const vecScale = 1.9;
    const pLen = Math.min(34, Math.max(8, weightN * vecScale));
    const eLen = Math.min(34, buoyN * vecScale);
    const cx = 126;
    const cy = blockY + blockH / 2;

    return (
      <div className="circuit-overlay-card">
        <div className="circuit-overlay-header">
          <span>Empuxo Dinâmico (t = {t.toFixed(1)}s)</span>
          <span
            className="circuit-badge"
            style={{
              color: floats ? '#34d399' : '#f472b6',
              borderColor: floats ? '#34d399' : '#f472b6',
            }}
          >
            {floats
              ? `Submerso: ${(actualSub * 100).toFixed(0)}%`
              : 'Afundando (P > E)'}
          </span>
        </div>

        <svg viewBox="0 0 256 136" className="circuit-svg">
          {/* Tank walls */}
          <rect
            x="24"
            y="14"
            width="204"
            height="106"
            rx="4"
            fill="#0f172a"
            stroke="#475569"
            strokeWidth="2"
          />
          {/* Base water reference line */}
          <line
            x1="26"
            y1={baseWaterY}
            x2="226"
            y2={baseWaterY}
            stroke="rgba(148,163,184,0.35)"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          {/* Displaced fluid */}
          <rect
            x="26"
            y={waterY}
            width="200"
            height={tankBottom - waterY}
            fill="rgba(56, 189, 248, 0.28)"
          />
          <line
            x1="26"
            y1={waterY}
            x2="226"
            y2={waterY}
            stroke="#38bdf8"
            strokeWidth="2"
          />

          {/* Dynamic Block */}
          <rect
            x={cx - 24}
            y={blockY}
            width="48"
            height={blockH}
            rx="3"
            fill="#fbbf24"
            stroke="#fef08a"
            strokeWidth="1.5"
          />
          <text
            x={cx}
            y={blockY + 20}
            textAnchor="middle"
            fill="#0f172a"
            fontSize="10"
            fontWeight="700"
            fontFamily="monospace"
          >
            {rhoC}
          </text>

          {/* Weight vector P (down) */}
          <line
            x1={cx - 10}
            y1={cy}
            x2={cx - 10}
            y2={cy + pLen}
            stroke="#fb7185"
            strokeWidth="2.5"
          />
          <polygon
            points={`${cx - 14},${cy + pLen - 3} ${cx - 6},${cy + pLen - 3} ${cx - 10},${cy + pLen + 4}`}
            fill="#fb7185"
          />
          <text x={cx - 28} y={cy + pLen} fill="#fb7185" fontSize="9" fontFamily="monospace">
            P
          </text>

          {/* Buoyancy vector E (up) */}
          {eLen > 3 && (
            <>
              <line
                x1={cx + 10}
                y1={cy}
                x2={cx + 10}
                y2={cy - eLen}
                stroke="#34d399"
                strokeWidth="2.5"
              />
              <polygon
                points={`${cx + 6},${cy - eLen + 3} ${cx + 14},${cy - eLen + 3} ${cx + 10},${cy - eLen - 4}`}
                fill="#34d399"
              />
              <text x={cx + 17} y={cy - eLen + 4} fill="#34d399" fontSize="9" fontFamily="monospace">
                E
              </text>
            </>
          )}

          {/* Readouts */}
          <text x="128" y="132" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
            P={weightN.toFixed(1)}N · E={buoyN.toFixed(1)}N · Δh={(approxSub * 10).toFixed(1)}cm
          </text>
        </svg>
      </div>
    );
  },
});
