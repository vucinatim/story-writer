"use server";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { Chapter } from "@/lib/schemas";

interface Params {
  chapter: Chapter;
}

export async function generateChapterSummary(params: Params) {
  "use server";

  const chapterContent = params.chapter.paragraphs
    .map((p) => p.content)
    .join("\n\n");

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: "Generate a short and concise summary of this light novel chapter.",
    prompt: `This is the chapter content: ${chapterContent}`,
  });

  return text;
}
