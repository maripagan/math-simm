import { Pause, Play, RotateCcw } from 'lucide-react';

interface TimeControlsProps {
  t: number;
  playing: boolean;
  speed: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

const SPEEDS = [0.25, 0.5, 1, 2, 4];

export function TimeControls({
  t,
  playing,
  speed,
  onTogglePlay,
  onReset,
  onSpeedChange,
}: TimeControlsProps) {
  return (
    <div className="time-controls">
      <button
        className={`time-btn ${playing ? 'playing' : ''}`}
        onClick={onTogglePlay}
        title={playing ? 'Pausar tempo t' : 'Iniciar tempo t'}
      >
        {playing ? <Pause size={15} /> : <Play size={15} />}
      </button>

      <button className="time-btn" onClick={onReset} title="Zerar t = 0">
        <RotateCcw size={15} />
      </button>

      <div className="time-readout">
        <span className="time-var">t</span> = {t.toFixed(2)}s
      </div>

      <select
        className="time-speed"
        value={speed}
        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        title="Velocidade do tempo"
      >
        {SPEEDS.map((s) => (
          <option key={s} value={s}>
            {s}x
          </option>
        ))}
      </select>
    </div>
  );
}
