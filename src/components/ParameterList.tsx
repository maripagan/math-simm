import { Pause, Play } from 'lucide-react';
import { VariableGlossaryItem } from '../modules/physics/types';
import { ParameterConfig } from '../types';

interface ParameterListProps {
  parameters: Record<string, ParameterConfig>;
  onUpdate: (name: string, patch: Partial<ParameterConfig>) => void;
  glossary?: VariableGlossaryItem[];
}

interface ParamCardProps {
  param: ParameterConfig;
  meta?: VariableGlossaryItem;
  onUpdate: (name: string, patch: Partial<ParameterConfig>) => void;
}

const degreeFormat = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
});

export function ParamCard({
  param: p,
  meta,
  onUpdate,
}: ParamCardProps) {
  if (meta?.choices) {
    return (
      <div className="param-card">
        <span className="param-label">{meta.name}</span>
        <div className="param-choices" role="group" aria-label={meta.name}>
          {meta.choices.map((c) => (
            <button
              key={c.value}
              aria-pressed={p.value === c.value}
              onClick={() => onUpdate(p.name, { value: c.value })}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const unit = meta?.unit && meta.unit !== 'adim.' ? meta.unit : '';
  if (p.min === p.max) {
    return (
      <div className="param-card param-constant">
        <span className="param-label">{meta?.name ?? p.name}</span>
        <span>{p.value.toLocaleString('pt-BR')} {unit}</span>
      </div>
    );
  }

  return (
    <div className="param-card">
      {meta && (
        <div className="param-label-row">
          <span className="param-label">{meta.name}</span>
          {unit === 'rad' && (
            <span className="param-degrees">
              {degreeFormat.format((p.value * 180) / Math.PI)}°
            </span>
          )}
        </div>
      )}

      <div className="param-top">
        <div className="param-name-val">
          <span className="param-name">{p.name}</span>
          <span className="param-eq">=</span>
          <input
            type="number"
            className="param-num-input"
            aria-label={`Valor de ${meta?.name ?? p.name}`}
            value={Number(p.value.toFixed(4))}
            step={p.step}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (Number.isFinite(v)) onUpdate(p.name, { value: v });
            }}
          />
          {unit && <span className="param-unit">{unit}</span>}
        </div>

        <button
          aria-label={p.playing ? 'Pausar animação' : 'Animar parâmetro'}
          className={`btn-play ${p.playing ? 'active' : ''}`}
          onClick={() => onUpdate(p.name, { playing: !p.playing })}
          title={p.playing ? 'Pausar animação' : 'Animar parâmetro'}
        >
          {p.playing ? <Pause size={13} /> : <Play size={13} />}
        </button>
      </div>

      <input
        type="range"
        className="param-slider"
        min={p.min}
        max={p.max}
        step={p.step}
        value={p.value}
        aria-label={meta?.name ?? p.name}
        onChange={(e) => onUpdate(p.name, { value: parseFloat(e.target.value) })}
      />

      <details className="param-bounds-details">
        <summary>Limites do controle</summary>
        <div className="param-bounds">
          <label>
            mín.
            <input
              type="number"
              value={p.min}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (Number.isFinite(v) && v < p.max) onUpdate(p.name, { min: v });
              }}
            />
          </label>
          <label>
            passo
            <input
              type="number"
              value={p.step}
              min={0.001}
              step={0.05}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (Number.isFinite(v) && v > 0) onUpdate(p.name, { step: v });
              }}
            />
          </label>
          <label>
            máx.
            <input
              type="number"
              value={p.max}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (Number.isFinite(v) && v > p.min) onUpdate(p.name, { max: v });
              }}
            />
          </label>
        </div>
      </details>
    </div>
  );
}

export function ParameterList({
  parameters,
  onUpdate,
  glossary,
}: ParameterListProps) {
  const entries = Object.values(parameters);
  if (entries.length === 0) return null;

  return (
    <section className="panel-section">
      <div className="section-header">
        <h2>Parâmetros</h2>
        <span className="badge">{entries.length}</span>
      </div>

      <div className="param-list">
        {entries.map((p) => (
          <ParamCard
            key={p.name}
            param={p}
            meta={glossary?.find((v) => v.symbol === p.name)}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </section>
  );
}
