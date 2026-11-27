import { z } from 'zod';

export const StepModeSchema = z.enum([
  'lobby_story',
  'quiz',
  'simulation',
  'quiz_prediction',
  'challenge',
  'report',
]);
export type StepMode = z.infer<typeof StepModeSchema>;

export const QuizOptionIdSchema = z.enum(['A', 'B', 'C', 'D']);
export type QuizOptionId = z.infer<typeof QuizOptionIdSchema>;

export const ChallengeOptionIdSchema = z.enum(['1', '2', '3']);
export type ChallengeOptionId = z.infer<typeof ChallengeOptionIdSchema>;

export const EnginePresetValueSchema = z.union([
  z.number(),
  z.string(),
  z.boolean(),
]);
export const EnginePresetSchema = z.record(z.string(), EnginePresetValueSchema);
export type EnginePreset = z.infer<typeof EnginePresetSchema>;

export const QuizQuestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['intuition', 'prediction', 'lightning', 'interdisciplinary']),
  prompt: z.string().min(1),
  timeLimitSec: z.number().int().min(10).max(90).default(25),
  options: z
    .array(
      z.object({
        id: QuizOptionIdSchema,
        text: z.string().min(1),
      }),
    )
    .length(4),
  correctOption: QuizOptionIdSchema,
  explanation: z.string().min(1),
  enginePresetBefore: EnginePresetSchema.optional(),
  enginePresetAfter: EnginePresetSchema.optional(),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const InterdisciplinarySubjectSchema = z.enum([
  'História',
  'Química',
  'Biologia',
  'Matemática',
  'Geografia',
]);
export type InterdisciplinarySubject = z.infer<
  typeof InterdisciplinarySubjectSchema
>;

export const InterdisciplinaryBridgeSchema = z.object({
  subject: InterdisciplinarySubjectSchema,
  themeTag: z.string().min(1),
  connectionHook: z.string().min(1),
  suggestedNextModuleId: z.string().optional(),
  bridgeQuestion: QuizQuestionSchema.optional(),
});
export type InterdisciplinaryBridge = z.infer<
  typeof InterdisciplinaryBridgeSchema
>;

export const CollectiveChallengeSchema = z.object({
  goalDescription: z.string().min(1),
  targetValidationRule: z.string().min(1),
  votingOptions: z
    .array(
      z.object({
        id: ChallengeOptionIdSchema,
        label: z.string().min(1),
        preset: EnginePresetSchema,
        isSuccess: z.boolean(),
      }),
    )
    .length(3),
});
export type CollectiveChallenge = z.infer<typeof CollectiveChallengeSchema>;

export const ModuleCategorySchema = z.enum([
  'Matemática',
  'Mecânica',
  'Termodinâmica',
  'Óptica',
  'Ondulatória',
  'Eletromagnetismo',
  'Física Moderna',
  'Química',
]);
export type ModuleCategory = z.infer<typeof ModuleCategorySchema>;

export const ClassroomModuleSchema = z.object({
  id: z.string().min(1),
  engineId: z.string().min(1), // ID correspondente no engines_registry.json / PHYSICS_EXPERIMENTS
  title: z.string().min(1),
  category: ModuleCategorySchema,
  themeTags: z.array(z.string().min(1)).min(1),
  historicalHook: z.object({
    year: z.string().min(1),
    figure: z.string().min(1),
    shortText: z.string().min(1).max(320),
    visualAssetUrl: z.string().optional(),
  }),
  teacherGuide: z.object({
    openingQuestion: z.string().min(1),
    commonPitfall: z.string().min(1),
  }),
  theoryPill: z.object({
    mythBusted: z.string().min(1),
    ahaInsight: z.string().min(1),
    everydayApp: z.string().min(1),
    formulaLatex: z.string().min(1),
    variablesLegend: z.array(z.string().min(1)).min(1),
  }),
  interdisciplinaryBridges: z.array(InterdisciplinaryBridgeSchema),
  collectiveChallenge: CollectiveChallengeSchema,
  quizzes: z.array(QuizQuestionSchema).min(2),
});
export type ClassroomModule = z.infer<typeof ClassroomModuleSchema>;

// Alias compatível com a nomenclatura da especificação
export type PhysicsClassroomModule = ClassroomModule;

export const RoomStateSchema = z.object({
  roomCode: z.string().min(3),
  moduleId: z.string().min(1),
  playlistId: z.string().optional(),
  currentStepIndex: z.number().int().min(0),
  mode: StepModeSchema,
  quizState: z
    .object({
      questionId: z.string().min(1),
      status: z.enum(['open', 'locked', 'revealed']),
      timeLeft: z.number().int().min(0),
      votesCount: z.record(QuizOptionIdSchema, z.number().int().min(0)),
      correctOption: QuizOptionIdSchema.optional(),
    })
    .optional(),
  challengeVoteState: z
    .object({
      status: z.enum(['open', 'executed']),
      options: z.array(
        z.object({
          id: ChallengeOptionIdSchema,
          label: z.string(),
          preset: EnginePresetSchema,
        }),
      ),
      votesCount: z.record(ChallengeOptionIdSchema, z.number().int().min(0)),
      winningOptionId: ChallengeOptionIdSchema.optional(),
      didClassWin: z.boolean().optional(),
    })
    .optional(),
  enginePreset: EnginePresetSchema.optional(),
  studentsCount: z.number().int().min(0).default(0),
  readyCount: z.number().int().min(0).default(0),
  updatedAt: z.number(),
});
export type RoomState = z.infer<typeof RoomStateSchema>;

// --- Schemas Preparatórios V2 (Trilhas Interdisciplinares & Analytics) ---

export const InterdisciplinaryPlaylistSchema = z.object({
  playlistId: z.string().min(1),
  title: z.string().min(1),
  themeTag: z.string().min(1),
  steps: z.array(
    z.object({
      order: z.number().int().min(1),
      moduleId: z.string().min(1),
      highlightBridgeSubject: InterdisciplinarySubjectSchema.optional(),
      passOutputVariableToNext: z
        .object({
          fromVariable: z.string().min(1),
          toPresetKey: z.string().min(1),
        })
        .optional(),
    }),
  ),
});
export type InterdisciplinaryPlaylist = z.infer<
  typeof InterdisciplinaryPlaylistSchema
>;

export const StudentRecordSchema = z.object({
  studentId: z.string().min(1),
  classId: z.string().min(1),
  displayName: z.string().min(1),
  sessionMetrics: z.array(
    z.object({
      sessionId: z.string(),
      moduleId: z.string(),
      date: z.string(),
      quizAccuracy: z.number().min(0).max(1),
      participatedInChallenge: z.boolean(),
    }),
  ),
  schoolGrades: z.array(
    z.object({
      assessmentId: z.string(),
      title: z.string(),
      date: z.string(),
      score: z.number().min(0).max(10),
      relatedCategory: ModuleCategorySchema.optional(),
    }),
  ),
});
export type StudentRecord = z.infer<typeof StudentRecordSchema>;
