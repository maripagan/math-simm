import { Pause, Play } from 'lucide-react';
import { ParameterConfig } from '../types';

interface ParameterListProps {
  parameters: Record<string, ParameterConfig>;
  onUpdate: (name: string, patch: Partial<ParameterConfig>) => void;
}

export function ParameterList({ parameters, onUpdate }: ParameterListProps) {
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
          <div key={p.name} className="param-card">
            <div className="param-top">
              <div className="param-name-val">
                <span className="param-name">{p.name}</span>
                <span className="param-eq">=</span>
                <input
                  type="number"
                  className="param-num-input"
                  value={Number(p.value.toFixed(4))}
                  step={p.step}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (Number.isFinite(v)) onUpdate(p.name, { value: v });
                  }}
                />
              </div>

              <button
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
              onChange={(e) => onUpdate(p.name, { value: parseFloat(e.target.value) })}
            />

            <div className="param-bounds">
              <label>
                min
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
                step
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
                max
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
          </div>
        ))}
      </div>
    </section>
  );
}
