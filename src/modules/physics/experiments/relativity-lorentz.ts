import { defineExperiment } from './defineExperiment';

export const relativityLorentz = defineExperiment({
  id: 'relativity-lorentz',
  year: 3,
  group: 'Física Moderna',
  title: 'Relatividade Restrita — Fator de Lorentz γ(v)',
  shortTitle: 'Relatividade (γ)',
  summary:
    'Veja o fator de Lorentz γ(x) = 1 / √(1 − x²) (com x = v/c) permanecer ≈ 1 em baixas velocidades e disparar rumo ao infinito ao se aproximar da velocidade da luz c (x = 1).',
  keyFormulaTex:
    '\\gamma(v) = \\frac{1}{\\sqrt{1 - (v/c)^2}}, \\quad \\Delta t = \\gamma \\Delta t_0',
  legendItems: [
    { label: 'Fator de Lorentz γ(v/c)', color: '#a78bfa' },
    { label: 'Velocidade da Luz (v/c = 1)', color: '#f472b6' },
    { label: 'Velocidade atual beta = v/c', color: '#fbbf24' },
  ],
  formulas: [
    { raw: 'gamma = 1 / √(1 - beta^2)', color: '#94a3b8' },
    { raw: 'y = 1 / √(1 - x^2)', color: '#a78bfa' },
    { raw: 'x = 1', color: '#f472b6' },
    { raw: 'x = beta', color: '#fbbf24' },
  ],
  parameters: {
    beta: { value: 0.6, min: 0, max: 0.99, step: 0.01 },
  },
  viewport: { centerX: 0.55, centerY: 3.0, scale: 110 },
  theory: {
    intuition: [
      'Na Relatividade Restrita de Einstein, a velocidade da luz no vácuo c é o limite universal. Para velocidades do cotidiano (v << c), o fator γ vale praticamente 1 e a mecânica de Newton funciona perfeitamente.',
      'Perto de c (ex: beta = 0.90 ou 0.99), γ cresce explosivamente: o tempo passa mais devagar para o viajante (dilatação temporal Δt = γ·Δt₀) e comprimentos se contraem (L = L₀/γ)!',
    ],
    equations: [
      {
        latex: '\\gamma = \\frac{1}{\\sqrt{1 - \\beta^2}}, \\quad \\beta = \\frac{v}{c}',
        note: 'Fator de Lorentz (note a assíntota vertical em β = 1).',
      },
      {
        latex: '\\Delta t = \\gamma \\Delta t_0, \\quad L = \\frac{L_0}{\\gamma}',
        note: 'Dilatação do tempo e contração do comprimento.',
      },
    ],
    variables: [
      { symbol: 'beta', name: 'Fração da velocidade da luz (v/c)', unit: 'c' },
      { symbol: 'gamma', name: 'Fator de dilatação temporal γ', unit: 'adim.' },
    ],
    observations: [
      'Note como até β = 0.5 (metade da velocidade da luz!) γ ainda é só 1.15, mas entre 0.90 e 0.99 ele explode de 2.29 para 7.09!',
    ],
    scenarios: [
      {
        id: 'rel-low',
        label: 'Regime Clássico (v = 0.1c)',
        description: 'γ ≈ 1.005: efeitos relativísticos quase imperceptíveis.',
        params: { beta: 0.1 },
      },
      {
        id: 'rel-high',
        label: 'Nave Relativística (v = 0.87c)',
        description: 'γ ≈ 2.0: 1 ano na nave equivale a 2 anos na Terra!',
        params: { beta: 0.87 },
      },
      {
        id: 'rel-ultra',
        label: 'Ultra-Relativístico (v = 0.99c)',
        description: 'γ ≈ 7.09: forte dilatação temporal (como múons cósmicos).',
        params: { beta: 0.99 },
      },
    ],
    commonPitfall:
      'Nenhum objeto com massa pode atingir v = c (β = 1), pois γ → ∞ exigiria energia infinita!',
  },
});
