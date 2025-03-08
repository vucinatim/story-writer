"use server";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { Novel } from "@/lib/schemas";
import { getContextPrompt } from "@/lib/utils/context-prompt";
import { suggestionPrompt } from "@/lib/utils/suggestion-prompt";

interface Params {
  novel: Novel;
  chapterId: string;
  paragraphId: string;
}

/**
 * Generates 3 possible continuation suggestions based on full novel context.
 */
export async function generateSuggestions(params: Params) {
  const { novel, chapterId, paragraphId } = params;

  const { object: suggestions } = await generateObject({
    model: openai("gpt-4o-mini"),
    system: `
      ${suggestionPrompt}

      - Each suggestion should include:
        - **Title**: A short name summarizing the idea with a leading emoji (always include the emoji).
        - **Continuation Prompt**: A short directive that sets up the next paragraph.
        - **Explanation**: Why this is a good continuation option. (keep this very short)

    --- Novel Context ---
    ${getContextPrompt({
      novel,
      chapterId,
      paragraphId,
    })}
    `,
    prompt: `
      **Generate three possible continuation suggestions.**
    `,
    schema: z.object({
      suggestions: z
        .array(
          z.object({
            title: z.string().min(1, "Title is required"),
            continuationPrompt: z
              .string()
              .min(1, "Continuation prompt is required"),
            explanation: z.string().min(1, "Explanation is required"),
          })
        )
        .min(3)
        .max(3),
    }),
  });

  return suggestions;
}
