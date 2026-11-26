import { PhysicsVisualCardType } from '../types';
import { evaluateCarnotState } from './carnotModel';
import { CircuitSchematic } from './CircuitSchematic';

interface PhysicsVisualCardProps {
  type: PhysicsVisualCardType;
  scope: Record<string, unknown>;
}

function num(scope: Record<string, unknown>, key: string, fallback: number): number {
  const v = scope[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

export function PhysicsVisualCard({ type, scope }: PhysicsVisualCardProps) {
  if (type === 'dc-rc' || type === 'ac-rlc') {
    return <CircuitSchematic mode={type} scope={scope} />;
  }

  if (type === 'energy') {
    const m = num(scope, 'm', 2);
    const A = num(scope, 'A', 3);
    const k = num(scope, 'k', 0.35);
    const w = num(scope, 'w', 1.6);
    const t = num(scope, 't', 0);

    const xNow = A * Math.cos(w * t);
    const hNow = k * xNow * xNow;
    const hMax = Math.max(0.01, k * A * A);
    const g = 9.8;
    const em = m * g * hMax;
    const ep = m * g * hNow;
    const ec = Math.max(0, em - ep);

    const epPct = (ep / em) * 100;
    const ecPct = (ec / em) * 100;

    return (
      <div className="circuit-overlay-card">
        <div className="circuit-overlay-header">
          <span>Energia Mecânica (Em = {em.toFixed(1)} J)</span>
        </div>
        <div className="energy-bars">
          <div className="energy-row">
            <span>Ec</span>
            <div className="energy-track">
              <div
                className="energy-fill"
                style={{ width: `${ecPct}%`, background: '#fbbf24' }}
              />
            </div>
            <code>{ec.toFixed(1)}J</code>
          </div>
          <div className="energy-row">
            <span>Ep</span>
            <div className="energy-track">
              <div
                className="energy-fill"
                style={{ width: `${epPct}%`, background: '#38bdf8' }}
              />
            </div>
            <code>{ep.toFixed(1)}J</code>
          </div>
          <div className="energy-row">
            <span>Em</span>
            <div className="energy-track">
              <div
                className="energy-fill"
                style={{ width: '100%', background: '#34d399' }}
              />
            </div>
            <code>{em.toFixed(1)}J</code>
          </div>
        </div>
      </div>
    );
  }

  // --- DYNAMIC ARCHIMEDES BUOYANCY SIMULATION ---
  if (type === 'hydrostatics') {
    const rhoF = Math.max(100, num(scope, 'rhoF', 1000));
    const rhoC = Math.max(50, num(scope, 'rhoC', 700));
    const g = Math.max(1, num(scope, 'g', 9.8));
    const t = Math.max(0, num(scope, 't', 0));

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
  }

  // --- ANIMATED CARNOT PISTON & THERMAL CYLINDER ---
  const n = num(scope, 'n', 2);
  const TQ = num(scope, 'TQ', 600);
  const TF = num(scope, 'TF', 300);
  const t = num(scope, 't', 0);

  const carnot = evaluateCarnotState(n, TQ, TF, t);
  const volFrac =
    (carnot.V - carnot.vMin) / Math.max(0.01, carnot.vMax - carnot.vMin);
  const tempFrac = (carnot.T - TF) / Math.max(1, TQ - TF);

  // Interpolate gas color from cool blue (#38bdf8) to hot red (#fb7185)
  const rCol = Math.round(56 + tempFrac * (251 - 56));
  const gCol = Math.round(189 + tempFrac * (113 - 189));
  const bCol = Math.round(248 + tempFrac * (133 - 248));
  const gasColor = `rgb(${rCol}, ${gCol}, ${bCol})`;

  const cylBottom = 104;
  const minChamberH = 26;
  const maxChamberH = 74;
  const chamberH = minChamberH + volFrac * (maxChamberH - minChamberH);
  const pistonY = cylBottom - chamberH;

  const baseColor =
    carnot.heatMode === 'hot'
      ? '#fb7185'
      : carnot.heatMode === 'cold'
        ? '#38bdf8'
        : '#64748b';
  const baseLabel =
    carnot.heatMode === 'hot'
      ? 'FONTE QUENTE (+QQ)'
      : carnot.heatMode === 'cold'
        ? 'FONTE FRIA (−QF)'
        : 'ISOLANTE (ADIABÁTICA)';

  // Deterministic lively gas particles inside the chamber
  const particles = Array.from({ length: 12 }, (_, idx) => {
    const speed = 1.6 + tempFrac * 3.2;
    const px = 76 + ((Math.sin(t * speed * (1 + idx * 0.17) + idx * 2.1) + 1) / 2) * 104;
    const py =
      pistonY +
      6 +
      ((Math.cos(t * speed * (1.2 + idx * 0.13) + idx * 1.7) + 1) / 2) *
        Math.max(6, chamberH - 12);
    return { px, py };
  });

  return (
    <div className="circuit-overlay-card">
      <div className="circuit-overlay-header">
        <span>Pistão de Carnot</span>
        <span className="circuit-badge">η = {carnot.etaPct.toFixed(1)}%</span>
      </div>

      <svg viewBox="0 0 260 144" className="circuit-svg">
        {/* Stage title */}
        <text x="130" y="12" textAnchor="middle" fill={gasColor} fontSize="10" fontWeight="600" fontFamily="monospace">
          {carnot.stageLabel}
        </text>

        {/* Cylinder walls */}
        <path
          d="M 68 24 V 106 H 188 V 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="3"
        />

        {/* Gas fill */}
        <rect
          x="70"
          y={pistonY}
          width="116"
          height={chamberH}
          fill={gasColor}
          opacity="0.22"
        />

        {/* Gas particles */}
        {particles.map((pt, i) => (
          <circle key={i} cx={pt.px} cy={pt.py} r="2.4" fill={gasColor} />
        ))}

        {/* Piston head + rod */}
        <rect
          x="70"
          y={pistonY - 8}
          width="116"
          height="8"
          rx="2"
          fill="#cbd5e1"
          stroke="#475569"
          strokeWidth="1"
        />
        <rect x="124" y="18" width="8" height={Math.max(4, pistonY - 26)} fill="#94a3b8" />

        {/* Thermal reservoir base */}
        <rect
          x="64"
          y="108"
          width="128"
          height="14"
          rx="3"
          fill={baseColor}
          opacity="0.85"
        />
        <text
          x="128"
          y="118"
          textAnchor="middle"
          fill="#0f172a"
          fontSize="8.5"
          fontWeight="700"
          fontFamily="monospace"
        >
          {baseLabel}
        </text>

        {/* Live P, V, T */}
        <text x="130" y="138" textAnchor="middle" fill="#cbd5e1" fontSize="9.5" fontFamily="monospace">
          T={carnot.T.toFixed(0)}K · V={carnot.V.toFixed(2)} · P={carnot.P.toFixed(2)}kPa
        </text>
      </svg>
    </div>
  );
}
