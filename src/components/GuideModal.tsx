import { X } from 'lucide-react';

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function GuideModal({ open, onClose }: GuideModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Guia Rápido — Complexos &amp; Sintaxe</h3>
          <button className="btn-delete" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="guide-content">
          <div className="guide-block">
            <h4>1. Funções com saída complexa (<code>y = f(x)</code>)</h4>
            <p>
              Quando uma função gera números complexos (ex: <code>y = √(x)</code> para{' '}
              <code>x &lt; 0</code> ou <code>y = e^(i*x)</code>), a parte{' '}
              <strong>Real</strong> aparece em linha contínua e a parte{' '}
              <strong>Imaginária</strong> em linha pontilhada. Passe o mouse para ver{' '}
              <code>a + bi</code>, módulo <code>|z|</code> e ângulo <code>θ</code>.
            </p>
          </div>

          <div className="guide-block">
            <h4>2. Plano Complexo / Argand-Gauss (<code>z = ...</code>)</h4>
            <p>
              Comece a fórmula com <code>z =</code> ou <code>z(t) =</code> para plotar
              diretamente no plano <strong>Re × Im</strong>:
            </p>
            <ul>
              <li>
                <strong>Vetor / Fasor fixo:</strong> <code>z = a + b*i</code> ou{' '}
                <code>z = r * e^(i*θ)</code>
              </li>
              <li>
                <strong>Trajetória animada com t:</strong> <code>z = e^(i*t)</code> ou{' '}
                <code>z = e^(i*t) + 0.5*e^(3*i*t)</code>
              </li>
            </ul>
          </div>

          <div className="guide-block">
            <h4>3. Curvas Paramétricas &amp; Variáveis Auxiliares</h4>
            <ul>
              <li>
                <strong>Paramétricas 2D:</strong>{' '}
                <code>p(t) = (v0*cos(ang)*t, v0*sin(ang)*t - 0.5*g*t^2)</code> —
                desenha a trajetória, a partícula animada e o vetor velocidade.
              </li>
              <li>
                <strong>Variáveis auxiliares encadeadas:</strong> defina grandezas
                como <code>Z = R + i*(w*L - 1/(w*C))</code> ou <code>tauRC = R*C</code>{' '}
                em uma linha e reutilize nas demais com telemetria ao vivo.
              </li>
            </ul>
          </div>

          <div className="guide-block">
            <h4>4. Áreas e Desigualdades</h4>
            <p>
              Use <code>&lt;</code>, <code>&gt;</code> (fronteira tracejada) ou{' '}
              <code>&lt;=</code>, <code>&gt;=</code> (fronteira contínua) em{' '}
              <code>y</code> ou <code>x</code>. Ex: <code>y &gt;= sin(x)</code>,{' '}
              <code>x &gt; -2</code>.
            </p>
          </div>

          <div className="guide-block">
            <h4>5. Constantes &amp; Funções Complexas</h4>
            <p>
              Constantes: <code>π</code>, <code>e</code>, <code>i</code>, <code>τ</code>,{' '}
              <code>φ</code>. Funções: <code>√()</code>, <code>∛()</code>,{' '}
              <code>re()</code>, <code>im()</code>, <code>abs()</code>,{' '}
              <code>arg()</code>, <code>conj()</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
