import { ClassroomModuleSchema } from '../../classroom/schemas';
import { EULER_PRESET_ID } from '../../modules/math/mathPresets';

export const eulerModule = ClassroomModuleSchema.parse({
  id: 'euler-01',
  engineId: EULER_PRESET_ID,
  title: 'Fórmula de Euler e fasores',
  category: 'Matemática',
  themeTags: ['números complexos', 'trigonometria', 'fasores'],
  historicalHook: {
    year: '1748',
    figure: 'Leonhard Euler',
    shortText: 'A fórmula de Euler relaciona a exponencial complexa com seno e cosseno. No plano complexo, variar o ângulo equivale a girar um vetor.',
  },
  teacherGuide: {
    openingQuestion: 'O que muda no vetor quando dobramos a frequência angular?',
    commonPitfall: 'O ângulo muda ao longo do tempo. O módulo do fasor simples continua igual a r.',
  },
  theoryPill: {
    mythBusted: 'Uma exponencial com expoente puramente imaginário tem módulo 1.',
    ahaInsight: 'Re(z) e Im(z) são as projeções horizontal e vertical do vetor que gira.',
    everydayApp: 'Os fasores descrevem a defasagem entre tensão e corrente em circuitos de corrente alternada.',
    formulaLatex: 'z(t) = r e^{i\\omega t} = r\\cos(\\omega t) + i r\\sin(\\omega t)',
    variablesLegend: ['r: módulo do fasor', 'ω: frequência angular (rad/s)', 't: tempo (s)'],
  },
  interdisciplinaryBridges: [
    {
      subject: 'Matemática',
      themeTag: 'fasores',
      connectionHook: 'No circuito RLC, tensão e corrente giram com a mesma frequência angular. A impedância complexa determina a diferença de fase entre elas.',
    },
  ],
  quizzes: [
    {
      id: 'euler-module',
      type: 'intuition',
      prompt: 'Qual é o módulo do fasor z(t) = 2eⁱʷᵗ em qualquer instante?',
      options: [
        { id: 'A', text: '0' },
        { id: 'B', text: '1' },
        { id: 'C', text: '2' },
        { id: 'D', text: 'Depende do tempo' },
      ],
      correctOption: 'C',
      explanation: 'A exponencial tem módulo 1. Multiplicá-la por 2 dá um vetor de módulo 2.',
      enginePresetBefore: { r: 2, w: 1 },
    },
    {
      id: 'euler-period',
      type: 'prediction',
      prompt: 'O que acontece com o período de uma volta se ω passa de 1 para 2 rad/s?',
      options: [
        { id: 'A', text: 'Cai pela metade' },
        { id: 'B', text: 'Dobra' },
        { id: 'C', text: 'Fica igual' },
        { id: 'D', text: 'Vai a zero' },
      ],
      correctOption: 'A',
      explanation: 'O período é 2π/ω. Dobrar ω reduz pela metade o tempo para completar uma volta.',
      enginePresetBefore: { r: 2, w: 1 },
      enginePresetAfter: { r: 2, w: 2 },
    },
  ],
  collectiveChallenge: {
    goalDescription: 'Faça o fasor simples completar uma volta em π segundos com módulo 3.',
    targetValidationRule: 'r === 3 && w === 2',
    votingOptions: [
      { id: '1', label: 'r = 3, ω = 1 rad/s', preset: { r: 3, w: 1 }, isSuccess: false },
      { id: '2', label: 'r = 2, ω = 2 rad/s', preset: { r: 2, w: 2 }, isSuccess: false },
      { id: '3', label: 'r = 3, ω = 2 rad/s', preset: { r: 3, w: 2 }, isSuccess: true },
    ],
  },
});
