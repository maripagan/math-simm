import { BookOpen, Presentation, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormulaSidebar } from '../../components/FormulaSidebar';
import { GraphCanvas } from '../../components/GraphCanvas';
import { KatexPreview } from '../../components/KatexPreview';
import { ParameterList } from '../../components/ParameterList';
import { TimeControls } from '../../components/TimeControls';
import { CLASSROOM_MODULES } from '../../data/modules';
import {
  ActiveCurve,
  AuxDef,
  buildScopeWithDefs,
} from '../../engine/evaluator';
import {
  evaluateCompiled,
  evaluateComplex,
  formatComplex,
  ParsedFormula,
  parseFormula,
} from '../../engine/parser';
import { FormulaItem, ParameterConfig, Viewport } from '../../types';
import { TheoryPanel } from './components/TheoryPanel';
import {
  PHYSICS_EXPERIMENTS,
  PhysicsExperiment,
  PhysicsExperimentId,
} from './physicsExperiments';
import { GuidedScenario, YearLevel } from './types';
import { getOpticsDrag, getPhysicsOverlay } from './visuals/canvasOverlays';
import { PhysicsVisualCard } from './visuals/PhysicsVisualCard';

const PALETTE = ['#38bdf8', '#fbbf24', '#34d399', '#f472b6', '#a78bfa'];

const YEAR_LABELS: Record<YearLevel, string> = {
  1: '1º Ano · Mecânica Clássica',
  2: '2º Ano · Termologia, Óptica & Ondulatória',
  3: '3º Ano · Eletromagnetismo & Física Moderna',
};

interface PhysicsModuleProps {
  year: YearLevel;
  initialExperimentId?: PhysicsExperimentId;
  onPresent: (moduleId: string) => void;
}

function experimentToState(exp: PhysicsExperiment): {
  formulas: FormulaItem[];
  parameters: Record<string, ParameterConfig>;
  viewport: Viewport;
} {
  const formulas: FormulaItem[] = exp.formulas.map((f, idx) => ({
    id: `p-${exp.id}-${idx}`,
    raw: f.raw,
    color: f.color,
    visible: true,
  }));

  const parameters: Record<string, ParameterConfig> = {};
  for (const [name, cfg] of Object.entries(exp.parameters)) {
    parameters[name] = {
      name,
      value: cfg.value,
      min: cfg.min,
      max: cfg.max,
      step: cfg.step,
      playing: false,
      direction: 1,
    };
  }

  return {
    formulas,
    parameters,
    viewport: exp.viewport,
  };
}

export function PhysicsModule({ year, initialExperimentId, onPresent }: PhysicsModuleProps) {
  const yearExperiments = useMemo(
    () => PHYSICS_EXPERIMENTS.filter((e) => e.year === year),
    [year],
  );

  const [experimentId, setExperimentId] = useState<PhysicsExperimentId>(
    () =>
      yearExperiments.find((e) => e.id === initialExperimentId)?.id ??
      yearExperiments[0]?.id ??
      PHYSICS_EXPERIMENTS[0].id,
  );

  const experiment = useMemo(
    () =>
      yearExperiments.find((e) => e.id === experimentId) ??
      yearExperiments[0] ??
      PHYSICS_EXPERIMENTS[0],
    [experimentId, yearExperiments],
  );

  const initial = useMemo(() => experimentToState(experiment), []);

  const [formulas, setFormulas] = useState<FormulaItem[]>(initial.formulas);
  const [parameters, setParameters] = useState<Record<string, ParameterConfig>>(
    initial.parameters,
  );
  const [viewport, setViewport] = useState<Viewport>(initial.viewport);

  const [t, setT] = useState(0);
  const [timePlaying, setTimePlaying] = useState(true);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [sidebarTab, setSidebarTab] = useState<'sim' | 'theory'>('sim');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  // Reset active experiment whenever the selected year module changes
  useEffect(() => {
    const first = yearExperiments[0];
    if (!first) return;
    if (!yearExperiments.some((e) => e.id === experimentId)) {
      const next = experimentToState(first);
      setExperimentId(first.id);
      setFormulas(next.formulas);
      setParameters(next.parameters);
      setViewport(next.viewport);
      setT(0);
      setTimePlaying(true);
      setActiveScenarioId(null);
    }
  }, [year, yearExperiments, experimentId]);

  const handleSelectExperiment = (exp: PhysicsExperiment) => {
    const next = experimentToState(exp);
    setExperimentId(exp.id);
    setFormulas(next.formulas);
    setParameters(next.parameters);
    setViewport(next.viewport);
    setT(0);
    setTimePlaying(true);
    setActiveScenarioId(null);
  };

  const handleApplyScenario = (scenario: GuidedScenario) => {
    setParameters((prev) => {
      const next = { ...prev };
      for (const [key, value] of Object.entries(scenario.params)) {
        if (next[key]) {
          next[key] = { ...next[key], value, playing: false };
        }
      }
      return next;
    });
    if (scenario.resetTime) {
      setT(0);
      setTimePlaying(true);
    }
    setActiveScenarioId(scenario.id);
  };

  const parsedMap = useMemo(() => {
    const map: Record<string, ParsedFormula> = {};
    for (const f of formulas) {
      map[f.id] = parseFormula(f.raw);
    }
    return map;
  }, [formulas]);

  useEffect(() => {
    const definedNames = new Set<string>();
    for (const f of formulas) {
      const parsed = parsedMap[f.id];
      if (parsed?.axis === 'def' && parsed.definedName) {
        definedNames.add(parsed.definedName);
      }
    }

    const detected = new Set<string>(Object.keys(experiment.parameters));
    for (const f of formulas) {
      const parsed = parsedMap[f.id];
      if (parsed) {
        for (const p of parsed.parameters) {
          if (!definedNames.has(p)) detected.add(p);
        }
      }
    }

    setParameters((prev) => {
      let changed = false;
      const next: Record<string, ParameterConfig> = {};
      for (const name of detected) {
        if (prev[name]) {
          next[name] = prev[name];
        } else {
          changed = true;
          const presetCfg = experiment.parameters[name];
          next[name] = presetCfg
            ? {
                name,
                value: presetCfg.value,
                min: presetCfg.min,
                max: presetCfg.max,
                step: presetCfg.step,
                playing: false,
                direction: 1,
              }
            : {
                name,
                value: 1,
                min: -5,
                max: 5,
                step: 0.1,
                playing: false,
                direction: 1,
              };
        }
      }
      if (Object.keys(prev).length !== Object.keys(next).length) {
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [formulas, parsedMap, experiment]);

  const lastFrameRef = useRef<number | null>(null);
  const anyParamPlaying = Object.values(parameters).some((p) => p.playing);

  useEffect(() => {
    if (!timePlaying && !anyParamPlaying) {
      lastFrameRef.current = null;
      return;
    }

    let rafId = 0;
    const tick = (now: number) => {
      if (lastFrameRef.current !== null) {
        const dt = Math.min((now - lastFrameRef.current) / 1000, 0.1);
        if (timePlaying) {
          setT((prev) => {
            const nextT = prev + dt * timeSpeed;
            // Auto-loop projectile after landing so user sees continuous launches
            if (experimentId === 'projectile') {
              const v0 = parameters.v0?.value ?? 12;
              const ang = parameters.ang?.value ?? 0.9;
              const g = Math.max(0.1, parameters.g?.value ?? 9.8);
              const tFlight = (2 * v0 * Math.sin(ang)) / g;
              if (tFlight > 0.2 && nextT > tFlight + 0.6) return 0;
            }
            return nextT;
          });
        }
        if (anyParamPlaying) {
          setParameters((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(next)) {
              const p = next[key];
              if (!p.playing) continue;
              const span = p.max - p.min;
              const speed = span * 0.25;
              const dir = p.direction ?? 1;
              let val = p.value + dir * speed * dt;
              let nextDir = dir;
              if (val >= p.max) {
                val = p.max;
                nextDir = -1;
              } else if (val <= p.min) {
                val = p.min;
                nextDir = 1;
              }
              next[key] = { ...p, value: val, direction: nextDir };
            }
            return next;
          });
        }
      }
      lastFrameRef.current = now;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [timePlaying, timeSpeed, anyParamPlaying, experimentId, parameters]);

  const auxDefs: AuxDef[] = useMemo(() => {
    const defs: AuxDef[] = [];
    for (const f of formulas) {
      const parsed = parsedMap[f.id];
      if (parsed?.axis === 'def' && parsed.definedName && parsed.compiled) {
        defs.push({
          id: f.id,
          name: parsed.definedName,
          compiled: parsed.compiled,
          usesTime: parsed.usesTime,
        });
      }
    }
    return defs;
  }, [formulas, parsedMap]);

  const activeCurves: ActiveCurve[] = useMemo(() => {
    const list: ActiveCurve[] = [];
    for (const f of formulas) {
      if (!f.visible) continue;
      const parsed = parsedMap[f.id];
      if (parsed?.compiled && parsed.axis !== 'def') {
        list.push({
          id: f.id,
          color: f.color,
          compiled: parsed.compiled,
          compiledY: parsed.compiledY,
          relation: parsed.relation,
          axis: parsed.axis,
          usesTime: parsed.usesTime,
          labelName: parsed.definedName,
        });
      }
    }
    return list;
  }, [formulas, parsedMap]);

  const scope = useMemo(() => {
    const base: Record<string, unknown> = { t };
    for (const p of Object.values(parameters)) {
      base[p.name] = p.value;
    }
    return buildScopeWithDefs(base, auxDefs);
  }, [parameters, t, auxDefs]);

  const telemetryMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const f of formulas) {
      const parsed = parsedMap[f.id];
      if (!parsed?.compiled) continue;

      if (parsed.axis === 'def' || parsed.axis === 'z') {
        const val = evaluateComplex(parsed.compiled, scope);
        if (!val) continue;
        if (Math.abs(val.im) > 1e-6) {
          const mod = Math.hypot(val.re, val.im);
          const deg = (Math.atan2(val.im, val.re) * 180) / Math.PI;
          map[f.id] = `= ${formatComplex(val.re, val.im)}   |·|=${mod.toFixed(2)}  ∠${deg.toFixed(1)}°`;
        } else {
          map[f.id] = `= ${val.re.toFixed(3)}`;
        }
      } else if (parsed.axis === 'parametric' && parsed.compiledY) {
        const vx = evaluateCompiled(parsed.compiled, scope);
        const vy = evaluateCompiled(parsed.compiledY, scope);
        if (vx !== null && vy !== null) {
          map[f.id] = `em t=${t.toFixed(2)}s → (${vx.toFixed(2)}, ${vy.toFixed(2)})`;
        }
      }
    }
    return map;
  }, [formulas, parsedMap, scope, t]);

  const overlayFn = useMemo(
    () => getPhysicsOverlay(experiment.id),
    [experiment.id],
  );

  const { target, onDrag } = getOpticsDrag(experiment.id, scope, (name, patch) => {
    setActiveScenarioId(null);
    setParameters((current) => ({ ...current, [name]: { ...current[name], ...patch } }));
  });
  const lesson = CLASSROOM_MODULES.find((item) => item.engineId === experiment.id);

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
                {lesson && (
                  <button className="btn-primary present-cta" onClick={() => onPresent(lesson.id)}>
                    <Presentation size={15} aria-hidden="true" /> Apresentar para a turma
                  </button>
                )}
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
                parameters={parameters}
                glossary={experiment.theory.variables}
                onUpdate={(name, patch) => {
                  setActiveScenarioId(null);
                  setParameters((prev) => ({
                    ...prev,
                    [name]: { ...prev[name], ...patch },
                  }));
                }}
              />

              <details className="physics-formulas" key={experiment.id}>
                <summary>Editar fórmulas da simulação</summary>
                <FormulaSidebar
                  formulas={formulas}
                  parsedMap={parsedMap}
                  telemetryMap={telemetryMap}
                  onAdd={() => {
                    const color = PALETTE[formulas.length % PALETTE.length];
                    setFormulas((prev) => [
                      ...prev,
                      { id: `p-${Date.now()}`, raw: '', color, visible: true },
                    ]);
                  }}
                  onChange={(id, raw) =>
                    setFormulas((prev) =>
                      prev.map((f) => (f.id === id ? { ...f, raw } : f)),
                    )
                  }
                  onToggleVisible={(id) =>
                    setFormulas((prev) =>
                      prev.map((f) =>
                        f.id === id ? { ...f, visible: !f.visible } : f,
                      ),
                    )
                  }
                  onRemove={(id) =>
                    setFormulas((prev) => prev.filter((f) => f.id !== id))
                  }
                />
              </details>
            </>
          )}
        </div>
      </aside>

      <main className="canvas-stage">
        <GraphCanvas
          curves={activeCurves}
          defs={auxDefs}
          scope={scope}
          viewport={viewport}
          onViewportChange={setViewport}
          renderOverlay={overlayFn}
          defaultViewport={experiment.viewport}
          dragTarget={target}
          onDragWorld={onDrag}
          label={experiment.shortTitle}
        />

        {experiment.visualCard && (
          <PhysicsVisualCard type={experiment.visualCard} scope={scope} />
        )}

        <TimeControls
          t={t}
          playing={timePlaying}
          speed={timeSpeed}
          onTogglePlay={() => setTimePlaying((p) => !p)}
          onReset={() => setT(0)}
          onSpeedChange={setTimeSpeed}
        />
      </main>
    </div>
  );
}
