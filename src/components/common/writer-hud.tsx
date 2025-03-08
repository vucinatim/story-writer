"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import ChatInput, { ChatInputRef } from "@/components/common/chat-input";
import { Paragraph } from "@/lib/schemas";

interface WriterHUDProps {
  paragraph: Paragraph;
  onSubmit: (prompt: string) => void;
  isGenerating?: boolean;
  placeholder?: string;
}

const WriterHUD = ({
  paragraph,
  onSubmit,
  isGenerating,
  placeholder,
}: WriterHUDProps) => {
  const chatInputRef = useRef<ChatInputRef>(null);
  const [prompt, setPrompt] = useState<string | null>(paragraph.prompt);

  return (
    <div className="flex flex-col gap-y-2 text-zinc-700 items-center justify-center">
      {/* AI-generated continuation options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center w-full">
        {Array.from({ length: 3 }).map((_, index) => {
          const suggestion =
            paragraph.suggestions && paragraph.suggestions[index];
          return (
            <Button
              key={index}
              disabled={isGenerating}
              className="flex-1 rounded-3xl"
              variant={
                prompt === suggestion?.continuationPrompt
                  ? "default"
                  : "outline"
              }
              onClick={() => {
                if (!suggestion) return;
                chatInputRef.current?.setValue(suggestion?.continuationPrompt);
              }}
            >
              {suggestion?.title ?? (
                <span className="animate-pulse text-zinc-400">
                  Generating...
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Manual input for custom continuation */}
      <div className="w-full">
        <ChatInput
          ref={chatInputRef}
          initialValue={paragraph.prompt}
          placeholder={placeholder}
          onChange={(prompt) => {
            setPrompt(prompt);
          }}
          onSubmit={(message) => {
            onSubmit(message.content);
          }}
        />
      </div>
    </div>
  );
};

export default WriterHUD;
