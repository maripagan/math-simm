import { ClassroomModule, ClassroomModuleSchema } from '../../classroom/schemas';

export const dopplerModule: ClassroomModule = ClassroomModuleSchema.parse({
  id: 'doppler-01',
  engineId: 'doppler-wave',
  title: 'Efeito Doppler & Cone de Mach',
  category: 'Ondulatória',
  themeTags: ['astronomia', 'medicina', 'aviacao', 'acustica'],
  historicalHook: {
    year: '1842',
    figure: 'Christian Doppler',
    shortText:
      'Doppler propôs o desvio de frequência para explicar a cor de estrelas binárias. Três anos depois, Buys Ballot testou a ideia com trompetistas tocando uma nota fixa sobre um trem em movimento na Holanda.',
  },
  teacherGuide: {
    openingQuestion:
      'Quando uma ambulância passa rápido por você, a sirene muda apenas de volume ou também muda de tom (mais agudo / mais grave)? Por quê?',
    commonPitfall:
      'Alunos acham que o Efeito Doppler altera a velocidade do som no ar. Reforce que vWave depende só do meio; o que muda é o espaçamento (λ) das frentes de onda.',
  },
  theoryPill: {
    mythBusted:
      'A velocidade da onda no meio não aumenta quando a fonte corre — o que muda é o comprimento de onda λ comprimido à frente e esticado atrás.',
    ahaInsight:
      'Quando a fonte atinge ou supera a velocidade da onda (M = vFonte/vOnda ≥ 1), as frentes se empilham formando o Cone de Mach (onda de choque).',
    everydayApp:
      'Sirenes de ambulância, carros de F1, radares de velocidade, ultrassom Doppler médico (fluxo sanguíneo) e expansão do Universo (redshift).',
    formulaLatex:
      'f_{\\text{obs}} = f_0 \\frac{v_{\\text{onda}}}{v_{\\text{onda}} \\mp v_{\\text{fonte}}} \\quad | \\quad M = \\frac{v_{\\text{fonte}}}{v_{\\text{onda}}}',
    variablesLegend: [
      'vWave: Velocidade de propagação da onda no meio (m/s)',
      'vSource: Velocidade da fonte emissora (m/s)',
      'f0: Frequência real emitida pela fonte (Hz)',
    ],
  },
  interdisciplinaryBridges: [
    {
      subject: 'História',
      themeTag: 'astronomia',
      connectionHook:
        'Em 1929, Edwin Hubble observou o desvio para o vermelho (redshift — Efeito Doppler da luz) em galáxias distantes, provando que o Universo está em expansão.',
    },
    {
      subject: 'Biologia',
      themeTag: 'medicina',
      connectionHook:
        'No ultrassom Doppler e no ecocardiograma, ondas sonoras refletem nas hemácias em movimento permitindo medir a velocidade do sangue nas artérias sem cirurgia.',
      bridgeQuestion: {
        id: 'doppler-bridge-med',
        type: 'interdisciplinary',
        prompt:
          'O que o exame de ultrassom Doppler mede usando a mudança de frequência das ondas refletidas?',
        timeLimitSec: 25,
        options: [
          { id: 'A', text: 'A velocidade e o sentido do fluxo sanguíneo nos vasos' },
          { id: 'B', text: 'A massa óssea total do paciente' },
          { id: 'C', text: 'A carga elétrica dos neurônios' },
          { id: 'D', text: 'A temperatura exata do ar nos pulmões' },
        ],
        correctOption: 'A',
        explanation:
          'As hemácias em movimento funcionam como fontes refletoras móveis, deslocando a frequência do ultrassom proporcionalmente à sua velocidade.',
      },
    },
  ],
  quizzes: [
    {
      id: 'doppler-q1-intuition',
      type: 'intuition',
      prompt:
        'Enquanto uma ambulância se aproxima de um observador parado, o que acontece com o som percebido?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: 'Fica mais grave, pois as frentes de onda se afastam' },
        { id: 'B', text: 'Fica mais agudo, pois as frentes de onda se comprimem (λ menor)' },
        { id: 'C', text: 'O som viaja mais rápido que a velocidade normal do som no ar' },
        { id: 'D', text: 'A frequência percebida não muda em nada' },
      ],
      correctOption: 'B',
      explanation:
        'À frente da fonte em movimento, cada nova crista nasce mais perto da anterior: λ diminui e, como v = λf é constante no ar, f aumenta (som mais agudo).',
      enginePresetBefore: { vWave: 3.0, vSource: 1.4, f0: 1.5 },
      enginePresetAfter: { vWave: 3.0, vSource: 1.4, f0: 1.5 },
    },
    {
      id: 'doppler-q2-prediction',
      type: 'prediction',
      prompt:
        'Com vWave = 3,0 m/s, vamos acelerar a fonte de vSource = 1,4 m/s para 3,4 m/s. O que vai aparecer na simulação?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: 'As ondas desaparecem completamente' },
        { id: 'B', text: 'As ondas ficam todas concêntricas e paradas' },
        { id: 'C', text: 'A fonte ultrapassa a própria onda e forma um Cone de Mach (onda de choque)' },
        { id: 'D', text: 'A velocidade da onda vWave sobe automaticamente para 3,4 m/s' },
      ],
      correctOption: 'C',
      explanation:
        'Quando vSource > vWave (número de Mach M > 1), a fonte corre na frente das próprias cristas, gerando a envoltória cônica de onda de choque.',
      enginePresetBefore: { vWave: 3.0, vSource: 1.4, f0: 1.5 },
      enginePresetAfter: { vWave: 3.0, vSource: 3.4, f0: 1.5 },
    },
  ],
  collectiveChallenge: {
    goalDescription:
      'Quebrar a barreira do som atingindo regime supersônico (M = vSource / vWave > 1,2) mantendo a frequência da fonte f0 = 1,5 Hz.',
    targetValidationRule: 'vSource / vWave > 1.2 && Math.abs(f0 - 1.5) < 0.05',
    votingOptions: [
      {
        id: '1',
        label: 'vWave = 3,6 m/s | vSource = 2,4 m/s (M = 0,67)',
        preset: { vWave: 3.6, vSource: 2.4, f0: 1.5 },
        isSuccess: false,
      },
      {
        id: '2',
        label: 'vWave = 3,0 m/s | vSource = 3,0 m/s (M = 1,00)',
        preset: { vWave: 3.0, vSource: 3.0, f0: 1.5 },
        isSuccess: false,
      },
      {
        id: '3',
        label: 'vWave = 2,4 m/s | vSource = 3,4 m/s (M = 1,42)',
        preset: { vWave: 2.4, vSource: 3.4, f0: 1.5 },
        isSuccess: true,
      },
    ],
  },
});
