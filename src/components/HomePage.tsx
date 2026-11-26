import { ArrowRight, Atom, Lock, Presentation, Sigma, Smartphone } from 'lucide-react';
import { PHYSICS_EXPERIMENTS } from '../modules/physics/physicsExperiments';
import { YearLevel } from '../modules/physics/types';

interface HomePageProps {
  onOpenMath: () => void;
  onOpenPhysicsYear: (year: YearLevel) => void;
  onOpenClassroomHost: () => void;
  onOpenClassroomPlay: () => void;
}

interface PhysicsYearCard {
  year: YearLevel;
  badge: string;
  title: string;
  topics: string;
  available: boolean;
}

const YEAR_MODULES: PhysicsYearCard[] = [
  {
    year: 1,
    badge: '1º Ano',
    title: 'Mecânica Clássica',
    topics:
      'Cinemática (MU, MUV, Projétil, MCU), Dinâmica, Estática, Hidrostática e Gravitação Universal (Kepler).',
    available: true,
  },
  {
    year: 2,
    badge: '2º Ano',
    title: 'Termologia, Óptica & Ondulatória',
    topics:
      'Termodinâmica e gases ideais (Carnot), Óptica Geométrica (Snell, reflexão total e lentes), Ondas e Efeito Doppler.',
    available: true,
  },
  {
    year: 3,
    badge: '3º Ano',
    title: 'Eletromagnetismo & Física Moderna',
    topics:
      'Eletrostática, Eletrodinâmica (Circuitos DC RC/RL e AC RLC com fasores), Magnetismo e Física Moderna.',
    available: true,
  },
];

export function HomePage({
  onOpenMath,
  onOpenPhysicsYear,
  onOpenClassroomHost,
  onOpenClassroomPlay,
}: HomePageProps) {
  return (
    <div className="home-page">
      <div className="home-container">
        <header className="home-hero">
          <div className="home-logo">∫</div>
          <h1>MathSimulator</h1>
          <p>
            Escolha sua frente de estudo. Todo o simulador compartilha a mesma
            engine matemática interativa, mas o Laboratório de Física é separado
            por módulo para respeitar a progressão de cada série.
          </p>
        </header>

        <div className="home-grid">
          {/* Frente 1: Matemática Pura */}
          <section className="home-front-card home-math-card">
            <div className="front-header">
              <div className="front-icon math">
                <Sigma size={22} />
              </div>
              <div>
                <span className="front-eyebrow">Frente Livre</span>
                <h2>Simulador de Fórmulas Matemáticas</h2>
              </div>
            </div>

            <p className="front-desc">
              Ambiente estilo plotter interativo para explorar livremente
              funções, desigualdades, curvas paramétricas e números complexos
              com sliders em tempo real.
            </p>

            <div className="front-tags">
              <span>y = f(x)</span>
              <span>Áreas (&lt;, &gt;, ≤, ≥)</span>
              <span>Números Complexos (ℂ)</span>
              <span>Fasores z(t)</span>
              <span>Paramétricas</span>
            </div>

            <button className="home-cta-primary" onClick={onOpenMath}>
              <span>Abrir Simulador Matemático</span>
              <ArrowRight size={16} />
            </button>
          </section>

          {/* Frente 2: Laboratório de Física por Módulo */}
          <section className="home-front-card home-physics-card">
            <div className="front-header">
              <div className="front-icon physics">
                <Atom size={22} />
              </div>
              <div>
                <span className="front-eyebrow">Progressão por Série</span>
                <h2>Laboratório de Física</h2>
              </div>
            </div>

            <p className="front-desc">
              Simulações visuais guiadas com explicação teórica, unidades no SI
              e cenários prontos. Cada módulo exibe apenas os conteúdos daquela
              etapa.
            </p>

            <div className="year-modules-list">
              {YEAR_MODULES.map((mod) => {
                const count = PHYSICS_EXPERIMENTS.filter(
                  (e) => e.year === mod.year,
                ).length;
                return (
                  <button
                    key={mod.year}
                    className={`year-module-btn ${mod.available ? '' : 'locked'}`}
                    disabled={!mod.available}
                    onClick={() => mod.available && onOpenPhysicsYear(mod.year)}
                  >
                    <div className="year-module-top">
                      <span className="year-badge">{mod.badge}</span>
                      {mod.available ? (
                        <span className="year-count">
                          {count} {count === 1 ? 'experimento' : 'experimentos'}
                        </span>
                      ) : (
                        <span className="year-soon">
                          <Lock size={11} /> Em breve (Fase 2.2B)
                        </span>
                      )}
                    </div>
                    <div className="year-title">{mod.title}</div>
                    <div className="year-topics">{mod.topics}</div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Frente 3: Modo Sala de Aula Interativo (V1) */}
        <section className="home-classroom-banner">
          <div className="home-classroom-info">
            <span className="front-eyebrow">Segunda Tela · Ao Vivo</span>
            <h2>Modo Sala de Aula Interativo (V1)</h2>
            <p>
              Conduza aulas no projetor com QR Code, quizzes de intuição e
              previsão, prova real na engine, desafio coletivo e relatório em
              PDF — sem exigir cadastro.
            </p>
          </div>
          <div className="home-classroom-actions">
            <button
              className="btn-primary-host"
              onClick={onOpenClassroomHost}
            >
              <Presentation size={16} />
              <span>Criar Sala (Professor)</span>
            </button>
            <button
              className="btn-secondary"
              onClick={onOpenClassroomPlay}
            >
              <Smartphone size={16} />
              <span>Entrar na Sala (Aluno)</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
