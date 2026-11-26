import { defineExperiment } from './defineExperiment';

export const acRlc = defineExperiment({
  id: 'ac-rlc',
  year: 3,
  group: 'Circuitos AC',
  title: 'Circuito Elétrico AC — RLC (Fasores + Senoides)',
  shortTitle: 'Circuito AC (RLC)',
  summary:
    'A impedância complexa Z = R + i(ωL − 1/ωC) define a amplitude e a defasagem φ entre tensão e corrente — visíveis tanto nos fasores girando quanto nas ondas senoidais.',
  keyFormulaTex:
    'Z = R + i\\left(\\omega L - \\frac{1}{\\omega C}\\right), \\quad I = \\frac{V_0}{Z}e^{i\\omega t}',
  legendItems: [
    { label: 'Tensão V (Fasor & Onda)', color: '#38bdf8' },
    { label: 'Corrente I (Fasor & Onda)', color: '#fbbf24' },
  ],
  formulas: [
    { raw: 'Z = R + i * (w * L - 1 / (w * C))', color: '#94a3b8' },
    { raw: 'zV(t) = V0 * e^(i * w * t)', color: '#38bdf8' },
    { raw: 'zI(t) = (V0 / Z) * e^(i * w * t)', color: '#fbbf24' },
    { raw: 'y = re(V0 * e^(i * (w * x - w * t)))', color: '#38bdf8' },
    { raw: 'y = re((V0 / Z) * e^(i * (w * x - w * t)))', color: '#fbbf24' },
  ],
  parameters: {
    V0: { value: 3, min: 0.5, max: 6, step: 0.2 },
    R: { value: 1.2, min: 0.2, max: 5, step: 0.1 },
    L: { value: 1.4, min: 0.1, max: 5, step: 0.1 },
    C: { value: 0.6, min: 0.1, max: 3, step: 0.05 },
    w: { value: 1.5, min: 0.3, max: 5, step: 0.1 },
  },
  viewport: { centerX: 0, centerY: 0, scale: 64 },
  theory: {
    intuition: [
      'Em AC, indutores atrasam a corrente (+iωL) e capacitores a adiantam (−i/ωC). Na ressonância (XL = XC), as reatâncias se anulam e a corrente atinge seu máximo em fase com a tensão.',
    ],
    equations: [
      {
        latex: 'Z = R + i\\left(\\omega L - \\frac{1}{\\omega C}\\right), \\quad \\omega_0 = \\frac{1}{\\sqrt{LC}}',
        note: 'Impedância complexa e frequência de ressonância.',
      },
    ],
    variables: [
      { symbol: 'V0', name: 'Amplitude da tensão AC', unit: 'V' },
      { symbol: 'R', name: 'Resistência', unit: 'Ω' },
      { symbol: 'L', name: 'Indutância', unit: 'H' },
      { symbol: 'C', name: 'Capacitância', unit: 'F' },
      { symbol: 'w', name: 'Frequência angular ω', unit: 'rad/s' },
    ],
    observations: [
      'Compare o ângulo entre zV e zI com a defasagem entre os picos das ondas.',
    ],
    scenarios: [
      {
        id: 'rlc-res',
        label: 'Ressonância (XL = XC, φ = 0°)',
        description: 'Fasores alinhados e corrente máxima.',
        params: { V0: 3, R: 1, L: 1, C: 0.25, w: 2 },
      },
      {
        id: 'rlc-ind',
        label: 'Regime Indutivo (I atrasada)',
        description: 'XL > XC: corrente gira atrás da tensão.',
        params: { V0: 3, R: 1, L: 2.2, C: 0.8, w: 2.2 },
      },
      {
        id: 'rlc-cap',
        label: 'Regime Capacitivo (I adiantada)',
        description: 'XC > XL: corrente gira à frente da tensão.',
        params: { V0: 3, R: 1, L: 0.4, C: 0.25, w: 0.9 },
      },
    ],
    commonPitfall:
      'A impedância total NÃO é R + XL + XC; a soma é vetorial: |Z| = √(R² + (XL − XC)²).',
  },
  card(vals) {
    const V0 = vals.V0;
    const R = Math.max(0.1, vals.R);
    const L = Math.max(0.05, vals.L);
    const C = Math.max(0.05, vals.C);
    const w = Math.max(0.1, vals.w);

    const xl = w * L;
    const xc = 1 / (w * C);
    const xNet = xl - xc;
    const zMag = Math.hypot(R, xNet);
    const phiDeg = (Math.atan2(xNet, R) * 180) / Math.PI;

    let regime = 'Ressonância (φ ≈ 0°)';
    let regimeColor = '#34d399';
    if (xNet > 0.15) {
      regime = 'Indutivo (I atrasada)';
      regimeColor = '#38bdf8';
    } else if (xNet < -0.15) {
      regime = 'Capacitivo (I adiantada)';
      regimeColor = '#f472b6';
    }

    return (
      <div className="circuit-overlay-card">
        <div className="circuit-overlay-header">
          <span>Circuito AC (RLC Série)</span>
          <span className="circuit-badge" style={{ color: regimeColor, borderColor: regimeColor }}>
            {regime}
          </span>
        </div>

        <svg viewBox="0 0 280 120" className="circuit-svg">
          {/* Loop */}
          <path
            d="M 34 32 H 74 M 118 32 H 142 M 196 32 H 236 V 48 M 236 72 V 92 H 34 V 74 M 34 46 V 32"
            fill="none"
            stroke="#64748b"
            strokeWidth="2.2"
          />

          {/* AC Source */}
          <circle cx="34" cy="60" r="13" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.2" />
          <path
            d="M 26 60 Q 30 52 34 60 T 42 60"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
          />
          <text x="34" y="86" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace">
            {V0.toFixed(1)}V~
          </text>

          {/* Resistor */}
          <polyline
            points="74,32 80,24 88,40 96,24 104,40 112,24 118,32"
            fill="none"
            stroke="#f8fafc"
            strokeWidth="2"
          />
          <text x="96" y="16" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontFamily="monospace">
            R={R.toFixed(1)}
          </text>

          {/* Inductor coils */}
          <path
            d="M 142 32 Q 149 18 156 32 Q 163 18 170 32 Q 177 18 184 32 Q 190 18 196 32"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.2"
          />
          <text x="169" y="16" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace">
            XL={xl.toFixed(1)}Ω
          </text>

          {/* Capacitor */}
          <line x1="220" y1="50" x2="252" y2="50" stroke="#f472b6" strokeWidth="2.8" />
          <line x1="220" y1="68" x2="252" y2="68" stroke="#f472b6" strokeWidth="2.8" />
          <text x="236" y="86" textAnchor="middle" fill="#f472b6" fontSize="9" fontFamily="monospace">
            XC={xc.toFixed(1)}Ω
          </text>

          {/* Impedance readout */}
          <text x="140" y="112" textAnchor="middle" fill="#fbbf24" fontSize="10" fontFamily="monospace">
            |Z|={zMag.toFixed(2)}Ω · φ={phiDeg.toFixed(1)}° · Imax={(V0 / zMag).toFixed(2)}A
          </text>
        </svg>
      </div>
    );
  },
});
