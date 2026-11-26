import {
  CheckCircle2,
  Clock,
  Flame,
  LogOut,
  Radio,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { KatexPreview } from '../../components/KatexPreview';
import { useStudentRoom } from '../hooks/useStudentRoom';
import { QuizOptionId } from '../schemas';

const OPTION_STYLES: Record<QuizOptionId, { bg: string; label: string }> = {
  A: { bg: '#0284c7', label: 'A' },
  B: { bg: '#db2777', label: 'B' },
  C: { bg: '#059669', label: 'C' },
  D: { bg: '#d97706', label: 'D' },
};

interface PlayViewProps {
  initialRoomCode?: string;
}

export function PlayView({ initialRoomCode = '' }: PlayViewProps) {
  const [roomInput, setRoomInput] = useState<string>(
    initialRoomCode.toUpperCase(),
  );
  const [nicknameInput, setNicknameInput] = useState<string>('');
  const [joining, setJoining] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const {
    nickname,
    joinedRoomCode,
    connected,
    roomClosed,
    roomState,
    module,
    myLeaderboardEntry,
    isReady,
    myQuizAnswers,
    myChallengeVote,
    joinRoom,
    leaveRoom,
    markReady,
    submitQuizVote,
    submitChallengeVote,
  } = useStudentRoom();

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (!roomInput.trim()) {
      setErrorMsg('Digite o código da sala (ex: FIS-402).');
      return;
    }
    if (!nicknameInput.trim()) {
      setErrorMsg('Digite seu nome ou apelido.');
      return;
    }
    setErrorMsg('');
    setJoining(true);
    try {
      await joinRoom(roomInput, nicknameInput);
    } catch {
      setErrorMsg('Não foi possível conectar à sala. Verifique o código.');
    } finally {
      setJoining(false);
    }
  };

  const activeQuestion = useMemo(() => {
    if (!module || !roomState?.quizState) return undefined;
    return module.quizzes.find((q) => q.id === roomState.quizState?.questionId);
  }, [module, roomState?.quizState]);

  const currentAnswer = roomState?.quizState
    ? myQuizAnswers[roomState.quizState.questionId]
    : undefined;

  // Tela de entrada (Mobile-First)
  if (!connected || !joinedRoomCode) {
    return (
      <div className="classroom-play">
        <div className="play-join-card">
          <div className="play-brand">
            <span className="brand-mark">∫</span>
            <div>
              <h1>Entrar na Sala</h1>
              <p>Sem cadastro — digite o código projetado pelo professor</p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="play-join-form">
            <label>
              <span>Código da Sala</span>
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                placeholder="Ex: FIS-402"
                autoComplete="off"
                className="play-input code-input"
              />
            </label>

            <label>
              <span>Seu Apelido</span>
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="Ex: Ana Clara"
                maxLength={24}
                autoComplete="off"
                className="play-input"
              />
            </label>

            {errorMsg && <div className="play-error">{errorMsg}</div>}

            <button
              type="submit"
              className="play-cta-btn"
              disabled={joining}
            >
              {joining ? 'Conectando...' : 'Entrar Agora'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="classroom-play">
      <header className="play-topbar">
        <div className="play-room-pill">
          <Radio size={13} className="pulse-online" />
          <span>{joinedRoomCode}</span>
        </div>
        <span className="play-nickname">{nickname}</span>
        <button
          className="play-leave-btn"
          onClick={() => void leaveRoom()}
          title="Sair da sala"
        >
          <LogOut size={15} />
        </button>
      </header>

      <main className="play-body">
        {roomClosed && (
          <div className="play-card centered">
            <h2>Sessão encerrada</h2>
            <p>O professor fechou esta sala.</p>
            <button
              className="play-cta-btn"
              onClick={() => void leaveRoom()}
            >
              Voltar ao início
            </button>
          </div>
        )}

        {!roomClosed && !roomState && (
          <div className="play-card centered">
            <Sparkles size={28} color="#38bdf8" />
            <h2>Conectado à sala {joinedRoomCode}</h2>
            <p>Aguardando o professor iniciar a aula no projetor...</p>
          </div>
        )}

        {/* ETAPA 1: LOBBY & HISTÓRIA */}
        {!roomClosed && roomState?.mode === 'lobby_story' && module && (
          <div className="play-card">
            <span className="play-eyebrow">
              {module.historicalHook.year} · {module.historicalHook.figure}
            </span>
            <h2>{module.title}</h2>
            <p className="play-story-text">{module.historicalHook.shortText}</p>

            <button
              className={`play-ready-btn ${isReady ? 'ready' : ''}`}
              onClick={() => markReady(!isReady)}
            >
              <CheckCircle2 size={20} />
              <span>{isReady ? 'Você está pronto!' : 'Estou pronto'}</span>
            </button>
          </div>
        )}

        {/* ETAPAS 2 e 4: QUIZ / PREVISÃO */}
        {!roomClosed &&
          (roomState?.mode === 'quiz' ||
            roomState?.mode === 'quiz_prediction') &&
          activeQuestion &&
          roomState.quizState && (
            <div className="play-quiz-wrap">
              <div className="play-quiz-meta">
                <span>
                  {roomState.mode === 'quiz'
                    ? 'Quiz de Intuição'
                    : 'Previsão Guiada'}
                </span>
                <span className="play-timer">
                  <Clock size={14} /> {roomState.quizState.timeLeft}s
                </span>
              </div>

              <h2 className="play-question-text">{activeQuestion.prompt}</h2>

              {roomState.quizState.status === 'revealed' ? (
                <div
                  className={`play-feedback-card ${
                    currentAnswer === activeQuestion.correctOption
                      ? 'correct'
                      : 'wrong'
                  }`}
                >
                  {currentAnswer === activeQuestion.correctOption ? (
                    <>
                      <CheckCircle2 size={36} color="#34d399" />
                      <h3>Você acertou! +100 pts</h3>
                    </>
                  ) : (
                    <>
                      <XCircle size={36} color="#fb7185" />
                      <h3>
                        Quase lá! A resposta era {activeQuestion.correctOption}
                      </h3>
                    </>
                  )}
                  <p>{activeQuestion.explanation}</p>
                </div>
              ) : (
                <div className="play-options-grid">
                  {activeQuestion.options.map((opt) => {
                    const chosen = currentAnswer === opt.id;
                    const locked =
                      Boolean(currentAnswer) ||
                      roomState.quizState?.status !== 'open';
                    return (
                      <button
                        key={opt.id}
                        className={`play-option-btn ${chosen ? 'chosen' : ''}`}
                        style={{
                          backgroundColor: OPTION_STYLES[opt.id].bg,
                          opacity: locked && !chosen ? 0.45 : 1,
                        }}
                        disabled={locked}
                        onClick={() => submitQuizVote(opt.id)}
                      >
                        <span className="play-opt-letter">{opt.id}</span>
                        <span className="play-opt-text">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentAnswer && roomState.quizState.status !== 'revealed' && (
                <div className="play-locked-note">
                  Resposta <strong>{currentAnswer}</strong> enviada! Aguarde o
                  professor revelar.
                </div>
              )}
            </div>
          )}

        {/* ETAPA 3: SIMULAÇÃO + CARTÃO RESUMO */}
        {!roomClosed && roomState?.mode === 'simulation' && module && (
          <div className="play-card">
            <span className="play-eyebrow">
              Olhe para o projetor · Cartão-Resumo
            </span>
            <h2>{module.title}</h2>
            <div className="play-summary-block">
              <strong>Mito derrubado:</strong>
              <p>{module.theoryPill.mythBusted}</p>
            </div>
            <div className="play-summary-block">
              <strong>Fórmula chave:</strong>
              <KatexPreview latex={module.theoryPill.formulaLatex} />
            </div>
            <div className="play-summary-block">
              <strong>No seu dia a dia:</strong>
              <p>{module.theoryPill.everydayApp}</p>
            </div>
          </div>
        )}

        {/* ETAPA 5: DESAFIO COLETIVO */}
        {!roomClosed &&
          roomState?.mode === 'challenge' &&
          module &&
          roomState.challengeVoteState && (
            <div className="play-card">
              <span className="play-eyebrow">
                <Flame size={14} /> Votação Coletiva
              </span>
              <h2>{module.collectiveChallenge.goalDescription}</h2>

              {roomState.challengeVoteState.status === 'executed' ? (
                <div
                  className={`play-feedback-card ${
                    roomState.challengeVoteState.didClassWin
                      ? 'correct'
                      : 'wrong'
                  }`}
                >
                  <Trophy size={34} />
                  <h3>
                    {roomState.challengeVoteState.didClassWin
                      ? 'A turma venceu o desafio!'
                      : 'Quase lá! Veja o resultado no projetor.'}
                  </h3>
                  <p>
                    Configuração mais votada: Opção{' '}
                    {roomState.challengeVoteState.winningOptionId}.
                  </p>
                </div>
              ) : (
                <div className="play-challenge-list">
                  {roomState.challengeVoteState.options.map((opt) => {
                    const chosen = myChallengeVote === opt.id;
                    return (
                      <button
                        key={opt.id}
                        className={`play-challenge-btn ${
                          chosen ? 'chosen' : ''
                        }`}
                        disabled={Boolean(myChallengeVote)}
                        onClick={() => submitChallengeVote(opt.id)}
                      >
                        <span className="ch-badge">Opção {opt.id}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {myChallengeVote &&
                roomState.challengeVoteState.status === 'open' && (
                  <div className="play-locked-note">
                    Voto registrado na <strong>Opção {myChallengeVote}</strong>!
                    Aguardando a turma...
                  </div>
                )}
            </div>
          )}

        {/* ETAPA 6: PONTUAÇÃO FINAL */}
        {!roomClosed && roomState?.mode === 'report' && (
          <div className="play-card centered">
            <Trophy size={42} color="#fbbf24" />
            <h2>Aula Concluída!</h2>
            {myLeaderboardEntry ? (
              <div className="play-final-stats">
                <div className="final-rank">#{myLeaderboardEntry.rank}</div>
                <div className="final-score">
                  {myLeaderboardEntry.score} pontos
                </div>
                <p>
                  {myLeaderboardEntry.correctCount} acerto
                  {myLeaderboardEntry.correctCount === 1 ? '' : 's'} nos quizzes
                </p>
              </div>
            ) : (
              <p>Obrigado por participar da aula de hoje!</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
