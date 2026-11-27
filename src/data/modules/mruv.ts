import { ClassroomModule, ClassroomModuleSchema } from '../../classroom/schemas';

export const mruvModule: ClassroomModule = ClassroomModuleSchema.parse({
  id: 'mruv-01',
  engineId: 'mruv',
  title: 'Movimento Retilíneo (MU & MUV)',
  category: 'Mecânica',
  themeTags: ['seguranca-viaria', 'transporte', 'cinematica', 'calculo-basico'],
  historicalHook: {
    year: '1638',
    figure: 'Galileu Galilei',
    shortText:
      'Usando planos inclinados suaves e relógios de água (clepsidras), Galileu provou que a distância percorrida na queda livre cresce com o quadrado do tempo (t²), e não de forma linear.',
  },
  teacherGuide: {
    openingQuestion:
      'Se um carro dobra sua velocidade de 40 km/h para 80 km/h, a distância necessária para frear também dobra?',
    commonPitfall:
      'Alunos costumam confundir aceleração negativa (a < 0) automaticamente com frear. Mostre que só há frenagem quando v e a têm sinais opostos.',
  },
  theoryPill: {
    mythBusted:
      'Dobrar a velocidade não dobra a distância de frenagem — ela quadruplica, pois Δs cresce com v0².',
    ahaInsight:
      'No gráfico s(t), a inclinação da reta tangente é a velocidade v(t). Quando v(t) cruza o zero, o corpo inverte o sentido no vértice da parábola.',
    everydayApp:
      'Distância de frenagem no trânsito, radares de velocidade média, decolagem em pistas de aeroporto e elevadores.',
    formulaLatex:
      's(t) = s_0 + v_0 t + \\tfrac{1}{2}at^2 \\quad | \\quad v(t) = v_0 + at',
    variablesLegend: [
      's0: Posição inicial (m)',
      'v0: Velocidade inicial (m/s)',
      'a: Aceleração constante (m/s²)',
    ],
  },
  interdisciplinaryBridges: [
    {
      subject: 'Matemática',
      themeTag: 'calculo-basico',
      connectionHook:
        'A função horária da posição s(t) é uma função quadrática e a velocidade instantânea v(t) é exatamente a derivada (reta tangente) dessa parábola.',
      suggestedNextModuleId: 'parabola-01',
    },
    {
      subject: 'Biologia',
      themeTag: 'seguranca-viaria',
      connectionHook:
        'Antes de o freio atuar (MUV), o motorista percorre uma distância em MU durante o tempo de reação neuromuscular (~0,7 s), que aumenta drasticamente com sono ou álcool.',
      bridgeQuestion: {
        id: 'mruv-bridge-bio',
        type: 'interdisciplinary',
        prompt:
          'Durante os ~0,7 s entre ver um obstáculo e pisar no freio, qual tipo de movimento o carro realiza?',
        timeLimitSec: 25,
        options: [
          { id: 'A', text: 'Movimento Uniforme (MU), com velocidade ainda constante' },
          { id: 'B', text: 'Repouso instantâneo' },
          { id: 'C', text: 'Movimento Circular Uniforme' },
          { id: 'D', text: 'Aceleração positiva máxima' },
        ],
        correctOption: 'A',
        explanation:
          'Enquanto o sinal nervoso viaja do olho ao cérebro e ao pé, o freio ainda não foi acionado e o carro segue em MU.',
      },
    },
  ],
  quizzes: [
    {
      id: 'mruv-q1-intuition',
      type: 'intuition',
      prompt:
        'Um carro está freando em linha reta. O que garante que um movimento é realmente retardado (está freando)?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: 'A aceleração ser sempre negativa, não importa a velocidade' },
        { id: 'B', text: 'Velocidade e aceleração terem sinais opostos' },
        { id: 'C', text: 'A posição inicial s0 ser negativa' },
        { id: 'D', text: 'A aceleração ser igual a zero' },
      ],
      correctOption: 'B',
      explanation:
        'Se v0 < 0 e a < 0, o carro acelera de ré! Ele só perde módulo de velocidade quando v e a apontam em sentidos opostos.',
      enginePresetBefore: { s0: 0, v0: 4, a: -2 },
      enginePresetAfter: { s0: 0, v0: 4, a: -2 },
    },
    {
      id: 'mruv-q2-prediction',
      type: 'prediction',
      prompt:
        'Com s0 = 0 e frenagem a = -2 m/s², um carro a v0 = 4 m/s percorre 4 m até parar. Se dobrarmos v0 para 8 m/s, qual será a nova distância de parada?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: '6 m' },
        { id: 'B', text: '8 m (o dobro)' },
        { id: 'C', text: '16 m (o quádruplo)' },
        { id: 'D', text: '32 m' },
      ],
      correctOption: 'C',
      explanation:
        'Por Torricelli (v² = v0² + 2aΔs), Δs = v0² / (2|a|). Dobrar v0 multiplica a distância de frenagem por 2² = 4 (de 4 m para 16 m).',
      enginePresetBefore: { s0: 0, v0: 4, a: -2 },
      enginePresetAfter: { s0: 0, v0: 8, a: -2 },
    },
  ],
  collectiveChallenge: {
    goalDescription:
      'Parar o trem exatamente na plataforma em s = 10 m, partindo de s0 = 0 com v0 = 6 m/s, escolhendo a desaceleração a correta.',
    targetValidationRule: 's0 === 0 && v0 === 6 && Math.abs(a + 1.8) < 0.05',
    votingOptions: [
      {
        id: '1',
        label: 'a = -0,9 m/s² (frenagem suave)',
        preset: { s0: 0, v0: 6, a: -0.9 },
        isSuccess: false, // Para em 20 m (passa da estação)
      },
      {
        id: '2',
        label: 'a = -1,8 m/s² (frenagem calibrada)',
        preset: { s0: 0, v0: 6, a: -1.8 },
        isSuccess: true, // v0² / (2 * 1.8) = 36 / 3.6 = 10 m exatos
      },
      {
        id: '3',
        label: 'a = -3,6 m/s² (frenagem brusca)',
        preset: { s0: 0, v0: 6, a: -3.6 },
        isSuccess: false, // Para em 5 m (antes da estação)
      },
    ],
  },
});
