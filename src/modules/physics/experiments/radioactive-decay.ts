import { defineExperiment } from './defineExperiment';

export const radioactiveDecay = defineExperiment({
  id: 'radioactive-decay',
  year: 3,
  group: 'Física Moderna',
  title: 'Decaimento Radioativo & Meia-Vida',
  shortTitle: 'Meia-Vida',
  summary:
    'A quantidade de núcleos radioativos cai pela metade a cada intervalo de meia-vida T12: N(x) = N0 · 2^(-x / T12).',
  keyFormulaTex: 'N(t) = N_0 \\cdot 2^{-t / T_{1/2}}',
  legendItems: [
    { label: 'Núcleos restantes N(x)', color: '#34d399' },
    { label: '1ª Meia-Vida (50%)', color: '#fbbf24' },
  ],
  formulas: [
    { raw: 'y = N0 * 2^(-x / T12)', color: '#34d399' },
    { raw: 'x = T12', color: '#fbbf24' },
    { raw: 'y = N0 / 2', color: '#64748b' },
  ],
  parameters: {
    N0: { value: 8, min: 2, max: 16, step: 1 },
    T12: { value: 2.0, min: 0.4, max: 6.0, step: 0.2 },
  },
  viewport: { centerX: 4, centerY: 4, scale: 52 },
  theory: {
    intuition: [
      'O decaimento radioativo é um processo quântico aleatório: não sabemos quando um átomo isolado vai decair, mas em uma amostra grande exatamente 50% decaem a cada meia-vida T½.',
    ],
    equations: [
      {
        latex: 'N(t) = N_0 \\left(\\frac{1}{2}\\right)^{t / T_{1/2}} = N_0 e^{-\\lambda t}',
        note: 'Lei do decaimento exponencial (usada na datação por Carbono-14).',
      },
    ],
    variables: [
      { symbol: 'N0', name: 'Quantidade inicial de núcleos', unit: 'unid.' },
      { symbol: 'T12', name: 'Tempo de meia-vida T½', unit: 's / anos' },
    ],
    observations: [
      'Veja o cruzamento exato entre a curva verde, a linha vertical x = T12 e a horizontal y = N0/2.',
    ],
    scenarios: [
      {
        id: 'dec-fast',
        label: 'Isótopo Instável (T½ = 0.8)',
        description: 'Cai rapidamente perto de zero.',
        params: { N0: 10, T12: 0.8 },
      },
      {
        id: 'dec-slow',
        label: 'Meia-Vida Longa (T½ = 4.5)',
        description: 'Decaimento suave e prolongado.',
        params: { N0: 10, T12: 4.5 },
      },
    ],
    commonPitfall:
      'Após 2 meias-vidas NÃO resta 0% da amostra — resta metade da metade, ou seja, 25% (1/4)!',
  },
});
