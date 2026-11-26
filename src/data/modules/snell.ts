import { ClassroomModule, ClassroomModuleSchema } from '../../classroom/schemas';

export const snellModule: ClassroomModule = ClassroomModuleSchema.parse({
  id: 'snell-01',
  engineId: 'snell-optics',
  title: 'Lei de Snell & Reflexão Interna Total',
  category: 'Óptica',
  themeTags: ['telecomunicacoes', 'luz-e-visao', 'tecnologia'],
  historicalHook: {
    year: '1621',
    figure: 'Willebrord Snellius',
    shortText:
      'Snellius matematizou por que uma lança parece "quebrada" dentro da água — o mesmo princípio que hoje mantém feixes de laser presos dentro de cabos de fibra óptica levando internet pelos oceanos.',
  },
  teacherGuide: {
    openingQuestion:
      'Por que uma piscina sempre parece mais rasa do que realmente é quando olhamos de fora?',
    commonPitfall:
      'Passar luz de um meio mais denso (vidro/água) para o ar em ângulos abertos e achar que o raio "sumiu". Aproveite o momento para mostrar o cone crítico e a Reflexão Interna Total.',
  },
  theoryPill: {
    mythBusted:
      'A luz não viaja sempre em linha reta sem desvios; ela "dobra" ao mudar de velocidade entre materiais diferentes.',
    ahaInsight:
      'Acima do ângulo limite (do meio mais refringente para o menos refringente), toda a luz é refletida internamente.',
    everydayApp:
      'Cabos de fibra óptica da internet, lentes de óculos e exames de endoscopia médica.',
    formulaLatex: 'n_1 \\cdot \\sin(\\theta_1) = n_2 \\cdot \\sin(\\theta_2)',
    variablesLegend: [
      'n1, n2: Índices de refração dos meios ópticos',
      'θ1: Ângulo de incidência em relação à reta Normal (rad)',
      'θ2: Ângulo de refração em relação à reta Normal (rad)',
      'dir: Sentido do laser (+1 cima→baixo, -1 baixo→cima)',
    ],
  },
  interdisciplinaryBridges: [
    {
      subject: 'Biologia',
      themeTag: 'fisiologia-visao',
      connectionHook:
        'A córnea e o cristalino do olho humano refratam a luz para formar imagem na retina. Debaixo d’água sem óculos, o índice da água é próximo ao da córnea e perdemos o foco.',
      bridgeQuestion: {
        id: 'snell-bridge-bio',
        type: 'interdisciplinary',
        prompt:
          'Por que enxergamos tudo embaçado quando abrimos os olhos debaixo d’água sem máscara de mergulho?',
        timeLimitSec: 25,
        options: [
          { id: 'A', text: 'A água bloqueia completamente a luz visível' },
          { id: 'B', text: 'O índice de refração da água é muito parecido com o da córnea, reduzindo a focalização' },
          { id: 'C', text: 'A pupila fecha totalmente em contato com água' },
          { id: 'D', text: 'A luz acelera dentro da água e não atinge a retina' },
        ],
        correctOption: 'B',
        explanation:
          'Sem a diferença de índice ar→córnea, a córnea quase não desvia os raios, deixando a imagem fora de foco na retina.',
      },
    },
  ],
  quizzes: [
    {
      id: 'snell-q1-intuition',
      type: 'intuition',
      prompt:
        'Quando um feixe de laser passa do ar para dentro da água, o que acontece com sua velocidade e trajetória?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: 'Acelera e se afasta da reta normal' },
        { id: 'B', text: 'Desacelera e se aproxima da reta normal' },
        { id: 'C', text: 'Mantém a mesma velocidade, mas muda de cor' },
        { id: 'D', text: 'Para imediatamente na superfície' },
      ],
      correctOption: 'B',
      explanation:
        'A água tem índice maior que o ar (n = 1,33 > 1,0), então a luz desacelera (v = c/n) e o raio se aproxima da normal.',
      enginePresetBefore: { n1: 1.0, n2: 1.33, ang1: 0.85, dir: 1 },
      enginePresetAfter: { n1: 1.0, n2: 1.33, ang1: 0.85, dir: 1 },
    },
    {
      id: 'snell-q2-prediction',
      type: 'prediction',
      prompt:
        'Se trocarmos a água (n = 1,33) por diamante (n = 2,40), o raio de luz vindo do ar vai desviar mais ou menos ao entrar?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: 'Desvia mais (aproxima-se ainda mais da normal)' },
        { id: 'B', text: 'Desvia menos (fica quase reto)' },
        { id: 'C', text: 'Não sofre nenhum desvio' },
        { id: 'D', text: 'Volta totalmente para o ar' },
      ],
      correctOption: 'A',
      explanation:
        'Quanto maior o índice n2, menor precisa ser sen(θ2) pela Lei de Snell — o raio dobra muito mais perto da normal.',
      enginePresetBefore: { n1: 1.0, n2: 1.33, ang1: 0.9, dir: 1 },
      enginePresetAfter: { n1: 1.0, n2: 2.4, ang1: 0.9, dir: 1 },
    },
  ],
  collectiveChallenge: {
    goalDescription:
      'Prender o feixe de laser dentro do bloco de Vidro (n2 = 1,5) para o Ar (n1 = 1,0) usando Reflexão Interna Total (luz saindo de baixo para cima).',
    targetValidationRule: 'dir === -1 && n2 === 1.5 && n1 === 1.0 && ang1 > 0.73',
    votingOptions: [
      {
        id: '1',
        label: 'Vidro → Ar (dir = -1) | Ângulo θ1 = 25° (0,44 rad)',
        preset: { n1: 1.0, n2: 1.5, ang1: 0.44, dir: -1 },
        isSuccess: false, // Abaixo do ângulo limite (~41.8° / 0.73 rad)
      },
      {
        id: '2',
        label: 'Ar → Vidro (dir = +1) | Ângulo θ1 = 60° (1,05 rad)',
        preset: { n1: 1.0, n2: 1.5, ang1: 1.05, dir: 1 },
        isSuccess: false, // Sentido errado: Ar -> Vidro nunca faz TIR
      },
      {
        id: '3',
        label: 'Vidro → Ar (dir = -1) | Ângulo θ1 = 55° (0,96 rad)',
        preset: { n1: 1.0, n2: 1.5, ang1: 0.96, dir: -1 },
        isSuccess: true, // Acima do ângulo limite (0.73 rad) -> TIR!
      },
    ],
  },
});
