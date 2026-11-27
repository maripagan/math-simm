import { ClassroomModule, ClassroomModuleSchema } from '../../classroom/schemas';

export const statisticsDispersionModule: ClassroomModule =
  ClassroomModuleSchema.parse({
    id: 'statistics-dispersion',
    engineId: 'statistics-lab',
    title: 'Estatística Visual — Média, Mediana & Desvio Padrão',
    category: 'Matemática',
    themeTags: ['Estatística', 'ENEM', 'Média e Mediana', 'Desvio Padrão'],
    historicalHook: {
      year: '1858',
      figure: 'Florence Nightingale',
      shortText:
        'Durante a Guerra da Crimeia, Florence Nightingale criou gráficos estatísticos pioneiros para provar ao Parlamento Britânico que condições sanitárias matavam mais soldados do que ferimentos de batalha — salvando milhares de vidas com visualização de dados.',
    },
    teacherGuide: {
      openingQuestion:
        'Se a média de idade de duas turmas é exatamente 25 anos, podemos dizer que as duas turmas têm o mesmo perfil?',
      commonPitfall:
        'Confundir média com mediana na presença de valores extremos (outliers), ou achar que média igual implica desvio padrão igual.',
    },
    theoryPill: {
      mythBusted:
        'A média sozinha não conta a história completa de um conjunto de dados: dois grupos podem ter a mesma média e comportamentos completamente opostos.',
      ahaInsight:
        'A mediana resiste a valores extremos (outliers), enquanto o desvio padrão (σ) mede o quanto os dados se espalham ao redor da média.',
      everydayApp:
        'Análise de salários, testes clínicos (como no ENEM 2025), controle de qualidade industrial, notas escolares e leitura crítica de gráficos na mídia.',
      formulaLatex:
        '\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i \\quad | \\quad \\sigma = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n} (x_i - \\bar{x})^2}',
      variablesLegend: [
        'x̄: Média aritmética (centro de massa dos dados)',
        'Md: Mediana (valor central após ordenar os dados)',
        'Mo: Moda (valor que aparece com maior frequência)',
        'σ: Desvio padrão populacional (medida de dispersão)',
      ],
    },
    interdisciplinaryBridges: [
      {
        subject: 'Biologia',
        themeTag: 'ensaios-clinicos',
        connectionHook:
          'Em testes clínicos de medicamentos, grupos de pacientes precisam não só de médias parecidas, mas de dispersão controlada para evitar vieses nos resultados.',
      },
      {
        subject: 'Geografia',
        themeTag: 'desigualdade-renda',
        connectionHook:
          'Na análise de renda per capita de países ou municípios, poucos salários altíssimos puxam a média para cima — por isso a mediana retrata melhor o trabalhador típico.',
      },
    ],
    quizzes: [
      {
        id: 'stats-q1-intuition',
        type: 'intuition',
        prompt:
          'Em uma pequena equipe, 7 pessoas ganham entre R$ 2,0 mil e R$ 3,0 mil, e 1 diretor ganha R$ 14,6 mil. Se o diretor receber um aumento para R$ 20,0 mil, o que acontece com a média e a mediana?',
        timeLimitSec: 25,
        options: [
          { id: 'A', text: 'Ambas aumentam na mesma proporção' },
          {
            id: 'B',
            text: 'A média sobe imediatamente, mas a mediana permanece exatamente igual',
          },
          { id: 'C', text: 'A mediana sobe e a média permanece igual' },
          { id: 'D', text: 'Nenhuma das duas se altera' },
        ],
        correctOption: 'B',
        explanation:
          'A média usa a soma de todos os valores, então qualquer valor extremo (outlier) a puxa. Já a mediana depende apenas da posição central dos dados ordenados.',
        enginePresetBefore: {
          scenario: 'dotplot',
          presetId: 'outlier-salaries',
          dotValues: '2.0,2.2,2.4,2.5,2.5,2.8,3.0,14.6',
          dotDomainMin: 0,
          dotDomainMax: 22,
        },
        enginePresetAfter: {
          scenario: 'dotplot',
          presetId: 'outlier-salaries',
          dotValues: '2.0,2.2,2.4,2.5,2.5,2.8,3.0,20.0',
          dotDomainMin: 0,
          dotDomainMax: 22,
        },
      },
      {
        id: 'stats-q2-prediction',
        type: 'prediction',
        prompt:
          'Dois grupos clínicos (A e B) têm exatamente a mesma média de idade (25 anos), mas σA = 3,0 anos e σB = 8,5 anos. Qual histograma terá barras mais concentradas perto dos 25 anos?',
        timeLimitSec: 25,
        options: [
          { id: 'A', text: 'Grupo A (menor desvio padrão → pico mais estreito e alto)' },
          { id: 'B', text: 'Grupo B (maior desvio padrão → pico mais estreito)' },
          { id: 'C', text: 'Os dois terão exatamente o mesmo formato, pois têm a mesma média' },
          { id: 'D', text: 'Não é possível saber sem conhecer a moda' },
        ],
        correctOption: 'A',
        explanation:
          'Quanto menor o desvio padrão σ, mais próximos da média os valores estão concentrados. Por isso o Grupo A (σ = 3,0) forma um pico estreito em torno de 25 anos.',
        enginePresetBefore: {
          scenario: 'histogram',
          presetId: 'enem-2025-q157',
          meanA: 25,
          stdA: 3.0,
          meanB: 25,
          stdB: 8.5,
          showB: true,
          bins: 10,
          showNormalCurve: true,
          showSigmaBand: true,
        },
        enginePresetAfter: {
          scenario: 'histogram',
          presetId: 'enem-2025-q157',
          meanA: 25,
          stdA: 3.0,
          meanB: 25,
          stdB: 8.5,
          showB: true,
          bins: 10,
          showNormalCurve: true,
          showSigmaBand: true,
        },
      },
    ],
    collectiveChallenge: {
      goalDescription:
        'Escolher o conjunto de pacientes com maioria das idades concentrada entre 20 e 30 anos e a menor dispersão possível (estilo ENEM 2025 Q157).',
      targetValidationRule: 'stdA <= 3.5 && Math.abs(meanA - 25) <= 2',
      votingOptions: [
        {
          id: '1',
          label: 'Grupo 1: μ = 25 anos, σ = 9,5 anos (idades espalhadas de 5 a 45)',
          preset: {
            scenario: 'histogram',
            meanA: 25,
            stdA: 9.5,
            labelA: 'Grupo 1 (σ = 9,5)',
            showB: false,
            bins: 10,
            showNormalCurve: true,
            showSigmaBand: true,
          },
          isSuccess: false,
        },
        {
          id: '2',
          label: 'Grupo 2: μ = 25 anos, σ = 2,5 anos (concentrado entre 20 e 30)',
          preset: {
            scenario: 'histogram',
            meanA: 25,
            stdA: 2.5,
            labelA: 'Grupo 2 (σ = 2,5)',
            showB: false,
            bins: 10,
            showNormalCurve: true,
            showSigmaBand: true,
          },
          isSuccess: true,
        },
        {
          id: '3',
          label: 'Grupo 3: μ = 36 anos, σ = 3,0 anos (concentrado, mas fora da faixa)',
          preset: {
            scenario: 'histogram',
            meanA: 36,
            stdA: 3.0,
            labelA: 'Grupo 3 (μ = 36)',
            showB: false,
            bins: 10,
            showNormalCurve: true,
            showSigmaBand: true,
          },
          isSuccess: false,
        },
      ],
    },
  });
