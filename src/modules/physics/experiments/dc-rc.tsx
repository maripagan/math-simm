import { defineExperiment } from './defineExperiment';

export const dcRc = defineExperiment({
  id: 'dc-rc',
  year: 3,
  group: 'Circuitos DC',
  title: 'Circuito Elétrico DC — Carga de Capacitor RC',
  shortTitle: 'Circuito DC (RC)',
  summary:
    'Acompanhe a tensão no capacitor Vc(x) subindo exponencialmente enquanto a corrente I(x) cai. Em x = τ = R·C, o capacitor atinge 63,2% de V0.',
  keyFormulaTex:
    'V_C(t) = V_0\\left(1 - e^{-t/(RC)}\\right), \\quad I(t) = \\frac{V_0}{R}e^{-t/(RC)}',
  legendItems: [
    { label: 'Tensão Vc(x)', color: '#38bdf8' },
    { label: 'Corrente I(x)', color: '#fbbf24' },
    { label: 'Constante de Tempo τ = RC', color: '#f472b6' },
  ],
  formulas: [
    { raw: 'tauRC = R * C', color: '#94a3b8' },
    { raw: 'y = V0 * (1 - e^(-x / tauRC))', color: '#38bdf8' },
    { raw: 'y = (V0 / R) * e^(-x / tauRC)', color: '#fbbf24' },
    { raw: 'x = tauRC', color: '#f472b6' },
  ],
  parameters: {
    V0: { value: 5, min: 1, max: 12, step: 0.5 },
    R: { value: 2, min: 0.5, max: 10, step: 0.2 },
    C: { value: 1.2, min: 0.2, max: 5, step: 0.1 },
  },
  viewport: { centerX: 3.5, centerY: 2.5, scale: 58 },
  theory: {
    intuition: [
      'Quando ligamos uma fonte contínua V0 a um resistor R e um capacitor C descarregado, a corrente começa máxima (V0/R) e cai exponencialmente conforme o capacitor se carrega.',
      'A constante de tempo τ = R·C determina a rapidez da carga: em t = τ o capacitor atinge 63,2% de V0.',
    ],
    equations: [
      {
        latex: '\\tau = R \\cdot C, \\quad V_C(t) = V_0(1 - e^{-t/\\tau})',
        note: 'Constante de tempo e curva de carga exponencial.',
      },
    ],
    variables: [
      { symbol: 'V0', name: 'Tensão da fonte DC', unit: 'V' },
      { symbol: 'R', name: 'Resistência elétrica', unit: 'Ω' },
      { symbol: 'C', name: 'Capacitância', unit: 'F' },
    ],
    observations: [
      'A linha vertical rosa marca x = τ.',
      'Veja o preenchimento azul do capacitor subir no esquema SVG acima.',
    ],
    scenarios: [
      {
        id: 'rc-fast',
        label: 'Carga Rápida (τ = 0.5s)',
        description: 'Resistor e capacitor pequenos.',
        params: { V0: 5, R: 1, C: 0.5 },
        resetTime: true,
      },
      {
        id: 'rc-slow',
        label: 'Carga Lenta (τ = 6s)',
        description: 'Alta resistência e capacitância.',
        params: { V0: 5, R: 3, C: 2 },
        resetTime: true,
      },
    ],
    commonPitfall:
      'Aumentar V0 NÃO muda o tempo τ = R·C que o capacitor leva para carregar!',
  },
  card(vals) {
    const t = vals.t;
    const V0 = vals.V0;
    const R = Math.max(0.1, vals.R);
    const C = Math.max(0.1, vals.C);
    const tau = R * C;
    const vc = V0 * (1 - Math.exp(-t / tau));
    const iNow = (V0 / R) * Math.exp(-t / tau);
    const chargeRatio = Math.min(1, Math.max(0, vc / Math.max(0.01, V0)));

    return (
      <div className="circuit-overlay-card">
        <div className="circuit-overlay-header">
          <span>Esquema DC (RC)</span>
          <span className="circuit-badge">
            Carga: {(chargeRatio * 100).toFixed(0)}%
          </span>
        </div>

        <svg viewBox="0 0 260 118" className="circuit-svg">
          {/* Wires */}
          <path
            d="M 34 30 H 92 M 150 30 H 214 V 46 M 214 72 V 92 H 34 V 70 M 34 48 V 30"
            fill="none"
            stroke="#64748b"
            strokeWidth="2.5"
          />

          {/* Animated current flow dashes */}
          <path
            d="M 34 30 H 214 V 92 H 34 Z"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="5 10"
            strokeDashoffset={-t * 40 * Math.max(0.15, iNow / (V0 / R))}
            opacity={Math.max(0.15, iNow / (V0 / R))}
          />

          {/* Battery V0 */}
          <line x1="22" y1="50" x2="46" y2="50" stroke="#38bdf8" strokeWidth="3" />
          <line x1="28" y1="60" x2="40" y2="60" stroke="#38bdf8" strokeWidth="2" />
          <text x="8" y="60" fill="#38bdf8" fontSize="10" fontFamily="monospace">
            {V0.toFixed(1)}V
          </text>

          {/* Resistor R */}
          <polyline
            points="92,30 98,22 108,38 118,22 128,38 138,22 144,30 150,30"
            fill="none"
            stroke="#f8fafc"
            strokeWidth="2.2"
          />
          <text x="121" y="15" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="monospace">
            R={R.toFixed(1)}Ω
          </text>

          {/* Capacitor C with live charge fill */}
          <line x1="196" y1="48" x2="232" y2="48" stroke="#38bdf8" strokeWidth="3" />
          <line x1="196" y1="70" x2="232" y2="70" stroke="#38bdf8" strokeWidth="3" />
          <rect
            x="200"
            y={70 - chargeRatio * 18}
            width="28"
            height={chargeRatio * 18}
            fill="#38bdf8"
            opacity="0.45"
          />
          <text x="237" y="62" fill="#38bdf8" fontSize="10" fontFamily="monospace">
            C
          </text>

          {/* Live readings */}
          <text x="125" y="110" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
            Vc={vc.toFixed(2)}V · I={iNow.toFixed(2)}A · τ={tau.toFixed(2)}s
          </text>
        </svg>
      </div>
    );
  },
});
