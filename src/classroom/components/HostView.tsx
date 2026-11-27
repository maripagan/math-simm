import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Flame,
  Lightbulb,
  Monitor,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Printer,
  Radio,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo, useState } from 'react';
import { GraphCanvas } from '../../components/GraphCanvas';
import { KatexPreview } from '../../components/KatexPreview';
import { ParameterList } from '../../components/ParameterList';
import { TimeControls } from '../../components/TimeControls';
import { CLASSROOM_MODULES, getClassroomModuleById } from '../../data/modules';
import { EULER_PARAMETERS, EULER_PRESET_ID } from '../../modules/math/mathPresets';
import { PhysicsVisualCard } from '../../modules/physics/visuals/PhysicsVisualCard';
import { useHostRoom } from '../hooks/useHostRoom';
import { QuizOptionId, StepMode } from '../schemas';
import {
  ChallengeOverlayConfig,
  getSimulationScene,
  useSimulationBridge,
} from '../useSimulationBridge';

const STEP_LABELS: Record<StepMode, string> = {
  lobby_story: 'Abertura',
  quiz: 'Quiz de intuição',
  simulation: 'Simulação',
  quiz_prediction: 'Previsão',
  challenge: 'Desafio coletivo',
  report: 'Relatório',
};

const STEP_ORDER: StepMode[] = [
  'lobby_story',
  'quiz',
  'simulation',
  'quiz_prediction',
  'challenge',
  'report',
];

const OPTION_COLORS: Record<QuizOptionId, string> = {
  A: '#2563eb',
  B: '#e11d48',
  C: '#059669',
  D: '#d97706',
};

interface HostViewProps {
  initialModuleId?: string;
}

export function HostView({ initialModuleId }: HostViewProps) {
  const initialModule = getClassroomModuleById(initialModuleId ?? '') ?? CLASSROOM_MODULES[0];
  const [projector, setProjector] = useState(false);
  const [tagFilter, setTagFilter] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [drawerTab, setDrawerTab] = useState<'theory' | 'guide' | 'bridges'>(
    'theory',
  );

  const {
    roomCode,
    module,
    roomState,
    connected,
    transportKind,
    participants,
    reportSummary,
    selectModule,
    goToStep,
    nextStep,
    prevStep,
    revealCurrentQuiz,
    executeChallengeWinner,
  } = useHostRoom({ initialModuleId: initialModule.id });

  const challengeOverlay: ChallengeOverlayConfig | undefined = useMemo(() => {
    if (
      roomState.mode === 'challenge' &&
      module?.engineId === 'projectile'
    ) {
      return {
        type: 'projectile-wall-target',
        wallX: 40,
        wallHeight: 15,
        targetX: 80,
        targetTolerance: 3,
      };
    }
    return undefined;
  }, [roomState.mode, module?.engineId]);

  const shouldPlaySim =
    roomState.mode === 'simulation' ||
    (roomState.mode === 'quiz_prediction' &&
      roomState.quizState?.status === 'revealed') ||
    (roomState.mode === 'challenge' &&
      roomState.challengeVoteState?.status === 'executed');

  const scene = getSimulationScene((module ?? initialModule).engineId);
  const experiment = 'theory' in scene ? scene : undefined;
  const glossary = experiment?.theory.variables ?? (scene.id === EULER_PRESET_ID ? EULER_PARAMETERS : undefined);
  const sim = useSimulationBridge({
    scene,
    externalPreset: roomState.enginePreset,
    challengeOverlay,
    initialPlaying: shouldPlaySim,
  });

  const joinUrl = useMemo(() => {
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}#/play?room=${encodeURIComponent(roomCode)}`;
  }, [roomCode]);

  const filteredModules = useMemo(() => {
    const q = tagFilter.trim().toLowerCase();
    if (!q) return CLASSROOM_MODULES;
    return CLASSROOM_MODULES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.themeTags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [tagFilter]);

  const activeQuestion = useMemo(() => {
    if (!module || !roomState.quizState) return undefined;
    return module.quizzes.find((q) => q.id === roomState.quizState?.questionId);
  }, [module, roomState.quizState]);

  const totalQuizVotes = useMemo(() => {
    if (!roomState.quizState) return 0;
    const v = roomState.quizState.votesCount;
    return v.A + v.B + v.C + v.D;
  }, [roomState.quizState]);

  const totalChallengeVotes = useMemo(() => {
    if (!roomState.challengeVoteState) return 0;
    const v = roomState.challengeVoteState.votesCount;
    return v['1'] + v['2'] + v['3'];
  }, [roomState.challengeVoteState]);

  if (!module) {
    return (
      <div className="classroom-empty">
        Módulo de sala de aula não encontrado.
      </div>
    );
  }

  return (
    <div className={`classroom-host${projector ? ' projector-mode' : ''}`}>
      {/* Barra de controle do professor (oculta na impressão PDF) */}
      <div className="host-control-bar no-print">
        <div className="host-bar-left">
          <span
            className={`live-badge ${connected ? 'online' : ''}`}
            title={
              transportKind === 'supabase'
                ? 'Sincronização pela internet'
                : 'Sincronização entre abas deste navegador'
            }
          >
            <Radio size={14} className={connected ? 'pulse-online' : ''} />
            {connected ? (transportKind === 'supabase' ? 'Ao vivo' : 'Sessão local') : 'Sala desconectada'}
          </span>
          <div className="room-code-chip" title="Código da sala">
            <span>{roomCode}</span>
          </div>
          <span className="students-counter">
            <Users size={14} />
            <strong>{roomState.studentsCount}</strong> alunos
            {roomState.mode === 'lobby_story' && (
              <span className="ready-counter">
                ({roomState.readyCount} prontos)
              </span>
            )}
          </span>
        </div>

        <div className="host-stepper">
          {STEP_ORDER.map((mode, idx) => (
            <button
              key={mode}
              className={`step-dot ${
                roomState.currentStepIndex === idx
                  ? 'active'
                  : idx < roomState.currentStepIndex
                    ? 'done'
                    : ''
              }`}
              onClick={() => goToStep(idx)}
              title={STEP_LABELS[mode]}
              aria-current={roomState.currentStepIndex === idx ? 'step' : undefined}
            >
              <b>{idx + 1}</b>
              <span>{STEP_LABELS[mode]}</span>
            </button>
          ))}
        </div>

        <div className="host-bar-right">
          {roomState.mode === 'lobby_story' && !projector && (
            <a
              href={joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary host-test-link"
              title="Abre a tela do aluno em outra aba"
            >
              <ExternalLink size={14} />
              <span>Tela do aluno</span>
            </a>
          )}

          <button className="btn-secondary projector-toggle" aria-pressed={projector}
            onClick={() => setProjector((current) => !current)}>
            <Monitor size={14} aria-hidden="true" />
            <span>Modo projetor</span>
          </button>

          <button
            className="btn-secondary"
            disabled={roomState.currentStepIndex === 0}
            onClick={prevStep}
            aria-label="Voltar uma etapa"
            title="Voltar uma etapa"
          >
            <ArrowLeft size={14} aria-hidden="true" />
          </button>

          <button
            className="btn-primary-host"
            disabled={roomState.currentStepIndex >= STEP_ORDER.length - 1}
            onClick={nextStep}
          >
            <span>Avançar</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Área Principal por Etapa */}
      <div className="host-stage">
        {/* ETAPA 1: LOBBY & GANCHO HISTÓRICO */}
        {roomState.mode === 'lobby_story' && (
          <div className="host-lobby-layout">
            <aside className="host-module-picker">
              <div className="picker-header">
                <h3>Módulos de aula</h3>
                <input
                  type="text"
                  className="tag-filter-input"
                  placeholder="Buscar por tema"
                  aria-label="Buscar aula por tema"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                />
              </div>
              <div className="module-list">
                {filteredModules.length === 0 && <p className="lesson-empty">Nenhuma aula encontrada.</p>}
                {filteredModules.map((mod) => (
                  <button
                    key={mod.id}
                    className={`module-card-btn ${
                      mod.id === module.id ? 'active' : ''
                    }`}
                    onClick={() => selectModule(mod.id)}
                  >
                    <span className="mod-cat">{mod.category}</span>
                    <strong>{mod.title}</strong>
                    <div className="mod-tags">
                      {mod.themeTags.map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            <section className="host-lobby-main">
              <div className="lobby-join-card">
                <div className="join-info">
                  <span className="eyebrow">Convide a turma</span>
                  <h2 className="join-title">Entre pelo celular</h2>
                  <ol className="join-steps">
                    <li>Aponte a câmera para o QR code</li>
                    <li>
                      ou abra <b>{window.location.host}</b> e toque em <b>Entrar com código</b>
                    </li>
                  </ol>
                  <div className="big-room-code" aria-label={`Código da sala ${roomCode}`}>{roomCode}</div>
                  {transportKind !== 'supabase' && (
                    <p className="join-url-hint">Sessão local: abra a tela do aluno em outra aba deste navegador.</p>
                  )}
                </div>
                <div className="join-side">
                  <div className="qr-box">
                    <QRCodeSVG
                      value={joinUrl}
                      size={232}
                      bgColor="#ffffff"
                      fgColor="#232323"
                      level="M"
                    />
                  </div>
                  <div className="lobby-stats-row" aria-live="polite">
                    <span>
                      <Users size={16} aria-hidden="true" /> <b>{participants.length}</b> na sala
                    </span>
                    <span>
                      <CheckCircle2 size={16} aria-hidden="true" /> <b>{roomState.readyCount}</b> prontos
                    </span>
                  </div>
                </div>
              </div>

              {participants.length > 0 ? (
                <div className="lobby-roster">
                  {participants.map((p) => (
                    <span
                      key={p.studentId}
                      className={`roster-pill ${p.ready ? 'ready' : ''}`}
                    >
                      {p.ready && <CheckCircle2 size={14} aria-hidden="true" />}
                      {p.nickname}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="lobby-waiting">Os nomes aparecem aqui assim que cada aluno entra.</p>
              )}

              <div className="historical-hook-card">
                <div className="hook-meta">
                  <Sparkles size={15} aria-hidden="true" />
                  <span>
                    {module.historicalHook.year} · <strong>{module.historicalHook.figure}</strong>
                  </span>
                </div>
                <h2>{module.title}</h2>
                <p>{module.historicalHook.shortText}</p>
                <div className="opening-q-box">
                  <span className="opening-q-label">Pergunta para abrir a aula</span>
                  {module.teacherGuide.openingQuestion}
                </div>
              </div>

            </section>
          </div>
        )}

        {/* ETAPAS 2 e 4: QUIZ DE INTUIÇÃO & PREVISÃO GUIADA */}
        {(roomState.mode === 'quiz' || roomState.mode === 'quiz_prediction') &&
          activeQuestion &&
          roomState.quizState && (
            <div
              className={`host-quiz-layout ${
                roomState.mode === 'quiz_prediction' ? 'with-engine' : ''
              }`}
            >
              <div className="quiz-projector-panel">
                <div className="quiz-top-meta">
                  <span className="quiz-type-badge">
                    {roomState.mode === 'quiz'
                      ? 'Quiz de intuição'
                      : 'Previsão · o que vai acontecer?'}
                  </span>
                  <div className="quiz-timer-chip">
                    <Clock size={16} />
                    <span>{roomState.quizState.timeLeft}s</span>
                  </div>
                  <span className="quiz-votes-chip">
                    {totalQuizVotes} resposta{totalQuizVotes === 1 ? '' : 's'}
                  </span>
                </div>

                <h2 className="quiz-prompt-big">{activeQuestion.prompt}</h2>

                <div className="quiz-options-grid">
                  {activeQuestion.options.map((opt) => {
                    const votes = roomState.quizState?.votesCount[opt.id] ?? 0;
                    const pct =
                      totalQuizVotes > 0
                        ? Math.round((votes / totalQuizVotes) * 100)
                        : 0;
                    const revealed = roomState.quizState?.status === 'revealed';
                    const isCorrect = opt.id === activeQuestion.correctOption;

                    return (
                      <div
                        key={opt.id}
                        className={`quiz-option-card ${
                          revealed
                            ? isCorrect
                              ? 'is-correct'
                              : 'is-dimmed'
                            : ''
                        }`}
                      >
                        <div className="opt-head">
                          <span
                            className="opt-letter"
                            style={{ backgroundColor: OPTION_COLORS[opt.id] }}
                          >
                            {opt.id}
                          </span>
                          <span className="opt-text">{opt.text}</span>
                        </div>
                        {revealed && (
                          <div className="opt-bar-wrap">
                            <div
                              className="opt-bar-fill"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: OPTION_COLORS[opt.id],
                              }}
                            />
                            <span className="opt-bar-label">
                              {votes} ({pct}%)
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="quiz-actions-row">
                  {roomState.quizState.status !== 'revealed' ? (
                    <button
                      className="btn-reveal-big"
                      onClick={revealCurrentQuiz}
                    >
                      <Eye size={18} />
                      <span>
                        Encerrar e revelar a resposta
                        {roomState.mode === 'quiz_prediction'
                          ? ' na simulação'
                          : ''}
                      </span>
                    </button>
                  ) : (
                    <div className="quiz-explanation-banner">
                      <CheckCircle2 size={20} aria-hidden="true" />
                      <div>
                        <strong>
                          Resposta correta: {activeQuestion.correctOption}
                        </strong>
                        <p>{activeQuestion.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {roomState.mode === 'quiz_prediction' && (
                <div className="quiz-engine-side">
                  <div className="canvas-stage">
                    <GraphCanvas
                      curves={sim.activeCurves}
                      defs={sim.auxDefs}
                      scope={sim.scope}
                      viewport={sim.viewport}
                      defaultViewport={sim.defaultViewport}
                      highContrast={projector}
                      onViewportChange={sim.setViewport}
                      renderOverlay={sim.overlayFn}
                    />
                    {experiment?.visualCard && (
                      <PhysicsVisualCard
                        type={experiment.visualCard}
                        scope={sim.scope}
                      />
                    )}
                    <TimeControls
                      t={sim.t}
                      playing={sim.timePlaying}
                      speed={sim.timeSpeed}
                      onTogglePlay={sim.togglePlay}
                      onReset={sim.resetTime}
                      onSpeedChange={sim.setTimeSpeed}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        {/* ETAPA 3: PROVA REAL NA ENGINE + PÍLULA DE TEORIA */}
        {roomState.mode === 'simulation' && (
          <div className="host-sim-layout">
            <main className="canvas-stage host-sim-canvas">
              <GraphCanvas
                curves={sim.activeCurves}
                defs={sim.auxDefs}
                scope={sim.scope}
                viewport={sim.viewport}
                defaultViewport={sim.defaultViewport}
                highContrast={projector}
                onViewportChange={sim.setViewport}
                renderOverlay={sim.overlayFn}
              />
              {experiment?.visualCard && (
                <PhysicsVisualCard
                  type={experiment.visualCard}
                  scope={sim.scope}
                />
              )}
              <TimeControls
                t={sim.t}
                playing={sim.timePlaying}
                speed={sim.timeSpeed}
                onTogglePlay={sim.togglePlay}
                onReset={sim.resetTime}
                onSpeedChange={sim.setTimeSpeed}
              />

              <button
                hidden={projector}
                className="drawer-toggle-fab"
                onClick={() => setDrawerOpen((v) => !v)}
                title={drawerOpen ? 'Recolher painel' : 'Abrir painel'}
              >
                {drawerOpen ? (
                  <PanelRightClose size={16} />
                ) : (
                  <PanelRightOpen size={16} />
                )}
              </button>
            </main>

            {drawerOpen && !projector && (
              <aside className="host-teacher-drawer">
                <div className="drawer-tabs">
                  <button
                    className={drawerTab === 'theory' ? 'active' : ''}
                    onClick={() => setDrawerTab('theory')}
                  >
                    <Lightbulb size={14} /> Teoria
                  </button>
                  <button
                    className={drawerTab === 'guide' ? 'active' : ''}
                    onClick={() => setDrawerTab('guide')}
                  >
                    <BookOpen size={14} /> Guia e parâmetros
                  </button>
                  <button
                    className={drawerTab === 'bridges' ? 'active' : ''}
                    onClick={() => setDrawerTab('bridges')}
                  >
                    <Sparkles size={14} /> Conexões
                  </button>
                </div>

                <div className="drawer-body">
                  {drawerTab === 'theory' && (
                    <div className="theory-pill-stack">
                      <div className="pill-block myth">
                        <span className="pill-label">Mito derrubado</span>
                        <p>{module.theoryPill.mythBusted}</p>
                      </div>
                      <div className="pill-block insight">
                        <span className="pill-label">Ideia principal</span>
                        <p>{module.theoryPill.ahaInsight}</p>
                      </div>
                      <div className="pill-block formula">
                        <span className="pill-label">Equação-chave</span>
                        <KatexPreview latex={module.theoryPill.formulaLatex} />
                        <ul className="vars-legend">
                          {module.theoryPill.variablesLegend.map((v) => (
                            <li key={v}>{v}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="pill-block everyday">
                        <span className="pill-label">No cotidiano</span>
                        <p>{module.theoryPill.everydayApp}</p>
                      </div>
                    </div>
                  )}

                  {drawerTab === 'guide' && (
                    <div className="guide-stack">
                      <div className="pill-block">
                        <span className="pill-label">Pergunta para abrir a aula</span>
                        <p>{module.teacherGuide.openingQuestion}</p>
                      </div>
                      <div className="pill-block pitfall">
                        <span className="pill-label">Erro comum</span>
                        <p>{module.teacherGuide.commonPitfall}</p>
                      </div>
                      <ParameterList
                        parameters={sim.parameters}
                        glossary={glossary}
                        onUpdate={sim.updateParameter}
                      />
                    </div>
                  )}

                  {drawerTab === 'bridges' && (
                    <div className="bridges-stack">
                      {module.interdisciplinaryBridges.map((bridge, idx) => (
                        <div key={idx} className="bridge-card">
                          <div className="bridge-head">
                            <span className="bridge-subject">
                              {bridge.subject}
                            </span>
                            <span className="bridge-tag">
                              #{bridge.themeTag}
                            </span>
                          </div>
                          <p>{bridge.connectionHook}</p>
                          {bridge.bridgeQuestion && (
                            <div className="bridge-q-preview">
                              <strong>Discussão rápida:</strong>{' '}
                              {bridge.bridgeQuestion.prompt}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        )}

        {/* ETAPA 5: DESAFIO COLETIVO */}
        {roomState.mode === 'challenge' && roomState.challengeVoteState && (
          <div className="host-challenge-layout">
            <div className="challenge-left-panel">
              <div className="challenge-header-card">
                <span className="challenge-badge">
                  <Flame size={15} aria-hidden="true" /> Desafio da turma
                </span>
                <h2>{module.collectiveChallenge.goalDescription}</h2>
                <span className="challenge-votes-meta">
                  {totalChallengeVotes} voto
                  {totalChallengeVotes === 1 ? '' : 's'} recebidos
                </span>
              </div>

              <div className="challenge-options-list">
                {roomState.challengeVoteState.options.map((opt) => {
                  const votes =
                    roomState.challengeVoteState?.votesCount[opt.id] ?? 0;
                  const pct =
                    totalChallengeVotes > 0
                      ? Math.round((votes / totalChallengeVotes) * 100)
                      : 0;
                  const isWinner =
                    roomState.challengeVoteState?.winningOptionId === opt.id;
                  const isExecuted =
                    roomState.challengeVoteState?.status === 'executed';

                  return (
                    <div
                      key={opt.id}
                      className={`challenge-option-row ${
                        isExecuted ? (isWinner ? 'winner' : 'is-dimmed') : ''
                      }`}
                    >
                      <div className="ch-opt-top">
                        <span className="ch-opt-num">Opção {opt.id}</span>
                        <strong>{opt.label}</strong>
                      </div>
                      <div className="opt-bar-wrap">
                        <div
                          className="opt-bar-fill"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: isWinner ? '#059669' : '#2563eb',
                          }}
                        />
                        <span className="opt-bar-label">
                          {votes} ({pct}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {roomState.challengeVoteState.status === 'open' ? (
                <button
                  className="btn-reveal-big"
                  onClick={executeChallengeWinner}
                >
                  <Play size={18} />
                  <span>Simular a opção mais votada</span>
                </button>
              ) : (
                <div
                  className={`challenge-result-banner ${
                    roomState.challengeVoteState.didClassWin ? 'won' : 'lost'
                  }`}
                >
                  <Trophy size={22} />
                  <div>
                    <strong>
                      {roomState.challengeVoteState.didClassWin
                        ? 'A turma venceu o desafio!'
                        : 'Quase lá! A configuração escolhida não atingiu a meta.'}
                    </strong>
                    <p>
                      Opção vencedora:{' '}
                      {roomState.challengeVoteState.winningOptionId}. Veja o
                      resultado ao vivo na simulação.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="challenge-engine-panel">
              <div className="canvas-stage">
                <GraphCanvas
                  curves={sim.activeCurves}
                  defs={sim.auxDefs}
                  scope={sim.scope}
                  viewport={sim.viewport}
                  defaultViewport={sim.defaultViewport}
                  highContrast={projector}
                  onViewportChange={sim.setViewport}
                  renderOverlay={sim.overlayFn}
                />
                {experiment?.visualCard && (
                  <PhysicsVisualCard
                    type={experiment.visualCard}
                    scope={sim.scope}
                  />
                )}
                <TimeControls
                  t={sim.t}
                  playing={sim.timePlaying}
                  speed={sim.timeSpeed}
                  onTogglePlay={sim.togglePlay}
                  onReset={sim.resetTime}
                  onSpeedChange={sim.setTimeSpeed}
                />
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 6: RELATÓRIO PÓS-AULA (PRINT/PDF LIMPO) */}
        {roomState.mode === 'report' && (
          <div className="host-report-page">
            <div className="report-sheet">
              <header className="report-header">
                <div>
                  <span className="report-eyebrow">
                    MathSimulator · Relatório da aula
                  </span>
                  <h1>{module.title}</h1>
                  <p className="report-sub">
                    Sala <strong>{roomCode}</strong> · Categoria:{' '}
                    {module.category} · Data:{' '}
                    {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  className="btn-primary-host no-print"
                  onClick={() => window.print()}
                >
                  <Printer size={16} />
                  <span>Exportar PDF</span>
                </button>
              </header>

              <div className="report-kpi-grid">
                <div className="kpi-card">
                  <span className="kpi-label">Alunos participantes</span>
                  <strong className="kpi-value">
                    {reportSummary.totalStudents}
                  </strong>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Acerto da turma</span>
                  <strong className="kpi-value">
                    {reportSummary.overallAccuracyPercent}%
                  </strong>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Desafio da turma</span>
                  <strong className="kpi-value">
                    {reportSummary.challengeWon === null
                      ? 'Não executado'
                      : reportSummary.challengeWon
                        ? 'Vencido ✓'
                        : 'Em revisão'}
                  </strong>
                </div>
              </div>

              {reportSummary.hardestQuestion && (
                <section className="report-section">
                  <h3>Ponto para reforçar</h3>
                  <div className="reinforcement-box">
                    <span className="error-rate-badge">
                      {reportSummary.hardestQuestion.errorRatePercent}% de erro
                    </span>
                    <p>{reportSummary.hardestQuestion.prompt}</p>
                  </div>
                </section>
              )}

              <section className="report-section">
                <h3>Destaques da turma</h3>
                {reportSummary.podium.length === 0 ? (
                  <p className="report-muted">
                    Nenhum aluno registrou respostas nesta sessão.
                  </p>
                ) : (
                  <ol className="podium-list">
                    {reportSummary.podium.map((entry) => (
                      <li key={entry.studentId} className="podium-row">
                        <span className="podium-rank">#{entry.rank}</span>
                        <span className="podium-name">{entry.nickname}</span>
                        <span className="podium-stats">
                          {entry.correctCount} acerto
                          {entry.correctCount === 1 ? '' : 's'} ·{' '}
                          <strong>{entry.score} pts</strong>
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="report-section">
                <h3>Resumo da aula</h3>
                <p>
                  <strong>Mito derrubado:</strong>{' '}
                  {module.theoryPill.mythBusted}
                </p>
                <p>
                  <strong>Aplicação no cotidiano:</strong>{' '}
                  {module.theoryPill.everydayApp}
                </p>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
