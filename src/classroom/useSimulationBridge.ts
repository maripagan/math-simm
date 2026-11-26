import { useEffect, useMemo, useRef } from 'react';
import { PhysicsExperiment } from '../modules/physics/physicsExperiments';
import { initScene, SceneContent, sceneFromSource } from '../scene/Scene';
import { Scene, useScene } from '../scene/useScene';
import { RenderOverlay } from '../types';
import { EnginePreset } from './schemas';

export interface UseSimulationBridgeOptions {
  experiment: PhysicsExperiment;
  preset?: EnginePreset;
  showChallenge: boolean;
  playing: boolean;
}

export interface SimulationBridge {
  experiment: PhysicsExperiment;
  scene: Scene;
  overlay?: RenderOverlay;
}

function classroomContent(exp: PhysicsExperiment): SceneContent {
  return sceneFromSource(exp, (idx) => `cls-${exp.id}-${idx}`, { pin: true });
}

export function useSimulationBridge({
  experiment,
  preset,
  showChallenge,
  playing,
}: UseSimulationBridgeOptions): SimulationBridge {
  const scene = useScene(
    () => initScene(classroomContent(experiment), { playing }),
    { restartAt: experiment.restartTimeAt },
  );
  const { apply } = scene;

  const loadedRef = useRef(experiment);
  const presetKeyRef = useRef('');
  useEffect(() => {
    if (loadedRef.current === experiment) return;
    loadedRef.current = experiment;
    presetKeyRef.current = '';
    apply({ type: 'load', content: classroomContent(experiment), playing });
  }, [experiment, playing, apply]);

  const playingRef = useRef(playing);
  useEffect(() => {
    if (playingRef.current === playing) return;
    playingRef.current = playing;
    apply({ type: 'setValues', values: {}, resetTime: true, play: playing });
  }, [playing, apply]);

  useEffect(() => {
    if (!preset) return;
    const key = JSON.stringify(preset);
    if (key === presetKeyRef.current) return;
    presetKeyRef.current = key;
    apply({ type: 'setValues', values: preset, resetTime: true, play: playing });
  }, [experiment, preset, playing, apply]);

  const challenge = showChallenge ? experiment.challenge : undefined;
  useEffect(() => {
    apply({
      type: 'setViewport',
      viewport: challenge?.viewport ?? experiment.viewport,
    });
  }, [challenge, experiment, apply]);

  const overlay = useMemo<RenderOverlay | undefined>(() => {
    const base = experiment.drawOverlay;
    if (!challenge) return base;
    return (ctx, h) => {
      base?.(ctx, h);
      challenge.draw(ctx, h);
    };
  }, [experiment, challenge]);

  return { experiment, scene, overlay };
}
