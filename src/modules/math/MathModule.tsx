import { BookOpen, Check, Share2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormulaSidebar } from '../../components/FormulaSidebar';
import { GuideModal } from '../../components/GuideModal';
import { ParameterList } from '../../components/ParameterList';
import { PresetModal } from '../../components/PresetModal';
import {
  hasPlayingParameter,
  initScene,
  SceneContent,
  sceneFromSource,
  SceneState,
} from '../../scene/Scene';
import { SceneStage } from '../../scene/SceneStage';
import { useScene } from '../../scene/useScene';
import {
  encodeSceneToUrl,
  loadSceneFromLocalStorage,
  loadSceneFromUrl,
  saveSceneToLocalStorage,
} from '../../state/persistence';
import { PresetScene } from '../../types';
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

function presetContent(preset: PresetScene): SceneContent {
  const stamp = Date.now();
  return sceneFromSource(preset, (idx) => `f-${idx}-${stamp}`);
}

function getInitialScene(): SceneState {
  const saved = loadSceneFromUrl() ?? loadSceneFromLocalStorage();
  return initScene(saved ? { ...saved, pinned: [] } : presetContent(MATH_PRESETS[0]));
}

export function MathModule() {
  const scene = useScene(getInitialScene);
  const { state, apply } = scene;
  const { formulas, parameters, viewport } = state;

  const [presetsOpen, setPresetsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const paramsAnimating = hasPlayingParameter(parameters);
  useEffect(() => {
    if (paramsAnimating) return;
    saveSceneToLocalStorage({ formulas, parameters, viewport });
  }, [formulas, parameters, viewport, paramsAnimating]);

  const handleAddFormula = () => {
    const color = PALETTE[formulas.length % PALETTE.length];
    apply({
      type: 'addFormula',
      formula: { id: `f-${Date.now()}`, raw: '', color, visible: true },
    });
  };

  const handleSelectPreset = (preset: PresetScene) => {
    apply({ type: 'load', content: presetContent(preset) });
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
            {copied ? <Check size={14} color="#34d399" /> : <Share2 size={14} />}
            <span>{copied ? 'Copiado' : 'Link'}</span>
          </button>
        </div>

        <div className="sidebar-scroll">
          <FormulaSidebar
            formulas={formulas}
            parsedMap={scene.parsedMap}
            telemetryMap={scene.telemetry}
            onAdd={handleAddFormula}
            onChange={(id, raw) => apply({ type: 'changeFormula', id, raw })}
            onToggleVisible={(id) => apply({ type: 'toggleFormula', id })}
            onRemove={(id) => apply({ type: 'removeFormula', id })}
          />
          <ParameterList
            parameters={parameters}
            onUpdate={(name, patch) =>
              apply({ type: 'updateParameter', name, patch })
            }
          />
        </div>
      </aside>

      <main className="canvas-stage">
        <SceneStage scene={scene} />
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
