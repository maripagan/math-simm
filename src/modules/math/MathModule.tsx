import { BookOpen, Check, Presentation, Share2, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormulaSidebar } from '../../components/FormulaSidebar';
import { GraphCanvas } from '../../components/GraphCanvas';
import { GuideModal } from '../../components/GuideModal';
import { ParameterList } from '../../components/ParameterList';
import { PresetModal } from '../../components/PresetModal';
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
import {
  encodeSceneToUrl,
  loadSceneFromLocalStorage,
  loadSceneFromUrl,
  saveSceneToLocalStorage,
} from '../../state/persistence';
import { FormulaItem, ParameterConfig, PresetScene, Viewport } from '../../types';
import { MATH_CATEGORIES, MATH_PRESETS } from './mathPresets';

const PALETTE = [
  '#38bdf8',
  '#f472b6',
  '#34d399',
  '#fbbf24',
  '#a78bfa',
  '#fb7185',
  '#22d3ee',
];

function presetToState(preset: PresetScene): {
  formulas: FormulaItem[];
  parameters: Record<string, ParameterConfig>;
  viewport: Viewport;
} {
  const formulas: FormulaItem[] = preset.formulas.map((f, idx) => ({
    id: `f-${idx}-${Date.now()}`,
    raw: f.raw,
    color: f.color,
    visible: true,
  }));

  const parameters: Record<string, ParameterConfig> = {};
  for (const [name, cfg] of Object.entries(preset.parameters)) {
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
    viewport: preset.viewport ?? { centerX: 0, centerY: 0, scale: 60 },
  };
}

function getInitialScene(presetId?: string) {
  const preset = MATH_PRESETS.find((item) => item.id === presetId);
  if (preset) return presetToState(preset);
  const fromUrl = loadSceneFromUrl();
  if (fromUrl) return fromUrl;
  const fromStorage = loadSceneFromLocalStorage();
  if (fromStorage) return fromStorage;
  return presetToState(MATH_PRESETS[0]);
}

export function MathModule({ initialPresetId, onPresent }: {
  initialPresetId?: string;
  onPresent: (moduleId: string) => void;
}) {
  const [initial] = useState(() => getInitialScene(initialPresetId));
  const [activePresetId, setActivePresetId] = useState(initialPresetId);
  const lesson = CLASSROOM_MODULES.find((item) => item.engineId === activePresetId);

  const [formulas, setFormulas] = useState<FormulaItem[]>(initial.formulas);
  const [parameters, setParameters] = useState<Record<string, ParameterConfig>>(
    initial.parameters,
  );
  const [viewport, setViewport] = useState<Viewport>(initial.viewport);

  const [t, setT] = useState(0);
  const [timePlaying, setTimePlaying] = useState(true);
  const [timeSpeed, setTimeSpeed] = useState(1);

  const [presetsOpen, setPresetsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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

    const detected = new Set<string>();
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
          next[name] = {
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
  }, [formulas, parsedMap]);

  useEffect(() => {
    saveSceneToLocalStorage({ formulas, parameters, viewport });
  }, [formulas, parameters, viewport]);

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
          setT((prev) => prev + dt * timeSpeed);
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
  }, [timePlaying, timeSpeed, anyParamPlaying]);

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

  const handleAddFormula = () => {
    const color = PALETTE[formulas.length % PALETTE.length];
    setFormulas((prev) => [
      ...prev,
      { id: `f-${Date.now()}`, raw: '', color, visible: true },
    ]);
  };

  const handleChangeFormula = (id: string, raw: string) => {
    setFormulas((prev) => prev.map((f) => (f.id === id ? { ...f, raw } : f)));
  };

  const handleToggleVisible = (id: string) => {
    setFormulas((prev) =>
      prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)),
    );
  };

  const handleRemoveFormula = (id: string) => {
    setFormulas((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpdateParam = (name: string, patch: Partial<ParameterConfig>) => {
    setParameters((prev) => ({
      ...prev,
      [name]: { ...prev[name], ...patch },
    }));
  };

  const handleSelectPreset = (preset: PresetScene) => {
    const next = presetToState(preset);
    setActivePresetId(preset.id);
    setFormulas(next.formulas);
    setParameters(next.parameters);
    setViewport(next.viewport);
    setT(0);
  };

  const handleShare = async () => {
    const url = encodeSceneToUrl({ formulas, parameters, viewport });
    window.history.replaceState(null, '', url);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <div className="module-body">
      <aside className="sidebar">
        <div className="module-toolbar">
          <button
            className="btn-secondary"
            onClick={() => setGuideOpen(true)}
            title="Guia de sintaxe e números complexos"
          >
            <BookOpen size={14} />
            <span>Guia</span>
          </button>
          <button
            className="btn-secondary"
            onClick={() => setPresetsOpen(true)}
            title="Presets de Matemática & Complexos"
          >
            <Sparkles size={14} />
            <span>Presets</span>
          </button>
          <button
            className="btn-secondary"
            onClick={handleShare}
            title="Copiar link da cena"
          >
            {copied ? <Check size={14} color="#0e6b3f" /> : <Share2 size={14} />}
            <span>{copied ? 'Copiado' : 'Link'}</span>
          </button>
        </div>

        <div className="sidebar-scroll">
          {lesson && (
            <button className="btn-primary present-cta" onClick={() => onPresent(lesson.id)}>
              <Presentation size={15} aria-hidden="true" /> Apresentar a aula de Euler para a turma
            </button>
          )}
          <FormulaSidebar
            formulas={formulas}
            parsedMap={parsedMap}
            telemetryMap={telemetryMap}
            onAdd={handleAddFormula}
            onChange={handleChangeFormula}
            onToggleVisible={handleToggleVisible}
            onRemove={handleRemoveFormula}
          />
          <ParameterList parameters={parameters} onUpdate={handleUpdateParam} />
        </div>
      </aside>

      <main className="canvas-stage">
        <GraphCanvas
          curves={activeCurves}
          defs={auxDefs}
          scope={scope}
          viewport={viewport}
          onViewportChange={setViewport}
        />
        <TimeControls
          t={t}
          playing={timePlaying}
          speed={timeSpeed}
          onTogglePlay={() => setTimePlaying((p) => !p)}
          onReset={() => setT(0)}
          onSpeedChange={setTimeSpeed}
        />
      </main>

      <PresetModal
        open={presetsOpen}
        onClose={() => setPresetsOpen(false)}
        onSelect={handleSelectPreset}
        presets={MATH_PRESETS}
        categories={MATH_CATEGORIES}
        title="Presets — Matemática Pura & Complexos"
      />

      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
