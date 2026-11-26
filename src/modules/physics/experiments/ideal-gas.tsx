import { evaluateCarnotState } from './carnotModel';
import { defineExperiment } from './defineExperiment';

export const idealGas = defineExperiment({
  id: 'ideal-gas',
  year: 2,
  group: 'Termologia',
  title: 'Gases Ideais & Ciclo de Carnot (Diagrama P × V)',
  shortTitle: 'Gases & Carnot',
  summary:
    'Compare as isotermas P(V) = nRT/V nas temperaturas quente (TQ) e fria (TF). A área abaixo da curva representa o trabalho mecânico realizado pelo gás.',
  keyFormulaTex:
    'P(V) = \\frac{nRT}{V}, \\quad \\eta_{\\text{Carnot}} = 1 - \\frac{T_F}{T_Q}',
  legendItems: [
    { label: 'Isoterma Quente (TQ)', color: '#fb7185' },
    { label: 'Isoterma Fria (TF)', color: '#38bdf8' },
  ],
  formulas: [
    { raw: 'y <= (n * 8.31 * TQ) / (1000 * x)', color: '#fb7185' },
    { raw: 'y = (n * 8.31 * TF) / (1000 * x)', color: '#38bdf8' },
  ],
  parameters: {
    n: { value: 2, min: 0.5, max: 6, step: 0.5 },
    TQ: { value: 600, min: 320, max: 1000, step: 20 },
    TF: { value: 300, min: 150, max: 580, step: 20 },
  },
  viewport: { centerX: 4, centerY: 3, scale: 62 },
  theory: {
    intuition: [
      'Na Equação de Clapeyron (PV = nRT), manter a temperatura T constante produz uma hipérbole equilátera chamada isoterma: quanto maior a temperatura, mais alta e afastada da origem fica a curva.',
      'A 2ª Lei da Termodinâmica estabelece que nenhuma máquina térmica operando entre duas temperaturas TQ e TF pode superar o rendimento de Carnot η = 1 − TF/TQ (sempre em Kelvin!).',
    ],
    equations: [
      {
        latex: 'P \\cdot V = n R T \\implies P(V) = \\frac{nRT}{V}',
        note: 'Equação dos Gases Ideais (eixo x = Volume, eixo y = Pressão).',
      },
      {
        latex: '\\eta_{\\max} = 1 - \\frac{T_F}{T_Q}',
        note: 'Rendimento máximo teórico de uma máquina térmica (Ciclo de Carnot).',
      },
    ],
    variables: [
      { symbol: 'n', name: 'Número de mols do gás', unit: 'mol' },
      { symbol: 'TQ', name: 'Temperatura da fonte quente', unit: 'K' },
      { symbol: 'TF', name: 'Temperatura da fonte fria', unit: 'K' },
    ],
    observations: [
      'Aumente TQ ou reduza TF e observe o card de Carnot mostrar o rendimento teórico subir.',
      'A área sombreada sob a isoterma representa graficamente o trabalho W = ∫ P dV.',
    ],
    scenarios: [
      {
        id: 'gas-50',
        label: 'Rendimento de 50% (TQ = 600K, TF = 300K)',
        description: 'Metade do calor vira trabalho e metade vai para a fonte fria.',
        params: { n: 2, TQ: 600, TF: 300 },
      },
      {
        id: 'gas-high',
        label: 'Alta Eficiência (TQ = 900K, TF = 225K)',
        description: 'Rendimento teórico de 75% com grande afastamento entre isotermas.',
        params: { n: 2, TQ: 900, TF: 225 },
      },
    ],
    commonPitfall:
      'Em Termodinâmica e Carnot, a temperatura SEMPRE deve estar em Kelvin (K = °C + 273). Usar °C gera resultados completamente errados!',
  },
  draw(ctx, h, vals) {
    const n = vals.n;
    const TQ = vals.TQ;
    const TF = vals.TF;
    const t = vals.t;

    // Sample closed 4-stage Carnot cycle polygon on P-V diagram
    ctx.save();
    ctx.beginPath();
    const samples = 120;
    for (let i = 0; i <= samples; i++) {
      const st = evaluateCarnotState(n, TQ, TF, (i / samples) * 8);
      const sx = h.toScreenX(st.V);
      const sy = h.toScreenY(st.P);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(52, 211, 153, 0.22)';
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Live glowing state dot along the Carnot cycle
    const cur = evaluateCarnotState(n, TQ, TF, t);
    const cx = h.toScreenX(cur.V);
    const cy = h.toScreenY(cur.P);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  },
  card(vals) {
    const n = vals.n;
    const TQ = vals.TQ;
    const TF = vals.TF;
    const t = vals.t;

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
  },
});
