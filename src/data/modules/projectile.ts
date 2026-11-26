import { ClassroomModule, ClassroomModuleSchema } from '../../classroom/schemas';

export const projectileModule: ClassroomModule = ClassroomModuleSchema.parse({
  id: 'projetil-01',
  engineId: 'projectile',
  title: 'Lançamento de Projétil (Cinemática Vetorial)',
  category: 'Mecânica',
  themeTags: ['segunda-guerra', 'renascimento', 'balistica', 'computacao'],
  historicalHook: {
    year: '1608',
    figure: 'Galileu Galilei',
    shortText:
      'Galileu demonstrou que a trajetória curva de uma bala de canhão é a combinação de dois movimentos independentes acontecendo ao mesmo tempo: um avanço horizontal constante e uma queda vertical acelerada.',
  },
  teacherGuide: {
    openingQuestion:
      'Se eu atirar uma bola para frente e soltar outra reta da mesma altura no mesmo instante, qual toca o chão primeiro?',
    commonPitfall:
      'Alunos chutam que a bola solta em queda livre chega antes. Mostre que o eixo vertical (queda) é independente do avanço horizontal.',
  },
  theoryPill: {
    mythBusted:
      'Atirar um objeto mais forte para frente não faz ele demorar mais para cair no chão.',
    ahaInsight:
      'Sem resistência do ar, a velocidade horizontal é constante, o alcance máximo ocorre a 45° e ângulos complementares (30° e 60°) atingem o mesmo alcance.',
    everydayApp:
      'Arremessos no basquete, chutes de falta no futebol e jatos d’água de mangueiras.',
    formulaLatex:
      'x(t) = v_0\\cos(\\theta)t \\quad | \\quad y(t) = v_0\\sin(\\theta)t - \\tfrac{1}{2}gt^2',
    variablesLegend: [
      'v0: Velocidade inicial de lançamento (m/s)',
      'ang (θ): Ângulo de lançamento (rad)',
      'g: Aceleração da gravidade (m/s²)',
    ],
  },
  interdisciplinaryBridges: [
    {
      subject: 'História',
      themeTag: 'segunda-guerra',
      connectionHook:
        'O cálculo de tabelas balísticas na Segunda Guerra Mundial levou à criação do ENIAC, um dos primeiros computadores eletrônicos programáveis da história.',
      bridgeQuestion: {
        id: 'proj-bridge-hist',
        type: 'interdisciplinary',
        prompt:
          'Qual necessidade prática da Segunda Guerra Mundial motivou o financiamento do ENIAC (1945)?',
        timeLimitSec: 25,
        options: [
          { id: 'A', text: 'Calcular rapidamente tabelas de trajetória balística de projéteis' },
          { id: 'B', text: 'Transmitir jogos de futebol via satélite' },
          { id: 'C', text: 'Criar redes sociais universitárias' },
          { id: 'D', text: 'Controlar carros autônomos elétricos' },
        ],
        correctOption: 'A',
        explanation:
          'Calcular trajetórias considerando ângulo, velocidade e vento levava horas à mão; o ENIAC reduziu esse cálculo para segundos.',
      },
    },
    {
      subject: 'Química',
      themeTag: 'reacoes-exotermicas',
      connectionHook:
        'A combustão rápida do propelente gera gases em alta pressão e temperatura que determinam a velocidade inicial (v0) do projétil ao sair do cano.',
    },
  ],
  quizzes: [
    {
      id: 'proj-q1-intuition',
      type: 'intuition',
      prompt:
        'No ponto mais alto da trajetória de um lançamento oblíquo (sem atrito), qual afirmação é verdadeira?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: 'A velocidade total é zero e a gravidade deixa de atuar' },
        { id: 'B', text: 'A velocidade vertical é zero, mas o corpo continua avançando na horizontal' },
        { id: 'C', text: 'A velocidade horizontal é zero e a vertical é máxima' },
        { id: 'D', text: 'O projétil para no ar por 1 segundo' },
      ],
      correctOption: 'B',
      explanation:
        'No topo da parábola apenas vy = 0; a componente horizontal vx = v0·cos(θ) permanece constante e g continua puxando para baixo.',
      enginePresetBefore: { v0: 14, ang: 0.785, g: 9.8 },
      enginePresetAfter: { v0: 14, ang: 0.785, g: 9.8 },
    },
    {
      id: 'proj-q2-prediction',
      type: 'prediction',
      prompt:
        'Você acertou um alvo usando um ângulo de 30° (0,52 rad). Mantendo a mesma velocidade inicial v0, qual outro ângulo acerta exatamente o mesmo ponto?',
      timeLimitSec: 25,
      options: [
        { id: 'A', text: '45° (0,79 rad)' },
        { id: 'B', text: '60° (1,05 rad) — ângulo complementar' },
        { id: 'C', text: '75° (1,31 rad)' },
        { id: 'D', text: 'Nenhum outro ângulo consegue' },
      ],
      correctOption: 'B',
      explanation:
        'Como sen(2·30°) = sen(60°) = sen(120°) = sen(2·60°), ângulos complementares (soma = 90°) produzem exatamente o mesmo alcance R.',
      enginePresetBefore: { v0: 14, ang: 0.524, g: 9.8 },
      enginePresetAfter: { v0: 14, ang: 1.047, g: 9.8 },
    },
  ],
  collectiveChallenge: {
    goalDescription:
      'Acertar o alvo a ~80 m de distância desviando de um muro central de 15 m de altura (em x = 40 m).',
    votingOptions: [
      {
        id: '1',
        label: 'Ângulo 30° (0,52 rad) | v0 = 30 m/s',
        preset: { v0: 30, ang: 0.524, g: 9.8 },
        isSuccess: false, // Alcance ~79.5m, mas Hmax = 11.5m < 15m (bate no muro!)
      },
      {
        id: '2',
        label: 'Ângulo 52° (0,91 rad) | v0 = 28,5 m/s',
        preset: { v0: 28.5, ang: 0.908, g: 9.8 },
        isSuccess: true, // Alcance ~80.4m e Hmax = 25.7m > 15m (passa o muro e acerta!)
      },
      {
        id: '3',
        label: 'Ângulo 60° (1,05 rad) | v0 = 24 m/s',
        preset: { v0: 24, ang: 1.047, g: 9.8 },
        isSuccess: false, // Passa o muro (Hmax = 22m), mas cai curto (~51m)
      },
    ],
  },
});
