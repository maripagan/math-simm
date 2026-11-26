import { ClassroomModule, ClassroomModuleSchema } from '../../classroom/schemas';

export const faradayModule: ClassroomModule = ClassroomModuleSchema.parse({
  id: 'faraday-01',
  engineId: 'faraday-induction',
  title: 'Indução Eletromagnética (Faraday-Lenz)',
  category: 'Eletromagnetismo',
  themeTags: [
    'matriz-energetica',
    'segunda-revolucao-industrial',
    'sustentabilidade',
  ],
  historicalHook: {
    year: '1831',
    figure: 'Michael Faraday',
    shortText:
      'Faraday passou meses tentando gerar eletricidade deixando um ímã parado perto de um fio, até descobrir que o segredo das usinas elétricas não é o ímã, mas o movimento contínuo.',
  },
  teacherGuide: {
    openingQuestion:
      'Se eu colar um super ímã num fio de cobre e deixar tudo parado, consigo acender uma lâmpada?',
    commonPitfall:
      'Achar que um campo magnético estático forte gera corrente. Mostre que sem variação de fluxo (ω = 0), a tensão induzida é rigorosamente 0 V.',
  },
  theoryPill: {
    mythBusted:
      'Um ímã forte parado perto de um fio não gera nenhuma eletricidade.',
    ahaInsight:
      'A voltagem induzida cresce quanto mais rápido o fluxo magnético varia (ω) e quanto maior o número de espiras (N) da bobina.',
    everydayApp:
      'Turbinas de usinas hidrelétricas e eólicas, carregadores de celular por indução e fogões de indução.',
    formulaLatex:
      '\\varepsilon(t) = -N\\frac{d\\Phi}{dt} = N B A \\omega \\sin(\\omega t)',
    variablesLegend: [
      'N: Número de espiras da bobina',
      'B: Intensidade do campo magnético (T)',
      'A: Área da espira (m²)',
      'ω: Velocidade angular de rotação da turbina (rad/s)',
    ],
  },
  interdisciplinaryBridges: [
    {
      subject: 'Geografia',
      themeTag: 'matriz-energetica',
      connectionHook:
        'A queda d’água nas hidrelétricas (como Itaipu) ou a força dos ventos nas usinas eólicas serve exatamente para girar as turbinas (ω) e manter a variação magnética contínua.',
      bridgeQuestion: {
        id: 'faraday-bridge-geo',
        type: 'interdisciplinary',
        prompt:
          'Qual fonte da matriz elétrica brasileira NÃO depende de girar uma turbina com ímãs/bobinas para gerar eletricidade?',
        timeLimitSec: 25,
        options: [
          { id: 'A', text: 'Usina Hidrelétrica' },
          { id: 'B', text: 'Usina Eólica' },
          { id: 'C', text: 'Usina Termelétrica' },
          { id: 'D', text: 'Painel Solar Fotovoltaico' },
        ],
        correctOption: 'D',
        explanation:
          'Hidrelétricas, eólicas e termelétricas giram turbinas (Faraday); já painéis solares usam o Efeito Fotoelétrico diretamente.',
      },
    },
  ],
  quizzes: [
    {
      id: 'faraday-q1-intuition',
      type: 'intuition',
      prompt:
        'Se encostarmos um super ímã de neodímio em uma bobina de cobre e deixarmos ambos perfeitamente parados, qual será a tensão gerada?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: 'Alta tensão contínua enquanto o ímã estiver perto' },
        { id: 'B', text: 'Zero (0 V), pois não há variação do fluxo magnético' },
        { id: 'C', text: 'Tensão alternada de 60 Hz automaticamente' },
        { id: 'D', text: 'Depende apenas da temperatura da sala' },
      ],
      correctOption: 'B',
      explanation:
        'A Lei de Faraday exige variação do fluxo magnético no tempo (dΦ/dt ≠ 0). Sem movimento ou mudança de campo, ε = 0.',
      enginePresetBefore: { N: 2, B: 1.2, A: 1.0, w: 0.4 },
      enginePresetAfter: { N: 2, B: 1.2, A: 1.0, w: 2.2 },
    },
    {
      id: 'faraday-q2-prediction',
      type: 'prediction',
      prompt:
        'Sem aumentar a velocidade com que a turbina gira (ω), qual alteração dobra exatamente o pico de tensão gerada?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: 'Dobrar o número de espiras (N) da bobina' },
        { id: 'B', text: 'Reduzir a área da espira pela metade' },
        { id: 'C', text: 'Parar a espira no ponto de fluxo máximo' },
        { id: 'D', text: 'Afastar o ímã da bobina' },
      ],
      correctOption: 'A',
      explanation:
        'Como ε_max = N·B·A·ω, dobrar o número de espiras N dobra diretamente a amplitude da tensão induzida.',
      enginePresetBefore: { N: 2, B: 1.2, A: 1.0, w: 1.8 },
      enginePresetAfter: { N: 4, B: 1.2, A: 1.0, w: 1.8 },
    },
  ],
  collectiveChallenge: {
    goalDescription:
      'Gerar um pico de tensão acima de 12 V (ε_max = N·B·A·ω > 12 V) para acender o holofote da usina.',
    votingOptions: [
      {
        id: '1',
        label: 'N = 2 espiras | B = 1,0 T | A = 1,0 m² | ω = 3,0 rad/s',
        preset: { N: 2, B: 1.0, A: 1.0, w: 3.0 },
        isSuccess: false, // 6 V
      },
      {
        id: '2',
        label: 'N = 4 espiras | B = 1,5 T | A = 1,0 m² | ω = 2,5 rad/s',
        preset: { N: 4, B: 1.5, A: 1.0, w: 2.5 },
        isSuccess: true, // 15 V > 12 V
      },
      {
        id: '3',
        label: 'N = 3 espiras | B = 1,0 T | A = 0,8 m² | ω = 4,0 rad/s',
        preset: { N: 3, B: 1.0, A: 0.8, w: 4.0 },
        isSuccess: false, // 9.6 V
      },
    ],
  },
});
