import { Atom, Home, Sigma } from 'lucide-react';
import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { MathModule } from './modules/math/MathModule';
import { PhysicsModule } from './modules/physics/PhysicsModule';
import { YearLevel } from './modules/physics/types';

type RouteState =
  | { view: 'home' }
  | { view: 'math' }
  | { view: 'physics'; year: YearLevel };

function getInitialRoute(): RouteState {
  if (window.location.hash.startsWith('#scene=')) {
    return { view: 'math' };
  }
  return { view: 'home' };
}

export function App() {
  const [route, setRoute] = useState<RouteState>(getInitialRoute);

  return (
    <div className="app-root">
      <header className="top-nav">
        <button
          className="brand brand-btn"
          onClick={() => setRoute({ view: 'home' })}
          title="Voltar para a tela inicial"
        >
          <span className="brand-mark">∫</span>
          <div style={{ textAlign: 'left' }}>
            <h1>MathSimulator</h1>
            <span className="brand-sub">Engine Matemática Unificada</span>
          </div>
        </button>

        {route.view !== 'home' && (
          <div className="top-nav-right">
            <span className="route-pill">
              {route.view === 'math' ? (
                <>
                  <Sigma size={14} /> Matemática Pura
                </>
              ) : (
                <>
                  <Atom size={14} /> Física · {route.year}º Ano
                </>
              )}
            </span>

            <button
              className="btn-secondary"
              onClick={() => setRoute({ view: 'home' })}
            >
              <Home size={14} />
              <span>Início</span>
            </button>
          </div>
        )}
      </header>

      <div className="session-viewport">
        {route.view === 'home' && (
          <HomePage
            onOpenMath={() => setRoute({ view: 'math' })}
            onOpenPhysicsYear={(year) => setRoute({ view: 'physics', year })}
          />
        )}
        {route.view === 'math' && <MathModule />}
        {route.view === 'physics' && <PhysicsModule year={route.year} />}
      </div>
    </div>
  );
}

export default App;
