import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { novelText, continuationType } = await req.json();

    const prompt = `You are an AI that writes interactive light novels.
    Continue the following novel with a compelling next paragraph.
    Previous Text: ${novelText}
    Continuation Type: ${continuationType}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a novel writer. Write immersive and engaging continuation paragraphs.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    return NextResponse.json({
      paragraph: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error continuing novel:", error);
    return NextResponse.json(
      { error: "Failed to continue novel." },
      { status: 500 }
    );
  }
}
