import { FormulaItem, ParameterConfig, Viewport } from '../types';

const STORAGE_KEY = 'math_simulator_scene_v1';

export interface SavedScene {
  formulas: FormulaItem[];
  parameters: Record<string, ParameterConfig>;
  viewport: Viewport;
}

export function encodeSceneToUrl(scene: SavedScene): string {
  const payload = JSON.stringify(scene);
  const encoded = btoa(unescape(encodeURIComponent(payload)));
  const url = new URL(window.location.href);
  url.hash = `scene=${encoded}`;
  return url.toString();
}

export function loadSceneFromUrl(): SavedScene | null {
  try {
    const hash = window.location.hash;
    if (!hash.startsWith('#scene=')) return null;
    const encoded = hash.slice('#scene='.length);
    const json = decodeURIComponent(escape(atob(encoded)));
    const parsed = JSON.parse(json) as SavedScene;
    if (Array.isArray(parsed.formulas) && parsed.viewport) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSceneToLocalStorage(scene: SavedScene): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scene));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadSceneFromLocalStorage(): SavedScene | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedScene;
    if (Array.isArray(parsed.formulas) && parsed.viewport) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
