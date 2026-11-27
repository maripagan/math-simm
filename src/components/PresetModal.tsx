import { X } from 'lucide-react';
import { useState } from 'react';
import { parseFormula } from '../engine/parser';
import { KatexPreview } from './KatexPreview';
import { PresetCategory, PresetScene } from '../types';

interface PresetModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (preset: PresetScene) => void;
  presets: PresetScene[];
  categories: Array<{ id: PresetCategory | 'todos'; label: string }>;
  title?: string;
}

export function PresetModal({
  open,
  onClose,
  onSelect,
  presets,
  categories,
  title = 'Galeria de Presets',
}: PresetModalProps) {
  const [selectedCat, setSelectedCat] = useState<PresetCategory | 'todos'>(
    'todos',
  );

  if (!open) return null;

  const filtered =
    selectedCat === 'todos'
      ? presets
      : presets.filter((p) => p.category === selectedCat);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card modal-wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn-delete" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-tab ${selectedCat === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCat(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="preset-grid">
          {filtered.map((preset) => (
            <button
              key={preset.id}
              className="preset-item"
              onClick={() => {
                onSelect(preset);
                onClose();
              }}
            >
              <div className="preset-title">{preset.title}</div>
              <div className="preset-desc">{preset.description}</div>
              <div className="preset-formulas">
                {preset.formulas.map((f, i) => (
                  <span key={i} className="preset-equation" style={{ borderLeftColor: f.color }}>
                    <KatexPreview as="span" latex={parseFormula(f.raw).latex} />
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
