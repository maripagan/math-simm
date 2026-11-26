import { AlertTriangle, BookOpen, Eye, PlayCircle } from 'lucide-react';
import { KatexPreview } from '../../../components/KatexPreview';
import { ExperimentTheory, GuidedScenario } from '../types';

interface TheoryPanelProps {
  title: string;
  theory: ExperimentTheory;
  activeScenarioId: string | null;
  onApplyScenario: (scenario: GuidedScenario) => void;
}

export function TheoryPanel({
  title,
  theory,
  activeScenarioId,
  onApplyScenario,
}: TheoryPanelProps) {
  return (
    <div className="theory-panel">
      <div className="theory-section">
        <div className="theory-heading">
          <BookOpen size={14} />
          <h4>Conceito &amp; Intuição — {title}</h4>
        </div>
        {theory.intuition.map((paragraph, idx) => (
          <p key={idx} className="theory-text">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="theory-section">
        <div className="theory-heading">
          <h4>Equações Fundamentais</h4>
        </div>
        <div className="theory-equations">
          {theory.equations.map((eq, idx) => (
            <div key={idx} className="theory-eq-card">
              <KatexPreview latex={eq.latex} />
              <span className="theory-eq-note">{eq.note}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="theory-section">
        <div className="theory-heading">
          <h4>Variáveis &amp; Unidades (SI)</h4>
        </div>
        <div className="theory-var-table">
          {theory.variables.map((v) => (
            <div key={v.symbol} className="theory-var-row">
              <code className="theory-var-sym">{v.symbol}</code>
              <span className="theory-var-name">{v.name}</span>
              <span className="theory-var-unit">{v.unit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="theory-section">
        <div className="theory-heading">
          <PlayCircle size={14} />
          <h4>Testar Cenários no Simulador</h4>
        </div>
        <div className="scenario-list">
          {theory.scenarios.map((sc) => (
            <button
              key={sc.id}
              className={`scenario-btn ${activeScenarioId === sc.id ? 'active' : ''}`}
              onClick={() => onApplyScenario(sc)}
            >
              <span className="scenario-title">{sc.label}</span>
              <span className="scenario-desc">{sc.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="theory-section">
        <div className="theory-heading">
          <Eye size={14} />
          <h4>O que observar no gráfico</h4>
        </div>
        <ul className="theory-obs-list">
          {theory.observations.map((obs, idx) => (
            <li key={idx}>{obs}</li>
          ))}
        </ul>
      </div>

      <div className="theory-pitfall">
        <div className="pitfall-title">
          <AlertTriangle size={14} />
          <span>Ponto de Atenção / Erro Comum</span>
        </div>
        <p>{theory.commonPitfall}</p>
      </div>
    </div>
  );
}
