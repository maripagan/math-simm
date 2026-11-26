import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getClassroomModuleById } from '../../data/modules';
import {
  ChallengeOptionId,
  ClassroomModule,
  QuizOptionId,
  RoomState,
} from '../schemas';
import {
  createRoomTransport,
  LeaderboardEntry,
  RoomTransport,
  TransportKind,
} from '../transport';

function getOrCreateStudentId(): string {
  const key = 'mathsim:classroom:studentId';
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const created = `stu-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(key, created);
    return created;
  } catch {
    return `stu-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export interface UseStudentRoomOptions {
  transportMode?: 'auto' | TransportKind;
}

export function useStudentRoom(options: UseStudentRoomOptions = {}) {
  const { transportMode = 'auto' } = options;

  const [studentId] = useState<string>(() => getOrCreateStudentId());
  const [joinedRoomCode, setJoinedRoomCode] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [roomClosed, setRoomClosed] = useState(false);
  const [transportKind, setTransportKind] = useState<TransportKind>('local');

  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [myQuizAnswers, setMyQuizAnswers] = useState<
    Record<string, QuizOptionId>
  >({});
  const [myChallengeVote, setMyChallengeVote] =
    useState<ChallengeOptionId | null>(null);

  const transportRef = useRef<RoomTransport | null>(null);

  const module: ClassroomModule | undefined = useMemo(() => {
    if (!roomState) return undefined;
    return getClassroomModuleById(roomState.moduleId);
  }, [roomState]);

  const leaveRoom = useCallback(async () => {
    if (transportRef.current) {
      await transportRef.current.disconnect();
      transportRef.current = null;
    }
    setConnected(false);
    setJoinedRoomCode(null);
    setRoomState(null);
    setLeaderboard([]);
    setIsReady(false);
    setRoomClosed(false);
  }, []);

  const joinRoom = useCallback(
    async (rawRoomCode: string, rawNickname: string) => {
      const code = rawRoomCode.trim().toUpperCase();
      const cleanName = rawNickname.trim() || 'Estudante';
      if (!code) return;

      if (transportRef.current) {
        await transportRef.current.disconnect();
      }

      const transport = createRoomTransport(transportMode);
      transportRef.current = transport;
      setTransportKind(transport.kind);
      setNickname(cleanName);
      setRoomClosed(false);
      setIsReady(false);
      setMyQuizAnswers({});
      setMyChallengeVote(null);

      let moduleId: string | null = null;
      transport.onHostEvent((event) => {
        if (event.type === 'room:state') {
          if (moduleId !== null && moduleId !== event.state.moduleId) {
            setIsReady(false);
            setMyQuizAnswers({});
            setMyChallengeVote(null);
          }
          moduleId = event.state.moduleId;
          setRoomState(event.state);
        } else if (event.type === 'room:leaderboard') {
          setLeaderboard(event.leaderboard);
        } else if (event.type === 'room:closed') {
          setRoomClosed(true);
        }
      });

      await transport.connect(code, 'student');
      setJoinedRoomCode(code);
      setConnected(true);

      transport.sendClientEvent({
        type: 'student:join',
        studentId,
        nickname: cleanName,
      });
      transport.sendClientEvent({
        type: 'student:request_sync',
        studentId,
      });
    },
    [studentId, transportMode],
  );

  // Limpa ao desmontar
  useEffect(() => {
    return () => {
      if (transportRef.current) {
        void transportRef.current.disconnect();
        transportRef.current = null;
      }
    };
  }, []);

  const markReady = useCallback(
    (ready = true) => {
      setIsReady(ready);
      transportRef.current?.sendClientEvent({
        type: 'student:ready',
        studentId,
        ready,
      });
    },
    [studentId],
  );

  const submitQuizVote = useCallback(
    (optionId: QuizOptionId) => {
      if (!roomState?.quizState || roomState.quizState.status !== 'open') {
        return;
      }
      const qId = roomState.quizState.questionId;
      if (myQuizAnswers[qId]) return; // Trava envio após clique

      setMyQuizAnswers((prev) => ({ ...prev, [qId]: optionId }));
      transportRef.current?.sendClientEvent({
        type: 'student:quiz_vote',
        studentId,
        questionId: qId,
        optionId,
      });
    },
    [roomState, myQuizAnswers, studentId],
  );

  const submitChallengeVote = useCallback(
    (optionId: ChallengeOptionId) => {
      if (
        !roomState?.challengeVoteState ||
        roomState.challengeVoteState.status !== 'open'
      ) {
        return;
      }
      if (myChallengeVote) return;

      setMyChallengeVote(optionId);
      transportRef.current?.sendClientEvent({
        type: 'student:challenge_vote',
        studentId,
        optionId,
      });
    },
    [roomState, myChallengeVote, studentId],
  );

  const myLeaderboardEntry = useMemo(
    () => leaderboard.find((e) => e.studentId === studentId) ?? null,
    [leaderboard, studentId],
  );

  return {
    studentId,
    nickname,
    joinedRoomCode,
    connected,
    roomClosed,
    transportKind,
    roomState,
    module,
    leaderboard,
    myLeaderboardEntry,
    isReady,
    myQuizAnswers,
    myChallengeVote,
    joinRoom,
    leaveRoom,
    markReady,
    submitQuizVote,
    submitChallengeVote,
  };
}
