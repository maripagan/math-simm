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
import { KatexPreview } from '../../components/KatexPreview';
import { ParameterList } from '../../components/ParameterList';
import { CLASSROOM_MODULES } from '../../data/modules';
import { EXPERIMENTS_BY_ID } from '../../modules/physics/physicsExperiments';
import { SceneStage } from '../../scene/SceneStage';
import { useHostRoom } from '../hooks/useHostRoom';
import { STEPS } from '../Lesson';
import { QuizOptionId, StepMode } from '../schemas';
import { useSimulationBridge } from '../useSimulationBridge';

const STEP_LABELS: Record<StepMode, string> = {
  lobby_story: '1. Lobby & História',
  quiz: '2. Quiz Intuição',
  simulation: '3. Prova Real + Teoria',
  quiz_prediction: '4. Previsão Guiada',
  challenge: '5. Desafio Coletivo',
  report: '6. Relatório Pós-Aula',
};

const OPTION_COLORS: Record<QuizOptionId, string> = {
  A: '#0ea5e9',
  B: '#ec4899',
  C: '#10b981',
  D: '#f59e0b',
};

export function HostView() {
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
  } = useHostRoom();

  const shouldPlaySim =
    roomState.mode === 'simulation' ||
    (roomState.mode === 'quiz_prediction' &&
      roomState.quizState?.status === 'revealed') ||
    (roomState.mode === 'challenge' &&
      roomState.challengeVoteState?.status === 'executed');

  const sim = useSimulationBridge({
    experiment: EXPERIMENTS_BY_ID[module.engineId],
    preset: roomState.enginePreset,
    showChallenge: roomState.mode === 'challenge',
    playing: shouldPlaySim,
  });
  const stage = (
    <SceneStage
      scene={sim.scene}
      overlay={sim.overlay}
      card={sim.experiment.renderCard?.(sim.scene.scope)}
    />
  );

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
    if (!roomState.quizState) return undefined;
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

  return (
    <div className="classroom-host">
      {/* Barra de controle do professor (oculta na impressão PDF) */}
      <div className="host-control-bar no-print">
        <div className="host-bar-left">
          <div className="room-code-chip" title="Código da sala ao vivo">
            <Radio size={14} className={connected ? 'pulse-online' : ''} />
            <span>{roomCode}</span>
          </div>
          <span className="transport-badge">
            {transportKind === 'supabase'
              ? 'Supabase Realtime'
              : 'Sync Local (Abas)'}
          </span>
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
          {STEPS.map((mode, idx) => (
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
            >
              {idx + 1}
            </button>
          ))}
          <span className="step-current-label">
            {STEP_LABELS[roomState.mode]}
          </span>
        </div>

        <div className="host-bar-right">
          <a
            href={joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary host-test-link"
            title="Abre a tela mobile do aluno em outra aba para testar agora"
          >
            <ExternalLink size={14} />
            <span>Testar Aluno</span>
          </a>

          <button
            className="btn-secondary"
            disabled={roomState.currentStepIndex === 0}
            onClick={prevStep}
          >
            <ArrowLeft size={14} />
            <span>Voltar</span>
          </button>

          <button
            className="btn-primary-host"
            disabled={roomState.currentStepIndex >= STEPS.length - 1}
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
                <h3>Módulos de Aula (V1)</h3>
                <input
                  type="text"
                  className="tag-filter-input"
                  placeholder="Filtrar por tema ou tag..."
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                />
              </div>
              <div className="module-list">
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
                <div className="qr-box">
                  <QRCodeSVG
                    value={joinUrl}
                    size={196}
                    bgColor="#ffffff"
                    fgColor="#0b1120"
                    level="M"
                  />
                </div>
                <div className="join-info">
                  <span className="eyebrow">Escaneie ou acesse no celular</span>
                  <div className="big-room-code">{roomCode}</div>
                  <p className="join-url-hint">{joinUrl}</p>
                  <div className="lobby-stats-row">
                    <span>
                      <Users size={16} /> {participants.length} conectados
                    </span>
                    <span>
                      <CheckCircle2 size={16} color="#34d399" />{' '}
                      {roomState.readyCount} prontos
                    </span>
                  </div>
                </div>
              </div>

              <div className="historical-hook-card">
                <div className="hook-meta">
                  <Sparkles size={16} color="#fbbf24" />
                  <span>
                    Contexto Histórico · {module.historicalHook.year} —{' '}
                    <strong>{module.historicalHook.figure}</strong>
                  </span>
                </div>
                <h2>{module.title}</h2>
                <p>{module.historicalHook.shortText}</p>
                <div className="opening-q-box">
                  <strong>Pergunta disparadora:</strong>{' '}
                  {module.teacherGuide.openingQuestion}
                </div>
              </div>

              {participants.length > 0 && (
                <div className="lobby-roster">
                  {participants.map((p) => (
                    <span
                      key={p.studentId}
                      className={`roster-pill ${p.ready ? 'ready' : ''}`}
                    >
                      {p.ready ? '✓ ' : ''}
                      {p.nickname}
                    </span>
                  ))}
                </div>
              )}
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
                      ? 'Quiz de Aquecimento · Intuição'
                      : 'Previsão Guiada · O que vai acontecer?'}
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
                        style={{
                          borderLeftColor: OPTION_COLORS[opt.id],
                        }}
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
                        Encerrar &amp; Revelar Resposta
                        {roomState.mode === 'quiz_prediction'
                          ? ' na Engine'
                          : ''}
                      </span>
                    </button>
                  ) : (
                    <div className="quiz-explanation-banner">
                      <CheckCircle2 size={20} color="#34d399" />
                      <div>
                        <strong>
                          Resposta Correta: {activeQuestion.correctOption}
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
                    {stage}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* ETAPA 3: PROVA REAL NA ENGINE + PÍLULA DE TEORIA */}
        {roomState.mode === 'simulation' && (
          <div className="host-sim-layout">
            <main className="canvas-stage host-sim-canvas">
              {stage}

              <button
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

            {drawerOpen && (
              <aside className="host-teacher-drawer">
                <div className="drawer-tabs">
                  <button
                    className={drawerTab === 'theory' ? 'active' : ''}
                    onClick={() => setDrawerTab('theory')}
                  >
                    <Lightbulb size={14} /> Pílula
                  </button>
                  <button
                    className={drawerTab === 'guide' ? 'active' : ''}
                    onClick={() => setDrawerTab('guide')}
                  >
                    <BookOpen size={14} /> Guia &amp; Sliders
                  </button>
                  <button
                    className={drawerTab === 'bridges' ? 'active' : ''}
                    onClick={() => setDrawerTab('bridges')}
                  >
                    <Sparkles size={14} /> STEAM
                  </button>
                </div>

                <div className="drawer-body">
                  {drawerTab === 'theory' && (
                    <div className="theory-pill-stack">
                      <div className="pill-block myth">
                        <span className="pill-label">Mito Derrubado</span>
                        <p>{module.theoryPill.mythBusted}</p>
                      </div>
                      <div className="pill-block insight">
                        <span className="pill-label">Insight Principal</span>
                        <p>{module.theoryPill.ahaInsight}</p>
                      </div>
                      <div className="pill-block formula">
                        <span className="pill-label">Equação Chave</span>
                        <KatexPreview latex={module.theoryPill.formulaLatex} />
                        <ul className="vars-legend">
                          {module.theoryPill.variablesLegend.map((v) => (
                            <li key={v}>{v}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="pill-block everyday">
                        <span className="pill-label">No Cotidiano</span>
                        <p>{module.theoryPill.everydayApp}</p>
                      </div>
                    </div>
                  )}

                  {drawerTab === 'guide' && (
                    <div className="guide-stack">
                      <div className="pill-block">
                        <span className="pill-label">Pergunta Disparadora</span>
                        <p>{module.teacherGuide.openingQuestion}</p>
                      </div>
                      <div className="pill-block pitfall">
                        <span className="pill-label">Armadilha Comum</span>
                        <p>{module.teacherGuide.commonPitfall}</p>
                      </div>
                      <ParameterList
                        parameters={sim.scene.state.parameters}
                        onUpdate={(name, patch) =>
                          sim.scene.apply({ type: 'updateParameter', name, patch })
                        }
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
                  <Flame size={15} /> Desafio Coletivo da Turma
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

                  return (
                    <div
                      key={opt.id}
                      className={`challenge-option-row ${
                        isWinner ? 'winner' : ''
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
                            backgroundColor: isWinner ? '#34d399' : '#38bdf8',
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
                  onClick={() => {
                    executeChallengeWinner();
                  }}
                >
                  <Play size={18} />
                  <span>Executar Configuração Mais Votada na Engine</span>
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
                        ? 'Missão Cumprida! A turma venceu o desafio!'
                        : 'Quase lá! A configuração escolhida não atingiu a meta.'}
                    </strong>
                    <p>
                      Opção vencedora:{' '}
                      {roomState.challengeVoteState.winningOptionId} — analise o
                      comportamento ao vivo na engine.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="challenge-engine-panel">
              <div className="canvas-stage">
                {stage}
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
                    MathSimulator · Relatório Pós-Aula
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
                  <span>Exportar Relatório (PDF)</span>
                </button>
              </header>

              <div className="report-kpi-grid">
                <div className="kpi-card">
                  <span className="kpi-label">Alunos Participantes</span>
                  <strong className="kpi-value">
                    {reportSummary.totalStudents}
                  </strong>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Acerto Geral da Turma</span>
                  <strong className="kpi-value">
                    {reportSummary.overallAccuracyPercent}%
                  </strong>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Desafio Coletivo</span>
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
                  <h3>Ponto de Reforço (Maior Índice de Erro)</h3>
                  <div className="reinforcement-box">
                    <span className="error-rate-badge">
                      {reportSummary.hardestQuestion.errorRatePercent}% de erro
                    </span>
                    <p>{reportSummary.hardestQuestion.prompt}</p>
                  </div>
                </section>
              )}

              <section className="report-section">
                <h3>Pódio dos Destaques</h3>
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
                <h3>Resumo Conceitual da Aula</h3>
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
