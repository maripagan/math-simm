import { Atom, Home, Presentation, Sigma } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HostView } from './classroom/components/HostView';
import { PlayView } from './classroom/components/PlayView';
import { HomePage } from './components/HomePage';
import { MathModule } from './modules/math/MathModule';
import { PhysicsModule } from './modules/physics/PhysicsModule';
import { YearLevel } from './modules/physics/types';

type RouteState =
  | { view: 'home' }
  | { view: 'math' }
  | { view: 'physics'; year: YearLevel }
  | { view: 'host' }
  | { view: 'play'; initialRoomCode?: string };

function parseLocationRoute(): RouteState {
  const hash = window.location.hash || '';
  const path = window.location.pathname || '';

  if (hash.startsWith('#scene=')) {
    return { view: 'math' };
  }

  if (hash.startsWith('#/host') || path === '/host' || path === '/sala/criar') {
    return { view: 'host' };
  }

  if (hash.startsWith('#/play') || path === '/play' || path === '/entrar') {
    const queryStr = hash.includes('?')
      ? hash.slice(hash.indexOf('?') + 1)
      : window.location.search.replace(/^\?/, '');
    const params = new URLSearchParams(queryStr);
    const room = params.get('room') ?? undefined;
    return { view: 'play', initialRoomCode: room };
  }

  return { view: 'home' };
}

export function App() {
  const [route, setRoute] = useState<RouteState>(parseLocationRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(parseLocationRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (next: RouteState) => {
    if (next.view === 'host') {
      window.location.hash = '#/host';
    } else if (next.view === 'play') {
      const qs = next.initialRoomCode
        ? `?room=${encodeURIComponent(next.initialRoomCode)}`
        : '';
      window.location.hash = `#/play${qs}`;
    } else if (
      window.location.hash.startsWith('#/host') ||
      window.location.hash.startsWith('#/play')
    ) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    setRoute(next);
  };

  return (
    <div className="app-root">
      {route.view !== 'play' && (
        <header className="top-nav">
          <button
            className="brand brand-btn"
            onClick={() => navigate({ view: 'home' })}
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
                {route.view === 'math' && (
                  <>
                    <Sigma size={14} /> Matemática Pura
                  </>
                )}
                {route.view === 'physics' && (
                  <>
                    <Atom size={14} /> Física · {route.year}º Ano
                  </>
                )}
                {route.view === 'host' && (
                  <>
                    <Presentation size={14} /> Modo Sala de Aula · Professor
                  </>
                )}
              </span>

              <button
                className="btn-secondary"
                onClick={() => navigate({ view: 'home' })}
              >
                <Home size={14} />
                <span>Início</span>
              </button>
            </div>
          )}
        </header>
      )}

      <div className="session-viewport">
        {route.view === 'home' && (
          <HomePage
            onOpenMath={() => navigate({ view: 'math' })}
            onOpenPhysicsYear={(year) => navigate({ view: 'physics', year })}
            onOpenClassroomHost={() => navigate({ view: 'host' })}
            onOpenClassroomPlay={() => navigate({ view: 'play' })}
          />
        )}
        {route.view === 'math' && <MathModule />}
        {route.view === 'physics' && <PhysicsModule key={route.year} year={route.year} />}
        {route.view === 'host' && <HostView />}
        {route.view === 'play' && (
          <PlayView initialRoomCode={route.initialRoomCode} />
        )}
      </div>
    </div>
  );
}

export default App;
