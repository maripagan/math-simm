import { EnginePreset } from '../../classroom/schemas';
import { parseNumberList } from './statisticsMath';

export type StatisticsScenario = 'dotplot' | 'histogram' | 'charts';
export type ChartViewType = 'bar' | 'line' | 'pie';

export interface CategoryDatum {
  label: string;
  value: number;
  color: string;
}

export interface StatisticsStageState {
  scenario: StatisticsScenario;
  // Cenário 1: Tendência Central (Dotplot)
  dotValues: number[];
  dotUnit: string;
  dotLabel: string;
  dotDomainMin: number;
  dotDomainMax: number;
  // Cenário 2: Dispersão & Desvio Padrão (Histograma A vs B)
  meanA: number;
  stdA: number;
  skewA: number;
  labelA: string;
  meanB: number;
  stdB: number;
  skewB: number;
  labelB: string;
  showB: boolean;
  bins: number;
  showNormalCurve: boolean;
  showSigmaBand: boolean;
  histDomainMin: number;
  histDomainMax: number;
  // Cenário 3: Gráficos & Armadilhas
  chartType: ChartViewType;
  startYAtZero: boolean;
  chartTitle: string;
  chartUnit: string;
  categories: CategoryDatum[];
}

export interface StatisticsPreset {
  id: string;
  title: string;
  badge: string;
  description: string;
  scenario: StatisticsScenario;
  state: Partial<StatisticsStageState>;
}

export const CHART_PALETTE = [
  '#2563eb',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#e11d48',
  '#0891b2',
];

export const DEFAULT_STATISTICS_STATE: StatisticsStageState = {
  scenario: 'dotplot',
  dotValues: [2.0, 2.2, 2.4, 2.5, 2.5, 2.8, 3.0, 14.6],
  dotUnit: 'mil R$',
  dotLabel: 'Salários da equipe',
  dotDomainMin: 0,
  dotDomainMax: 20,
  meanA: 25,
  stdA: 3.0,
  skewA: 0,
  labelA: 'Grupo A (concentrado)',
  meanB: 25,
  stdB: 8.5,
  skewB: 0,
  labelB: 'Grupo B (disperso)',
  showB: true,
  bins: 10,
  showNormalCurve: true,
  showSigmaBand: true,
  histDomainMin: 0,
  histDomainMax: 50,
  chartType: 'bar',
  startYAtZero: false,
  chartTitle: 'Aprovação por unidade escolar (%)',
  chartUnit: '%',
  categories: [
    { label: 'Unid. A', value: 91, color: CHART_PALETTE[0] },
    { label: 'Unid. B', value: 93, color: CHART_PALETTE[1] },
    { label: 'Unid. C', value: 94, color: CHART_PALETTE[2] },
    { label: 'Unid. D', value: 96, color: CHART_PALETTE[3] },
  ],
};

export const STATISTICS_PRESETS: StatisticsPreset[] = [
  {
    id: 'outlier-salaries',
    title: 'Outlier / Salários',
    badge: 'Tendência Central',
    description:
      'Sete salários próximos de R$ 2,5 mil e um único valor extremo puxam a média para cima sem mover a mediana.',
    scenario: 'dotplot',
    state: {
      scenario: 'dotplot',
      dotValues: [2.0, 2.2, 2.4, 2.5, 2.5, 2.8, 3.0, 14.6],
      dotUnit: 'mil R$',
      dotLabel: 'Salários mensais',
      dotDomainMin: 0,
      dotDomainMax: 20,
    },
  },
  {
    id: 'balanced-class',
    title: 'Notas Simétricas (Turma)',
    badge: 'Tendência Central',
    description:
      'Distribuição equilibrada onde média, mediana e moda coincidem no centro.',
    scenario: 'dotplot',
    state: {
      scenario: 'dotplot',
      dotValues: [5.0, 6.0, 6.5, 7.0, 7.0, 7.0, 7.5, 8.0, 9.0],
      dotUnit: 'pts',
      dotLabel: 'Notas da turma',
      dotDomainMin: 0,
      dotDomainMax: 10,
    },
  },
  {
    id: 'enem-2025-q157',
    title: 'ENEM 2025 Q157 — Grupos Clínicos',
    badge: 'Desvio Padrão',
    description:
      'Dois grupos com a mesma média de idade (25 anos), mas dispersões muito diferentes (σ = 3 vs. σ = 8,5).',
    scenario: 'histogram',
    state: {
      scenario: 'histogram',
      meanA: 25,
      stdA: 3.0,
      skewA: 0,
      labelA: 'Grupo A (σ = 3,0)',
      meanB: 25,
      stdB: 8.5,
      skewB: 0,
      labelB: 'Grupo B (σ = 8,5)',
      showB: true,
      bins: 10,
      showNormalCurve: true,
      showSigmaBand: true,
      histDomainMin: 0,
      histDomainMax: 50,
    },
  },
  {
    id: 'symmetric-vs-skewed',
    title: 'Histograma Simétrico vs. Assimétrico',
    badge: 'Desvio Padrão',
    description:
      'Compare uma distribuição em sino simétrica com outra com cauda longa à direita.',
    scenario: 'histogram',
    state: {
      scenario: 'histogram',
      meanA: 24,
      stdA: 4.5,
      skewA: 0,
      labelA: 'Simétrica',
      meanB: 24,
      stdB: 5.5,
      skewB: 0.7,
      labelB: 'Assimétrica à direita',
      showB: true,
      bins: 12,
      showNormalCurve: true,
      showSigmaBand: true,
      histDomainMin: 0,
      histDomainMax: 50,
    },
  },
  {
    id: 'truncated-axis',
    title: 'Eixo Truncado — Distorção de Escala',
    badge: 'Gráficos & Armadilhas',
    description:
      'Diferenças de 1% a 5% parecem gigantes quando o eixo Y não começa no zero. Ative e desative o toggle para comparar.',
    scenario: 'charts',
    state: {
      scenario: 'charts',
      chartType: 'bar',
      startYAtZero: false,
      chartTitle: 'Aprovação por unidade escolar (%)',
      chartUnit: '%',
      categories: [
        { label: 'Unid. A', value: 91, color: CHART_PALETTE[0] },
        { label: 'Unid. B', value: 93, color: CHART_PALETTE[1] },
        { label: 'Unid. C', value: 94, color: CHART_PALETTE[2] },
        { label: 'Unid. D', value: 96, color: CHART_PALETTE[3] },
      ],
    },
  },
  {
    id: 'energy-matrix',
    title: 'Matriz Elétrica (Setores vs. Barras)',
    badge: 'Gráficos & Armadilhas',
    description:
      'Compare a leitura de proporções em gráfico de setores (pizza) com a precisão das barras.',
    scenario: 'charts',
    state: {
      scenario: 'charts',
      chartType: 'pie',
      startYAtZero: true,
      chartTitle: 'Participação por fonte (%)',
      chartUnit: '%',
      categories: [
        { label: 'Hidrelétrica', value: 56, color: CHART_PALETTE[0] },
        { label: 'Eólica', value: 16, color: CHART_PALETTE[1] },
        { label: 'Solar', value: 12, color: CHART_PALETTE[2] },
        { label: 'Biomassa', value: 9, color: CHART_PALETTE[3] },
        { label: 'Outras', value: 7, color: CHART_PALETTE[4] },
      ],
    },
  },
];

export function resolveStatisticsState(
  presetId?: string,
  enginePreset?: EnginePreset,
): StatisticsStageState {
  const base: StatisticsStageState = {
    ...DEFAULT_STATISTICS_STATE,
    dotValues: [...DEFAULT_STATISTICS_STATE.dotValues],
    categories: DEFAULT_STATISTICS_STATE.categories.map((c) => ({ ...c })),
  };

  if (presetId) {
    const found = STATISTICS_PRESETS.find((p) => p.id === presetId);
    if (found) {
      Object.assign(base, found.state);
    }
  }

  if (!enginePreset) return base;

  if (typeof enginePreset.presetId === 'string') {
    const found = STATISTICS_PRESETS.find((p) => p.id === enginePreset.presetId);
    if (found) Object.assign(base, found.state);
  }

  if (
    enginePreset.scenario === 'dotplot' ||
    enginePreset.scenario === 'histogram' ||
    enginePreset.scenario === 'charts'
  ) {
    base.scenario = enginePreset.scenario;
  }

  if (typeof enginePreset.dotValues === 'string') {
    const parsed = parseNumberList(enginePreset.dotValues);
    if (parsed.length >= 2) base.dotValues = parsed;
  }
  if (typeof enginePreset.dotUnit === 'string') base.dotUnit = enginePreset.dotUnit;
  if (typeof enginePreset.dotLabel === 'string') base.dotLabel = enginePreset.dotLabel;
  if (typeof enginePreset.dotDomainMin === 'number') base.dotDomainMin = enginePreset.dotDomainMin;
  if (typeof enginePreset.dotDomainMax === 'number') base.dotDomainMax = enginePreset.dotDomainMax;

  if (typeof enginePreset.meanA === 'number') base.meanA = enginePreset.meanA;
  if (typeof enginePreset.stdA === 'number') base.stdA = enginePreset.stdA;
  if (typeof enginePreset.skewA === 'number') base.skewA = enginePreset.skewA;
  if (typeof enginePreset.labelA === 'string') base.labelA = enginePreset.labelA;
  if (typeof enginePreset.meanB === 'number') base.meanB = enginePreset.meanB;
  if (typeof enginePreset.stdB === 'number') base.stdB = enginePreset.stdB;
  if (typeof enginePreset.skewB === 'number') base.skewB = enginePreset.skewB;
  if (typeof enginePreset.labelB === 'string') base.labelB = enginePreset.labelB;
  if (typeof enginePreset.showB === 'boolean') base.showB = enginePreset.showB;
  if (typeof enginePreset.bins === 'number') base.bins = enginePreset.bins;
  if (typeof enginePreset.showNormalCurve === 'boolean') {
    base.showNormalCurve = enginePreset.showNormalCurve;
  }
  if (typeof enginePreset.showSigmaBand === 'boolean') {
    base.showSigmaBand = enginePreset.showSigmaBand;
  }
  if (typeof enginePreset.histDomainMin === 'number') {
    base.histDomainMin = enginePreset.histDomainMin;
  }
  if (typeof enginePreset.histDomainMax === 'number') {
    base.histDomainMax = enginePreset.histDomainMax;
  }

  if (
    enginePreset.chartType === 'bar' ||
    enginePreset.chartType === 'line' ||
    enginePreset.chartType === 'pie'
  ) {
    base.chartType = enginePreset.chartType;
  }
  if (typeof enginePreset.startYAtZero === 'boolean') {
    base.startYAtZero = enginePreset.startYAtZero;
  }

  return base;
}
