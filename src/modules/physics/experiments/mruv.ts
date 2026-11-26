import { defineExperiment } from './defineExperiment';

export const mruv = defineExperiment({
  id: 'mruv',
  year: 1,
  group: 'Cinemática',
  title: 'Movimento Retilíneo (MU & MUV)',
  shortTitle: 'MU & MUV',
  summary:
    'Compare a função horária da posição s(x) com a velocidade v(x). Quando a = 0 temos Movimento Uniforme (reta); com a ≠ 0 surge a parábola do MUV.',
  keyFormulaTex:
    's(t) = s_0 + v_0 t + \\tfrac{1}{2}at^2, \\quad v(t) = v_0 + at',
  legendItems: [
    { label: 'Posição s(t)', color: '#38bdf8' },
    { label: 'Velocidade v(t)', color: '#f472b6' },
    { label: 'Instante atual t', color: '#fbbf24' },
  ],
  formulas: [
    { raw: 'y = s0 + v0 * x + 0.5 * a * x^2', color: '#38bdf8' },
    { raw: 'y = v0 + a * x', color: '#f472b6' },
    { raw: 'p(t) = (t, s0 + v0 * t + 0.5 * a * t^2)', color: '#fbbf24' },
  ],
  parameters: {
    s0: { value: 0, min: -5, max: 5, step: 0.2 },
    v0: { value: 4, min: -6, max: 10, step: 0.2 },
    a: { value: -1.5, min: -5, max: 5, step: 0.1 },
  },
  viewport: { centerX: 3, centerY: 2, scale: 52 },
  theory: {
    intuition: [
      'No Movimento Uniforme (MU), a aceleração é nula (a = 0) e a posição varia linearmente com o tempo. Já no Movimento Uniformemente Variado (MUV), a velocidade varia em taxa constante a, fazendo a posição descrever uma parábola.',
      'O vértice da parábola s(t) ocorre exatamente no instante em que a reta da velocidade v(t) cruza o eixo zero — momento em que o móvel inverte o sentido do movimento!',
    ],
    equations: [
      {
        latex: 's(t) = s_0 + v_0 t + \\tfrac{1}{2}a t^2',
        note: 'Função horária da posição (equação do sorvetão).',
      },
      {
        latex: 'v(t) = v_0 + a t, \\quad v^2 = v_0^2 + 2a\\Delta s',
        note: 'Velocidade no tempo e Equação de Torricelli.',
      },
    ],
    variables: [
      { symbol: 's0', name: 'Posição inicial', unit: 'm' },
      { symbol: 'v0', name: 'Velocidade inicial', unit: 'm/s' },
      { symbol: 'a', name: 'Aceleração escalar constante', unit: 'm/s²' },
    ],
    observations: [
      'Veja que onde a reta rosa v(x) cruza y = 0, a curva azul s(x) atinge exatamente seu ponto de máximo ou mínimo.',
      'Com a = 0, s(x) vira uma reta inclinada e v(x) uma reta horizontal constante.',
    ],
    scenarios: [
      {
        id: 'mruv-mu',
        label: 'MU Puro (a = 0)',
        description: 'Velocidade constante: posição cresce em linha reta.',
        params: { s0: 0, v0: 2.5, a: 0 },
        resetTime: true,
      },
      {
        id: 'mruv-brake',
        label: 'Frenagem e Retorno (a < 0)',
        description: 'Parte com v0 positiva, freia até parar e inverte o sentido.',
        params: { s0: 0, v0: 5, a: -2 },
        resetTime: true,
      },
      {
        id: 'mruv-freefall',
        label: 'Queda Livre (g = -9.8 m/s²)',
        description: 'Solto do repouso a 10 m de altura sob gravidade.',
        params: { s0: 5, v0: 0, a: -9.8 },
        resetTime: true,
      },
    ],
    commonPitfall:
      'Aceleração negativa (a < 0) nem sempre significa "frear": se v e a tiverem o mesmo sinal (ambos negativos), o corpo está acelerando no sentido retrógrado!',
  },
});
