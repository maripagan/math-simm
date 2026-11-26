import { ReactNode } from 'react';
import { CanvasOverlayHelpers, RenderOverlay, Viewport } from '../../../types';
import {
  ExperimentTheory,
  PhysicsExperimentId,
  PhysicsGroup,
  YearLevel,
} from '../types';

export interface ParameterSpec {
  value: number;
  min: number;
  max: number;
  step: number;
}

export type Scope = Record<string, unknown>;
export type DragPhase = 'down' | 'move';
export type Values<K extends string> = Record<K, number> & { t: number };

interface ExperimentData {
  id: PhysicsExperimentId;
  year: YearLevel;
  group: PhysicsGroup;
  title: string;
  shortTitle: string;
  summary: string;
  keyFormulaTex: string;
  legendItems: Array<{ label: string; color: string }>;
  formulas: Array<{ raw: string; color: string }>;
  viewport: Viewport;
  theory: ExperimentTheory;
}

export interface ExperimentChallenge {
  viewport: Viewport;
  draw: RenderOverlay;
}

export interface ExperimentSpec<K extends string> extends ExperimentData {
  parameters: Record<K, ParameterSpec>;
  draw?(
    ctx: CanvasRenderingContext2D,
    h: CanvasOverlayHelpers,
    vals: Values<K>,
  ): void;
  drag?(
    wx: number,
    wy: number,
    phase: DragPhase,
  ): Partial<Record<K, number>> | null;
  restartAt?(vals: Values<K>): number | null;
  card?(vals: Values<K>): ReactNode;
  challenge?: ExperimentChallenge;
}

export interface PhysicsExperiment extends ExperimentData {
  parameters: Record<string, ParameterSpec>;
  drawOverlay?: RenderOverlay;
  dragTo?: (
    wx: number,
    wy: number,
    phase: DragPhase,
  ) => Record<string, number> | null;
  restartTimeAt?: (scope: Scope) => number | null;
  renderCard?: (scope: Scope) => ReactNode;
  challenge?: ExperimentChallenge;
}

export function defineExperiment<K extends string>(
  spec: ExperimentSpec<K>,
): PhysicsExperiment {
  const { draw, drag, restartAt, card, ...data } = spec;
  const read = (scope: Scope): Values<K> => {
    const vals = { t: finiteOr(scope.t, 0) } as Values<K>;
    for (const key of Object.keys(spec.parameters) as K[]) {
      (vals as Record<K, number>)[key] = finiteOr(
        scope[key],
        spec.parameters[key].value,
      );
    }
    return vals;
  };
  return {
    ...data,
    drawOverlay: draw && ((ctx, h) => draw(ctx, h, read(h.scope))),
    dragTo: drag && ((wx, wy, phase) => stripUndefined(drag(wx, wy, phase))),
    restartTimeAt: restartAt && ((scope) => restartAt(read(scope))),
    renderCard: card && ((scope) => card(read(scope))),
  };
}

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function stripUndefined(
  patch: Partial<Record<string, number>> | null,
): Record<string, number> | null {
  if (!patch) return null;
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (typeof value === 'number') out[key] = value;
  }
  return out;
}
