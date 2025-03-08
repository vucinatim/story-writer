"use server";

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "ai/rsc";
import { Novel } from "@/lib/schemas";
import { getContextPrompt } from "@/lib/utils/context-prompt";
import { guidePrompt } from "@/lib/utils/guide-prompt";
import { continuationPrompt } from "@/lib/utils/continuation-prompt";

interface Params {
  novel: Novel;
  chapterId: string;
  paragraphId: string;
  prompt: string;
}

/**
 * Generates the next paragraph with full context from the novel.
 */
export async function generateParagraph(params: Params) {
  const { novel, chapterId, paragraphId, prompt } = params;
  const stream = createStreamableValue("");

  (async () => {
    const { textStream } = streamText({
      model: openai("gpt-4o-mini"),
      system: `
      ${guidePrompt}
      
      ${continuationPrompt}

      --- Novel Context ---
      ${getContextPrompt({
        novel,
        chapterId,
        paragraphId,
      })}

      Remember that this is fiction - used for storytelling so some things may be some horrific scenes (e.g. violence, gore, etc.). Ž
      But remember that these things are only being depicted to create an enticing narrative for the reader.
      
      You should continue the story in the way the **continuation prompt** suggests.
    `,
      prompt: `
        Generate the next paragraph with the following **continuation prompt**: 
        ${prompt}
        `,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}
