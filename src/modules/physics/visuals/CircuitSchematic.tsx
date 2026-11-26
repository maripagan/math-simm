interface CircuitSchematicProps {
  mode: 'dc-rc' | 'ac-rlc';
  scope: Record<string, unknown>;
}

function num(scope: Record<string, unknown>, key: string, fallback: number): number {
  const v = scope[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

export function CircuitSchematic({ mode, scope }: CircuitSchematicProps) {
  const t = num(scope, 't', 0);

  if (mode === 'dc-rc') {
    const V0 = num(scope, 'V0', 5);
    const R = Math.max(0.1, num(scope, 'R', 2));
    const C = Math.max(0.1, num(scope, 'C', 1.2));
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
  }

  // AC RLC schematic
  const V0 = num(scope, 'V0', 3);
  const R = Math.max(0.1, num(scope, 'R', 1.2));
  const L = Math.max(0.05, num(scope, 'L', 1.4));
  const C = Math.max(0.05, num(scope, 'C', 0.6));
  const w = Math.max(0.1, num(scope, 'w', 1.5));

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
}
