import { defineExperiment } from './defineExperiment';

export const energyConservation = defineExperiment({
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
  card(vals) {
    const m = vals.m;
    const A = vals.A;
    const k = vals.k;
    const w = vals.w;
    const t = vals.t;

    const xNow = A * Math.cos(w * t);
    const hNow = k * xNow * xNow;
    const hMax = Math.max(0.01, k * A * A);
    const g = 9.8;
    const em = m * g * hMax;
    const ep = m * g * hNow;
    const ec = Math.max(0, em - ep);

    const epPct = (ep / em) * 100;
    const ecPct = (ec / em) * 100;

    return (
      <div className="circuit-overlay-card">
        <div className="circuit-overlay-header">
          <span>Energia Mecânica (Em = {em.toFixed(1)} J)</span>
        </div>
        <div className="energy-bars">
          <div className="energy-row">
            <span>Ec</span>
            <div className="energy-track">
              <div
                className="energy-fill"
                style={{ width: `${ecPct}%`, background: '#fbbf24' }}
              />
            </div>
            <code>{ec.toFixed(1)}J</code>
          </div>
          <div className="energy-row">
            <span>Ep</span>
            <div className="energy-track">
              <div
                className="energy-fill"
                style={{ width: `${epPct}%`, background: '#38bdf8' }}
              />
            </div>
            <code>{ep.toFixed(1)}J</code>
          </div>
          <div className="energy-row">
            <span>Em</span>
            <div className="energy-track">
              <div
                className="energy-fill"
                style={{ width: '100%', background: '#34d399' }}
              />
            </div>
            <code>{em.toFixed(1)}J</code>
          </div>
        </div>
      </div>
    );
  },
});
