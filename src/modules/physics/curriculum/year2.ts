import { PhysicsExperiment } from '../types';

export const YEAR2_EXPERIMENTS: PhysicsExperiment[] = [
  {
    id: 'ideal-gas',
    year: 2,
    group: 'Termologia',
    title: 'Gases Ideais & Ciclo de Carnot (Diagrama P × V)',
    shortTitle: 'Gases & Carnot',
    summary:
      'Compare as isotermas P(V) = nRT/V nas temperaturas quente (TQ) e fria (TF). A área abaixo da curva representa o trabalho mecânico realizado pelo gás.',
    keyFormulaTex:
      'P(V) = \\frac{nRT}{V}, \\quad \\eta_{\\text{Carnot}} = 1 - \\frac{T_F}{T_Q}',
    legendItems: [
      { label: 'Isoterma Quente (TQ)', color: '#fb7185' },
      { label: 'Isoterma Fria (TF)', color: '#38bdf8' },
    ],
    formulas: [
      { raw: 'y <= (n * 8.31 * TQ) / (1000 * x)', color: '#fb7185' },
      { raw: 'y = (n * 8.31 * TF) / (1000 * x)', color: '#38bdf8' },
    ],
    parameters: {
      n: { value: 2, min: 0.5, max: 6, step: 0.5 },
      TQ: { value: 600, min: 320, max: 1000, step: 20 },
      TF: { value: 300, min: 150, max: 580, step: 20 },
    },
    viewport: { centerX: 4, centerY: 3, scale: 62 },
    visualCard: 'carnot',
    theory: {
      intuition: [
        'Na Equação de Clapeyron (PV = nRT), manter a temperatura T constante produz uma hipérbole equilátera chamada isoterma: quanto maior a temperatura, mais alta e afastada da origem fica a curva.',
        'A 2ª Lei da Termodinâmica estabelece que nenhuma máquina térmica operando entre duas temperaturas TQ e TF pode superar o rendimento de Carnot η = 1 − TF/TQ (sempre em Kelvin!).',
      ],
      equations: [
        {
          latex: 'P \\cdot V = n R T \\implies P(V) = \\frac{nRT}{V}',
          note: 'Equação dos Gases Ideais (eixo x = Volume, eixo y = Pressão).',
        },
        {
          latex: '\\eta_{\\max} = 1 - \\frac{T_F}{T_Q}',
          note: 'Rendimento máximo teórico de uma máquina térmica (Ciclo de Carnot).',
        },
      ],
      variables: [
        { symbol: 'n', name: 'Número de mols do gás', unit: 'mol' },
        { symbol: 'TQ', name: 'Temperatura da fonte quente', unit: 'K' },
        { symbol: 'TF', name: 'Temperatura da fonte fria', unit: 'K' },
      ],
      observations: [
        'Aumente TQ ou reduza TF e observe o card de Carnot mostrar o rendimento teórico subir.',
        'A área sombreada sob a isoterma representa graficamente o trabalho W = ∫ P dV.',
      ],
      scenarios: [
        {
          id: 'gas-50',
          label: 'Rendimento de 50% (TQ = 600K, TF = 300K)',
          description: 'Metade do calor vira trabalho e metade vai para a fonte fria.',
          params: { n: 2, TQ: 600, TF: 300 },
        },
        {
          id: 'gas-high',
          label: 'Alta Eficiência (TQ = 900K, TF = 225K)',
          description: 'Rendimento teórico de 75% com grande afastamento entre isotermas.',
          params: { n: 2, TQ: 900, TF: 225 },
        },
      ],
      commonPitfall:
        'Em Termodinâmica e Carnot, a temperatura SEMPRE deve estar em Kelvin (K = °C + 273). Usar °C gera resultados completamente errados!',
    },
  },
  {
    id: 'snell-optics',
    year: 2,
    group: 'Óptica',
    title: 'Óptica Geométrica — Lei de Snell & Reflexão Total',
    shortTitle: 'Refração (Snell)',
    summary:
      'Arraste o laser diretamente no gráfico para mudar o ângulo θ1 ou inverter a direção (de cima para baixo ou de baixo para cima). Observe o cone crítico e os pulsos de luz mudando de velocidade!',
    keyFormulaTex:
      'n_1\\sin\\theta_1 = n_2\\sin\\theta_2, \\quad \\sin\\theta_L = \\frac{n_{\\text{menor}}}{n_{\\text{maior}}}',
    legendItems: [
      { label: 'Raio Incidente (Arraste!)', color: '#fbbf24' },
      { label: 'Raio Refratado', color: '#38bdf8' },
      { label: 'Refletido / Cone Crítico', color: '#f472b6' },
    ],
    formulas: [{ raw: 'y <= 0', color: '#1e3a5f' }],
    parameters: {
      n1: { value: 1.0, min: 1.0, max: 2.4, step: 0.05 },
      n2: { value: 1.5, min: 1.0, max: 2.4, step: 0.05 },
      ang1: { value: 0.65, min: 0.05, max: 1.48, step: 0.03 },
      dir: { value: 1, min: -1, max: 1, step: 2 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 68 },
    theory: {
      intuition: [
        'Quando a luz muda de meio óptico (ex: ar para água ou vidro para ar), sua velocidade muda e o raio desvia conforme a Lei de Snell-Descartes.',
        'Ao passar de um meio mais refringente (n1 > n2) para um menos refringente, o raio se afasta da normal. Se o ângulo de incidência ultrapassar o ângulo limite θL, toda a luz é refletida de volta — princípio das fibras ópticas!',
      ],
      equations: [
        {
          latex: 'n_1\\sin\\theta_1 = n_2\\sin\\theta_2',
          note: 'Lei de Snell-Descartes da refração.',
        },
        {
          latex: '\\theta_L = \\arcsin\\left(\\frac{n_2}{n_1}\\right) \\quad (n_1 > n_2)',
          note: 'Ângulo limite para ocorrer Reflexão Interna Total.',
        },
      ],
      variables: [
        { symbol: 'n1', name: 'Índice de refração do meio superior', unit: 'adim.' },
        { symbol: 'n2', name: 'Índice de refração do meio inferior', unit: 'adim.' },
        { symbol: 'ang1', name: 'Ângulo de incidência θ₁ (com a normal)', unit: 'rad' },
      ],
      observations: [
        'Os ângulos são sempre medidos em relação à reta Normal (vertical tracejada), nunca em relação à superfície!',
        'Com n1 = 1.5 (vidro) e n2 = 1.0 (ar), o ângulo limite é ≈ 41.8° (0.73 rad). Passe disso e veja o raio refratado desaparecer!',
      ],
      scenarios: [
        {
          id: 'snell-air-water',
          label: 'De Cima → Baixo: Ar para Água (n1=1, n2=1.33)',
          description: 'Luz desacelera ao entrar na água e se aproxima da normal.',
          params: { n1: 1.0, n2: 1.33, ang1: 0.85, dir: 1 },
        },
        {
          id: 'snell-underwater',
          label: 'De Baixo → Cima: Mergulhador olhando o céu',
          description: 'Luz sai da água (n2=1.33) para o ar (n1=1.0) e se afasta da normal.',
          params: { n1: 1.0, n2: 1.33, ang1: 0.55, dir: -1 },
        },
        {
          id: 'snell-tir',
          label: 'Reflexão Interna Total (Baixo → Cima)',
          description: 'Vidro (1.5) → Ar (1.0) acima do cone crítico θL ≈ 41.8°.',
          params: { n1: 1.0, n2: 1.5, ang1: 0.95, dir: -1 },
        },
      ],
      commonPitfall:
        'Reflexão Interna Total SÓ pode acontecer quando a luz tenta passar de um meio de MAIOR índice (n1) para um de MENOR índice (n2).',
    },
  },
  {
    id: 'thin-lens',
    year: 2,
    group: 'Óptica',
    title: 'Lentes Esféricas (Equação de Gauss)',
    shortTitle: 'Lentes (Gauss)',
    summary:
      'Mova o objeto (p) e a distância focal (f) para ver os raios notáveis desenharem a imagem real/virtual, invertida/direita e o aumento linear transversal A.',
    keyFormulaTex:
      '\\frac{1}{f} = \\frac{1}{p} + \\frac{1}{p\'}, \\quad A = -\\frac{p\'}{p}',
    legendItems: [
      { label: 'Objeto (altura h)', color: '#34d399' },
      { label: 'Imagem formada', color: '#f472b6' },
      { label: 'Raios Notáveis', color: '#fbbf24' },
    ],
    formulas: [
      { raw: 'x = 0', color: '#38bdf8' },
      { raw: 'pImg = (p * f) / (p - f)', color: '#94a3b8' },
      { raw: 'A = -pImg / p', color: '#f472b6' },
    ],
    parameters: {
      f: { value: 2.0, min: -4.0, max: 4.0, step: 0.2 },
      p: { value: 4.2, min: 0.6, max: 7.5, step: 0.2 },
      hObj: { value: 1.6, min: 0.5, max: 3.0, step: 0.1 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 62 },
    theory: {
      intuition: [
        'Lentes convergentes (f > 0) concentram raios paralelos no foco F′. Dependendo da distância p do objeto até a lente, a imagem pode ser real e invertida (p > f) ou virtual, direita e ampliada — como em uma lupa (p < f)!',
        'Lentes divergentes (f < 0) sempre formam imagens virtuais, direitas e menores que o objeto.',
      ],
      equations: [
        {
          latex: '\\frac{1}{f} = \\frac{1}{p} + \\frac{1}{p\'} \\implies p\' = \\frac{p \\cdot f}{p - f}',
          note: 'Equação de Gauss para lentes delgadas.',
        },
        {
          latex: 'A = \\frac{i}{o} = -\\frac{p\'}{p}',
          note: 'Aumento linear transversal (negativo = imagem invertida).',
        },
      ],
      variables: [
        { symbol: 'f', name: 'Distância focal (>0 convergente, <0 divergente)', unit: 'm' },
        { symbol: 'p', name: 'Distância do objeto à lente', unit: 'm' },
        { symbol: 'hObj', name: 'Altura do objeto', unit: 'm' },
      ],
      observations: [
        'Aproxime o objeto p para dentro do foco (p < f) e veja a imagem virar virtual (tracejada do mesmo lado) e ampliada!',
      ],
      scenarios: [
        {
          id: 'lens-real',
          label: 'Imagem Real Invertida (p > 2f)',
          description: 'Objeto longe da lente convergente: imagem menor e invertida.',
          params: { f: 2.0, p: 5.2, hObj: 1.6 },
        },
        {
          id: 'lens-lupa',
          label: 'Modo Lupa (p < f)',
          description: 'Objeto entre o foco e a lente: imagem virtual, direita e ampliada.',
          params: { f: 2.5, p: 1.4, hObj: 1.2 },
        },
        {
          id: 'lens-div',
          label: 'Lente Divergente (f < 0)',
          description: 'Sempre forma imagem virtual, direita e reduzida.',
          params: { f: -2.2, p: 3.5, hObj: 1.8 },
        },
      ],
      commonPitfall:
        'Quando p = f (objeto exatamente sobre o foco), os raios saem paralelos e a imagem é imprópria (formada no infinito)!',
    },
  },
  {
    id: 'doppler-wave',
    year: 2,
    group: 'Ondulatória',
    title: 'Ondulatória — Equação Fundamental & Efeito Doppler',
    shortTitle: 'Efeito Doppler',
    summary:
      'Uma fonte sonora se move com velocidade vs emitindo frentes de onda com rapidez v. Veja a compressão do comprimento de onda à frente (som mais agudo) e o alongamento atrás.',
    keyFormulaTex:
      'v = \\lambda f, \\quad f\' = f\\frac{v}{v \\mp v_s}',
    legendItems: [
      { label: 'Frentes de Onda', color: '#38bdf8' },
      { label: 'Fonte Móvel (vs)', color: '#fbbf24' },
      { label: 'Onda Harmônica', color: '#34d399' },
    ],
    formulas: [
      { raw: 'y = 0.6 * sin((2 * π * f0 / vWave) * x - 2 * π * f0 * t) - 3.2', color: '#34d399' },
    ],
    parameters: {
      vWave: { value: 3.0, min: 1.5, max: 6.0, step: 0.2 },
      vSource: { value: 1.4, min: 0, max: 3.8, step: 0.2 },
      f0: { value: 1.5, min: 0.5, max: 4.0, step: 0.1 },
    },
    viewport: { centerX: 0, centerY: -0.5, scale: 58 },
    theory: {
      intuition: [
        'Toda onda obedece à equação fundamental v = λ·f. Quando uma fonte sonora (como uma ambulância) se move, ela "corre atrás" das ondas que emitiu à frente, encurtando o comprimento de onda λ e aumentando a frequência percebida f′ (som mais agudo).',
        'Se a velocidade da fonte igualar ou ultrapassar a velocidade da onda (vs ≥ v, número de Mach ≥ 1), as frentes de onda se empilham formando um Cone de Mach (onda de choque)!',
      ],
      equations: [
        {
          latex: 'v = \\lambda \\cdot f',
          note: 'Equação fundamental da ondulatória.',
        },
        {
          latex: 'f_{\\text{aprox}} = f_0\\frac{v}{v - v_s}, \\quad f_{\\text{afast}} = f_0\\frac{v}{v + v_s}',
          note: 'Frequência aparente na aproximação e no afastamento da fonte.',
        },
      ],
      variables: [
        { symbol: 'vWave', name: 'Velocidade de propagação da onda v', unit: 'm/s' },
        { symbol: 'vSource', name: 'Velocidade da fonte emissora vs', unit: 'm/s' },
        { symbol: 'f0', name: 'Frequência natural da fonte', unit: 'Hz' },
      ],
      observations: [
        'Compare o espaçamento entre os círculos azuis à direita (aproximação) e à esquerda (afastamento) da fonte amarela.',
        'Teste aumentar vSource acima de vWave para visualizar o Cone de Mach supersônico!',
      ],
      scenarios: [
        {
          id: 'dop-static',
          label: 'Fonte Parada (vs = 0)',
          description: 'Frentes concêntricas simétricas: f′ = f0 em todas as direções.',
          params: { vWave: 3.0, vSource: 0, f0: 1.5 },
          resetTime: true,
        },
        {
          id: 'dop-sub',
          label: 'Ambulância Subsônica (vs = 1.6)',
          description: 'Clara compressão à frente e rarefação atrás.',
          params: { vWave: 3.0, vSource: 1.6, f0: 1.5 },
          resetTime: true,
        },
        {
          id: 'dop-mach',
          label: 'Supersônico — Cone de Mach (vs > v)',
          description: 'Fonte ultrapassa as próprias ondas formando onda de choque!',
          params: { vWave: 2.2, vSource: 3.2, f0: 1.8 },
          resetTime: true,
        },
      ],
      commonPitfall:
        'O Efeito Doppler NÃO altera a velocidade de propagação da onda no meio (v depende apenas do meio), mas sim o comprimento de onda λ e a frequência percebida f′!',
    },
  },
];
