export interface FormulaItem {
  id: string;
  raw: string;
  color: string;
  visible: boolean;
}

export interface ParameterConfig {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  playing: boolean;
  direction?: 1 | -1;
}

export interface Viewport {
  centerX: number;
  centerY: number;
  /** Pixels per world unit */
  scale: number;
}

export interface CanvasOverlayHelpers {
  width: number;
  height: number;
  viewport: Viewport;
  scope: Record<string, unknown>;
  toScreenX: (wx: number) => number;
  toScreenY: (wy: number) => number;
}

export type RenderOverlay = (
  ctx: CanvasRenderingContext2D,
  h: CanvasOverlayHelpers,
) => void;

export interface NotablePoint {
  x: number;
  y: number;
  type: 'root' | 'intersection';
  label: string;
  color: string;
}

export type PresetCategory = 'matematica' | 'complexos';

export interface PresetScene {
  id: string;
  category: PresetCategory;
  title: string;
  description: string;
  formulas: { raw: string; color: string }[];
  parameters: Record<
    string,
    { value: number; min: number; max: number; step: number }
  >;
  viewport?: Viewport;
}
