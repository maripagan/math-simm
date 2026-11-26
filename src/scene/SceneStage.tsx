import { ReactNode } from 'react';
import { GraphCanvas } from '../components/GraphCanvas';
import { TimeControls } from '../components/TimeControls';
import { RenderOverlay } from '../types';
import { Scene } from './useScene';

interface SceneStageProps {
  scene: Scene;
  overlay?: RenderOverlay;
  onDragWorld?: (wx: number, wy: number, phase: 'down' | 'move') => boolean;
  card?: ReactNode;
}

export function SceneStage({
  scene,
  overlay,
  onDragWorld,
  card,
}: SceneStageProps) {
  const { state, apply } = scene;
  return (
    <>
      <GraphCanvas
        curves={scene.curves}
        defs={scene.defs}
        scope={scene.scope}
        viewport={state.viewport}
        onViewportChange={(viewport) => apply({ type: 'setViewport', viewport })}
        renderOverlay={overlay}
        onDragWorld={onDragWorld}
      />
      {card}
      <TimeControls
        t={state.t}
        playing={state.playing}
        speed={state.speed}
        onTogglePlay={() => apply({ type: 'togglePlaying' })}
        onReset={() => apply({ type: 'resetTime' })}
        onSpeedChange={(speed) => apply({ type: 'setSpeed', speed })}
      />
    </>
  );
}
