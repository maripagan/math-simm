import { z } from 'zod';
import {
  ChallengeOptionIdSchema,
  QuizOptionIdSchema,
  RoomStateSchema,
} from '../schemas';

const StudentIdSchema = z.string().min(1).max(40);

export const LeaderboardEntrySchema = z.object({
  studentId: z.string(),
  nickname: z.string(),
  score: z.number(),
  correctCount: z.number(),
  rank: z.number(),
});
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

export const ClientToHostEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('student:join'),
    studentId: StudentIdSchema,
    nickname: z.string().trim().min(1).max(24),
  }),
  z.object({
    type: z.literal('student:ready'),
    studentId: StudentIdSchema,
    ready: z.boolean(),
  }),
  z.object({
    type: z.literal('student:quiz_vote'),
    studentId: StudentIdSchema,
    questionId: z.string().min(1),
    optionId: QuizOptionIdSchema,
  }),
  z.object({
    type: z.literal('student:challenge_vote'),
    studentId: StudentIdSchema,
    optionId: ChallengeOptionIdSchema,
  }),
  z.object({
    type: z.literal('student:request_sync'),
    studentId: StudentIdSchema,
  }),
]);
export type ClientToHostEvent = z.infer<typeof ClientToHostEventSchema>;

export const HostToClientEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('room:state'), state: RoomStateSchema }),
  z.object({
    type: z.literal('room:leaderboard'),
    leaderboard: z.array(LeaderboardEntrySchema),
  }),
  z.object({ type: z.literal('room:closed'), reason: z.string().optional() }),
]);
export type HostToClientEvent = z.infer<typeof HostToClientEventSchema>;

export function decodeHostEvent(raw: unknown): HostToClientEvent | null {
  return decode(HostToClientEventSchema, raw);
}

export function decodeClientEvent(raw: unknown): ClientToHostEvent | null {
  return decode(ClientToHostEventSchema, raw);
}

function decode<T>(schema: z.ZodType<T>, raw: unknown): T | null {
  const result = schema.safeParse(raw);
  if (result.success) return result.data;
  console.warn('[classroom] mensagem descartada', describeType(raw), result.error.issues);
  return null;
}

function describeType(raw: unknown): unknown {
  return typeof raw === 'object' && raw !== null && 'type' in raw
    ? (raw as { type: unknown }).type
    : typeof raw;
}
