import { PresetCategory, PresetScene } from '../types';

export const PRESET_CATEGORIES: Array<{ id: PresetCategory | 'todos'; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'cinematica', label: 'Cinemática' },
  { id: 'circuitos-dc', label: 'Circuitos DC' },
  { id: 'circuitos-ac', label: 'Circuitos AC' },
  { id: 'gravitacao', label: 'Gravitação' },
  { id: 'complexos', label: 'Complexos' },
  { id: 'matematica', label: 'Matemática' },
];

export const PRESET_SCENES: PresetScene[] = [
  // --- CINEMÁTICA (Retilíneo & Rotacional) ---
  {
    id: 'projectile-motion',
    category: 'cinematica',
    title: 'Lançamento Oblíquo (Projétil)',
    description:
      'Trajetória paramétrica com partícula e vetor velocidade ao vivo. Varie v0, ângulo (rad) e gravidade g.',
    formulas: [
      {
        raw: 'p(t) = (v0 * cos(ang) * t, v0 * sin(ang) * t - 0.5 * g * t^2)',
        color: '#38bdf8',
      },
      { raw: 'y <= 0', color: '#475569' },
    ],
    parameters: {
      v0: { value: 12, min: 2, max: 25, step: 0.5 },
      ang: { value: 0.9, min: 0.1, max: 1.5, step: 0.05 },
      g: { value: 9.8, min: 1.6, max: 20, step: 0.2 },
    },
    viewport: { centerX: 6, centerY: 3, scale: 38 },
  },
  {
    id: 'mruv-linear',
    category: 'cinematica',
    title: 'Movimento Retilíneo (MRUV)',
    description:
      'Posição s(x), velocidade v(x) e partícula acompanhando s(t) em tempo real.',
    formulas: [
      { raw: 'y = s0 + v0 * x + 0.5 * a * x^2', color: '#38bdf8' },
      { raw: 'y = v0 + a * x', color: '#f472b6' },
      { raw: 'p(t) = (t, s0 + v0 * t + 0.5 * a * t^2)', color: '#fbbf24' },
    ],
    parameters: {
      s0: { value: 0, min: -5, max: 5, step: 0.2 },
      v0: { value: 3, min: -5, max: 10, step: 0.2 },
      a: { value: -1.2, min: -5, max: 5, step: 0.1 },
    },
    viewport: { centerX: 3, centerY: 2, scale: 50 },
  },
  {
    id: 'rotational-mcuv',
    category: 'cinematica',
    title: 'Movimento Rotacional (MCU / MCUV)',
    description:
      'Ângulo θ(t) com aceleração angular α, vetor girando em z(t) = R·e^(i·θ) e projeção senoidal.',
    formulas: [
      { raw: 'theta = w0 * t + 0.5 * alpha * t^2', color: '#94a3b8' },
      { raw: 'z(t) = R * e^(i * theta)', color: '#38bdf8' },
      { raw: 'y = R * sin(w0 * x)', color: '#34d399' },
    ],
    parameters: {
      R: { value: 2.5, min: 0.5, max: 5, step: 0.1 },
      w0: { value: 1.5, min: 0, max: 6, step: 0.1 },
      alpha: { value: 0.25, min: -2, max: 2, step: 0.05 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 65 },
  },

  // --- CIRCUITOS ELÉTRICOS DC ---
  {
    id: 'dc-rc-circuit',
    category: 'circuitos-dc',
    title: 'Circuito RC — Carga & Corrente DC',
    description:
      'Tensão no capacitor Vc(x) e corrente I(x) com constante de tempo τ = R·C destacada.',
    formulas: [
      { raw: 'tauRC = R * C', color: '#94a3b8' },
      { raw: 'y = V0 * (1 - e^(-x / tauRC))', color: '#38bdf8' },
      { raw: 'y = (V0 / R) * e^(-x / tauRC)', color: '#fbbf24' },
      { raw: 'x = tauRC', color: '#f472b6' },
    ],
    parameters: {
      V0: { value: 5, min: 1, max: 12, step: 0.5 },
      R: { value: 2, min: 0.5, max: 10, step: 0.2 },
      C: { value: 1, min: 0.2, max: 5, step: 0.1 },
    },
    viewport: { centerX: 3, centerY: 2.5, scale: 60 },
  },
  {
    id: 'dc-rl-circuit',
    category: 'circuitos-dc',
    title: 'Circuito RL — Resposta de Corrente DC',
    description:
      'Crescimento exponencial da corrente no indutor I(x) com constante de tempo τ = L/R.',
    formulas: [
      { raw: 'tauRL = L / R', color: '#94a3b8' },
      { raw: 'y = (V0 / R) * (1 - e^(-x / tauRL))', color: '#34d399' },
      { raw: 'y = V0 / R', color: '#64748b' },
      { raw: 'x = tauRL', color: '#f472b6' },
    ],
    parameters: {
      V0: { value: 6, min: 1, max: 15, step: 0.5 },
      R: { value: 2, min: 0.5, max: 10, step: 0.2 },
      L: { value: 3, min: 0.2, max: 10, step: 0.2 },
    },
    viewport: { centerX: 3, centerY: 2, scale: 65 },
  },
  {
    id: 'dc-max-power',
    category: 'circuitos-dc',
    title: 'Máxima Transferência de Potência (DC)',
    description:
      'Potência na carga P(R) atinge o máximo exato quando a resistência de carga x iguala a interna r.',
    formulas: [
      { raw: 'y = (V^2 * x) / (x + r)^2', color: '#a78bfa' },
      { raw: 'x = r', color: '#fbbf24' },
    ],
    parameters: {
      V: { value: 6, min: 1, max: 15, step: 0.5 },
      r: { value: 2.5, min: 0.5, max: 8, step: 0.2 },
    },
    viewport: { centerX: 4, centerY: 2, scale: 55 },
  },

  // --- CIRCUITOS ELÉTRICOS AC ---
  {
    id: 'ac-rlc-phasors',
    category: 'circuitos-ac',
    title: 'Circuito RLC AC — Fasores + Senoides',
    description:
      'Impedância complexa Z conectando fasores girando (zV, zI) e ondas senoidais defasadas ao mesmo tempo.',
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
    viewport: { centerX: 0, centerY: 0, scale: 65 },
  },
  {
    id: 'ac-rlc-resonance',
    category: 'circuitos-ac',
    title: 'Curva de Ressonância RLC (|I| vs ω)',
    description:
      'Amplitude da corrente em função da frequência angular x = ω, com pico na frequência de ressonância ω0 = 1/√(LC).',
    formulas: [
      { raw: 'w0 = 1 / √(L * C)', color: '#94a3b8' },
      { raw: 'y = V0 / √(R^2 + (x * L - 1 / (x * C))^2)', color: '#fb7185' },
      { raw: 'x = w0', color: '#34d399' },
    ],
    parameters: {
      V0: { value: 4, min: 1, max: 10, step: 0.5 },
      R: { value: 0.8, min: 0.2, max: 4, step: 0.1 },
      L: { value: 0.8, min: 0.1, max: 3, step: 0.1 },
      C: { value: 0.4, min: 0.1, max: 2, step: 0.05 },
    },
    viewport: { centerX: 3, centerY: 2.5, scale: 60 },
  },

  // --- GRAVITAÇÃO & ÓRBITAS ---
  {
    id: 'kepler-orbit',
    category: 'gravitacao',
    title: 'Órbita Gravitacional (Kepler)',
    description:
      'Solução polar analítica das cônicas com foco na origem (0, 0). Varie a excentricidade ecc: 0 = círculo, 0..1 = elipse, >1 = hipérbole.',
    formulas: [
      { raw: 'p = a * abs(1 - ecc^2)', color: '#94a3b8' },
      { raw: 'z(t) = (p / (1 + ecc * cos(t))) * e^(i * t)', color: '#38bdf8' },
      { raw: 'zS = 0', color: '#fbbf24' },
    ],
    parameters: {
      a: { value: 3.2, min: 1, max: 6, step: 0.1 },
      ecc: { value: 0.6, min: 0, max: 1.4, step: 0.05 },
    },
    viewport: { centerX: -1, centerY: 0, scale: 60 },
  },
  {
    id: 'gravity-potential',
    category: 'gravitacao',
    title: 'Poço de Potencial Gravitacional',
    description:
      'Energia potencial U(x) = -GM/|x| comparada ao nível de energia total E (E < 0: órbita ligada; E ≥ 0: escape).',
    formulas: [
      { raw: 'y = -GM / abs(x)', color: '#a78bfa' },
      { raw: 'y <= E', color: '#38bdf8' },
    ],
    parameters: {
      GM: { value: 4, min: 1, max: 12, step: 0.5 },
      E: { value: -1.5, min: -5, max: 3, step: 0.2 },
    },
    viewport: { centerX: 0, centerY: -2, scale: 55 },
  },

  // --- COMPLEXOS ---
  {
    id: 'euler-phasor',
    category: 'complexos',
    title: 'Fórmula de Euler & Fasor (ℂ)',
    description:
      'Fasor z(t) = r·e^(i·w·t) girando no plano complexo junto com e^(i·x) (Re contínua, Im pontilhada).',
    formulas: [
      { raw: 'z(t) = r * e^(i * w * t)', color: '#38bdf8' },
      { raw: 'z(t) = r * e^(i * w * t) + 0.6 * e^(i * 3 * w * t)', color: '#f472b6' },
      { raw: 'y = r * e^(i * x)', color: '#34d399' },
    ],
    parameters: {
      r: { value: 2.0, min: 0.5, max: 4, step: 0.1 },
      w: { value: 1.2, min: 0.2, max: 5, step: 0.1 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 70 },
  },
  {
    id: 'complex-sqrt',
    category: 'complexos',
    title: 'Raiz Complexa & Vetor z (ℂ)',
    description:
      'Veja √(x) gerar parte imaginária para x < 0 junto com um número complexo ajustável z = a + bi.',
    formulas: [
      { raw: 'y = √(x)', color: '#a78bfa' },
      { raw: 'z = a + b * i', color: '#fbbf24' },
    ],
    parameters: {
      a: { value: 2, min: -5, max: 5, step: 0.2 },
      b: { value: 1.5, min: -5, max: 5, step: 0.2 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 65 },
  },

  // --- MATEMÁTICA ---
  {
    id: 'wave-beat',
    category: 'matematica',
    title: 'Onda Viajante & Envelope',
    description:
      'Senoide animada no tempo t com amplitude e frequência controladas por sliders.',
    formulas: [
      { raw: 'y = a * sin(b * x - t)', color: '#38bdf8' },
      { raw: 'y = a * exp(-0.15 * x^2)', color: '#f472b6' },
    ],
    parameters: {
      a: { value: 2.5, min: 0.2, max: 5, step: 0.1 },
      b: { value: 1.8, min: 0.2, max: 6, step: 0.1 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 60 },
  },
  {
    id: 'parabola-tangent',
    category: 'matematica',
    title: 'Parábola & Reta Secante/Tangente',
    description:
      'Explore raízes e interseções ajustando inclinação m e deslocamento k.',
    formulas: [
      { raw: 'y = a * x^2 + c', color: '#a78bfa' },
      { raw: 'y = m * x + k', color: '#fbbf24' },
    ],
    parameters: {
      a: { value: 0.5, min: -2, max: 2, step: 0.1 },
      c: { value: -2, min: -5, max: 5, step: 0.2 },
      m: { value: 1, min: -4, max: 4, step: 0.1 },
      k: { value: 0.5, min: -5, max: 5, step: 0.2 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 60 },
  },
];
