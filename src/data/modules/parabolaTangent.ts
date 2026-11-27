import { ClassroomModule, ClassroomModuleSchema } from '../../classroom/schemas';

export const parabolaTangentModule: ClassroomModule = ClassroomModuleSchema.parse({
  id: 'parabola-01',
  engineId: 'parabola-tangent',
  title: 'Parábola & Reta Secante/Tangente',
  category: 'Matemática',
  themeTags: ['geometria-analitica', 'calculo-basico', 'otimizacao', 'cinematica'],
  historicalHook: {
    year: '1637',
    figure: 'René Descartes',
    shortText:
      'Descartes uniu álgebra e geometria no plano cartesiano. Décadas depois, Newton e Leibniz transformaram o problema geométrico da reta tangente na base do Cálculo Diferencial.',
  },
  teacherGuide: {
    openingQuestion:
      'Como podemos saber, só olhando a parábola e a reta, se um sistema de equações tem 2 soluções, 1 solução ou nenhuma solução real?',
    commonPitfall:
      'Alunos confundem o papel de a (concavidade/abertura) com c (translação vertical), ou acham que a reta tangente precisa cruzar a parábola em dois pontos muito próximos.',
  },
  theoryPill: {
    mythBusted:
      'O discriminante Δ não serve apenas para decorar Bhaskara — ele diz geometricamente quantas vezes a reta encontra a parábola.',
    ahaInsight:
      'Quando Δ > 0 a reta é secante (2 interseções); quando Δ = 0 é tangente (1 ponto exato onde m = 2ax); quando Δ < 0 não há interseção real.',
    everydayApp:
      'Otimização de lucro e custo (ponto de equilíbrio), trajetórias parabólicas, antenas e velocidade instantânea.',
    formulaLatex:
      'f(x) = ax^2 + c \\quad | \\quad g(x) = mx + k \\quad | \\quad \\Delta = m^2 - 4a(c - k)',
    variablesLegend: [
      'a: Coeficiente quadrático (concavidade e abertura)',
      'c: Deslocamento vertical da parábola',
      'm: Inclinação (coeficiente angular) da reta',
      'k: Intercepto vertical da reta',
    ],
  },
  interdisciplinaryBridges: [
    {
      subject: 'Matemática',
      themeTag: 'cinematica',
      connectionHook:
        'Na Física (MUV), a posição s(t) forma uma parábola e a velocidade instantânea v(t) é exatamente a inclinação da reta tangente em cada instante.',
      suggestedNextModuleId: 'mruv-01',
    },
    {
      subject: 'Geografia',
      themeTag: 'otimizacao',
      connectionHook:
        'Em economia e logística, cruzar uma curva quadrática de custo com uma reta de receita mostra visualmente a faixa de lucro e o ponto de equilíbrio (break-even).',
    },
  ],
  quizzes: [
    {
      id: 'parabola-q1-intuition',
      type: 'intuition',
      prompt:
        'Na parábola y = a·x² + c, o que acontece visualmente se trocarmos apenas a = +0,5 por a = −0,5?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: 'A parábola desliza para a esquerda' },
        { id: 'B', text: 'A concavidade inverte de cima para baixo, mantendo o mesmo vértice em (0, c)' },
        { id: 'C', text: 'A parábola vira uma reta horizontal' },
        { id: 'D', text: 'O vértice sobe para o eixo x' },
      ],
      correctOption: 'B',
      explanation:
        'O sinal de a controla a concavidade (a > 0 voltada para cima; a < 0 voltada para baixo), enquanto c fixa o ponto (0, c) onde a curva corta o eixo y.',
      enginePresetBefore: { a: 0.5, c: -2, m: 1, k: 0.5 },
      enginePresetAfter: { a: -0.5, c: -2, m: 1, k: 0.5 },
    },
    {
      id: 'parabola-q2-prediction',
      type: 'prediction',
      prompt:
        'Para a parábola y = 0,5x² (a = 0,5, c = 0) e a reta com inclinação m = 2, qual valor de k torna a reta exatamente tangente (1 único ponto de contato)?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: 'k = 0' },
        { id: 'B', text: 'k = 1' },
        { id: 'C', text: 'k = -2' },
        { id: 'D', text: 'k = -4' },
      ],
      correctOption: 'C',
      explanation:
        'Igualando 0,5x² = 2x + k, temos Δ = 2² − 4(0,5)(−k) = 4 + 2k = 0 ⇒ k = −2, tocando em exatamente um ponto (2, 2).',
      enginePresetBefore: { a: 0.5, c: 0, m: 2, k: 1 },
      enginePresetAfter: { a: 0.5, c: 0, m: 2, k: -2 },
    },
  ],
  collectiveChallenge: {
    goalDescription:
      'Ajustar o intercepto k para tornar a reta y = 2x + k perfeitamente tangente à parábola y = 0,5x² − 2.',
    targetValidationRule:
      'Math.abs(a - 0.5) < 0.05 && Math.abs(c + 2) < 0.05 && Math.abs(m - 2) < 0.05 && Math.abs(k + 4) < 0.05',
    votingOptions: [
      {
        id: '1',
        label: 'k = -1 (reta corta a parábola em 2 pontos)',
        preset: { a: 0.5, c: -2, m: 2, k: -1 },
        isSuccess: false, // Δ > 0 (secante)
      },
      {
        id: '2',
        label: 'k = -4 (Δ = 0, tangente em x = 2, y = 0)',
        preset: { a: 0.5, c: -2, m: 2, k: -4 },
        isSuccess: true, // 0.5x² - 2 = 2x - 4 -> 0.5(x - 2)² = 0
      },
      {
        id: '3',
        label: 'k = -5 (reta passa abaixo sem tocar)',
        preset: { a: 0.5, c: -2, m: 2, k: -5 },
        isSuccess: false, // Δ < 0 (sem interseção real)
      },
    ],
  },
});
