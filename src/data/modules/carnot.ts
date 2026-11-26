import { ClassroomModule, ClassroomModuleSchema } from '../../classroom/schemas';

export const carnotModule: ClassroomModule = ClassroomModuleSchema.parse({
  id: 'carnot-01',
  engineId: 'ideal-gas',
  title: 'Ciclo de Carnot & Eficiência Térmica',
  category: 'Termodinâmica',
  themeTags: ['revolucao-industrial', 'energia', 'sustentabilidade'],
  historicalHook: {
    year: '1824',
    figure: 'Sadi Carnot',
    shortText:
      'Tentando entender por que as máquinas a vapor desperdiçavam tanto carvão, o engenheiro francês Sadi Carnot descobriu o limite máximo de eficiência que qualquer motor térmico pode atingir no universo.',
  },
  teacherGuide: {
    openingQuestion:
      'Por que nenhum motor de carro aproveita 100% da gasolina que queima?',
    commonPitfall:
      'Alunos tentam zerar a temperatura da fonte fria (TF = 0 K) para bater 100% de rendimento. Mostre que a engine bloqueia no zero absoluto (2ª Lei da Termodinâmica) e que as temperaturas precisam estar em Kelvin.',
  },
  theoryPill: {
    mythBusted:
      'Nenhum motor térmico pode ter 100% de eficiência, mesmo sem atrito.',
    ahaInsight:
      'O rendimento máximo depende apenas da razão entre a temperatura absoluta da fonte fria (TF) e da fonte quente (TQ).',
    everydayApp:
      'Motores a combustão, usinas termelétricas e o funcionamento reverso de geladeiras e aparelhos de ar-condicionado.',
    formulaLatex: '\\eta = 1 - \\frac{T_F}{T_Q}',
    variablesLegend: [
      'η: Rendimento máximo teórico (0 a 100%)',
      'TQ: Temperatura absoluta da fonte quente (K)',
      'TF: Temperatura absoluta da fonte fria (K)',
      'n: Quantidade de gás (mol)',
    ],
  },
  interdisciplinaryBridges: [
    {
      subject: 'História',
      themeTag: 'revolucao-industrial',
      connectionHook:
        'A evolução das máquinas a vapor de James Watt e os estudos de Carnot impulsionaram as fábricas, teares mecânicos e ferrovias no século XIX.',
      bridgeQuestion: {
        id: 'carnot-bridge-hist',
        type: 'interdisciplinary',
        prompt:
          'Qual foi o principal impacto econômico imediato da melhoria do rendimento das máquinas a vapor no século XIX?',
        timeLimitSec: 25,
        options: [
          { id: 'A', text: 'Redução do consumo de carvão, viabilizando locomotivas e fábricas em larga escala' },
          { id: 'B', text: 'Substituição imediata do vapor por energia solar nas indústrias' },
          { id: 'C', text: 'Eliminação completa do trabalho humano nas minas' },
          { id: 'D', text: 'Fim das ferrovias na Europa' },
        ],
        correctOption: 'A',
        explanation:
          'Motores mais eficientes precisavam de menos carvão para gerar o mesmo trabalho, barateando o transporte ferroviário e a produção fabril.',
      },
    },
    {
      subject: 'Química',
      themeTag: 'termoquimica',
      connectionHook:
        'O poder calorífico da queima de combustíveis fósseis e biocombustíveis define quanta energia química é liberada para aquecer a fonte quente (TQ).',
    },
  ],
  quizzes: [
    {
      id: 'carnot-q1-intuition',
      type: 'intuition',
      prompt:
        'Se construíssemos um motor a combustão perfeito, sem nenhum atrito nas peças, qual seria o rendimento máximo possível?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: '100%, pois sem atrito não há perda de energia' },
        { id: 'B', text: 'Sempre menor que 100%, pois parte do calor precisa ir para a fonte fria' },
        { id: 'C', text: 'Exatamente 50% para qualquer combustível' },
        { id: 'D', text: 'Depende apenas do peso do pistão' },
      ],
      correctOption: 'B',
      explanation:
        'Pela 2ª Lei da Termodinâmica, toda máquina térmica precisa rejeitar parte do calor para uma fonte fria (TF > 0 K), impedindo 100% de rendimento.',
      enginePresetBefore: { n: 2, TQ: 600, TF: 300 },
      enginePresetAfter: { n: 2, TQ: 600, TF: 300 },
    },
    {
      id: 'carnot-q2-prediction',
      type: 'prediction',
      prompt:
        'Se aumentarmos bastante a temperatura absoluta da fonte quente (TQ) mantendo TF fixa, o que acontece com a área interna do ciclo no gráfico P × V?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: 'Aumenta — o gás realiza mais trabalho útil por ciclo' },
        { id: 'B', text: 'Diminui — o motor fica mais fraco' },
        { id: 'C', text: 'Fica igual, pois TF não mudou' },
        { id: 'D', text: 'A área zera completamente' },
      ],
      correctOption: 'A',
      explanation:
        'Subir TQ afasta a isoterma quente para cima no diagrama P × V, ampliando a área interna (trabalho líquido) e o rendimento η.',
      enginePresetBefore: { n: 2, TQ: 500, TF: 300 },
      enginePresetAfter: { n: 2, TQ: 960, TF: 300 },
    },
  ],
  collectiveChallenge: {
    goalDescription:
      'Atingir rendimento superior a 60% sem ultrapassar 800 K na fonte quente (TQ).',
    targetValidationRule: 'TQ <= 800 && (1 - TF / TQ) > 0.6',
    votingOptions: [
      {
        id: '1',
        label: 'TQ = 760 K | TF = 400 K (n = 2 mol)',
        preset: { n: 2, TQ: 760, TF: 400 },
        isSuccess: false, // η = 47.4%
      },
      {
        id: '2',
        label: 'TQ = 780 K | TF = 260 K (n = 2 mol)',
        preset: { n: 2, TQ: 780, TF: 260 },
        isSuccess: true, // η = 66.7% > 60% e TQ <= 800 K
      },
      {
        id: '3',
        label: 'TQ = 960 K | TF = 300 K (n = 2 mol)',
        preset: { n: 2, TQ: 960, TF: 300 },
        isSuccess: false, // η = 68.8%, mas ultrapassa 800 K!
      },
    ],
  },
});
