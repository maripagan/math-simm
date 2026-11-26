import { PhysicsExperiment } from '../types';

export const YEAR3_EXPERIMENTS: PhysicsExperiment[] = [
  {
    id: 'coulomb-electrostatics',
    year: 3,
    group: 'Eletrostática',
    title: 'Lei de Coulomb & Potencial Elétrico',
    shortTitle: 'Lei de Coulomb',
    summary:
      'Veja a força eletrostática F(r) cair com 1/r² e observe as cargas q1 e q2 se atraindo (sinais opostos) ou repelindo (mesmo sinal) no diagrama ao vivo.',
    keyFormulaTex:
      'F(r) = k\\frac{|q_1 q_2|}{r^2}, \\quad V(r) = \\frac{k q_1}{r}',
    legendItems: [
      { label: 'Força F(r) (k·|q1·q2|/x²)', color: '#38bdf8' },
      { label: 'Potencial V(x) de q1', color: '#f472b6' },
      { label: 'Distância atual d', color: '#fbbf24' },
    ],
    formulas: [
      { raw: 'y = (9 * abs(q1 * q2)) / (x^2)', color: '#38bdf8' },
      { raw: 'y = (9 * q1) / abs(x)', color: '#f472b6' },
      { raw: 'x = d', color: '#fbbf24' },
    ],
    parameters: {
      q1: { value: 2, min: -5, max: 5, step: 0.5 },
      q2: { value: -2, min: -5, max: 5, step: 0.5 },
      d: { value: 2.5, min: 0.8, max: 6, step: 0.1 },
    },
    viewport: { centerX: 2.5, centerY: 3, scale: 52 },
    theory: {
      intuition: [
        'A Lei de Coulomb descreve a interação entre cargas elétricas em repouso: cargas de mesmo sinal se repelem e cargas de sinais opostos se atraem.',
        'Assim como a gravitação, a força cai com o inverso do quadrado da distância (1/r²): dobrar a distância reduz a força a 1/4 do valor original!',
      ],
      equations: [
        {
          latex: 'F = k_0\\frac{|q_1 q_2|}{d^2}',
          note: 'Lei de Coulomb (k₀ ≈ 9×10⁹ N·m²/C² no vácuo).',
        },
        {
          latex: 'E = \\frac{k_0 |q|}{d^2}, \\quad V = \\frac{k_0 q}{d}',
          note: 'Campo elétrico (vetorial) e Potencial elétrico (escalar).',
        },
      ],
      variables: [
        { symbol: 'q1', name: 'Carga elétrica 1 (em μC)', unit: 'μC' },
        { symbol: 'q2', name: 'Carga elétrica 2 (em μC)', unit: 'μC' },
        { symbol: 'd', name: 'Distância entre as cargas', unit: 'm' },
      ],
      observations: [
        'Inverta o sinal de q2 (de negativo para positivo) e veja as setas no card visual mudarem de Atração para Repulsão!',
      ],
      scenarios: [
        {
          id: 'coul-attract',
          label: 'Atração (Dipolo +2 / -2)',
          description: 'Cargas opostas se puxam com forças iguais e contrárias.',
          params: { q1: 2, q2: -2, d: 2.2 },
        },
        {
          id: 'coul-repel',
          label: 'Repulsão Forte (+4 / +3)',
          description: 'Mesmo sinal: setas apontam para fora e força dispara de perto.',
          params: { q1: 4, q2: 3, d: 1.5 },
        },
      ],
      commonPitfall:
        'Mesmo que q1 seja 10 vezes maior que q2, a força que q1 faz em q2 tem EXATAMENTE o mesmo módulo da força que q2 faz em q1 (3ª Lei de Newton)!',
    },
  },
  {
    id: 'dc-rc',
    year: 3,
    group: 'Circuitos DC',
    title: 'Circuito Elétrico DC — Carga de Capacitor RC',
    shortTitle: 'Circuito DC (RC)',
    summary:
      'Acompanhe a tensão no capacitor Vc(x) subindo exponencialmente enquanto a corrente I(x) cai. Em x = τ = R·C, o capacitor atinge 63,2% de V0.',
    keyFormulaTex:
      'V_C(t) = V_0\\left(1 - e^{-t/(RC)}\\right), \\quad I(t) = \\frac{V_0}{R}e^{-t/(RC)}',
    legendItems: [
      { label: 'Tensão Vc(x)', color: '#38bdf8' },
      { label: 'Corrente I(x)', color: '#fbbf24' },
      { label: 'Constante de Tempo τ = RC', color: '#f472b6' },
    ],
    formulas: [
      { raw: 'tauRC = R * C', color: '#94a3b8' },
      { raw: 'y = V0 * (1 - e^(-x / tauRC))', color: '#38bdf8' },
      { raw: 'y = (V0 / R) * e^(-x / tauRC)', color: '#fbbf24' },
      { raw: 'x = tauRC', color: '#f472b6' },
    ],
    parameters: {
      V0: { value: 5, min: 1, max: 12, step: 0.5 },
      R: { value: 2, min: 0.5, max: 10, step: 0.2 },
      C: { value: 1.2, min: 0.2, max: 5, step: 0.1 },
    },
    viewport: { centerX: 3.5, centerY: 2.5, scale: 58 },
    visualCard: 'dc-rc',
    theory: {
      intuition: [
        'Quando ligamos uma fonte contínua V0 a um resistor R e um capacitor C descarregado, a corrente começa máxima (V0/R) e cai exponencialmente conforme o capacitor se carrega.',
        'A constante de tempo τ = R·C determina a rapidez da carga: em t = τ o capacitor atinge 63,2% de V0.',
      ],
      equations: [
        {
          latex: '\\tau = R \\cdot C, \\quad V_C(t) = V_0(1 - e^{-t/\\tau})',
          note: 'Constante de tempo e curva de carga exponencial.',
        },
      ],
      variables: [
        { symbol: 'V0', name: 'Tensão da fonte DC', unit: 'V' },
        { symbol: 'R', name: 'Resistência elétrica', unit: 'Ω' },
        { symbol: 'C', name: 'Capacitância', unit: 'F' },
      ],
      observations: [
        'A linha vertical rosa marca x = τ.',
        'Veja o preenchimento azul do capacitor subir no esquema SVG acima.',
      ],
      scenarios: [
        {
          id: 'rc-fast',
          label: 'Carga Rápida (τ = 0.5s)',
          description: 'Resistor e capacitor pequenos.',
          params: { V0: 5, R: 1, C: 0.5 },
          resetTime: true,
        },
        {
          id: 'rc-slow',
          label: 'Carga Lenta (τ = 6s)',
          description: 'Alta resistência e capacitância.',
          params: { V0: 5, R: 3, C: 2 },
          resetTime: true,
        },
      ],
      commonPitfall:
        'Aumentar V0 NÃO muda o tempo τ = R·C que o capacitor leva para carregar!',
    },
  },
  {
    id: 'ac-rlc',
    year: 3,
    group: 'Circuitos AC',
    title: 'Circuito Elétrico AC — RLC (Fasores + Senoides)',
    shortTitle: 'Circuito AC (RLC)',
    summary:
      'A impedância complexa Z = R + i(ωL − 1/ωC) define a amplitude e a defasagem φ entre tensão e corrente — visíveis tanto nos fasores girando quanto nas ondas senoidais.',
    keyFormulaTex:
      'Z = R + i\\left(\\omega L - \\frac{1}{\\omega C}\\right), \\quad I = \\frac{V_0}{Z}e^{i\\omega t}',
    legendItems: [
      { label: 'Tensão V (Fasor & Onda)', color: '#38bdf8' },
      { label: 'Corrente I (Fasor & Onda)', color: '#fbbf24' },
    ],
    formulas: [
      { raw: 'Z = R + i * (w * L - 1 / (w * C))', color: '#94a3b8' },
      { raw: 'zV(t) = V0 * e^(i * w * t)', color: '#38bdf8' },
      { raw: 'zI(t) = (V0 / Z) * e^(i * w * t)', color: '#fbbf24' },
      { raw: 'y = re(V0 * e^(i * (w * x - w * t)))', color: '#38bdf8' },
      { raw: 'y = re((V0 / Z) * e^(i * (w * x - w * t)))', color: '#fbbf24' },
    ],
    parameters: {
      V0: { value: 3, min: 0.5, max: 6, step: 0.2 },
      R: { value: 1.2, min: 0.2, max: 5, step: 0.1 },
      L: { value: 1.4, min: 0.1, max: 5, step: 0.1 },
      C: { value: 0.6, min: 0.1, max: 3, step: 0.05 },
      w: { value: 1.5, min: 0.3, max: 5, step: 0.1 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 64 },
    visualCard: 'ac-rlc',
    theory: {
      intuition: [
        'Em AC, indutores atrasam a corrente (+iωL) e capacitores a adiantam (−i/ωC). Na ressonância (XL = XC), as reatâncias se anulam e a corrente atinge seu máximo em fase com a tensão.',
      ],
      equations: [
        {
          latex: 'Z = R + i\\left(\\omega L - \\frac{1}{\\omega C}\\right), \\quad \\omega_0 = \\frac{1}{\\sqrt{LC}}',
          note: 'Impedância complexa e frequência de ressonância.',
        },
      ],
      variables: [
        { symbol: 'V0', name: 'Amplitude da tensão AC', unit: 'V' },
        { symbol: 'R', name: 'Resistência', unit: 'Ω' },
        { symbol: 'L', name: 'Indutância', unit: 'H' },
        { symbol: 'C', name: 'Capacitância', unit: 'F' },
        { symbol: 'w', name: 'Frequência angular ω', unit: 'rad/s' },
      ],
      observations: [
        'Compare o ângulo entre zV e zI com a defasagem entre os picos das ondas.',
      ],
      scenarios: [
        {
          id: 'rlc-res',
          label: 'Ressonância (XL = XC, φ = 0°)',
          description: 'Fasores alinhados e corrente máxima.',
          params: { V0: 3, R: 1, L: 1, C: 0.25, w: 2 },
        },
        {
          id: 'rlc-ind',
          label: 'Regime Indutivo (I atrasada)',
          description: 'XL > XC: corrente gira atrás da tensão.',
          params: { V0: 3, R: 1, L: 2.2, C: 0.8, w: 2.2 },
        },
        {
          id: 'rlc-cap',
          label: 'Regime Capacitivo (I adiantada)',
          description: 'XC > XL: corrente gira à frente da tensão.',
          params: { V0: 3, R: 1, L: 0.4, C: 0.25, w: 0.9 },
        },
      ],
      commonPitfall:
        'A impedância total NÃO é R + XL + XC; a soma é vetorial: |Z| = √(R² + (XL − XC)²).',
    },
  },
  {
    id: 'lorentz-magnetism',
    year: 3,
    group: 'Magnetismo',
    title: 'Força Magnética de Lorentz (Movimento Ciclotrônico)',
    shortTitle: 'Força de Lorentz',
    summary:
      'Uma carga q lançada perpendicularmente a um campo magnético uniforme B descreve um círculo de raio R = mv/(|q|B) com frequência ciclotrônica ω = qB/m.',
    keyFormulaTex:
      'F_B = |q|vB, \\quad R = \\frac{m v}{|q| B}, \\quad \\omega_c = \\frac{q B}{m}',
    legendItems: [
      { label: 'Órbita Ciclotrônica z(t)', color: '#38bdf8' },
      { label: 'Campo Magnético B (⊗ / ⊙)', color: '#64748b' },
      { label: 'Força Magnética FB', color: '#f472b6' },
    ],
    formulas: [
      { raw: 'Rc = (m * v) / (abs(q) * B)', color: '#94a3b8' },
      { raw: 'wc = (q * B) / m', color: '#94a3b8' },
      { raw: 'z(t) = Rc * e^(i * wc * t)', color: '#38bdf8' },
    ],
    parameters: {
      q: { value: 1, min: -3, max: 3, step: 0.5 },
      m: { value: 1.5, min: 0.5, max: 5, step: 0.2 },
      v: { value: 2.5, min: 0.5, max: 6, step: 0.2 },
      B: { value: 1.2, min: 0.4, max: 4, step: 0.2 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 62 },
    theory: {
      intuition: [
        'A Força Magnética (F = q·v×B) é sempre perpendicular à velocidade da partícula. Por isso, ela NÃO realiza trabalho nem altera o módulo da velocidade — apenas curva a trajetória em um círculo perfeito (princípio dos aceleradores cíclotrons e espectrômetros de massa)!',
        'Inverter o sinal da carga q (de positiva para negativa) inverte imediatamente o sentido de rotação.',
      ],
      equations: [
        {
          latex: 'F_B = |q| v B \\sin\\theta',
          note: 'Módulo da força magnética sobre carga em movimento.',
        },
        {
          latex: 'R = \\frac{m v}{|q| B}, \\quad T = \\frac{2\\pi m}{|q| B}',
          note: 'Raio da órbita e período ciclotrônico (independe da velocidade v!).',
        },
      ],
      variables: [
        { symbol: 'q', name: 'Carga da partícula (sinal define sentido)', unit: 'C' },
        { symbol: 'm', name: 'Massa da partícula', unit: 'kg' },
        { symbol: 'v', name: 'Velocidade de entrada', unit: 'm/s' },
        { symbol: 'B', name: 'Campo magnético uniforme', unit: 'T' },
      ],
      observations: [
        'Mude q de +1 para -1 e observe o sentido da órbita inverter pela Regra da Mão Direita!',
        'Aumente o campo B e note o raio Rc encolher enquanto a partícula gira mais rápido.',
      ],
      scenarios: [
        {
          id: 'lor-pos',
          label: 'Próton (q > 0, sentido anti-horário)',
          description: 'Carga positiva curvada pelo campo magnético.',
          params: { q: 1, m: 1.5, v: 2.5, B: 1.2 },
          resetTime: true,
        },
        {
          id: 'lor-neg',
          label: 'Elétron (q < 0, inverte rotação)',
          description: 'Carga negativa gira no sentido oposto com raio menor.',
          params: { q: -1.5, m: 0.8, v: 2.5, B: 1.2 },
          resetTime: true,
        },
      ],
      commonPitfall:
        'A força magnética NUNCA acelera ou freia uma partícula em módulo (trabalho = 0); além disso, se a carga estiver parada (v = 0), a força magnética é zero!',
    },
  },
  {
    id: 'faraday-induction',
    year: 3,
    group: 'Magnetismo',
    title: 'Indução Eletromagnética (Faraday-Neumann & Lenz)',
    shortTitle: 'Faraday & Lenz',
    summary:
      'Uma espira girando com velocidade angular w em um campo B gera fluxo magnético Φ(t) = BA·cos(wt) e força eletromotriz induzida ε(t) = NBAw·sin(wt) — o princípio dos geradores elétricos.',
    keyFormulaTex:
      '\\Phi(t) = BA\\cos(\\omega t), \\quad \\varepsilon(t) = -N\\frac{d\\Phi}{dt} = NBA\\omega\\sin(\\omega t)',
    legendItems: [
      { label: 'Fluxo Magnético Φ(x)', color: '#38bdf8' },
      { label: 'FEM Induzida ε(x)', color: '#fbbf24' },
    ],
    formulas: [
      { raw: 'y = B * A * cos(w * x - w * t)', color: '#38bdf8' },
      { raw: 'y = N * B * A * w * sin(w * x - w * t)', color: '#fbbf24' },
    ],
    parameters: {
      N: { value: 2, min: 1, max: 6, step: 1 },
      B: { value: 1.2, min: 0.2, max: 3, step: 0.1 },
      A: { value: 1.0, min: 0.2, max: 3, step: 0.1 },
      w: { value: 1.8, min: 0.4, max: 4.5, step: 0.1 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 56 },
    theory: {
      intuition: [
        'A Lei de Faraday-Neumann revela que não basta haver campo magnético para gerar eletricidade: é preciso que o fluxo magnético VARIE no tempo! Girar uma espira dentro de um campo B faz o fluxo oscilar como um cosseno.',
        'Como a tensão induzida ε é a taxa de variação (derivada negativa) do fluxo, ela nasce como um seno defasado em 90°: quando o fluxo passa por zero (variando mais rápido), a tensão gerada é máxima!',
      ],
      equations: [
        {
          latex: '\\Phi(t) = B A \\cos(\\omega t)',
          note: 'Fluxo magnético atravessando cada espira.',
        },
        {
          latex: '\\varepsilon(t) = -N\\frac{d\\Phi}{dt} = N B A \\omega \\sin(\\omega t)',
          note: 'Tensão alternada gerada (Lei de Faraday-Lenz).',
        },
      ],
      variables: [
        { symbol: 'N', name: 'Número de espiras da bobina', unit: 'espiras' },
        { symbol: 'B', name: 'Campo magnético', unit: 'T' },
        { symbol: 'A', name: 'Área da espira', unit: 'm²' },
        { symbol: 'w', name: 'Velocidade de rotação ω', unit: 'rad/s' },
      ],
      observations: [
        'Repare que onde a curva azul Φ(x) cruza zero, a curva amarela ε(x) atinge seu pico máximo!',
        'Aumentar a velocidade de rotação w aumenta tanto a frequência quanto a amplitude da tensão gerada.',
      ],
      scenarios: [
        {
          id: 'far-fast',
          label: 'Turbina Rápida (w = 3.5 rad/s)',
          description: 'Dobrar a rotação dobra a tensão de pico induzida.',
          params: { N: 2, B: 1.2, A: 1.0, w: 3.5 },
        },
        {
          id: 'far-coil',
          label: 'Bobina com 5 Espiras',
          description: 'Multiplica a FEM induzida proporcionalmente a N.',
          params: { N: 5, B: 1.0, A: 1.0, w: 1.5 },
        },
      ],
      commonPitfall:
        'Um campo magnético muito forte, mas ESTÁTICO (sem variação de fluxo), induz tensão ZERO na espira!',
    },
  },
  {
    id: 'photoelectric',
    year: 3,
    group: 'Física Moderna',
    title: 'Efeito Fotoelétrico (Einstein & Quanta de Luz)',
    shortTitle: 'Fotoelétrico',
    summary:
      'A energia cinética máxima dos elétrons ejetados cresce linearmente com a frequência f da luz (Ec = h·f − φ), mas só há emissão acima da frequência de corte f0 = φ/h.',
    keyFormulaTex:
      'E_c = \\max(0,\\; h f - \\phi), \\quad f_0 = \\frac{\\phi}{h}',
    legendItems: [
      { label: 'Energia Cinética Ec(f) [eV]', color: '#38bdf8' },
      { label: 'Frequência de Corte f0', color: '#f472b6' },
      { label: 'Frequência da Luz f', color: '#fbbf24' },
    ],
    formulas: [
      { raw: 'f0 = phi / h', color: '#94a3b8' },
      { raw: 'y = max(0, h * x - phi)', color: '#38bdf8' },
      { raw: 'x = f0', color: '#f472b6' },
      { raw: 'x = fLight', color: '#fbbf24' },
    ],
    parameters: {
      h: { value: 4.14, min: 4.14, max: 4.14, step: 0.01 },
      phi: { value: 2.3, min: 1.0, max: 5.5, step: 0.1 },
      fLight: { value: 0.85, min: 0.2, max: 2.0, step: 0.05 },
    },
    viewport: { centerX: 1.0, centerY: 2.2, scale: 110 },
    theory: {
      intuition: [
        'Einstein explicou o Efeito Fotoelétrico propondo que a luz é composta por pacotes de energia chamados fótons (E = h·f). Cada elétron absorve um único fóton.',
        'Se a energia do fóton for menor que a função trabalho φ do metal (f < f0), NENHUM elétron é arrancado — mesmo com luz muito intensa! Acima de f0, o excesso de energia vira energia cinética Ec.',
      ],
      equations: [
        {
          latex: 'E_{\\text{fóton}} = h f, \\quad E_c = h f - \\phi',
          note: 'Equação fotoelétrica de Einstein (em eV com f em 10¹⁵ Hz).',
        },
        {
          latex: 'f_0 = \\frac{\\phi}{h}',
          note: 'Frequência mínima (de corte) para arrancar elétrons.',
        },
      ],
      variables: [
        { symbol: 'phi', name: 'Função trabalho do metal φ', unit: 'eV' },
        { symbol: 'fLight', name: 'Frequência da luz incidente', unit: '10¹⁵ Hz' },
        { symbol: 'f0', name: 'Frequência de corte do metal', unit: '10¹⁵ Hz' },
      ],
      observations: [
        'Mova fLight para a esquerda da linha rosa f0 e veja o indicador mudar para "Sem emissão"! Passe para a direita e os elétrons são ejetados.',
      ],
      scenarios: [
        {
          id: 'pe-blocked',
          label: 'Abaixo do Corte (Luz Vermelha)',
          description: 'f < f0: fótons sem energia suficiente (Ec = 0).',
          params: { h: 4.14, phi: 2.3, fLight: 0.45 },
        },
        {
          id: 'pe-uv',
          label: 'Ultravioleta (Emissão Forte)',
          description: 'f >> f0: elétrons arrancados com alta energia cinética.',
          params: { h: 4.14, phi: 2.3, fLight: 1.35 },
        },
      ],
      commonPitfall:
        'Aumentar a INTENSIDADE (brilho) de uma luz abaixo da frequência de corte NÃO arranca elétrons; intensidade aumenta o número de fótons, não a energia de cada fóton!',
    },
  },
  {
    id: 'radioactive-decay',
    year: 3,
    group: 'Física Moderna',
    title: 'Decaimento Radioativo & Meia-Vida',
    shortTitle: 'Meia-Vida',
    summary:
      'A quantidade de núcleos radioativos cai pela metade a cada intervalo de meia-vida T12: N(x) = N0 · 2^(-x / T12).',
    keyFormulaTex: 'N(t) = N_0 \\cdot 2^{-t / T_{1/2}}',
    legendItems: [
      { label: 'Núcleos restantes N(x)', color: '#34d399' },
      { label: '1ª Meia-Vida (50%)', color: '#fbbf24' },
    ],
    formulas: [
      { raw: 'y = N0 * 2^(-x / T12)', color: '#34d399' },
      { raw: 'x = T12', color: '#fbbf24' },
      { raw: 'y = N0 / 2', color: '#64748b' },
    ],
    parameters: {
      N0: { value: 8, min: 2, max: 16, step: 1 },
      T12: { value: 2.0, min: 0.4, max: 6.0, step: 0.2 },
    },
    viewport: { centerX: 4, centerY: 4, scale: 52 },
    theory: {
      intuition: [
        'O decaimento radioativo é um processo quântico aleatório: não sabemos quando um átomo isolado vai decair, mas em uma amostra grande exatamente 50% decaem a cada meia-vida T½.',
      ],
      equations: [
        {
          latex: 'N(t) = N_0 \\left(\\frac{1}{2}\\right)^{t / T_{1/2}} = N_0 e^{-\\lambda t}',
          note: 'Lei do decaimento exponencial (usada na datação por Carbono-14).',
        },
      ],
      variables: [
        { symbol: 'N0', name: 'Quantidade inicial de núcleos', unit: 'unid.' },
        { symbol: 'T12', name: 'Tempo de meia-vida T½', unit: 's / anos' },
      ],
      observations: [
        'Veja o cruzamento exato entre a curva verde, a linha vertical x = T12 e a horizontal y = N0/2.',
      ],
      scenarios: [
        {
          id: 'dec-fast',
          label: 'Isótopo Instável (T½ = 0.8)',
          description: 'Cai rapidamente perto de zero.',
          params: { N0: 10, T12: 0.8 },
        },
        {
          id: 'dec-slow',
          label: 'Meia-Vida Longa (T½ = 4.5)',
          description: 'Decaimento suave e prolongado.',
          params: { N0: 10, T12: 4.5 },
        },
      ],
      commonPitfall:
        'Após 2 meias-vidas NÃO resta 0% da amostra — resta metade da metade, ou seja, 25% (1/4)!',
    },
  },
  {
    id: 'relativity-lorentz',
    year: 3,
    group: 'Física Moderna',
    title: 'Relatividade Restrita — Fator de Lorentz γ(v)',
    shortTitle: 'Relatividade (γ)',
    summary:
      'Veja o fator de Lorentz γ(x) = 1 / √(1 − x²) (com x = v/c) permanecer ≈ 1 em baixas velocidades e disparar rumo ao infinito ao se aproximar da velocidade da luz c (x = 1).',
    keyFormulaTex:
      '\\gamma(v) = \\frac{1}{\\sqrt{1 - (v/c)^2}}, \\quad \\Delta t = \\gamma \\Delta t_0',
    legendItems: [
      { label: 'Fator de Lorentz γ(v/c)', color: '#a78bfa' },
      { label: 'Velocidade da Luz (v/c = 1)', color: '#f472b6' },
      { label: 'Velocidade atual beta = v/c', color: '#fbbf24' },
    ],
    formulas: [
      { raw: 'gamma = 1 / √(1 - beta^2)', color: '#94a3b8' },
      { raw: 'y = 1 / √(1 - x^2)', color: '#a78bfa' },
      { raw: 'x = 1', color: '#f472b6' },
      { raw: 'x = beta', color: '#fbbf24' },
    ],
    parameters: {
      beta: { value: 0.6, min: 0, max: 0.99, step: 0.01 },
    },
    viewport: { centerX: 0.55, centerY: 3.0, scale: 110 },
    theory: {
      intuition: [
        'Na Relatividade Restrita de Einstein, a velocidade da luz no vácuo c é o limite universal. Para velocidades do cotidiano (v << c), o fator γ vale praticamente 1 e a mecânica de Newton funciona perfeitamente.',
        'Perto de c (ex: beta = 0.90 ou 0.99), γ cresce explosivamente: o tempo passa mais devagar para o viajante (dilatação temporal Δt = γ·Δt₀) e comprimentos se contraem (L = L₀/γ)!',
      ],
      equations: [
        {
          latex: '\\gamma = \\frac{1}{\\sqrt{1 - \\beta^2}}, \\quad \\beta = \\frac{v}{c}',
          note: 'Fator de Lorentz (note a assíntota vertical em β = 1).',
        },
        {
          latex: '\\Delta t = \\gamma \\Delta t_0, \\quad L = \\frac{L_0}{\\gamma}',
          note: 'Dilatação do tempo e contração do comprimento.',
        },
      ],
      variables: [
        { symbol: 'beta', name: 'Fração da velocidade da luz (v/c)', unit: 'c' },
        { symbol: 'gamma', name: 'Fator de dilatação temporal γ', unit: 'adim.' },
      ],
      observations: [
        'Note como até β = 0.5 (metade da velocidade da luz!) γ ainda é só 1.15, mas entre 0.90 e 0.99 ele explode de 2.29 para 7.09!',
      ],
      scenarios: [
        {
          id: 'rel-low',
          label: 'Regime Clássico (v = 0.1c)',
          description: 'γ ≈ 1.005: efeitos relativísticos quase imperceptíveis.',
          params: { beta: 0.1 },
        },
        {
          id: 'rel-high',
          label: 'Nave Relativística (v = 0.87c)',
          description: 'γ ≈ 2.0: 1 ano na nave equivale a 2 anos na Terra!',
          params: { beta: 0.87 },
        },
        {
          id: 'rel-ultra',
          label: 'Ultra-Relativístico (v = 0.99c)',
          description: 'γ ≈ 7.09: forte dilatação temporal (como múons cósmicos).',
          params: { beta: 0.99 },
        },
      ],
      commonPitfall:
        'Nenhum objeto com massa pode atingir v = c (β = 1), pois γ → ∞ exigiria energia infinita!',
    },
  },
];
