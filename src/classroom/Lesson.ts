import {
  ChallengeOptionId,
  ChallengeOptionIdSchema,
  ClassroomModule,
  QuizOptionId,
  QuizQuestion,
  RoomState,
  StepMode,
  StepModeSchema,
} from './schemas';
import {
  ClientToHostEvent,
  HostToClientEvent,
  LeaderboardEntry,
} from './transport/types';

export const STEPS: readonly StepMode[] = StepModeSchema.options;

export interface StudentParticipant {
  studentId: string;
  nickname: string;
  ready: boolean;
  joinedAt: number;
  score: number;
  correctCount: number;
  answeredCount: number;
}

export interface ChallengeResult {
  winningOptionId: ChallengeOptionId;
  didClassWin: boolean;
}

export interface LessonState {
  room: RoomState;
  module: ClassroomModule;
  participants: Record<string, StudentParticipant>;
  quizAnswers: Record<string, Record<string, QuizOptionId>>;
  scoredQuestions: string[];
  challengeVotes: Record<string, ChallengeOptionId>;
  challengeResult: ChallengeResult | null;
}

export type LessonCommand =
  | ClientToHostEvent
  | { type: 'host:go_to_step'; stepIndex: number }
  | { type: 'host:reveal_quiz' }
  | { type: 'host:execute_challenge' }
  | { type: 'host:select_module'; module: ClassroomModule }
  | { type: 'host:tick' };

export interface LessonStep {
  state: LessonState;
  outbox: HostToClientEvent[];
}

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

export function start(
  roomCode: string,
  module: ClassroomModule,
  now: number,
): LessonState {
  return {
    room: {
      roomCode,
      moduleId: module.id,
      currentStepIndex: 0,
      mode: 'lobby_story',
      studentsCount: 0,
      readyCount: 0,
      updatedAt: now,
    },
    module,
    participants: {},
    quizAnswers: {},
    scoredQuestions: [],
    challengeVotes: {},
    challengeResult: null,
  };
}

export function apply(
  state: LessonState,
  command: LessonCommand,
  now: number,
): LessonStep {
  switch (command.type) {
    case 'student:request_sync':
      return {
        state,
        outbox: [roomEvent(state), leaderboardEvent(state)],
      };
    case 'student:join': {
      const existing = state.participants[command.studentId];
      const participants = {
        ...state.participants,
        [command.studentId]: existing
          ? { ...existing, nickname: command.nickname }
          : {
              studentId: command.studentId,
              nickname: command.nickname,
              ready: false,
              joinedAt: now,
              score: 0,
              correctCount: 0,
              answeredCount: 0,
            },
      };
      return publish(withParticipants(state, participants, now));
    }
    case 'student:ready': {
      const target = state.participants[command.studentId];
      if (!target) return unchanged(state);
      const participants = {
        ...state.participants,
        [command.studentId]: { ...target, ready: command.ready },
      };
      return publish(withParticipants(state, participants, now));
    }
    case 'student:quiz_vote': {
      const quiz = state.room.quizState;
      if (
        !quiz ||
        quiz.status !== 'open' ||
        quiz.questionId !== command.questionId
      ) {
        return unchanged(state);
      }
      const answers = state.quizAnswers[quiz.questionId] ?? {};
      if (answers[command.studentId]) return unchanged(state);
      const nextAnswers = { ...answers, [command.studentId]: command.optionId };
      return publish({
        ...state,
        quizAnswers: { ...state.quizAnswers, [quiz.questionId]: nextAnswers },
        room: {
          ...state.room,
          quizState: { ...quiz, votesCount: countQuizVotes(nextAnswers) },
          updatedAt: now,
        },
      });
    }
    case 'student:challenge_vote': {
      const vote = state.room.challengeVoteState;
      if (!vote || vote.status !== 'open') return unchanged(state);
      if (state.challengeVotes[command.studentId]) return unchanged(state);
      const challengeVotes = {
        ...state.challengeVotes,
        [command.studentId]: command.optionId,
      };
      return publish({
        ...state,
        challengeVotes,
        room: {
          ...state.room,
          challengeVoteState: {
            ...vote,
            votesCount: countChallengeVotes(challengeVotes),
          },
          updatedAt: now,
        },
      });
    }
    case 'host:tick': {
      const quiz = state.room.quizState;
      if (!quiz || quiz.status !== 'open') return unchanged(state);
      const timeLeft = Math.max(0, quiz.timeLeft - 1);
      return publish({
        ...state,
        room: {
          ...state.room,
          quizState: {
            ...quiz,
            timeLeft,
            status: timeLeft === 0 ? 'locked' : 'open',
          },
          updatedAt: now,
        },
      });
    }
    case 'host:reveal_quiz':
      return revealQuiz(state, now);
    case 'host:execute_challenge':
      return executeChallenge(state, now);
    case 'host:go_to_step':
      return goToStep(state, command.stepIndex, now);
    case 'host:select_module': {
      const participants: Record<string, StudentParticipant> = {};
      for (const [id, p] of Object.entries(state.participants)) {
        participants[id] = {
          ...p,
          ready: false,
          score: 0,
          correctCount: 0,
          answeredCount: 0,
        };
      }
      const fresh = start(state.room.roomCode, command.module, now);
      const next = withParticipants(fresh, participants, now);
      return { state: next, outbox: [leaderboardEvent(next), roomEvent(next)] };
    }
  }
}

export function rank(
  participants: Record<string, StudentParticipant>,
): LeaderboardEntry[] {
  return Object.values(participants)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.correctCount !== a.correctCount) {
        return b.correctCount - a.correctCount;
      }
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

export function summarize(state: LessonState): SessionReportSummary {
  const list = Object.values(state.participants);
  const totalAnswered = list.reduce((acc, p) => acc + p.answeredCount, 0);
  const totalCorrect = list.reduce((acc, p) => acc + p.correctCount, 0);

  let hardest: SessionReportSummary['hardestQuestion'] = null;
  for (const q of state.module.quizzes) {
    const answers = Object.values(state.quizAnswers[q.id] ?? {});
    if (answers.length === 0) continue;
    const wrongCount = answers.filter((a) => a !== q.correctOption).length;
    const errorRatePercent = Math.round((wrongCount / answers.length) * 100);
    if (!hardest || errorRatePercent > hardest.errorRatePercent) {
      hardest = { questionId: q.id, prompt: q.prompt, errorRatePercent };
    }
  }

  return {
    totalStudents: list.length,
    overallAccuracyPercent:
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
    hardestQuestion: hardest,
    podium: rank(state.participants).slice(0, 5),
    challengeWon: state.challengeResult?.didClassWin ?? null,
  };
}

function revealQuiz(state: LessonState, now: number): LessonStep {
  const quiz = state.room.quizState;
  if (!quiz || quiz.status === 'revealed') return unchanged(state);
  const question = findQuestion(state.module, quiz.questionId);
  if (!question) return unchanged(state);

  let participants = state.participants;
  let scoredQuestions = state.scoredQuestions;
  if (!scoredQuestions.includes(question.id)) {
    participants = { ...participants };
    for (const [studentId, chosen] of Object.entries(
      state.quizAnswers[question.id] ?? {},
    )) {
      const p = participants[studentId];
      if (!p) continue;
      const isCorrect = chosen === question.correctOption;
      participants[studentId] = {
        ...p,
        answeredCount: p.answeredCount + 1,
        correctCount: p.correctCount + (isCorrect ? 1 : 0),
        score: p.score + (isCorrect ? 100 : 0),
      };
    }
    scoredQuestions = [...scoredQuestions, question.id];
  }

  const next: LessonState = {
    ...state,
    participants,
    scoredQuestions,
    room: {
      ...state.room,
      quizState: revealedQuiz(state, question),
      enginePreset: question.enginePresetAfter ?? state.room.enginePreset,
      updatedAt: now,
    },
  };
  return { state: next, outbox: [leaderboardEvent(next), roomEvent(next)] };
}

function executeChallenge(state: LessonState, now: number): LessonStep {
  const vote = state.room.challengeVoteState;
  if (!vote || vote.status === 'executed' || state.challengeResult) {
    return unchanged(state);
  }

  let winningOptionId: ChallengeOptionId = '1';
  let maxVotes = -1;
  for (const id of ChallengeOptionIdSchema.options) {
    if (vote.votesCount[id] > maxVotes) {
      maxVotes = vote.votesCount[id];
      winningOptionId = id;
    }
  }
  const didClassWin =
    findChallengeOption(state.module, winningOptionId)?.isSuccess ?? false;

  const participants = { ...state.participants };
  for (const studentId of Object.keys(state.challengeVotes)) {
    const p = participants[studentId];
    if (!p) continue;
    participants[studentId] = { ...p, score: p.score + (didClassWin ? 50 : 20) };
  }

  const challengeResult = { winningOptionId, didClassWin };
  const executed: LessonState = { ...state, participants, challengeResult };
  const next: LessonState = {
    ...executed,
    room: {
      ...state.room,
      ...challengeRoom(executed),
      updatedAt: now,
    },
  };
  return { state: next, outbox: [leaderboardEvent(next), roomEvent(next)] };
}

function goToStep(
  state: LessonState,
  stepIndex: number,
  now: number,
): LessonStep {
  const index = Math.max(0, Math.min(STEPS.length - 1, stepIndex));
  const mode = STEPS[index];
  const { module } = state;
  const room: RoomState = {
    ...state.room,
    currentStepIndex: index,
    mode,
    quizState: undefined,
    challengeVoteState: undefined,
    updatedAt: now,
  };

  if (mode === 'quiz' || mode === 'quiz_prediction') {
    const question =
      mode === 'quiz'
        ? module.quizzes[0]
        : (module.quizzes[1] ?? module.quizzes[0]);
    if (state.scoredQuestions.includes(question.id)) {
      room.quizState = revealedQuiz(state, question);
      room.enginePreset =
        question.enginePresetAfter ??
        question.enginePresetBefore ??
        room.enginePreset;
    } else {
      room.quizState = {
        questionId: question.id,
        status: 'open',
        timeLeft: question.timeLimitSec,
        votesCount: countQuizVotes(state.quizAnswers[question.id] ?? {}),
      };
      room.enginePreset = question.enginePresetBefore ?? room.enginePreset;
    }
  } else if (mode === 'simulation') {
    const q1 = module.quizzes[0];
    room.enginePreset = q1.enginePresetAfter ?? q1.enginePresetBefore;
  } else if (mode === 'challenge') {
    Object.assign(room, challengeRoom(state));
  }

  const next = { ...state, room };
  return {
    state: next,
    outbox:
      mode === 'report'
        ? [leaderboardEvent(next), roomEvent(next)]
        : [roomEvent(next)],
  };
}

function challengeRoom(
  state: LessonState,
): Pick<RoomState, 'challengeVoteState' | 'enginePreset'> {
  const { votingOptions } = state.module.collectiveChallenge;
  const result = state.challengeResult;
  const base = {
    options: votingOptions.map((o) => ({
      id: o.id,
      label: o.label,
      preset: o.preset,
    })),
    votesCount: countChallengeVotes(state.challengeVotes),
  };
  if (!result) {
    return {
      challengeVoteState: { ...base, status: 'open' },
      enginePreset: state.room.enginePreset,
    };
  }
  return {
    challengeVoteState: { ...base, status: 'executed', ...result },
    enginePreset:
      findChallengeOption(state.module, result.winningOptionId)?.preset ??
      state.room.enginePreset,
  };
}

function revealedQuiz(
  state: LessonState,
  question: QuizQuestion,
): NonNullable<RoomState['quizState']> {
  return {
    questionId: question.id,
    status: 'revealed',
    timeLeft: 0,
    votesCount: countQuizVotes(state.quizAnswers[question.id] ?? {}),
    correctOption: question.correctOption,
  };
}

function findQuestion(
  module: ClassroomModule,
  questionId: string,
): QuizQuestion | undefined {
  return module.quizzes.find((q) => q.id === questionId);
}

function findChallengeOption(
  module: ClassroomModule,
  optionId: ChallengeOptionId,
) {
  return module.collectiveChallenge.votingOptions.find(
    (o) => o.id === optionId,
  );
}

function withParticipants(
  state: LessonState,
  participants: Record<string, StudentParticipant>,
  now: number,
): LessonState {
  const list = Object.values(participants);
  return {
    ...state,
    participants,
    room: {
      ...state.room,
      studentsCount: list.length,
      readyCount: list.filter((s) => s.ready).length,
      updatedAt: now,
    },
  };
}

function countQuizVotes(
  answers: Record<string, QuizOptionId>,
): Record<QuizOptionId, number> {
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  for (const opt of Object.values(answers)) {
    counts[opt] += 1;
  }
  return counts;
}

function countChallengeVotes(
  votes: Record<string, ChallengeOptionId>,
): Record<ChallengeOptionId, number> {
  const counts = { '1': 0, '2': 0, '3': 0 };
  for (const opt of Object.values(votes)) {
    counts[opt] += 1;
  }
  return counts;
}

function roomEvent(state: LessonState): HostToClientEvent {
  return { type: 'room:state', state: state.room };
}

function leaderboardEvent(state: LessonState): HostToClientEvent {
  return { type: 'room:leaderboard', leaderboard: rank(state.participants) };
}

function publish(state: LessonState): LessonStep {
  return { state, outbox: [roomEvent(state)] };
}

function unchanged(state: LessonState): LessonStep {
  return { state, outbox: [] };
}
