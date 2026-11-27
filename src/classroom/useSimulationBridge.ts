import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CanvasOverlayHelpers } from '../components/GraphCanvas';
import {
  ActiveCurve,
  AuxDef,
  buildScopeWithDefs,
} from '../engine/evaluator';
import { ParsedFormula, parseFormula } from '../engine/parser';
import { MATH_PRESETS } from '../modules/math/mathPresets';
import { PHYSICS_EXPERIMENTS } from '../modules/physics/physicsExperiments';
import { getPhysicsOverlay } from '../modules/physics/visuals/canvasOverlays';
import { FormulaItem, ParameterConfig, Viewport } from '../types';
import { EnginePreset } from './schemas';

export interface ProjectileChallengeOverlay {
  type: 'projectile-wall-target';
  wallX: number;
  wallHeight: number;
  targetX: number;
  targetTolerance?: number;
}

export type ChallengeOverlayConfig = ProjectileChallengeOverlay;

export interface EngineScene {
  id: string;
  formulas: Array<{ raw: string; color: string }>;
  parameters: Record<
    string,
    { value: number; min: number; max: number; step: number }
  >;
  viewport?: Viewport;
}

const LONG_PROJECTILE_VIEW: Viewport = { centerX: 44, centerY: 16, scale: 8.5 };

function experimentToInitialState(exp: EngineScene): {
  formulas: FormulaItem[];
  parameters: Record<string, ParameterConfig>;
  viewport: Viewport;
} {
  const formulas: FormulaItem[] = exp.formulas.map((f, idx) => ({
    id: `cls-${exp.id}-${idx}`,
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
    viewport: exp.viewport ?? { centerX: 0, centerY: 0, scale: 60 },
  };
}

function renderChallengeOverlay(
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
  config: ChallengeOverlayConfig,
) {
  if (config.type === 'projectile-wall-target') {
    const { wallX, wallHeight, targetX, targetTolerance = 3 } = config;
    const baseY = h.toScreenY(0);

    // Muro central
    const wx = h.toScreenX(wallX);
    const wyTop = h.toScreenY(wallHeight);
    ctx.save();
    ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.rect(wx - 6, wyTop, 12, Math.max(4, baseY - wyTop));
    ctx.fill();
    ctx.stroke();

    ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = '#fda4af';
    ctx.textAlign = 'center';
    ctx.fillText(`Muro ${wallHeight}m`, wx, wyTop - 8);

    // Zona do alvo
    const txLeft = h.toScreenX(targetX - targetTolerance);
    const txRight = h.toScreenX(targetX + targetTolerance);
    const txCenter = h.toScreenX(targetX);
    ctx.fillStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.rect(txLeft, baseY - 10, Math.max(10, txRight - txLeft), 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#6ee7b7';
    ctx.fillText(`Alvo ${targetX}m`, txCenter, baseY - 16);
    ctx.restore();
  }
}

const STATISTICS_LAB_SCENE = {
  id: 'statistics-lab' as const,
  formulas: [] as Array<{ raw: string; color: string }>,
  parameters: {
    meanA: { value: 25, min: 10, max: 40, step: 0.5 },
    stdA: { value: 3.0, min: 1, max: 12, step: 0.5 },
    meanB: { value: 25, min: 10, max: 40, step: 0.5 },
    stdB: { value: 8.5, min: 1, max: 12, step: 0.5 },
    bins: { value: 10, min: 5, max: 20, step: 1 },
  },
};

export function getSimulationScene(id: string) {
  if (id === 'statistics-lab') return STATISTICS_LAB_SCENE;
  const scene = PHYSICS_EXPERIMENTS.find((experiment) => experiment.id === id) ??
    MATH_PRESETS.find((preset) => preset.id === id);
  if (!scene) throw new Error(`Cena ausente: ${id}`);
  return scene;
}

export interface UseSimulationBridgeOptions {
  scene: EngineScene;
  externalPreset?: EnginePreset;
  challengeOverlay?: ChallengeOverlayConfig;
  initialPlaying?: boolean;
}

export function useSimulationBridge({
  scene,
  externalPreset,
  challengeOverlay,
  initialPlaying = true,
}: UseSimulationBridgeOptions) {
  const initial = useMemo(() => experimentToInitialState(scene), [scene]);

  const [formulas, setFormulas] = useState<FormulaItem[]>(initial.formulas);
  const [parameters, setParameters] = useState<Record<string, ParameterConfig>>(
    initial.parameters,
  );
  const [viewport, setViewport] = useState<Viewport>(initial.viewport);
  const [t, setT] = useState(0);
  const [timePlaying, setTimePlaying] = useState(initialPlaying);
  const [timeSpeed, setTimeSpeed] = useState(1);

  const isLongProjectile = scene.id === 'projectile' &&
    typeof externalPreset?.v0 === 'number' && externalPreset.v0 >= 22;
  const defaultViewport = isLongProjectile ? LONG_PROJECTILE_VIEW : initial.viewport;

  useEffect(() => {
    setFormulas(initial.formulas);
    setParameters(initial.parameters);
    setViewport(initial.viewport);
    setT(0);
  }, [initial]);

  useEffect(() => {
    setTimePlaying(initialPlaying);
  }, [scene, initialPlaying]);

  useEffect(() => {
    if (!externalPreset) return;
    setParameters((current) => {
      const next = { ...current };
      for (const [name, value] of Object.entries(externalPreset)) {
        const param = next[name];
        if (!param || typeof value !== 'number' || !Number.isFinite(value)) continue;
        next[name] = {
          ...param,
          value: Math.min(param.max, Math.max(param.min, value)),
          playing: false,
        };
      }
      return next;
    });
    setT(0);

    if (scene.id === 'projectile' && typeof externalPreset.v0 === 'number') {
      setViewport(defaultViewport);
    }
  }, [scene.id, initial, externalPreset, defaultViewport]);

  const parsedMap = useMemo(() => {
    const map: Record<string, ParsedFormula> = {};
    for (const f of formulas) {
      map[f.id] = parseFormula(f.raw);
    }
    return map;
  }, [formulas]);

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
            if (scene.id === 'projectile') {
              const v0 = parameters.v0?.value ?? 12;
              const ang = parameters.ang?.value ?? 0.9;
              const g = Math.max(0.1, parameters.g?.value ?? 9.8);
              const tFlight = (2 * v0 * Math.sin(ang)) / g;
              if (tFlight > 0.2 && nextT > tFlight + 0.8) return 0;
            }
            return nextT;
          });
        }
      }
      lastFrameRef.current = now;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [timePlaying, timeSpeed, anyParamPlaying, scene.id, parameters]);

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

  const overlayFn = useMemo(() => {
    const baseOverlay = getPhysicsOverlay(scene.id);
    if (!challengeOverlay) return baseOverlay;
    return (ctx: CanvasRenderingContext2D, h: CanvasOverlayHelpers) => {
      baseOverlay?.(ctx, h);
      renderChallengeOverlay(ctx, h, challengeOverlay);
    };
  }, [scene.id, challengeOverlay]);

  const updateParameter = useCallback(
    (name: string, patch: Partial<ParameterConfig>) => {
      setParameters((prev) => {
        if (!prev[name]) return prev;
        return {
          ...prev,
          [name]: { ...prev[name], ...patch },
        };
      });
    },
    [],
  );

  const resetTime = useCallback(() => setT(0), []);
  const togglePlay = useCallback(() => setTimePlaying((p) => !p), []);

  return {
    defaultViewport,
    formulas,
    parameters,
    viewport,
    setViewport,
    t,
    timePlaying,
    timeSpeed,
    setTimeSpeed,
    activeCurves,
    auxDefs,
    scope,
    overlayFn,
    updateParameter,
    resetTime,
    togglePlay,
  };
}
