import {
  BarChart3,
  Plus,
  Presentation,
  RotateCcw,
  Sliders,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CHART_PALETTE,
  ChartViewType,
  resolveStatisticsState,
  STATISTICS_PRESETS,
  StatisticsPreset,
  StatisticsScenario,
  StatisticsStageState,
} from './statisticsPresets';
import { StatisticsStage } from './StatisticsStage';
import './statistics.css';

interface StatisticsModuleProps {
  initialPresetId?: string;
  onPresent: (moduleId: string) => void;
}

const SCENARIO_TABS: Array<{ id: StatisticsScenario; label: string }> = [
  { id: 'dotplot', label: 'Tendência Central' },
  { id: 'histogram', label: 'Desvio Padrão' },
  { id: 'charts', label: 'Gráficos & Armadilhas' },
];

export function StatisticsModule({
  initialPresetId,
  onPresent,
}: StatisticsModuleProps) {
  const [state, setState] = useState<StatisticsStageState>(() =>
    resolveStatisticsState(initialPresetId),
  );
  const [activePresetId, setActivePresetId] = useState<string>(
    initialPresetId ?? 'outlier-salaries',
  );

  useEffect(() => {
    if (initialPresetId) {
      setState(resolveStatisticsState(initialPresetId));
      setActivePresetId(initialPresetId);
    }
  }, [initialPresetId]);

  const applyPreset = (preset: StatisticsPreset) => {
    setActivePresetId(preset.id);
    setState((prev) => ({
      ...prev,
      ...preset.state,
      dotValues: preset.state.dotValues
        ? [...preset.state.dotValues]
        : prev.dotValues,
      categories: preset.state.categories
        ? preset.state.categories.map((c) => ({ ...c }))
        : prev.categories,
    }));
  };

  const handleDotChange = (index: number, nextValue: number) => {
    if (!Number.isFinite(nextValue)) return;
    setState((prev) => {
      const next = [...prev.dotValues];
      next[index] = nextValue;
      return { ...prev, dotValues: next };
    });
  };

  const handleAddDot = () => {
    setState((prev) => {
      if (prev.dotValues.length >= 15) return prev;
      const mid =
        Math.round(((prev.dotDomainMin + prev.dotDomainMax) / 2) * 10) / 10;
      return { ...prev, dotValues: [...prev.dotValues, mid] };
    });
  };

  const handleRemoveDot = (index: number) => {
    setState((prev) => {
      if (prev.dotValues.length <= 5) return prev;
      return {
        ...prev,
        dotValues: prev.dotValues.filter((_, i) => i !== index),
      };
    });
  };

  const handleCategoryChange = (
    index: number,
    patch: { label?: string; value?: number },
  ) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, ...patch } : cat,
      ),
    }));
  };

  const handleAddCategory = () => {
    setState((prev) => {
      if (prev.categories.length >= 6) return prev;
      const idx = prev.categories.length;
      return {
        ...prev,
        categories: [
          ...prev.categories,
          {
            label: `Cat. ${idx + 1}`,
            value: 92,
            color: CHART_PALETTE[idx % CHART_PALETTE.length],
          },
        ],
      };
    });
  };

  const handleRemoveCategory = (index: number) => {
    setState((prev) => {
      if (prev.categories.length <= 3) return prev;
      return {
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index),
      };
    });
  };

  return (
    <div className="module-body stats-module">
      <aside className="sidebar">
        <div className="sidebar-scroll">
          <button
            className="btn-primary present-cta"
            onClick={() => onPresent('statistics-dispersion')}
          >
            <Presentation size={15} aria-hidden="true" />
            Apresentar aula de Estatística no Modo Sala
          </button>

          {/* Seletor de cenários */}
          <div className="stats-section">
            <div className="stats-section-title">
              <Sliders size={14} aria-hidden="true" />
              <span>Cenário Visual</span>
            </div>
            <div className="stats-scenario-tabs" role="tablist">
              {SCENARIO_TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={state.scenario === tab.id}
                  className={`stats-tab-btn ${
                    state.scenario === tab.id ? 'is-active' : ''
                  }`}
                  onClick={() =>
                    setState((prev) => ({ ...prev, scenario: tab.id }))
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Presets rápidos */}
          <div className="stats-section">
            <div className="stats-section-title">
              <Sparkles size={14} aria-hidden="true" />
              <span>Presets Prontos (ENEM & Aula)</span>
            </div>
            <div className="stats-preset-list">
              {STATISTICS_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  className={`stats-preset-card ${
                    activePresetId === preset.id ? 'is-active' : ''
                  }`}
                  onClick={() => applyPreset(preset)}
                >
                  <span className="stats-preset-badge">{preset.badge}</span>
                  <strong>{preset.title}</strong>
                  <p>{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Controles específicos do Cenário 1 */}
          {state.scenario === 'dotplot' && (
            <div className="stats-section">
              <div className="stats-section-header">
                <div className="stats-section-title">
                  <TrendingUp size={14} aria-hidden="true" />
                  <span>Conjunto de Dados ({state.dotValues.length}/15)</span>
                </div>
                <button
                  className="btn-secondary stats-mini-btn"
                  onClick={handleAddDot}
                  disabled={state.dotValues.length >= 15}
                  title="Adicionar valor (máximo 15)"
                >
                  <Plus size={13} /> Valor
                </button>
              </div>

              <div className="stats-data-grid">
                {state.dotValues.map((val, idx) => (
                  <div key={idx} className="stats-data-row">
                    <span className="stats-row-idx">x{idx + 1}</span>
                    <input
                      type="number"
                      step="0.1"
                      value={val}
                      onChange={(e) =>
                        handleDotChange(idx, Number(e.target.value))
                      }
                      aria-label={`Valor ${idx + 1}`}
                    />
                    <button
                      className="stats-icon-btn"
                      onClick={() => handleRemoveDot(idx)}
                      disabled={state.dotValues.length <= 5}
                      title="Remover ponto (mínimo 5)"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controles específicos do Cenário 2 */}
          {state.scenario === 'histogram' && (
            <div className="stats-section">
              <div className="stats-section-title">
                <BarChart3 size={14} aria-hidden="true" />
                <span>Parâmetros das Distribuições</span>
              </div>

              <div className="stats-group-box is-blue">
                <strong>Grupo A</strong>
                <label className="stats-slider-label">
                  <span>Média alvo (μA)</span>
                  <code>{state.meanA.toFixed(1)}</code>
                </label>
                <input
                  type="range"
                  min={10}
                  max={40}
                  step={0.5}
                  value={state.meanA}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      meanA: Number(e.target.value),
                    }))
                  }
                />

                <label className="stats-slider-label">
                  <span>Desvio padrão (σA)</span>
                  <code>{state.stdA.toFixed(1)}</code>
                </label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={0.5}
                  value={state.stdA}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      stdA: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <label className="stats-checkbox">
                <input
                  type="checkbox"
                  checked={state.showB}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, showB: e.target.checked }))
                  }
                />
                <span>Comparar com Grupo B</span>
              </label>

              {state.showB && (
                <div className="stats-group-box is-rose">
                  <strong>Grupo B</strong>
                  <label className="stats-slider-label">
                    <span>Média alvo (μB)</span>
                    <code>{state.meanB.toFixed(1)}</code>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={40}
                    step={0.5}
                    value={state.meanB}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        meanB: Number(e.target.value),
                      }))
                    }
                  />

                  <label className="stats-slider-label">
                    <span>Desvio padrão (σB)</span>
                    <code>{state.stdB.toFixed(1)}</code>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    step={0.5}
                    value={state.stdB}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        stdB: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              )}

              <label className="stats-slider-label">
                <span>Número de classes (bins)</span>
                <code>{state.bins}</code>
              </label>
              <input
                type="range"
                min={5}
                max={20}
                step={1}
                value={state.bins}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, bins: Number(e.target.value) }))
                }
              />

              <label className="stats-checkbox">
                <input
                  type="checkbox"
                  checked={state.showNormalCurve}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      showNormalCurve: e.target.checked,
                    }))
                  }
                />
                <span>Sobrepor curva normal aproximada</span>
              </label>

              <label className="stats-checkbox">
                <input
                  type="checkbox"
                  checked={state.showSigmaBand}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      showSigmaBand: e.target.checked,
                    }))
                  }
                />
                <span>Destacar faixa [x̄ − σ, x̄ + σ]</span>
              </label>
            </div>
          )}

          {/* Controles específicos do Cenário 3 */}
          {state.scenario === 'charts' && (
            <div className="stats-section">
              <div className="stats-section-title">
                <BarChart3 size={14} aria-hidden="true" />
                <span>Visualização & Escala</span>
              </div>

              <div className="stats-chart-type-row">
                {(
                  [
                    { id: 'bar', label: 'Barras' },
                    { id: 'line', label: 'Linhas' },
                    { id: 'pie', label: 'Setores' },
                  ] as Array<{ id: ChartViewType; label: string }>
                ).map((item) => (
                  <button
                    key={item.id}
                    className={`stats-tab-btn ${
                      state.chartType === item.id ? 'is-active' : ''
                    }`}
                    onClick={() =>
                      setState((prev) => ({ ...prev, chartType: item.id }))
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {state.chartType !== 'pie' && (
                <label className="stats-checkbox is-highlight">
                  <input
                    type="checkbox"
                    checked={state.startYAtZero}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        startYAtZero: e.target.checked,
                      }))
                    }
                  />
                  <span>Iniciar eixo Y no zero</span>
                </label>
              )}

              <div className="stats-section-header">
                <span className="stats-sub-label">
                  Categorias ({state.categories.length}/6)
                </span>
                <button
                  className="btn-secondary stats-mini-btn"
                  onClick={handleAddCategory}
                  disabled={state.categories.length >= 6}
                >
                  <Plus size={13} /> Categoria
                </button>
              </div>

              <div className="stats-cat-list">
                {state.categories.map((cat, idx) => (
                  <div key={idx} className="stats-cat-row">
                    <span
                      className="stats-color-dot"
                      style={{ background: cat.color }}
                    />
                    <input
                      type="text"
                      value={cat.label}
                      onChange={(e) =>
                        handleCategoryChange(idx, { label: e.target.value })
                      }
                      aria-label={`Nome categoria ${idx + 1}`}
                    />
                    <input
                      type="number"
                      className="stats-cat-val"
                      value={cat.value}
                      onChange={(e) =>
                        handleCategoryChange(idx, {
                          value: Number(e.target.value),
                        })
                      }
                      aria-label={`Valor categoria ${idx + 1}`}
                    />
                    <button
                      className="stats-icon-btn"
                      onClick={() => handleRemoveCategory(idx)}
                      disabled={state.categories.length <= 3}
                      title="Remover categoria (mínimo 3)"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            className="btn-secondary stats-reset-btn"
            onClick={() => setState(resolveStatisticsState(activePresetId))}
          >
            <RotateCcw size={13} /> Restaurar preset atual
          </button>
        </div>
      </aside>

      <main className="canvas-stage stats-main-stage">
        <StatisticsStage
          state={state}
          interactive={true}
          onChangeDotValue={handleDotChange}
        />
      </main>
    </div>
  );
}
