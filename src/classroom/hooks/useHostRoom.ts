import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CLASSROOM_MODULES, getClassroomModuleById } from '../../data/modules';
import * as Lesson from '../Lesson';
import { RoomStateSchema } from '../schemas';
import { createRoomTransport, RoomTransport, TransportKind } from '../transport';

function generateRoomCode(): string {
  const num = Math.floor(100 + Math.random() * 900);
  return `FIS-${num}`;
}

export interface UseHostRoomOptions {
  transportMode?: 'auto' | TransportKind;
}

export function useHostRoom({ transportMode = 'auto' }: UseHostRoomOptions = {}) {
  const [lesson, setLesson] = useState(() =>
    Lesson.start(generateRoomCode(), CLASSROOM_MODULES[0], Date.now()),
  );
  const [connected, setConnected] = useState(false);
  const [transportKind, setTransportKind] = useState<TransportKind>('local');
  const lessonRef = useRef(lesson);
  const transportRef = useRef<RoomTransport | null>(null);
  const roomCode = lesson.room.roomCode;

  const dispatch = useCallback((command: Lesson.LessonCommand) => {
    const step = Lesson.apply(lessonRef.current, command, Date.now());
    lessonRef.current = step.state;
    setLesson(step.state);
    for (const event of step.outbox) {
      if (import.meta.env.DEV && event.type === 'room:state') {
        RoomStateSchema.parse(event.state);
      }
      transportRef.current?.sendHostEvent(event);
    }
  }, []);

  useEffect(() => {
    const transport = createRoomTransport(transportMode);
    transportRef.current = transport;
    setTransportKind(transport.kind);
    let active = true;

    const unsub = transport.onClientEvent((event) => {
      if (active) dispatch(event);
    });

    transport
      .connect(roomCode, 'host')
      .then(() => {
        if (!active) return;
        setConnected(true);
        transport.sendHostEvent({
          type: 'room:state',
          state: lessonRef.current.room,
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
  }, [roomCode, transportMode, dispatch]);

  const quizOpen = lesson.room.quizState?.status === 'open';
  const questionId = lesson.room.quizState?.questionId;
  useEffect(() => {
    if (!quizOpen) return;
    const timer = window.setInterval(() => dispatch({ type: 'host:tick' }), 1000);
    return () => window.clearInterval(timer);
  }, [quizOpen, questionId, dispatch]);

  const goToStep = useCallback(
    (stepIndex: number) => dispatch({ type: 'host:go_to_step', stepIndex }),
    [dispatch],
  );

  const selectModule = useCallback(
    (moduleId: string) => {
      const module = getClassroomModuleById(moduleId);
      if (module) dispatch({ type: 'host:select_module', module });
    },
    [dispatch],
  );

  const reportSummary = useMemo(() => Lesson.summarize(lesson), [lesson]);
  const participants = useMemo(
    () => Object.values(lesson.participants),
    [lesson.participants],
  );

  return {
    roomCode,
    module: lesson.module,
    roomState: lesson.room,
    connected,
    transportKind,
    participants,
    reportSummary,
    selectModule,
    goToStep,
    nextStep: () => goToStep(lesson.room.currentStepIndex + 1),
    prevStep: () => goToStep(lesson.room.currentStepIndex - 1),
    revealCurrentQuiz: () => dispatch({ type: 'host:reveal_quiz' }),
    executeChallengeWinner: () => dispatch({ type: 'host:execute_challenge' }),
  };
}
