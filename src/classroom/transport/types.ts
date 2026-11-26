import {
  ChallengeOptionId,
  QuizOptionId,
  RoomState,
} from '../schemas';

export interface StudentParticipant {
  studentId: string;
  nickname: string;
  ready: boolean;
  joinedAt: number;
  score: number;
  correctCount: number;
  answeredCount: number;
}

export interface LeaderboardEntry {
  studentId: string;
  nickname: string;
  score: number;
  correctCount: number;
  rank: number;
}

export type ClientToHostEvent =
  | {
      type: 'student:join';
      studentId: string;
      nickname: string;
    }
  | {
      type: 'student:ready';
      studentId: string;
      ready: boolean;
    }
  | {
      type: 'student:quiz_vote';
      studentId: string;
      questionId: string;
      optionId: QuizOptionId;
    }
  | {
      type: 'student:challenge_vote';
      studentId: string;
      optionId: ChallengeOptionId;
    }
  | {
      type: 'student:request_sync';
      studentId: string;
    };

export type HostToClientEvent =
  | {
      type: 'room:state';
      state: RoomState;
    }
  | {
      type: 'room:leaderboard';
      leaderboard: LeaderboardEntry[];
    }
  | {
      type: 'room:closed';
      reason?: string;
    };

export type TransportKind = 'local' | 'supabase';

export interface RoomTransport {
  readonly kind: TransportKind;
  connect(roomCode: string, role: 'host' | 'student'): Promise<void>;
  disconnect(): Promise<void>;
  sendHostEvent(event: HostToClientEvent): void;
  sendClientEvent(event: ClientToHostEvent): void;
  onHostEvent(handler: (event: HostToClientEvent) => void): () => void;
  onClientEvent(handler: (event: ClientToHostEvent) => void): () => void;
}
