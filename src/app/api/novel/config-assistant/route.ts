import { streamText, tool, ToolInvocation } from "ai";
import { openai } from "@ai-sdk/openai";
import { UpdateNovelConfigSchema } from "@/lib/schemas";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: ToolInvocation[];
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: Message[] } = await req.json();

    console.log("🚨 UPDATING NOVEL CONFIG MESSAGES:", messages);

    // OpenAI API Call (streaming)
    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: `
        You are an AI that helps users create novels by refining their novel configurations.
        You have to fill out the form using the provided information and the "updateNovelConfig" function.
        If there are any missing details, just come up with the best guess and call the function.
        Make sure to also come up with fitting characters.
        Please call the "updateNovelConfig" function every time and with as much detail as possible.
        Your job is to:
        - **ALWAYS** call the "updateNovelConfig" function when the user provides novel details.
        - **DO NOT JUST RESPOND IN TEXT**; update the config dynamically using the function.
        - WHEN CALLING THE "updateNovelConfig" FUNCTION, ALWAYS USE write out the exact details of the novel config - including whats in the brackets.
        - WHEN CALLING THE "updateNovelConfig" FUNCTION, MAKE SURE TO USE ONLY THE PROVIDED ENUM VALUES FOR THE SELECT FIELDS (Do not come up with new values).
      `,
      messages,
      tools: {
        updateNovelConfig: tool({
          description: "Update the novel config",
          parameters: UpdateNovelConfigSchema,
          execute: async (updates) => {
            console.log("✅ UPDATE NOVEL CONFIG CALLED:", updates);
            // return JSON.stringify(updates);
            return updates;
          },
        }),
      },
      onError({ error }) {
        console.error(error); // your error logging logic here
      },
    });

    // Convert response into a stream
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error generating response:", error);
    return new Response("Error generating response", { status: 500 });
  }
}
