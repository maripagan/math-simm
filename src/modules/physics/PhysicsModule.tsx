import { BookOpen, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FormulaSidebar } from '../../components/FormulaSidebar';
import { KatexPreview } from '../../components/KatexPreview';
import { ParameterList } from '../../components/ParameterList';
import { initScene, SceneContent, sceneFromSource } from '../../scene/Scene';
import { SceneStage } from '../../scene/SceneStage';
import { useScene } from '../../scene/useScene';
import { TheoryPanel } from './components/TheoryPanel';
import { PHYSICS_EXPERIMENTS, PhysicsExperiment } from './physicsExperiments';
import { GuidedScenario, YearLevel } from './types';

const PALETTE = ['#38bdf8', '#fbbf24', '#34d399', '#f472b6', '#a78bfa'];

const YEAR_LABELS: Record<YearLevel, string> = {
  1: '1º Ano · Mecânica Clássica',
  2: '2º Ano · Termologia, Óptica & Ondulatória',
  3: '3º Ano · Eletromagnetismo & Física Moderna',
};

interface PhysicsModuleProps {
  year: YearLevel;
}

function experimentContent(exp: PhysicsExperiment): SceneContent {
  return sceneFromSource(exp, (idx) => `p-${exp.id}-${idx}`, { pin: true });
}

export function PhysicsModule({ year }: PhysicsModuleProps) {
  const yearExperiments = useMemo(
    () => PHYSICS_EXPERIMENTS.filter((e) => e.year === year),
    [year],
  );
  const [experiment, setExperiment] = useState(() => yearExperiments[0]);
  const scene = useScene(() => initScene(experimentContent(experiment)), {
    restartAt: experiment.restartTimeAt,
  });
  const { state, apply } = scene;
  const [sidebarTab, setSidebarTab] = useState<'sim' | 'theory'>('sim');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const handleSelectExperiment = (exp: PhysicsExperiment) => {
    setExperiment(exp);
    apply({ type: 'load', content: experimentContent(exp), playing: true });
    setActiveScenarioId(null);
  };

  const handleApplyScenario = (scenario: GuidedScenario) => {
    apply({
      type: 'setValues',
      values: scenario.params,
      resetTime: scenario.resetTime,
      play: scenario.resetTime ? true : undefined,
    });
    setActiveScenarioId(scenario.id);
  };

  const dragTo = experiment.dragTo;
  const handleDragWorld = useMemo(() => {
    if (!dragTo) return undefined;
    return (wx: number, wy: number, phase: 'down' | 'move') => {
      const patch = dragTo(wx, wy, phase);
      if (!patch) return false;
      setActiveScenarioId(null);
      apply({ type: 'setValues', values: patch });
      return true;
    };
  }, [dragTo]);

  return (
    <div className="module-body">
      <aside className="sidebar sidebar-physics">
        <div className="module-level-banner">{YEAR_LABELS[year]}</div>

        <div className="experiment-picker">
          {yearExperiments.map((exp) => (
            <button
              key={exp.id}
              className={`exp-pill ${exp.id === experiment.id ? 'active' : ''}`}
              onClick={() => handleSelectExperiment(exp)}
            >
              <span className="exp-group">{exp.group}</span>
              <span className="exp-name">{exp.shortTitle}</span>
            </button>
          ))}
        </div>

        <div className="physics-subtabs">
          <button
            className={`subtab-btn ${sidebarTab === 'sim' ? 'active' : ''}`}
            onClick={() => setSidebarTab('sim')}
          >
            <SlidersHorizontal size={14} />
            <span>Simulação</span>
          </button>
          <button
            className={`subtab-btn ${sidebarTab === 'theory' ? 'active' : ''}`}
            onClick={() => setSidebarTab('theory')}
          >
            <BookOpen size={14} />
            <span>Teoria &amp; Cenários</span>
          </button>
        </div>

        <div className="sidebar-scroll">
          {sidebarTab === 'theory' ? (
            <TheoryPanel
              title={experiment.shortTitle}
              theory={experiment.theory}
              activeScenarioId={activeScenarioId}
              onApplyScenario={handleApplyScenario}
            />
          ) : (
            <>
              <section className="physics-info-card">
                <h3>{experiment.title}</h3>
                <p>{experiment.summary}</p>
                <KatexPreview latex={experiment.keyFormulaTex} />
                <div className="legend-row">
                  {experiment.legendItems.map((item) => (
                    <span key={item.label} className="legend-item">
                      <i style={{ backgroundColor: item.color }} />
                      {item.label}
                    </span>
                  ))}
                </div>
              </section>

              <ParameterList
                parameters={state.parameters}
                onUpdate={(name, patch) => {
                  setActiveScenarioId(null);
                  apply({ type: 'updateParameter', name, patch });
                }}
              />

              <FormulaSidebar
                formulas={state.formulas}
                parsedMap={scene.parsedMap}
                telemetryMap={scene.telemetry}
                onAdd={() => {
                  const color = PALETTE[state.formulas.length % PALETTE.length];
                  apply({
                    type: 'addFormula',
                    formula: { id: `p-${Date.now()}`, raw: '', color, visible: true },
                  });
                }}
                onChange={(id, raw) => apply({ type: 'changeFormula', id, raw })}
                onToggleVisible={(id) => apply({ type: 'toggleFormula', id })}
                onRemove={(id) => apply({ type: 'removeFormula', id })}
              />
            </>
          )}
        </div>
      </aside>

      <main className="canvas-stage">
        <SceneStage
          scene={scene}
          overlay={experiment.drawOverlay}
          onDragWorld={handleDragWorld}
          card={experiment.renderCard?.(scene.scope)}
        />
      </main>
    </div>
  );
}
