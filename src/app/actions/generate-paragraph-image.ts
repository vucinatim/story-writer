"use server";

import { generateText, experimental_generateImage as generateImage } from "ai";
import { openai } from "@ai-sdk/openai";
import { Novel } from "@/lib/schemas";
import {
  getContextPrompt,
  getCurrentParagraphContent,
} from "@/lib/utils/context-prompt";

interface Params {
  novel: Novel;
  chapterId: string;
  paragraphId: string;
}

export async function generateParagraphImage({
  novel,
  chapterId,
  paragraphId,
}: Params) {
  "use server";

  try {
    // 1️⃣ Generate a detailed image prompt from OpenAI
    const { text: imagePrompt } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `
        You are a professional AI image generation prompt engineer. 
        You know how to utilize all the prompting tricks for generating stunning images using dall-e-3. 
        Generate a highly detailed image prompt for the current light novel paragraph.
        `,
      prompt: `
        --- Novel Context ---
        ${getContextPrompt({ novel, chapterId, paragraphId })}

        -- Current Paragraph Content --
       ${getCurrentParagraphContent({ novel, chapterId, paragraphId })}

        --- Prompt Generation Instructions ---
        Describe a visually striking scene that represents this paragraph, 
        including setting, lighting, colors, and emotions.
        The images should be aesthetically pleasing and detailed.
        Always focus on depicting the **current** paragraph but make sure that the scene/atmosphere fits the overall story.
        Make sure that your outputted prompt focuses only on describing the scene as concisely as possible.
        `,
    });

    console.log("Generated image prompt:", imagePrompt);

    // 2️⃣ Generate the image using Vercel AI SDK
    const { image } = await generateImage({
      model: openai.image("dall-e-3"),
      prompt: `
      Style: detailed HD modern Anime digital illustrations (sharp focus, beautiful lighting)
      Generate a captivating modern japanese colored anime / manga illustration of a scene described below:
      ${imagePrompt}
      `,
      size: "1024x1024", // Choose size
      providerOptions: {
        openai: { style: "vivid", quality: "hd" }, // High-quality settings
      },
    });

    return image.base64; // Return base64 image data
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}
