import { ClassroomModule, ClassroomModuleSchema } from '../../classroom/schemas';

export const photoelectricModule: ClassroomModule = ClassroomModuleSchema.parse({
  id: 'photoelectric-01',
  engineId: 'photoelectric',
  title: 'Efeito Fotoelétrico (Einstein & Quanta de Luz)',
  category: 'Física Moderna',
  themeTags: ['energia-solar', 'fisica-quantica', 'sustentabilidade', 'quimica-quantica'],
  historicalHook: {
    year: '1905',
    figure: 'Albert Einstein',
    shortText:
      'No seu Ano Miraculoso, Einstein explicou o Efeito Fotoelétrico propondo que a luz viaja em pacotes discretos de energia (fótons) — descoberta que lhe rendeu o Prêmio Nobel de Física de 1921.',
  },
  teacherGuide: {
    openingQuestion:
      'Se uma luz vermelha fortíssima não consegue arrancar elétrons de uma placa metálica, aumentar ainda mais o brilho (intensidade) dela vai resolver?',
    commonPitfall:
      'Alunos acham que aumentar o brilho dá mais energia a cada elétron. Deixe claro que intensidade muda o número de fótons, mas só a frequência (cor) define a energia de cada fóton.',
  },
  theoryPill: {
    mythBusted:
      'Abaixo da frequência de corte f0 = φ/h, nenhum elétron é arrancado — não importa quão brilhante seja a fonte de luz.',
    ahaInsight:
      'Cada fóton entrega energia E = h·f num impacto único. Acima de f0, a energia que sobra além da função trabalho φ vira energia cinética do elétron (Ec = h·f − φ).',
    everydayApp:
      'Painéis solares fotovoltaicos, sensores de portas automáticas, câmeras digitais (CMOS/CCD) e postes que acendem ao anoitecer.',
    formulaLatex:
      'E_{\\text{fóton}} = hf \\quad | \\quad E_{c,\\max} = hf - \\phi \\quad | \\quad f_0 = \\frac{\\phi}{h}',
    variablesLegend: [
      'h: Constante de Planck (4,14 eV·fs)',
      'phi (φ): Função trabalho do metal (eV)',
      'fLight (f): Frequência da luz incidente (×10¹⁵ Hz)',
    ],
  },
  interdisciplinaryBridges: [
    {
      subject: 'Geografia',
      themeTag: 'sustentabilidade',
      connectionHook:
        'Enquanto hidrelétricas e eólicas geram eletricidade girando turbinas (Lei de Faraday), os painéis solares fotovoltaicos convertem luz diretamente em corrente usando o Efeito Fotoelétrico.',
      suggestedNextModuleId: 'faraday-01',
    },
    {
      subject: 'Biologia',
      themeTag: 'fisica-quantica',
      connectionHook:
        'A radiação ultravioleta (alta frequência) tem fótons energéticos o suficiente para quebrar ligações do DNA e causar queimaduras, enquanto ondas de rádio e Wi-Fi têm baixa frequência e são não-ionizantes.',
      bridgeQuestion: {
        id: 'photo-bridge-bio',
        type: 'interdisciplinary',
        prompt:
          'Por que precisamos de protetor solar contra radiação UV, mas não contra ondas de rádio ou Wi-Fi?',
        timeLimitSec: 25,
        options: [
          { id: 'A', text: 'Cada fóton de UV tem frequência e energia muito maiores, podendo danificar moléculas do DNA' },
          { id: 'B', text: 'Ondas de rádio não atravessam o ar' },
          { id: 'C', text: 'Fótons de Wi-Fi têm massa maior que os de UV' },
          { id: 'D', text: 'A luz UV viaja mais devagar que as ondas de rádio' },
        ],
        correctOption: 'A',
        explanation:
          'Pela relação E = hf, a frequência da radiação UV é milhões de vezes maior que a do Wi-Fi, tornando seus fótons capazes de ionizar moléculas.',
      },
    },
  ],
  quizzes: [
    {
      id: 'photo-q1-intuition',
      type: 'intuition',
      prompt:
        'Uma luz vermelha não consegue arrancar elétrons de uma placa de sódio. O que acontece se aumentarmos muito o brilho (intensidade) dessa mesma luz vermelha?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: 'Os elétrons finalmente são ejetados com alta velocidade' },
        { id: 'B', text: 'Continuam não sendo ejetados, pois cada fóton individual ainda tem energia menor que φ' },
        { id: 'C', text: 'A função trabalho φ do metal cai pela metade' },
        { id: 'D', text: 'O metal derrete antes de emitir qualquer fóton' },
      ],
      correctOption: 'B',
      explanation:
        'Mais brilho significa mais fótons por segundo, mas cada fóton continua com energia hf < φ, incapaz de liberar o elétron.',
      enginePresetBefore: { h: 4.14, phi: 2.3, fLight: 0.45 },
      enginePresetAfter: { h: 4.14, phi: 2.3, fLight: 0.45 },
    },
    {
      id: 'photo-q2-prediction',
      type: 'prediction',
      prompt:
        'Numa placa de Sódio (φ = 2,3 eV), vamos subir a frequência de f = 0,45 (vermelho) para f = 0,85 (ultravioleta). O que ocorrerá na câmara?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: 'Nada muda, pois a placa continua sendo de Sódio' },
        { id: 'B', text: 'Elétrons passam a ser ejetados imediatamente com energia cinética próxima de 1,22 eV' },
        { id: 'C', text: 'Os elétrons só começam a sair após 10 minutos de aquecimento' },
        { id: 'D', text: 'A energia cinética dos elétrons fica negativa' },
      ],
      correctOption: 'B',
      explanation:
        'Com f = 0,85, cada fóton carrega E = 4,14 × 0,85 ≈ 3,52 eV > 2,3 eV, ejetando elétrons imediatamente com Ec,máx ≈ 1,22 eV.',
      enginePresetBefore: { h: 4.14, phi: 2.3, fLight: 0.45 },
      enginePresetAfter: { h: 4.14, phi: 2.3, fLight: 0.85 },
    },
  ],
  collectiveChallenge: {
    goalDescription:
      'Ativar uma placa de Cobre (φ = 4,7 eV) ejetando elétrons com energia cinética Ec > 1,5 eV escolhendo a frequência da fonte.',
    targetValidationRule: '4.14 * fLight - phi > 1.5 && Math.abs(phi - 4.7) < 0.05',
    votingOptions: [
      {
        id: '1',
        label: 'Luz verde (f = 0,55 × 10¹⁵ Hz) | φ = 4,7 eV',
        preset: { h: 4.14, phi: 4.7, fLight: 0.55 },
        isSuccess: false, // hf = 2.28 eV < 4.7 eV
      },
      {
        id: '2',
        label: 'UV próximo (f = 1,25 × 10¹⁵ Hz) | φ = 4,7 eV',
        preset: { h: 4.14, phi: 4.7, fLight: 1.25 },
        isSuccess: false, // hf = 5.18 eV -> Ec = 0.48 eV < 1.5 eV
      },
      {
        id: '3',
        label: 'UV extremo (f = 1,75 × 10¹⁵ Hz) | φ = 4,7 eV',
        preset: { h: 4.14, phi: 4.7, fLight: 1.75 },
        isSuccess: true, // hf = 7.25 eV -> Ec = 2.55 eV > 1.5 eV
      },
    ],
  },
});
