import { ClassroomModule, ClassroomModuleSchema } from '../../classroom/schemas';

export const keplerModule: ClassroomModule = ClassroomModuleSchema.parse({
  id: 'kepler-01',
  engineId: 'kepler',
  title: 'Gravitação Universal & Órbitas de Kepler',
  category: 'Mecânica',
  themeTags: ['corrida-espacial', 'guerra-fria', 'astronomia'],
  historicalHook: {
    year: '1687',
    figure: 'Isaac Newton',
    shortText:
      'Newton unificou o céu e a Terra ao mostrar que a mesma força que puxa uma maçã para o chão mantém a Lua presa em órbita sem cair sobre nós nem escapar para o espaço.',
  },
  teacherGuide: {
    openingQuestion:
      'Se a gravidade da Terra puxa a Lua o tempo todo, por que ela nunca colide com o nosso planeta?',
    commonPitfall:
      'Alunos acham que astronautas flutuam na Estação Espacial porque "não há gravidade lá". Reforce que eles estão em queda livre contínua em volta da curvatura da Terra.',
  },
  theoryPill: {
    mythBusted:
      'Astronautas na Estação Espacial não estão "sem gravidade" — eles estão caindo continuamente em torno da Terra.',
    ahaInsight:
      'Orbitar é "cair para o lado" na velocidade certa. A excentricidade (ecc) define se a órbita é circular (= 0), elíptica (0 a 1) ou de escape (> 1).',
    everydayApp:
      'Satélites de GPS no celular, previsão do tempo e internet via satélite.',
    formulaLatex:
      'F = G\\frac{M \\cdot m}{d^2}, \\quad r(\\theta) = \\frac{a(1 - \\varepsilon^2)}{1 + \\varepsilon\\cos\\theta}',
    variablesLegend: [
      'a: Semieixo maior da órbita (UA)',
      'ecc (ε): Excentricidade orbital (0 = círculo, 0..1 = elipse, >1 = escape)',
      'G: Constante gravitacional universal',
      'd: Distância entre os centros de massa',
    ],
  },
  interdisciplinaryBridges: [
    {
      subject: 'História',
      themeTag: 'corrida-espacial',
      connectionHook:
        'O lançamento do Sputnik (1957) e a chegada à Lua (1969) na Guerra Fria aplicaram as leis de Newton e Kepler para calcular janelas de lançamento e órbitas de transferência.',
      bridgeQuestion: {
        id: 'kepler-bridge-hist',
        type: 'interdisciplinary',
        prompt:
          'Qual evento geopolítico de 1957 inaugurou a Era Espacial ao colocar o primeiro satélite artificial em órbita da Terra?',
        timeLimitSec: 25,
        options: [
          { id: 'A', text: 'Lançamento do Sputnik 1 pela União Soviética' },
          { id: 'B', text: 'Chegada da Apollo 11 à Lua' },
          { id: 'C', text: 'Construção do telescópio Hubble' },
          { id: 'D', text: 'Primeira viagem de Galileu' },
        ],
        correctOption: 'A',
        explanation:
          'O Sputnik 1 (1957) foi o primeiro satélite artificial em órbita elíptica ao redor da Terra, acelerando a Corrida Espacial na Guerra Fria.',
      },
    },
  ],
  quizzes: [
    {
      id: 'kepler-q1-intuition',
      type: 'intuition',
      prompt:
        'Por que os astronautas flutuam dentro da Estação Espacial Internacional a 400 km de altitude?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: 'Porque a gravidade da Terra acaba depois da atmosfera' },
        { id: 'B', text: 'Porque eles e a estação estão em queda livre contínua em órbita' },
        { id: 'C', text: 'Porque o ar dentro da estação empurra todos para cima' },
        { id: 'D', text: 'Porque a Lua cancela a gravidade da Terra' },
      ],
      correctOption: 'B',
      explanation:
        'A 400 km de altitude a gravidade ainda é ~89% da superfície; a sensação de imponderabilidade vem da queda livre orbital contínua.',
      enginePresetBefore: { a: 3.2, ecc: 0.45 },
      enginePresetAfter: { a: 3.2, ecc: 0.0 },
    },
    {
      id: 'kepler-q2-lightning',
      type: 'lightning',
      prompt:
        'Se dobrarmos a distância entre dois planetas, o que acontece com a força gravitacional entre eles?',
      timeLimitSec: 20,
      options: [
        { id: 'A', text: 'Fica 2 vezes menor' },
        { id: 'B', text: 'Fica 4 vezes menor' },
        { id: 'C', text: 'Fica 2 vezes maior' },
        { id: 'D', text: 'Permanece igual' },
      ],
      correctOption: 'B',
      explanation:
        'Como a atração gravitacional cai com o inverso do quadrado da distância (1/d²), dobrar d reduz a força a 1/4.',
      enginePresetBefore: { a: 2.0, ecc: 0.2 },
      enginePresetAfter: { a: 4.0, ecc: 0.2 },
    },
  ],
  collectiveChallenge: {
    goalDescription:
      'Colocar o satélite em uma órbita circular estável (excentricidade nula) sem esticar demais nem escapar da gravidade.',
    votingOptions: [
      {
        id: '1',
        label: 'Semieixo a = 3,0 UA | Excentricidade ecc = 0,00',
        preset: { a: 3.0, ecc: 0 },
        isSuccess: true, // Órbita circular estável
      },
      {
        id: '2',
        label: 'Semieixo a = 3,6 UA | Excentricidade ecc = 0,76',
        preset: { a: 3.6, ecc: 0.76 },
        isSuccess: false, // Elipse muito excêntrica (cometa)
      },
      {
        id: '3',
        label: 'Semieixo a = 2,5 UA | Excentricidade ecc = 1,24',
        preset: { a: 2.5, ecc: 1.24 },
        isSuccess: false, // Trajetória hiperbólica de escape!
      },
    ],
  },
});
