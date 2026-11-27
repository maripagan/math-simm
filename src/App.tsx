import { Presentation, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HostView } from './classroom/components/HostView';
import { PlayView } from './classroom/components/PlayView';
import { MathModule } from './modules/math/MathModule';
import { PhysicsModule } from './modules/physics/PhysicsModule';
import { PHYSICS_EXPERIMENTS } from './modules/physics/physicsExperiments';
import { PhysicsExperimentId, YearLevel } from './modules/physics/types';

const YEARS: YearLevel[] = [1, 2, 3];
const firstExperimentOf = (year: YearLevel) => PHYSICS_EXPERIMENTS.find((item) => item.year === year)!.id;

type RouteState =
  | { view: 'math'; presetId?: string }
  | { view: 'physics'; year: YearLevel; experimentId?: PhysicsExperimentId }
  | { view: 'host'; moduleId?: string }
  | { view: 'play'; initialRoomCode?: string };

function parseLocationRoute(): RouteState {
  const [fragment, query] = window.location.hash.split('?');
  const path = window.location.pathname;
  const params = new URLSearchParams(fragment ? query : window.location.search);

  if (fragment.startsWith('#scene=')) return { view: 'math' };

  if (fragment === '#/math') {
    return { view: 'math', presetId: params.get('preset') ?? undefined };
  }
  if (fragment === '#/physics') {
    const experiment = PHYSICS_EXPERIMENTS.find((item) => item.id === params.get('experiment'));
    if (experiment) {
      return { view: 'physics', year: experiment.year, experimentId: experiment.id };
    }
  }
  if (fragment === '#/host' || (!fragment && (path === '/host' || path === '/sala/criar'))) {
    return { view: 'host', moduleId: params.get('aula') ?? undefined };
  }
  if (fragment === '#/play' || (!fragment && (path === '/play' || path === '/entrar'))) {
    return { view: 'play', initialRoomCode: params.get('room') ?? undefined };
  }

  return { view: 'math' };
}

export function App() {
  const [route, setRoute] = useState<RouteState>(parseLocationRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(parseLocationRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (next: RouteState) => {
    const params = new URLSearchParams();
    if (next.view === 'host' && next.moduleId) params.set('aula', next.moduleId);
    if (next.view === 'play' && next.initialRoomCode) params.set('room', next.initialRoomCode);
    if (next.view === 'physics' && next.experimentId) params.set('experiment', next.experimentId);
    if (next.view === 'math' && next.presetId) params.set('preset', next.presetId);

    const query = params.size ? `?${params}` : '';
    window.location.hash = `#/${next.view}${query}`;
    setRoute(next);
  };

  const openClassroom = (moduleId: string) => navigate({ view: 'host', moduleId });

  return (
    <div className="app-root">
      {route.view !== 'play' && (
        <header className="top-nav">
          <a className="brand brand-btn" href="/" title="Voltar para a página inicial">
            <span className="brand-mark">∫</span>
            <span>
              <strong className="brand-name">MathSimulator</strong>
              <span className="brand-sub">Física e matemática ao vivo</span>
            </span>
          </a>

          <nav className="session-switcher" aria-label="Conteúdos">
            <a className="session-tab" href="#/math" aria-current={route.view === 'math' ? 'page' : undefined}>
              Matemática
            </a>
            {YEARS.map((year) => (
              <a key={year} className="session-tab" href={`#/physics?experiment=${firstExperimentOf(year)}`}
                aria-current={route.view === 'physics' && route.year === year ? 'page' : undefined}>
                Física {year}º ano
              </a>
            ))}
            <a className="session-tab is-room" href="#/host" aria-current={route.view === 'host' ? 'page' : undefined}>
              <Presentation size={14} aria-hidden="true" /> Modo Sala
            </a>
          </nav>

          <div className="top-nav-right">
            {route.view !== 'host' && (
              <a className="btn-secondary btn-ghost" href="#/play" target="_blank" rel="noopener noreferrer">
                <Smartphone size={14} aria-hidden="true" />
                <span>Tela do aluno</span>
              </a>
            )}
          </div>
        </header>
      )}

      <div className="session-viewport">
        {route.view === 'math' && <MathModule initialPresetId={route.presetId} onPresent={openClassroom} />}
        {route.view === 'physics' && (
          <PhysicsModule
            key={route.experimentId}
            year={route.year}
            initialExperimentId={route.experimentId}
            onPresent={openClassroom}
          />
        )}
        {route.view === 'host' && <HostView key={route.moduleId} initialModuleId={route.moduleId} />}
        {route.view === 'play' && (
          <PlayView initialRoomCode={route.initialRoomCode} />
        )}
      </div>
    </div>
  );
}

export default App;
