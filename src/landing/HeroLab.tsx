import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { useSimulationBridge } from '../classroom/useSimulationBridge';
import { GraphCanvas } from '../components/GraphCanvas';
import { KatexPreview } from '../components/KatexPreview';
import { EULER_PRESET_ID, MATH_PRESETS } from '../modules/math/mathPresets';
import { PHYSICS_EXPERIMENTS } from '../modules/physics/physicsExperiments';
import { PhysicsExperimentId } from '../modules/physics/types';
import { getOpticsDrag } from '../modules/physics/visuals/canvasOverlays';

interface Subject {
  id: string;
  name: string;
  experimentId?: PhysicsExperimentId;
  title: string;
  equation: string;
  control: { symbol: string; label: string; unit?: string };
  readout: (p: Record<string, number>) => string;
  animated?: boolean;
}

const num = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

const SUBJECTS: Subject[] = [
  {
    id: 'math',
    name: 'Matemática',
    title: 'Fasores no plano complexo',
    equation: String.raw`z(t)=r\,e^{i\omega t}`,
    control: { symbol: 'w', label: 'ω', unit: 'rad/s' },
    readout: (p) => `Período ${num((2 * Math.PI) / p.w)} s`,
    animated: true,
  },
  {
    id: 'mechanics',
    name: 'Gravitação',
    experimentId: 'kepler',
    title: 'Órbitas de Kepler',
    equation: String.raw`r(\theta)=\frac{q(1+\varepsilon)}{1+\varepsilon\cos\theta}`,
    control: { symbol: 'ecc', label: 'ε' },
    readout: ({ ecc }) => {
      if (ecc === 0) return 'Órbita circular';
      if (ecc < 1) return 'Órbita elíptica';
      return ecc === 1 ? 'Trajetória parabólica' : 'Trajetória hiperbólica';
    },
    animated: true,
  },
  {
    id: 'optics',
    name: 'Óptica',
    experimentId: 'snell-optics',
    title: 'Refração e reflexão total',
    equation: String.raw`n_1\sin\theta_1=n_2\sin\theta_2`,
    control: { symbol: 'ang1', label: 'θ₁', unit: '°' },
    readout: (p) => {
      const [from, to] = p.dir < 0 ? [p.n2, p.n1] : [p.n1, p.n2];
      const sine = (from / to) * Math.sin(p.ang1);
      if (sine > 1) return 'Reflexão interna total';
      return `θ₂ ${num(toDegrees(Math.asin(sine)))}°`;
    },
    animated: true,
  },
  {
    id: 'thermodynamics',
    name: 'Termodinâmica',
    experimentId: 'ideal-gas',
    title: 'Ciclo de Carnot',
    equation: String.raw`\eta=1-\frac{T_F}{T_Q}`,
    control: { symbol: 'TQ', label: 'T_Q', unit: 'K' },
    readout: ({ TQ, TF }) => `Rendimento ${num(100 * (1 - TF / TQ))}%`,
    animated: true,
  },
  {
    id: 'electromagnetism',
    name: 'Eletromagnetismo',
    experimentId: 'ac-rlc',
    title: 'Circuito RLC',
    equation: String.raw`Z=R+i\!\left(\omega L-\frac{1}{\omega C}\right)`,
    control: { symbol: 'w', label: 'ω', unit: 'rad/s' },
    readout: (p) => `Defasagem ${num(toDegrees(Math.atan2(p.w * p.L - 1 / (p.w * p.C), p.R)))}°`,
    animated: true,
  },
  {
    id: 'modern',
    name: 'Física moderna',
    experimentId: 'radioactive-decay',
    title: 'Meia-vida',
    equation: String.raw`N(t)=N_0\,2^{-t/T_{1/2}}`,
    control: { symbol: 'T12', label: 'T½', unit: 's' },
    readout: ({ T12 }) => `50% em ${num(T12)} s`,
  },
];

function Stage({ subject }: { subject: Subject }) {
  const experiment = PHYSICS_EXPERIMENTS.find((item) => item.id === subject.experimentId);
  const scene = experiment ?? MATH_PRESETS.find((preset) => preset.id === EULER_PRESET_ID)!;
  const [autoplay] = useState(() => Boolean(subject.animated) &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const sim = useSimulationBridge({ scene, initialPlaying: autoplay });
  const { control } = subject;
  const param = sim.parameters[control.symbol];
  const values = Object.fromEntries(Object.values(sim.parameters).map(({ name, value }) => [name, value]));
  const value = control.unit === '°' ? toDegrees(param.value) : param.value;
  const unit = control.unit === '°' ? '°' : control.unit ? ` ${control.unit}` : '';
  const { target, onDrag } = getOpticsDrag(scene.id, sim.scope, sim.updateParameter);

  return (
    <div className="lab__main">
      <div className="lab__head">
        <KatexPreview as="span" latex={subject.equation} />
        <label className="lab__control">
          <span>{control.label}</span>
          <input type="range" min={param.min} max={param.max} step={param.step} value={param.value}
            aria-label={`${subject.title}: ${control.label}`}
            aria-valuetext={`${num(value)}${unit}`}
            onChange={(event) => sim.updateParameter(control.symbol, { value: Number(event.target.value) })} />
          <output>{num(value)}{unit}</output>
        </label>
        <span className="lab__readout">{subject.readout(values)}</span>
        {subject.animated && (
          <button type="button" className="lab__play" onClick={sim.togglePlay}
            aria-label={sim.timePlaying ? 'Pausar a simulação' : 'Animar a simulação'}>
            {sim.timePlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
        )}
      </div>
      <div className="lab__canvas">
        <GraphCanvas
          curves={sim.activeCurves}
          defs={sim.auxDefs}
          scope={sim.scope}
          viewport={sim.viewport}
          defaultViewport={sim.defaultViewport}
          fitWidth={560}
          onViewportChange={sim.setViewport}
          renderOverlay={sim.overlayFn}
          dragTarget={target}
          onDragWorld={onDrag}
          label={subject.title}
        />
      </div>
    </div>
  );
}

export function HeroLab() {
  const [subjectId, setSubjectId] = useState('math');
  const subject = SUBJECTS.find((item) => item.id === subjectId)!;

  return (
    <div className="lab" data-ui="">
      <div className="lab__bar">
        <span className="lab__dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="lab__crumb"><span>{subject.name} <i>/</i> </span><b>{subject.title}</b></span>
      </div>
      <div className="lab__body">
        <nav className="lab__side" aria-label="Matérias do simulador">
          {SUBJECTS.map((item) => (
            <button key={item.id} type="button" aria-pressed={item.id === subjectId}
              onClick={() => setSubjectId(item.id)}>
              {item.name}
            </button>
          ))}
        </nav>
        <Stage key={subject.id} subject={subject} />
      </div>
    </div>
  );
}
