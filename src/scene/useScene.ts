import { Dispatch, useEffect, useMemo, useReducer, useRef } from 'react';
import { ActiveCurve, AuxDef } from '../engine/evaluator';
import { ParsedFormula, parseFormula } from '../engine/parser';
import {
  applySceneCommand,
  buildScope,
  deriveCurves,
  deriveDefs,
  describeFormulas,
  detectParameters,
  isAnimating,
  RestartRule,
  SceneCommand,
  SceneState,
} from './Scene';

export interface SceneRules {
  restartAt?: RestartRule;
}

export interface Scene {
  state: SceneState;
  parsedMap: Record<string, ParsedFormula>;
  curves: ActiveCurve[];
  defs: AuxDef[];
  scope: Record<string, unknown>;
  telemetry: Record<string, string>;
  apply: Dispatch<SceneCommand>;
}

export function useScene(init: () => SceneState, rules?: SceneRules): Scene {
  const [state, apply] = useReducer(applySceneCommand, undefined, init);
  const rulesRef = useRef(rules);
  rulesRef.current = rules;

  const parsedMap = useMemo(() => {
    const map: Record<string, ParsedFormula> = {};
    for (const f of state.formulas) {
      map[f.id] = parseFormula(f.raw);
    }
    return map;
  }, [state.formulas]);

  useEffect(() => {
    apply({
      type: 'reconcile',
      detected: detectParameters(state.formulas, parsedMap),
    });
  }, [state.formulas, parsedMap]);

  const running = isAnimating(state);
  useEffect(() => {
    if (!running) return;
    let last: number | null = null;
    let rafId = 0;
    const loop = (now: number) => {
      if (last !== null) {
        apply({
          type: 'tick',
          dt: Math.min((now - last) / 1000, 0.1),
          restartAt: rulesRef.current?.restartAt,
        });
      }
      last = now;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [running]);

  const defs = useMemo(
    () => deriveDefs(state.formulas, parsedMap),
    [state.formulas, parsedMap],
  );
  const curves = useMemo(
    () => deriveCurves(state.formulas, parsedMap),
    [state.formulas, parsedMap],
  );
  const scope = useMemo(
    () => buildScope(state.parameters, state.t, defs),
    [state.parameters, state.t, defs],
  );
  const telemetry = useMemo(
    () => describeFormulas(state.formulas, parsedMap, scope, state.t),
    [state.formulas, parsedMap, scope, state.t],
  );

  return { state, parsedMap, curves, defs, scope, telemetry, apply };
}
