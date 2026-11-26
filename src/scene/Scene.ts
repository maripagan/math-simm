import { ActiveCurve, AuxDef, buildScopeWithDefs } from '../engine/evaluator';
import {
  evaluateCompiled,
  evaluateComplex,
  formatComplex,
  ParsedFormula,
} from '../engine/parser';
import { FormulaItem, ParameterConfig, Viewport } from '../types';

export interface SceneSource {
  formulas: { raw: string; color: string }[];
  parameters: Record<
    string,
    { value: number; min: number; max: number; step: number }
  >;
  viewport?: Viewport;
}

export interface SceneContent {
  formulas: FormulaItem[];
  parameters: Record<string, ParameterConfig>;
  pinned: string[];
  viewport: Viewport;
}

export interface SceneState extends SceneContent {
  t: number;
  playing: boolean;
  speed: number;
}

export type RestartRule = (values: Record<string, number>) => number | null;

export type SceneCommand =
  | { type: 'load'; content: SceneContent; playing?: boolean }
  | { type: 'addFormula'; formula: FormulaItem }
  | { type: 'changeFormula'; id: string; raw: string }
  | { type: 'toggleFormula'; id: string }
  | { type: 'removeFormula'; id: string }
  | { type: 'reconcile'; detected: string[] }
  | {
      type: 'setValues';
      values: Record<string, unknown>;
      resetTime?: boolean;
      play?: boolean;
    }
  | { type: 'updateParameter'; name: string; patch: Partial<ParameterConfig> }
  | { type: 'setViewport'; viewport: Viewport }
  | { type: 'setPlaying'; playing: boolean }
  | { type: 'togglePlaying' }
  | { type: 'resetTime' }
  | { type: 'setSpeed'; speed: number }
  | { type: 'tick'; dt: number; restartAt?: RestartRule };

const DEFAULT_VIEWPORT: Viewport = { centerX: 0, centerY: 0, scale: 60 };

export function sceneFromSource(
  source: SceneSource,
  formulaId: (index: number) => string,
  options: { pin?: boolean } = {},
): SceneContent {
  const parameters: Record<string, ParameterConfig> = {};
  for (const [name, cfg] of Object.entries(source.parameters)) {
    parameters[name] = newParameter(name, cfg);
  }
  return {
    formulas: source.formulas.map((f, idx) => ({
      id: formulaId(idx),
      raw: f.raw,
      color: f.color,
      visible: true,
    })),
    parameters,
    pinned: options.pin ? Object.keys(source.parameters) : [],
    viewport: source.viewport ?? DEFAULT_VIEWPORT,
  };
}

export function initScene(
  content: SceneContent,
  options: { playing?: boolean } = {},
): SceneState {
  return { ...content, t: 0, playing: options.playing ?? true, speed: 1 };
}

export function applySceneCommand(
  state: SceneState,
  command: SceneCommand,
): SceneState {
  switch (command.type) {
    case 'load':
      return {
        ...state,
        ...command.content,
        t: 0,
        playing: command.playing ?? state.playing,
      };
    case 'addFormula':
      return { ...state, formulas: [...state.formulas, command.formula] };
    case 'changeFormula':
      return {
        ...state,
        formulas: state.formulas.map((f) =>
          f.id === command.id ? { ...f, raw: command.raw } : f,
        ),
      };
    case 'toggleFormula':
      return {
        ...state,
        formulas: state.formulas.map((f) =>
          f.id === command.id ? { ...f, visible: !f.visible } : f,
        ),
      };
    case 'removeFormula':
      return {
        ...state,
        formulas: state.formulas.filter((f) => f.id !== command.id),
      };
    case 'reconcile':
      return reconcileParameters(state, command.detected);
    case 'setValues': {
      const parameters = { ...state.parameters };
      for (const [key, raw] of Object.entries(command.values)) {
        const current = parameters[key];
        if (!current || typeof raw !== 'number' || !Number.isFinite(raw)) {
          continue;
        }
        parameters[key] = {
          ...current,
          value: Math.min(current.max, Math.max(current.min, raw)),
          playing: false,
        };
      }
      return {
        ...state,
        parameters,
        t: command.resetTime ? 0 : state.t,
        playing: command.play ?? state.playing,
      };
    }
    case 'updateParameter': {
      const current = state.parameters[command.name];
      if (!current) return state;
      return {
        ...state,
        parameters: {
          ...state.parameters,
          [command.name]: { ...current, ...command.patch },
        },
      };
    }
    case 'setViewport':
      return { ...state, viewport: command.viewport };
    case 'setPlaying':
      return { ...state, playing: command.playing };
    case 'togglePlaying':
      return { ...state, playing: !state.playing };
    case 'resetTime':
      return { ...state, t: 0 };
    case 'setSpeed':
      return { ...state, speed: command.speed };
    case 'tick':
      return tick(state, command.dt, command.restartAt);
  }
}

export function isAnimating(state: SceneState): boolean {
  return state.playing || hasPlayingParameter(state.parameters);
}

export function hasPlayingParameter(
  parameters: Record<string, ParameterConfig>,
): boolean {
  return Object.values(parameters).some((p) => p.playing);
}

export function detectParameters(
  formulas: FormulaItem[],
  parsedMap: Record<string, ParsedFormula>,
): string[] {
  const defined = new Set<string>();
  for (const f of formulas) {
    const parsed = parsedMap[f.id];
    if (parsed?.axis === 'def' && parsed.definedName) {
      defined.add(parsed.definedName);
    }
  }
  const detected = new Set<string>();
  for (const f of formulas) {
    for (const p of parsedMap[f.id]?.parameters ?? []) {
      if (!defined.has(p)) detected.add(p);
    }
  }
  return [...detected];
}

export function deriveDefs(
  formulas: FormulaItem[],
  parsedMap: Record<string, ParsedFormula>,
): AuxDef[] {
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
}

export function deriveCurves(
  formulas: FormulaItem[],
  parsedMap: Record<string, ParsedFormula>,
): ActiveCurve[] {
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
}

export function buildScope(
  parameters: Record<string, ParameterConfig>,
  t: number,
  defs: AuxDef[],
): Record<string, unknown> {
  return buildScopeWithDefs(valuesOf(parameters, t), defs);
}

export function describeFormulas(
  formulas: FormulaItem[],
  parsedMap: Record<string, ParsedFormula>,
  scope: Record<string, unknown>,
  t: number,
): Record<string, string> {
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
}

function valuesOf(
  parameters: Record<string, ParameterConfig>,
  t: number,
): Record<string, number> {
  const values: Record<string, number> = { t };
  for (const p of Object.values(parameters)) {
    values[p.name] = p.value;
  }
  return values;
}

function newParameter(
  name: string,
  cfg: { value: number; min: number; max: number; step: number },
): ParameterConfig {
  return { name, ...cfg, playing: false, direction: 1 };
}

function reconcileParameters(
  state: SceneState,
  detected: string[],
): SceneState {
  const names = [...new Set([...state.pinned, ...detected])];
  const prev = state.parameters;
  let changed = names.length !== Object.keys(prev).length;
  const next: Record<string, ParameterConfig> = {};
  for (const name of names) {
    if (prev[name]) {
      next[name] = prev[name];
    } else {
      changed = true;
      next[name] = newParameter(name, { value: 1, min: -5, max: 5, step: 0.1 });
    }
  }
  return changed ? { ...state, parameters: next } : state;
}

function tick(
  state: SceneState,
  dt: number,
  restartAt?: RestartRule,
): SceneState {
  let { t, parameters } = state;
  if (state.playing) {
    t = state.t + dt * state.speed;
    const restart = restartAt?.(valuesOf(state.parameters, t));
    if (restart != null && t > restart) t = 0;
  }
  if (hasPlayingParameter(parameters)) {
    parameters = { ...parameters };
    for (const [key, p] of Object.entries(parameters)) {
      if (!p.playing) continue;
      const dir = p.direction ?? 1;
      let value = p.value + dir * (p.max - p.min) * 0.25 * dt;
      let direction = dir;
      if (value >= p.max) {
        value = p.max;
        direction = -1;
      } else if (value <= p.min) {
        value = p.min;
        direction = 1;
      }
      parameters[key] = { ...p, value, direction };
    }
  }
  if (t === state.t && parameters === state.parameters) return state;
  return { ...state, t, parameters };
}
