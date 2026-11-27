import { PhysicsExperiment } from '../types';

export const YEAR1_EXPERIMENTS: PhysicsExperiment[] = [
  {
    id: 'mruv',
    year: 1,
    group: 'Cinemática',
    title: 'Movimento Retilíneo (MU & MUV)',
    shortTitle: 'MU & MUV',
    summary:
      'Compare a função horária da posição s(x) com a velocidade v(x). Quando a = 0 temos Movimento Uniforme (reta); com a ≠ 0 surge a parábola do MUV.',
    keyFormulaTex:
      's(t) = s_0 + v_0 t + \\tfrac{1}{2}at^2, \\quad v(t) = v_0 + at',
    legendItems: [
      { label: 'Posição s(t)', color: '#38bdf8' },
      { label: 'Velocidade v(t)', color: '#f472b6' },
      { label: 'Instante atual t', color: '#fbbf24' },
    ],
    formulas: [
      { raw: 'y = s0 + v0 * x + 0.5 * a * x^2', color: '#38bdf8' },
      { raw: 'y = v0 + a * x', color: '#f472b6' },
      { raw: 'p(t) = (t, s0 + v0 * t + 0.5 * a * t^2)', color: '#fbbf24' },
    ],
    parameters: {
      s0: { value: 0, min: -5, max: 5, step: 0.2 },
      v0: { value: 4, min: -6, max: 10, step: 0.2 },
      a: { value: -1.5, min: -5, max: 5, step: 0.1 },
    },
    viewport: { centerX: 3, centerY: 2, scale: 52 },
    theory: {
      intuition: [
        'No Movimento Uniforme (MU), a aceleração é nula (a = 0) e a posição varia linearmente com o tempo. Já no Movimento Uniformemente Variado (MUV), a velocidade varia em taxa constante a, fazendo a posição descrever uma parábola.',
        'O vértice da parábola s(t) ocorre exatamente no instante em que a reta da velocidade v(t) cruza o eixo zero — momento em que o móvel inverte o sentido do movimento!',
      ],
      equations: [
        {
          latex: 's(t) = s_0 + v_0 t + \\tfrac{1}{2}a t^2',
          note: 'Função horária da posição (equação do sorvetão).',
        },
        {
          latex: 'v(t) = v_0 + a t, \\quad v^2 = v_0^2 + 2a\\Delta s',
          note: 'Velocidade no tempo e Equação de Torricelli.',
        },
      ],
      variables: [
        { symbol: 's0', name: 'Posição inicial', unit: 'm' },
        { symbol: 'v0', name: 'Velocidade inicial', unit: 'm/s' },
        { symbol: 'a', name: 'Aceleração escalar constante', unit: 'm/s²' },
      ],
      observations: [
        'Veja que onde a reta rosa v(x) cruza y = 0, a curva azul s(x) atinge exatamente seu ponto de máximo ou mínimo.',
        'Com a = 0, s(x) vira uma reta inclinada e v(x) uma reta horizontal constante.',
      ],
      scenarios: [
        {
          id: 'mruv-mu',
          label: 'MU Puro (a = 0)',
          description: 'Velocidade constante: posição cresce em linha reta.',
          params: { s0: 0, v0: 2.5, a: 0 },
          resetTime: true,
        },
        {
          id: 'mruv-brake',
          label: 'Frenagem e Retorno (a < 0)',
          description: 'Parte com v0 positiva, freia até parar e inverte o sentido.',
          params: { s0: 0, v0: 5, a: -2 },
          resetTime: true,
        },
        {
          id: 'mruv-freefall',
          label: 'Queda Livre (g = -9.8 m/s²)',
          description: 'Solto do repouso a 10 m de altura sob gravidade.',
          params: { s0: 5, v0: 0, a: -9.8 },
          resetTime: true,
        },
      ],
      commonPitfall:
        'Aceleração negativa (a < 0) nem sempre significa "frear": se v e a tiverem o mesmo sinal (ambos negativos), o corpo está acelerando no sentido retrógrado!',
    },
  },
  {
    id: 'projectile',
    year: 1,
    group: 'Cinemática',
    title: 'Lançamento Oblíquo (Projétil)',
    shortTitle: 'Projétil (2D)',
    summary:
      'Combina MRU na horizontal com MRUV na vertical sob gravidade g. Ajuste a velocidade inicial v0 e o ângulo (rad) para observar alcance R e altura máxima H.',
    keyFormulaTex:
      'x(t) = v_0\\cos(\\theta)t, \\quad y(t) = v_0\\sin(\\theta)t - \\tfrac{1}{2}gt^2',
    legendItems: [
      { label: 'Trajetória & Partícula', color: '#38bdf8' },
      { label: 'Vetor Velocidade v', color: '#fbbf24' },
      { label: 'Altura Máx (H) & Alcance (R)', color: '#34d399' },
    ],
    formulas: [
      {
        raw: 'p(t) = (v0 * cos(ang) * t, v0 * sin(ang) * t - 0.5 * g * t^2)',
        color: '#38bdf8',
      },
      { raw: 'y <= 0', color: '#334155' },
    ],
    parameters: {
      v0: { value: 12, min: 3, max: 35, step: 0.5 },
      ang: { value: 0.9, min: 0.15, max: 1.45, step: 0.05 },
      g: { value: 9.8, min: 1.6, max: 20, step: 0.2 },
    },
    viewport: { centerX: 6.5, centerY: 3.2, scale: 38 },
    theory: {
      intuition: [
        'No lançamento oblíquo (sem resistência do ar), o movimento em 2D se decompõe em dois movimentos independentes: MU na horizontal e MUV na vertical sob gravidade g.',
        'A combinação gera uma parábola perfeita cujo alcance máximo ocorre em 45° (π/4 ≈ 0,785 rad).',
      ],
      equations: [
        {
          latex: 'x(t) = v_0\\cos(\\theta)\\,t, \\quad y(t) = v_0\\sin(\\theta)\\,t - \\tfrac{1}{2}gt^2',
          note: 'Equações paramétricas do lançamento oblíquo.',
        },
        {
          latex: 'H_{\\max} = \\frac{(v_0\\sin\\theta)^2}{2g}, \\quad R = \\frac{v_0^2\\sin(2\\theta)}{g}',
          note: 'Altura máxima e alcance horizontal no mesmo nível.',
        },
      ],
      variables: [
        { symbol: 'v0', name: 'Velocidade inicial de lançamento', unit: 'm/s' },
        { symbol: 'ang', name: 'Ângulo de lançamento θ', unit: 'rad' },
        { symbol: 'g', name: 'Aceleração da gravidade', unit: 'm/s²' },
      ],
      observations: [
        'O vetor velocidade amarelo é sempre tangente à curva e fica horizontal no topo.',
        'Ângulos complementares (ex: 30° e 60°) geram o mesmo alcance R.',
      ],
      scenarios: [
        {
          id: 'proj-45',
          label: 'Ângulo de 45° (Alcance Máximo)',
          description: 'Define ang ≈ 0.785 rad com g = 9.8 m/s².',
          params: { v0: 12, ang: 0.785, g: 9.8 },
          resetTime: true,
        },
        {
          id: 'proj-moon',
          label: 'Gravidade Lunar (1.6 m/s²)',
          description: 'Veja como o alcance e a altura crescem na Lua.',
          params: { v0: 8, ang: 0.785, g: 1.6 },
          resetTime: true,
        },
      ],
      commonPitfall:
        'Na altura máxima, vy = 0, mas a velocidade total NÃO é zero (resta vx = v0·cos θ) e a aceleração continua sendo g para baixo!',
    },
  },
  {
    id: 'rotational',
    year: 1,
    group: 'Cinemática',
    title: 'Movimento Rotacional (MCU & MCUV)',
    shortTitle: 'Rotacional (MCU)',
    summary:
      'Um ponto gira em um disco de raio R com velocidade angular w0 e aceleração angular alpha. Veja o arco θ(t), a velocidade tangencial v e a aceleração centrípeta ac.',
    keyFormulaTex:
      '\\theta(t) = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2, \\quad z(t) = R\\,e^{i\\theta(t)}',
    legendItems: [
      { label: 'Raio & Posição z(t)', color: '#38bdf8' },
      { label: 'Velocidade Tangencial v', color: '#34d399' },
      { label: 'Aceleração Centrípeta ac', color: '#f472b6' },
    ],
    formulas: [
      { raw: 'theta = w0 * t + 0.5 * alpha * t^2', color: '#94a3b8' },
      { raw: 'z(t) = R * e^(i * theta)', color: '#38bdf8' },
      { raw: 'y = R * sin(w0 * x)', color: '#34d399' },
    ],
    parameters: {
      R: { value: 2.6, min: 0.8, max: 5, step: 0.1 },
      w0: { value: 1.4, min: 0, max: 5, step: 0.1 },
      alpha: { value: 0.2, min: -1.5, max: 1.5, step: 0.05 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 68 },
    theory: {
      intuition: [
        'No Movimento Circular, mesmo com rapidez constante (α = 0), a direção da velocidade muda continuamente — exigindo a aceleração centrípeta ac apontando sempre para o centro.',
      ],
      equations: [
        {
          latex: '\\theta(t) = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2',
          note: 'Posição angular em radianos.',
        },
        {
          latex: 'v = \\omega R, \\quad a_c = \\frac{v^2}{R} = \\omega^2 R',
          note: 'Velocidade tangencial e aceleração centrípeta.',
        },
      ],
      variables: [
        { symbol: 'R', name: 'Raio da trajetória', unit: 'm' },
        { symbol: 'w0', name: 'Velocidade angular inicial ω₀', unit: 'rad/s' },
        { symbol: 'alpha', name: 'Aceleração angular α', unit: 'rad/s²' },
      ],
      observations: [
        'A seta verde (v) é sempre perpendicular ao raio; a rosa (ac) aponta sempre para o centro.',
      ],
      scenarios: [
        {
          id: 'rot-mcu',
          label: 'MCU Puro (α = 0)',
          description: 'Velocidade angular constante.',
          params: { R: 2.6, w0: 1.8, alpha: 0 },
          resetTime: true,
        },
        {
          id: 'rot-accel',
          label: 'Partida Acelerada (α > 0)',
          description: 'Parte do repouso ganhando rapidez angular.',
          params: { R: 2.8, w0: 0, alpha: 0.6 },
          resetTime: true,
        },
      ],
      commonPitfall:
        'A aceleração centrípeta NÃO muda o módulo da velocidade; ela muda apenas sua direção!',
    },
  },
  {
    id: 'inclined-plane',
    year: 1,
    group: 'Dinâmica',
    title: 'Plano Inclinado, Leis de Newton & Atrito',
    shortTitle: 'Plano Inclinado',
    summary:
      'Veja a decomposição do Peso (Px e Py), a Normal N e a força de atrito fat em um plano inclinado de ângulo ang, e a curva de deslocamento resultante s(x).',
    keyFormulaTex:
      'F_R = mg(\\sin\\theta - \\mu\\cos\\theta), \\quad a = g(\\sin\\theta - \\mu\\cos\\theta)',
    legendItems: [
      { label: 'Deslocamento s(x)', color: '#38bdf8' },
      { label: 'Peso P & Componentes', color: '#fbbf24' },
      { label: 'Normal N & Atrito fat', color: '#f472b6' },
    ],
    formulas: [
      { raw: 'aNet = max(0, g * (sin(ang) - mu * cos(ang)))', color: '#94a3b8' },
      { raw: 'y = 0.5 * aNet * x^2', color: '#38bdf8' },
    ],
    parameters: {
      m: { value: 4, min: 1, max: 15, step: 0.5 },
      ang: { value: 0.55, min: 0.1, max: 1.25, step: 0.05 },
      mu: { value: 0.25, min: 0, max: 1.0, step: 0.05 },
      g: { value: 9.8, min: 1.6, max: 15, step: 0.2 },
    },
    viewport: { centerX: 2.5, centerY: 2.5, scale: 52 },
    theory: {
      intuition: [
        'Em um plano inclinado de ângulo θ, o peso P = m·g se divide em duas componentes: Px = P·sen(θ) (que puxa o bloco rampa abaixo) e Py = P·cos(θ) (que pressiona o bloco contra a superfície e é equilibrada pela Normal N).',
        'O atrito se opõe ao escorregamento com força máxima fat = μ·N = μ·m·g·cos(θ). O bloco só desliza se tan(θ) > μ — note que a massa m se cancela na aceleração!',
      ],
      equations: [
        {
          latex: 'P_x = mg\\sin\\theta, \\quad N = P_y = mg\\cos\\theta',
          note: 'Decomposição do peso paralelo e perpendicular à rampa.',
        },
        {
          latex: 'f_{at} = \\mu N = \\mu mg\\cos\\theta',
          note: 'Força de atrito cinético/máximo estático.',
        },
        {
          latex: 'a = g(\\sin\\theta - \\mu\\cos\\theta)',
          note: 'Aceleração de descida pela 2ª Lei de Newton (F_R = m·a).',
        },
      ],
      variables: [
        { symbol: 'm', name: 'Massa do bloco', unit: 'kg' },
        { symbol: 'ang', name: 'Ângulo da rampa θ', unit: 'rad' },
        { symbol: 'mu', name: 'Coeficiente de atrito μ', unit: 'adim.' },
        { symbol: 'aNet', name: 'Aceleração resultante', unit: 'm/s²' },
      ],
      observations: [
        'Aumente μ até aNet zerar: o bloco fica em equilíbrio estático (tan θ ≤ μ).',
        'Altere a massa m e note que as forças crescem, mas a aceleração aNet não muda!',
      ],
      scenarios: [
        {
          id: 'inc-ice',
          label: 'Sem Atrito (Gelo, μ = 0)',
          description: 'Aceleração pura a = g·sen(θ).',
          params: { m: 4, ang: 0.52, mu: 0, g: 9.8 },
          resetTime: true,
        },
        {
          id: 'inc-stuck',
          label: 'Equilíbrio Estático (Trava)',
          description: 'Atrito alto impede o bloco de descer (aNet = 0).',
          params: { m: 4, ang: 0.35, mu: 0.6, g: 9.8 },
          resetTime: true,
        },
      ],
      commonPitfall:
        'A força Normal NÃO é sempre igual ao Peso! No plano inclinado, N = m·g·cos(θ), que é sempre menor que m·g.',
    },
  },
  {
    id: 'energy-conservation',
    year: 1,
    group: 'Dinâmica',
    title: 'Conservação da Energia Mecânica',
    shortTitle: 'Energia Mecânica',
    summary:
      'Uma partícula oscila em um poço parabólico (sem atrito): observe a troca contínua entre Energia Potencial Ep e Energia Cinética Ec mantendo Em constante.',
    keyFormulaTex:
      'E_m = E_c + E_p = \\tfrac{1}{2}mv^2 + mgh = \\text{constante}',
    legendItems: [
      { label: 'Pista / Potencial y = k·x²', color: '#38bdf8' },
      { label: 'Partícula oscilando', color: '#fbbf24' },
      { label: 'Nível de Energia Em', color: '#34d399' },
    ],
    formulas: [
      { raw: 'y = k * x^2', color: '#38bdf8' },
      { raw: 'y = k * A^2', color: '#34d399' },
      { raw: 'p(t) = (A * cos(w * t), k * (A * cos(w * t))^2)', color: '#fbbf24' },
    ],
    parameters: {
      m: { value: 2, min: 0.5, max: 10, step: 0.5 },
      A: { value: 3, min: 0.8, max: 5, step: 0.2 },
      k: { value: 0.35, min: 0.1, max: 1.0, step: 0.05 },
      w: { value: 1.6, min: 0.4, max: 4, step: 0.1 },
    },
    viewport: { centerX: 0, centerY: 2.2, scale: 62 },
    visualCard: 'energy',
    theory: {
      intuition: [
        'Em sistemas conservativos (sem atrito ou arrasto), a Energia Mecânica Total Em = Ec + Ep permanece rigorosamente constante.',
        'Nos extremos da pista (altura máxima), toda a energia é Potencial (Ep máxima, Ec = 0). Ao passar pelo fundo (h = 0), toda a energia se converte em Cinética (velocidade máxima!).',
      ],
      equations: [
        {
          latex: 'E_p = m g h, \\quad E_c = \\tfrac{1}{2} m v^2',
          note: 'Energia potencial gravitacional e energia cinética.',
        },
        {
          latex: 'E_{c,1} + E_{p,1} = E_{c,2} + E_{p,2}',
          note: 'Princípio da Conservação da Energia Mecânica.',
        },
      ],
      variables: [
        { symbol: 'm', name: 'Massa do corpo', unit: 'kg' },
        { symbol: 'A', name: 'Amplitude horizontal máxima', unit: 'm' },
        { symbol: 'k', name: 'Curvatura da pista', unit: '1/m' },
      ],
      observations: [
        'Acompanhe as barras no canto superior esquerdo: quando a barra azul (Ep) sobe, a amarela (Ec) cai na mesma medida, mantendo a soma Em verde fixa!',
      ],
      scenarios: [
        {
          id: 'en-high',
          label: 'Grande Amplitude (Alta Energia)',
          description: 'Mais altura inicial → maior velocidade no fundo da pista.',
          params: { m: 2, A: 4.2, k: 0.35, w: 1.8 },
          resetTime: false,
        },
        {
          id: 'en-heavy',
          label: 'Corpo Mais Pesado (m = 8 kg)',
          description: 'Multiplica todas as energias proporcionalmente à massa.',
          params: { m: 8, A: 3, k: 0.35, w: 1.6 },
          resetTime: false,
        },
      ],
      commonPitfall:
        'A velocidade no fundo de uma rampa sem atrito NÃO depende da massa do objeto nem do formato da curva, apenas da diferença de altura h (v = √(2gh))!',
    },
  },
  {
    id: 'hydrostatics',
    year: 1,
    group: 'Hidrostática',
    title: 'Hidrostática — Stevin & Empuxo (Arquimedes)',
    shortTitle: 'Stevin & Empuxo',
    summary:
      'Veja a pressão crescer linearmente com a profundidade x (Teorema de Stevin) e compare as densidades do corpo e do fluido no tanque interativo de Empuxo.',
    keyFormulaTex:
      'P(h) = P_0 + \\rho_{\\text{f}} g h, \\quad E = \\rho_{\\text{f}} g V_{\\text{sub}}',
    legendItems: [
      { label: 'Pressão Hidrostática P(h) [kPa]', color: '#38bdf8' },
      { label: 'Pressão Atmosférica P0', color: '#94a3b8' },
    ],
    formulas: [
      { raw: 'y = P0 + (rhoF * g * x) / 1000', color: '#38bdf8' },
      { raw: 'y = P0', color: '#94a3b8' },
      { raw: 'x = h', color: '#fbbf24' },
    ],
    parameters: {
      P0: { value: 101, min: 80, max: 120, step: 1 },
      rhoF: { value: 1000, min: 600, max: 2000, step: 50 },
      rhoC: { value: 700, min: 200, max: 2200, step: 50 },
      h: { value: 4, min: 0.5, max: 15, step: 0.5 },
      g: { value: 9.8, min: 1.6, max: 15, step: 0.2 },
    },
    viewport: { centerX: 5, centerY: 130, scale: 6 },
    visualCard: 'hydrostatics',
    theory: {
      intuition: [
        'O Teorema de Stevin mostra que a pressão em um fluido em repouso cresce linearmente com a profundidade h (a cada 10 m de água, a pressão aumenta cerca de 1 atm ≈ 100 kPa).',
        'Já o Princípio de Arquimedes afirma que todo corpo imerso recebe um empuxo vertical para cima igual ao peso do fluido deslocado. Se ρ_corpo < ρ_fluido, ele flutua com fração submersa igual a ρ_corpo / ρ_fluido!',
      ],
      equations: [
        {
          latex: 'P(h) = P_0 + \\rho_f g h',
          note: 'Teorema de Stevin (pressão absoluta na profundidade h).',
        },
        {
          latex: 'E = \\rho_f g V_{\\text{sub}}, \\quad \\frac{V_{\\text{sub}}}{V} = \\frac{\\rho_c}{\\rho_f}',
          note: 'Empuxo e fração submersa para corpos que flutuam (ρ_c ≤ ρ_f).',
        },
      ],
      variables: [
        { symbol: 'P0', name: 'Pressão atmosférica na superfície', unit: 'kPa' },
        { symbol: 'rhoF', name: 'Densidade do fluido (água = 1000)', unit: 'kg/m³' },
        { symbol: 'rhoC', name: 'Densidade do corpo', unit: 'kg/m³' },
        { symbol: 'h', name: 'Profundidade analisada', unit: 'm' },
      ],
      observations: [
        'No tanque visual, teste ajustar rhoC acima e abaixo de rhoF para ver o bloco afundar ou flutuar!',
      ],
      scenarios: [
        {
          id: 'hyd-ice',
          label: 'Iceberg na Água (ρc = 900)',
          description: '90% do bloco fica submerso e apenas 10% acima da linha d’água!',
          params: { P0: 101, rhoF: 1000, rhoC: 900, h: 4, g: 9.8 },
        },
        {
          id: 'hyd-iron',
          label: 'Bloco Pesado Afundando (ρc = 1800)',
          description: 'Peso supera o empuxo máximo e o bloco vai para o fundo.',
          params: { P0: 101, rhoF: 1000, rhoC: 1800, h: 8, g: 9.8 },
        },
        {
          id: 'hyd-wood',
          label: 'Madeira Leve (ρc = 450)',
          description: 'Flutua com menos da metade do volume submerso.',
          params: { P0: 101, rhoF: 1000, rhoC: 450, h: 2, g: 9.8 },
        },
      ],
      commonPitfall:
        'A pressão hidrostática no fundo de um recipiente NÃO depende do formato ou da largura do tanque, apenas da profundidade h e da densidade do líquido!',
    },
  },
  {
    id: 'kepler',
    year: 1,
    group: 'Gravitação',
    title: 'Lei Gravitacional — Órbitas de Kepler',
    shortTitle: 'Órbitas (Kepler)',
    summary:
      'Solução analítica das órbitas gravitacionais com o Sol no foco (0, 0). Altere a excentricidade ecc: 0 = círculo, entre 0 e 1 = elipse, 1 = parábola, acima de 1 = hipérbole.',
    keyFormulaTex:
      'r(\\theta) = \\frac{q(1 + \\varepsilon)}{1 + \\varepsilon\\cos\\theta}',
    legendItems: [
      { label: 'Órbita & Planeta', color: '#38bdf8' },
      { label: 'Estrela / Foco (0, 0)', color: '#fbbf24' },
      { label: 'Periélio & Afélio', color: '#34d399' },
    ],
    formulas: [
      { raw: 'p = q * (1 + ecc)', color: '#94a3b8' },
      { raw: 'z(t) = 1 + ecc * cos(t) > 0 ? (p / (1 + ecc * cos(t))) * e^(i * t) : NaN', color: '#38bdf8' },
    ],
    parameters: {
      q: { value: 1.4, min: 0.5, max: 4.5, step: 0.1 },
      ecc: { value: 0.58, min: 0, max: 1.35, step: 0.01 },
    },
    viewport: { centerX: -2.4, centerY: 0, scale: 46 },
    theory: {
      intuition: [
        'A 1ª Lei de Kepler afirma que planetas descrevem órbitas elípticas com o Sol em um dos focos. Newton provou que isso decorre da força gravitacional cair com 1/r².',
      ],
      equations: [
        {
          latex: 'F = G\\frac{Mm}{r^2}, \\quad r(\\theta) = \\frac{p}{1 + \\varepsilon\\cos\\theta}',
          note: 'Gravitação Universal e equação polar das cônicas.',
        },
      ],
      variables: [
        { symbol: 'q', name: 'Distância ao periélio', unit: 'UA' },
        { symbol: 'ecc', name: 'Excentricidade orbital ε', unit: 'adim.' },
      ],
      observations: [
        'Veja o Sol em (0, 0) ficar fora do centro da elipse conforme ecc aumenta.',
      ],
      scenarios: [
        {
          id: 'kep-circle',
          label: 'Órbita Circular (ε = 0)',
          description: 'Periélio e Afélio ficam iguais ao raio q.',
          params: { q: 3.0, ecc: 0 },
        },
        {
          id: 'kep-comet',
          label: 'Elipse Excêntrica (ε = 0.72)',
          description: 'Órbita alongada típica de cometas periódicos.',
          params: { q: 1.0, ecc: 0.72 },
        },
        {
          id: 'kep-hyper',
          label: 'Passagem Hiperbólica (ε = 1.25)',
          description: 'Trajetória aberta de escape.',
          params: { q: 0.6, ecc: 1.25 },
        },
      ],
      commonPitfall:
        'As estações do ano na Terra NÃO vêm da distância ao Sol, mas da inclinação de 23,5° do eixo terrestre!',
    },
  },
];
