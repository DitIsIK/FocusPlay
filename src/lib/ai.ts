import OpenAI from "openai";
import { z } from "zod";
import { THEMES } from "@/lib/utils";

export const GeneratedChallengeSchema = z
  .object({
    type: z.enum(["quiz", "fact"]),
    theme: z.enum(THEMES),
    question: z.string().max(120).optional(),
    options: z.array(z.string().max(60)).length(4).optional(),
    answerIndex: z.number().int().min(0).max(3).optional(),
    fact: z.string().max(200).optional(),
    source: z.string().max(120).optional()
  })
  .superRefine((value, ctx) => {
    if (value.type === "quiz") {
      if (!value.question) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["question"], message: "Verplicht" });
      }
      if (!value.options) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "Verplicht" });
      }
      if (value.answerIndex === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["answerIndex"], message: "Verplicht" });
      }
    }
    if (value.type === "fact" && !value.fact) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fact"], message: "Verplicht" });
    }
  });

export type GeneratedChallenge = z.infer<typeof GeneratedChallengeSchema>;

const SYSTEM_PROMPT = `Je schrijft ultrakorte, feitelijk kloppende quizvragen (1 vraag, 4 opties, 1 juist) of fun facts (≤200 tekens). Toon lichte humor, PG-13, NL-taal. Output MOET dit JSON schema volgen.`;

export async function generateChallenge(params: { type: "quiz" | "fact"; theme: (typeof THEMES)[number] }) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      {
        role: "user",
        content: JSON.stringify(params)
      }
    ]
  });
  const outputText = response.output_text;
  let raw;
  try {
    raw = JSON.parse(outputText);
  } catch (error) {
    throw new Error("AI output niet parsebaar");
  }
  const parsed = GeneratedChallengeSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("AI output onbruikbaar");
  }
  return parsed.data;
}
