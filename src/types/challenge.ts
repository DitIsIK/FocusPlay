import { z } from "zod";
import { THEMES } from "@/lib/utils";

export const ChallengeContentSchema = z.object({
  question: z.string().max(200).optional(),
  options: z.array(z.string().max(120)).optional(),
  answerIndex: z.number().int().min(0).max(3).optional(),
  fact: z.string().max(200).optional(),
  source: z.string().max(120).optional()
});

export const ChallengeSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["quiz", "poll", "fact"]),
  theme: z.enum(THEMES).nullable(),
  content: ChallengeContentSchema,
  author: z.string().uuid().nullable(),
  visibility: z.enum(["global", "friends"]),
  created_at: z.string()
});

export type Challenge = z.infer<typeof ChallengeSchema>;

export const QuizAnswerSchema = z.object({
  challengeId: z.string().uuid(),
  answerIndex: z.number().int().min(0).max(3)
});

export const PollVoteSchema = z.object({
  challengeId: z.string().uuid(),
  choice: z.number().int().min(0)
});

export const CreateChallengeSchema = z.object({
  type: z.enum(["quiz", "poll", "fact"]),
  theme: z.enum(THEMES),
  question: z.string().max(200).optional(),
  options: z.array(z.string().max(120)).optional(),
  answerIndex: z.number().int().min(0).max(3).optional(),
  fact: z.string().max(200).optional()
}).superRefine((value, ctx) => {
  if (value.type === "poll" && (!value.options || value.options.length < 2)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "Poll heeft opties nodig" });
  }
  if (value.type === "quiz") {
    if (!value.question) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["question"], message: "Quiz mist vraag" });
    }
    if (!value.options || value.options.length !== 4) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "Quiz heeft 4 opties nodig" });
    }
    if (value.answerIndex === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["answerIndex"], message: "Quiz mist antwoord" });
    }
  }
  if (value.type === "fact" && !value.fact) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fact"], message: "Fact tekst verplicht" });
  }
});
