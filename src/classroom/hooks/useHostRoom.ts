import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getClassroomModuleById } from '../../data/modules';
import {
  ChallengeOptionId,
  ClassroomModule,
  QuizOptionId,
  QuizQuestion,
  RoomState,
  StepMode,
} from '../schemas';
import {
  ClientToHostEvent,
  createRoomTransport,
  LeaderboardEntry,
  RoomTransport,
  StudentParticipant,
  TransportKind,
} from '../transport';

const STEP_SEQUENCE: StepMode[] = [
  'lobby_story',
  'quiz',
  'simulation',
  'quiz_prediction',
  'challenge',
  'report',
];

export interface SessionReportSummary {
  totalStudents: number;
  overallAccuracyPercent: number;
  hardestQuestion: {
    questionId: string;
    prompt: string;
    errorRatePercent: number;
  } | null;
  podium: LeaderboardEntry[];
  challengeWon: boolean | null;
}

function generateRoomCode(): string {
  const num = Math.floor(100 + Math.random() * 900);
  return `FIS-${num}`;
}

function emptyQuizVotes(): Record<QuizOptionId, number> {
  return { A: 0, B: 0, C: 0, D: 0 };
}

function emptyChallengeVotes(): Record<ChallengeOptionId, number> {
  return { '1': 0, '2': 0, '3': 0 };
}

function computeLeaderboard(
  participants: Record<string, StudentParticipant>,
): LeaderboardEntry[] {
  return Object.values(participants)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
      return a.joinedAt - b.joinedAt;
    })
    .map((p, idx) => ({
      studentId: p.studentId,
      nickname: p.nickname,
      score: p.score,
      correctCount: p.correctCount,
      rank: idx + 1,
    }));
}

export interface UseHostRoomOptions {
  initialModuleId: string;
  transportMode?: 'auto' | TransportKind;
}

export function useHostRoom({
  initialModuleId,
  transportMode = 'auto',
}: UseHostRoomOptions) {
  const [roomCode] = useState<string>(() => generateRoomCode());
  const [moduleId, setModuleId] = useState<string>(initialModuleId);
  const [connected, setConnected] = useState(false);
  const [transportKind, setTransportKind] = useState<TransportKind>('local');
  const [participants, setParticipants] = useState<
    Record<string, StudentParticipant>
  >({});

  // Votos registrados por questionId -> studentId -> optionId
  const quizAnswersRef = useRef<
    Record<string, Record<string, QuizOptionId>>
  >({});
  // Votos do desafio coletivo: studentId -> optionId
  const challengeVotesRef = useRef<Record<string, ChallengeOptionId>>({});

  const module: ClassroomModule | undefined = useMemo(
    () => getClassroomModuleById(moduleId),
    [moduleId],
  );

  const [roomState, setRoomState] = useState<RoomState>(() => ({
    roomCode,
    moduleId: initialModuleId,
    currentStepIndex: 0,
    mode: 'lobby_story',
    studentsCount: 0,
    readyCount: 0,
    updatedAt: Date.now(),
  }));

  const roomStateRef = useRef<RoomState>(roomState);
  roomStateRef.current = roomState;

  const participantsRef = useRef(participants);
  participantsRef.current = participants;

  const transportRef = useRef<RoomTransport | null>(null);

  const broadcastState = useCallback((next: RoomState) => {
    roomStateRef.current = next;
    setRoomState(next);
    transportRef.current?.sendHostEvent({
      type: 'room:state',
      state: next,
    });
  }, []);

  const broadcastLeaderboard = useCallback(
    (nextParticipants: Record<string, StudentParticipant>) => {
      const leaderboard = computeLeaderboard(nextParticipants);
      transportRef.current?.sendHostEvent({
        type: 'room:leaderboard',
        leaderboard,
      });
    },
    [],
  );

  // Conecta transporte ao montar
  useEffect(() => {
    const transport = createRoomTransport(transportMode);
    transportRef.current = transport;
    setTransportKind(transport.kind);

    let active = true;

    const handleClientEvent = (event: ClientToHostEvent) => {
      if (!active) return;

      if (event.type === 'student:request_sync') {
        transport.sendHostEvent({
          type: 'room:state',
          state: roomStateRef.current,
        });
        transport.sendHostEvent({
          type: 'room:leaderboard',
          leaderboard: computeLeaderboard(participantsRef.current),
        });
        return;
      }

      if (event.type === 'student:join') {
        setParticipants((prev) => {
          const existing = prev[event.studentId];
          const updated: Record<string, StudentParticipant> = {
            ...prev,
            [event.studentId]: existing
              ? { ...existing, nickname: event.nickname }
              : {
                  studentId: event.studentId,
                  nickname: event.nickname,
                  ready: false,
                  joinedAt: Date.now(),
                  score: 0,
                  correctCount: 0,
                  answeredCount: 0,
                },
          };
          const list = Object.values(updated);
          broadcastState({
            ...roomStateRef.current,
            studentsCount: list.length,
            readyCount: list.filter((s) => s.ready).length,
            updatedAt: Date.now(),
          });
          return updated;
        });
        return;
      }

      if (event.type === 'student:ready') {
        setParticipants((prev) => {
          const target = prev[event.studentId];
          if (!target) return prev;
          const updated = {
            ...prev,
            [event.studentId]: { ...target, ready: event.ready },
          };
          const list = Object.values(updated);
          broadcastState({
            ...roomStateRef.current,
            studentsCount: list.length,
            readyCount: list.filter((s) => s.ready).length,
            updatedAt: Date.now(),
          });
          return updated;
        });
        return;
      }

      if (event.type === 'student:quiz_vote') {
        const current = roomStateRef.current;
        if (
          !current.quizState ||
          current.quizState.status !== 'open' ||
          current.quizState.questionId !== event.questionId
        ) {
          return;
        }

        const qMap = (quizAnswersRef.current[event.questionId] ??= {});
        if (qMap[event.studentId]) return; // Evita voto duplicado
        qMap[event.studentId] = event.optionId;

        const counts = emptyQuizVotes();
        for (const opt of Object.values(qMap)) {
          counts[opt] += 1;
        }

        broadcastState({
          ...current,
          quizState: {
            ...current.quizState,
            votesCount: counts,
          },
          updatedAt: Date.now(),
        });
        return;
      }

      if (event.type === 'student:challenge_vote') {
        const current = roomStateRef.current;
        if (
          !current.challengeVoteState ||
          current.challengeVoteState.status !== 'open'
        ) {
          return;
        }
        if (challengeVotesRef.current[event.studentId]) return;
        challengeVotesRef.current[event.studentId] = event.optionId;

        const counts = emptyChallengeVotes();
        for (const opt of Object.values(challengeVotesRef.current)) {
          counts[opt] += 1;
        }

        broadcastState({
          ...current,
          challengeVoteState: {
            ...current.challengeVoteState,
            votesCount: counts,
          },
          updatedAt: Date.now(),
        });
      }
    };

    const unsub = transport.onClientEvent(handleClientEvent);

    transport
      .connect(roomCode, 'host')
      .then(() => {
        if (!active) return;
        setConnected(true);
        transport.sendHostEvent({
          type: 'room:state',
          state: roomStateRef.current,
        });
      })
      .catch(() => {
        if (active) setConnected(false);
      });

    return () => {
      active = false;
      unsub();
      transport.sendHostEvent({ type: 'room:closed', reason: 'host_left' });
      void transport.disconnect();
    };
  }, [roomCode, transportMode, broadcastState]);

  // Cronômetro regressivo automático quando há quiz aberto
  useEffect(() => {
    if (roomState.quizState?.status !== 'open') return;
    if (roomState.quizState.timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      const curr = roomStateRef.current;
      if (!curr.quizState || curr.quizState.status !== 'open') return;
      const nextTime = Math.max(0, curr.quizState.timeLeft - 1);
      broadcastState({
        ...curr,
        quizState: {
          ...curr.quizState,
          timeLeft: nextTime,
          status: nextTime === 0 ? 'locked' : 'open',
        },
        updatedAt: Date.now(),
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [roomState.quizState?.status, roomState.quizState?.questionId, broadcastState]);

  const findQuestionById = useCallback(
    (questionId: string): QuizQuestion | undefined => {
      if (!module) return undefined;
      const direct = module.quizzes.find((q) => q.id === questionId);
      if (direct) return direct;
      for (const b of module.interdisciplinaryBridges) {
        if (b.bridgeQuestion?.id === questionId) return b.bridgeQuestion;
      }
      return undefined;
    },
    [module],
  );

  const revealCurrentQuiz = useCallback(() => {
    const curr = roomStateRef.current;
    if (!curr.quizState || curr.quizState.status === 'revealed') return;

    const question = findQuestionById(curr.quizState.questionId);
    if (!question) return;

    const qAnswers = quizAnswersRef.current[question.id] ?? {};

    setParticipants((prev) => {
      const next = { ...prev };
      for (const [studentId, chosen] of Object.entries(qAnswers)) {
        const p = next[studentId];
        if (!p) continue;
        const isCorrect = chosen === question.correctOption;
        next[studentId] = {
          ...p,
          answeredCount: p.answeredCount + 1,
          correctCount: p.correctCount + (isCorrect ? 1 : 0),
          score: p.score + (isCorrect ? 100 : 0),
        };
      }
      broadcastLeaderboard(next);
      return next;
    });

    broadcastState({
      ...curr,
      quizState: {
        ...curr.quizState,
        status: 'revealed',
        timeLeft: 0,
        correctOption: question.correctOption,
      },
      enginePreset: question.enginePresetAfter ?? curr.enginePreset,
      updatedAt: Date.now(),
    });
  }, [findQuestionById, broadcastState, broadcastLeaderboard]);

  const executeChallengeWinner = useCallback(() => {
    const curr = roomStateRef.current;
    if (!module || !curr.challengeVoteState) return;
    if (curr.challengeVoteState.status === 'executed') return;

    const counts = curr.challengeVoteState.votesCount;
    const options: ChallengeOptionId[] = ['1', '2', '3'];
    let winningId: ChallengeOptionId = '1';
    let maxVotes = -1;
    for (const id of options) {
      if (counts[id] > maxVotes) {
        maxVotes = counts[id];
        winningId = id;
      }
    }

    const winningOpt = module.collectiveChallenge.votingOptions.find(
      (o) => o.id === winningId,
    );
    const didWin = winningOpt?.isSuccess ?? false;

    // Bônus de participação (+50 pts se a turma venceu, +20 pts por votar)
    setParticipants((prev) => {
      const next = { ...prev };
      for (const studentId of Object.keys(challengeVotesRef.current)) {
        const p = next[studentId];
        if (!p) continue;
        next[studentId] = {
          ...p,
          score: p.score + (didWin ? 50 : 20),
        };
      }
      broadcastLeaderboard(next);
      return next;
    });

    broadcastState({
      ...curr,
      challengeVoteState: {
        ...curr.challengeVoteState,
        status: 'executed',
        winningOptionId: winningId,
        didClassWin: didWin,
      },
      enginePreset: winningOpt?.preset ?? curr.enginePreset,
      updatedAt: Date.now(),
    });
  }, [module, broadcastState, broadcastLeaderboard]);

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (!module) return;
      const clamped = Math.max(0, Math.min(STEP_SEQUENCE.length - 1, stepIndex));
      const mode = STEP_SEQUENCE[clamped];
      const curr = roomStateRef.current;

      const base: RoomState = {
        ...curr,
        moduleId: module.id,
        currentStepIndex: clamped,
        mode,
        quizState: undefined,
        challengeVoteState: undefined,
        updatedAt: Date.now(),
      };

      if (mode === 'quiz') {
        const q1 = module.quizzes[0];
        base.quizState = {
          questionId: q1.id,
          status: 'open',
          timeLeft: q1.timeLimitSec,
          votesCount: emptyQuizVotes(),
        };
        if (q1.enginePresetBefore) {
          base.enginePreset = q1.enginePresetBefore;
        }
      } else if (mode === 'simulation') {
        const q1 = module.quizzes[0];
        base.enginePreset = q1.enginePresetAfter ?? q1.enginePresetBefore;
      } else if (mode === 'quiz_prediction') {
        const q2 = module.quizzes[1] ?? module.quizzes[0];
        base.quizState = {
          questionId: q2.id,
          status: 'open',
          timeLeft: q2.timeLimitSec,
          votesCount: emptyQuizVotes(),
        };
        if (q2.enginePresetBefore) {
          base.enginePreset = q2.enginePresetBefore;
        }
      } else if (mode === 'challenge') {
        challengeVotesRef.current = {};
        base.challengeVoteState = {
          status: 'open',
          options: module.collectiveChallenge.votingOptions.map((o) => ({
            id: o.id,
            label: o.label,
            preset: o.preset,
          })),
          votesCount: emptyChallengeVotes(),
        };
      } else if (mode === 'report') {
        broadcastLeaderboard(participantsRef.current);
      }

      broadcastState(base);
    },
    [module, broadcastState, broadcastLeaderboard],
  );

  const nextStep = useCallback(() => {
    goToStep(roomStateRef.current.currentStepIndex + 1);
  }, [goToStep]);

  const prevStep = useCallback(() => {
    goToStep(roomStateRef.current.currentStepIndex - 1);
  }, [goToStep]);

  const selectModule = useCallback(
    (nextModuleId: string) => {
      setModuleId(nextModuleId);
      quizAnswersRef.current = {};
      challengeVotesRef.current = {};
      setParticipants((prev) => {
        const reset: Record<string, StudentParticipant> = {};
        for (const [id, p] of Object.entries(prev)) {
          reset[id] = {
            ...p,
            ready: false,
            score: 0,
            correctCount: 0,
            answeredCount: 0,
          };
        }
        return reset;
      });
      broadcastState({
        roomCode,
        moduleId: nextModuleId,
        currentStepIndex: 0,
        mode: 'lobby_story',
        studentsCount: Object.keys(participantsRef.current).length,
        readyCount: 0,
        updatedAt: Date.now(),
      });
    },
    [roomCode, broadcastState],
  );

  const reportSummary: SessionReportSummary = useMemo(() => {
    const list = Object.values(participants);
    const totalAnswered = list.reduce((acc, p) => acc + p.answeredCount, 0);
    const totalCorrect = list.reduce((acc, p) => acc + p.correctCount, 0);
    const overallAccuracyPercent =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    let hardest: SessionReportSummary['hardestQuestion'] = null;
    if (module) {
      for (const q of module.quizzes) {
        const qMap = quizAnswersRef.current[q.id];
        if (!qMap) continue;
        const answers = Object.values(qMap);
        if (answers.length === 0) continue;
        const wrongCount = answers.filter((a) => a !== q.correctOption).length;
        const errorRatePercent = Math.round((wrongCount / answers.length) * 100);
        if (!hardest || errorRatePercent > hardest.errorRatePercent) {
          hardest = {
            questionId: q.id,
            prompt: q.prompt,
            errorRatePercent,
          };
        }
      }
    }

    return {
      totalStudents: list.length,
      overallAccuracyPercent,
      hardestQuestion: hardest,
      podium: computeLeaderboard(participants).slice(0, 5),
      challengeWon: roomState.challengeVoteState?.didClassWin ?? null,
    };
  }, [participants, module, roomState.challengeVoteState?.didClassWin]);

  return {
    roomCode,
    module,
    roomState,
    connected,
    transportKind,
    participants: Object.values(participants),
    leaderboard: computeLeaderboard(participants),
    reportSummary,
    selectModule,
    goToStep,
    nextStep,
    prevStep,
    revealCurrentQuiz,
    executeChallengeWinner,
  };
}
