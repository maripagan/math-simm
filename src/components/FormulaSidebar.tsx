import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { ParsedFormula } from '../engine/parser';
import { FormulaItem } from '../types';
import { KatexPreview } from './KatexPreview';

interface FormulaSidebarProps {
  formulas: FormulaItem[];
  parsedMap: Record<string, ParsedFormula>;
  telemetryMap: Record<string, string>;
  onAdd: () => void;
  onChange: (id: string, raw: string) => void;
  onToggleVisible: (id: string) => void;
  onRemove: (id: string) => void;
}

interface KeypadButton {
  label: string;
  insert: string;
  /** If true, places cursor inside () and wraps any selected text */
  wrapParens?: boolean;
  title: string;
}

const CONSTANT_BUTTONS: KeypadButton[] = [
  { label: 'π', insert: 'π', title: 'Pi (≈ 3.14159)' },
  { label: 'e', insert: 'e', title: 'Número de Euler (≈ 2.71828)' },
  { label: 'i', insert: 'i', title: 'Unidade imaginária (i² = -1)' },
  { label: 'τ', insert: 'τ', title: 'Tau = 2π (≈ 6.28318)' },
  { label: 'φ', insert: 'φ', title: 'Proporção Áurea (≈ 1.61803)' },
  { label: '<', insert: ' < ', title: 'Menor que (área aberta)' },
  { label: '>', insert: ' > ', title: 'Maior que (área aberta)' },
  { label: '≤', insert: ' <= ', title: 'Menor ou igual (área fechada)' },
  { label: '≥', insert: ' >= ', title: 'Maior ou igual (área fechada)' },
];

const FUNCTION_BUTTONS: KeypadButton[] = [
  { label: '√', insert: '√()', wrapParens: true, title: 'Raiz quadrada: √(x)' },
  { label: '∛', insert: '∛()', wrapParens: true, title: 'Raiz cúbica: ∛(x)' },
  { label: 'x²', insert: '^2', title: 'Ao quadrado' },
  { label: 'xⁿ', insert: '^', title: 'Potência' },
  { label: '|x|', insert: 'abs()', wrapParens: true, title: 'Valor absoluto: abs(x)' },
  { label: 'sin', insert: 'sin()', wrapParens: true, title: 'Seno: sin(x)' },
  { label: 'cos', insert: 'cos()', wrapParens: true, title: 'Cosseno: cos(x)' },
  { label: 'tan', insert: 'tan()', wrapParens: true, title: 'Tangente: tan(x)' },
  { label: 'log', insert: 'log()', wrapParens: true, title: 'Logaritmo natural: log(x)' },
  { label: 'exp', insert: 'exp()', wrapParens: true, title: 'Exponencial: e^x' },
];

export function FormulaSidebar({
  formulas,
  parsedMap,
  telemetryMap,
  onAdd,
  onChange,
  onToggleVisible,
  onRemove,
}: FormulaSidebarProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleInsert = (btn: KeypadButton) => {
    const targetId =
      activeId && formulas.some((f) => f.id === activeId)
        ? activeId
        : formulas[0]?.id;
    if (!targetId) return;

    const targetFormula = formulas.find((f) => f.id === targetId);
    if (!targetFormula) return;

    const inputEl = inputRefs.current[targetId];
    const raw = targetFormula.raw;
    const start = inputEl?.selectionStart ?? raw.length;
    const end = inputEl?.selectionEnd ?? raw.length;
    const selected = raw.slice(start, end);

    let inserted = btn.insert;
    let nextCursor = start + inserted.length;

    if (btn.wrapParens && btn.insert.endsWith('()')) {
      const prefix = btn.insert.slice(0, -2);
      inserted = `${prefix}(${selected})`;
      nextCursor = selected
        ? start + inserted.length
        : start + prefix.length + 1;
    }

    const nextValue = raw.slice(0, start) + inserted + raw.slice(end);
    onChange(targetId, nextValue);
    setActiveId(targetId);

    requestAnimationFrame(() => {
      const el = inputRefs.current[targetId];
      if (el) {
        el.focus();
        el.setSelectionRange(nextCursor, nextCursor);
      }
    });
  };

  return (
    <section className="panel-section">
      <div className="section-header">
        <h2>Fórmulas</h2>
        <button className="btn-icon" onClick={onAdd} title="Adicionar fórmula">
          <Plus size={16} />
          <span>Nova</span>
        </button>
      </div>

      <div className="formula-list">
        {formulas.map((f) => {
          const parsed = parsedMap[f.id];
          const isActive = activeId === f.id;
          return (
            <div
              key={f.id}
              className={`formula-card ${isActive ? 'active' : ''}`}
            >
              <div className="formula-row">
                <button
                  className="color-dot-btn"
                  style={{
                    backgroundColor: f.visible ? f.color : 'transparent',
                    borderColor: f.color,
                  }}
                  onClick={() => onToggleVisible(f.id)}
                  title={f.visible ? 'Ocultar curva' : 'Mostrar curva'}
                >
                  {f.visible ? (
                    <Eye size={12} color="#0f172a" />
                  ) : (
                    <EyeOff size={12} color={f.color} />
                  )}
                </button>

                <input
                  ref={(el) => {
                    inputRefs.current[f.id] = el;
                  }}
                  type="text"
                  className="formula-input"
                  value={f.raw}
                  placeholder="Ex: y = a * sin(π * x - t)"
                  onFocus={() => setActiveId(f.id)}
                  onChange={(e) => onChange(f.id, e.target.value)}
                  spellCheck={false}
                />

                {formulas.length > 1 && (
                  <button
                    className="btn-delete"
                    onClick={() => onRemove(f.id)}
                    title="Remover fórmula"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {parsed?.error ? (
                <div className="formula-error">{parsed.error}</div>
              ) : parsed?.latex ? (
                <KatexPreview latex={parsed.latex} />
              ) : null}

              {telemetryMap[f.id] && (
                <div className="formula-telemetry">{telemetryMap[f.id]}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="math-keypad">
        <div className="keypad-group">
          <span className="keypad-label">Constantes &amp; Desigualdades</span>
          <div className="keypad-row">
            {CONSTANT_BUTTONS.map((btn) => (
              <button
                key={btn.label}
                type="button"
                className="keypad-btn const"
                title={btn.title}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleInsert(btn)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="keypad-group">
          <span className="keypad-label">Raízes &amp; Funções</span>
          <div className="keypad-row">
            {FUNCTION_BUTTONS.map((btn) => (
              <button
                key={btn.label}
                type="button"
                className="keypad-btn"
                title={btn.title}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleInsert(btn)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
