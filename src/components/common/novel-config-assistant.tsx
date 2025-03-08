"use client";

import { useChat } from "@ai-sdk/react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Novel } from "@/lib/schemas";
import { useNovelStore } from "@/lib/stores/novels-store";
import { cn } from "@/lib/utils";
import { ToolInvocation } from "ai";
import MarkdownRenderer from "./markdown-renderer";
import { AutoScrollContainer } from "./autoscroll-container";
import ChatInput, { UserMessage } from "./chat-input";
import { Settings } from "lucide-react";

interface NovelConfigAssistantProps {
  novel: Novel;
}

export default function NovelConfigAssistant({
  novel,
}: NovelConfigAssistantProps) {
  const updateNovel = useNovelStore((state) => state.updateNovel);
  const { messages, append, status } = useChat({
    id: novel.id,
    api: "/api/novel/config-assistant",
    maxSteps: 2,
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName !== "updateNovelConfig") return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateNovel(novel.id, toolCall.args as any);
    },
  });

  const onSubmit = (message: UserMessage) => {
    append({ content: message.content, role: "user" });
  };

  return (
    <Card className="w-full h-full flex flex-col shadow-none border-none">
      <CardContent className="flex-1 relative">
        <AutoScrollContainer className="absolute inset-0 p-6">
          {messages.map((message) => {
            return message.parts.map((part, index) => {
              if (part.type === "tool-invocation") {
                switch (part.toolInvocation.toolName) {
                  case "updateNovelConfig":
                    return (
                      <ToolCallMessage
                        key={index}
                        toolInvocation={part.toolInvocation}
                        loadingText="Updating your novel..."
                        successText="Novel Updated!"
                      />
                    );
                }
              }

              return (
                <div
                  key={`${index}-${part.type}`}
                  className={cn(
                    "rounded-3xl",
                    message.role === "user" &&
                      "bg-zinc-100 px-4 py-2 self-end max-w-xl"
                  )}
                >
                  <MarkdownRenderer>{message.content}</MarkdownRenderer>
                </div>
              );
            });
          })}
          {status === "submitted" && <WaitingForResponse />}
          {messages.length === 0 && (
            <div className="absolute inset-0 flex flex-col gap-y-2 text-zinc-500 items-center justify-center">
              <p className="font-semibold text-lg">
                Hi 👋, I&apos;m an AI Assistant
              </p>
              <p className="text-sm">
                I&apos;m here to help you create your light novel. Let&apos;s
                get started!
              </p>
              <p className="text-sm">
                Describe your novel here and I will configure it for you.
              </p>
            </div>
          )}
        </AutoScrollContainer>
      </CardContent>
      <CardFooter>
        <ChatInput onSubmit={onSubmit} />
      </CardFooter>
    </Card>
  );
}

const WaitingForResponse = () => {
  return (
    <div className="relative h-9 px-4 flex rounded-3xl bg-zinc-100 text-zinc-400 text-sm self-start">
      <div className="flex h-full gap-x-1 justify-center items-center animate-pulse">
        <span className="sr-only">Loading...</span>
        <div className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

interface ToolCallMessageProps {
  toolInvocation: ToolInvocation;
  loadingText: string;
  successText: string;
}

const ToolCallMessage = ({
  toolInvocation,
  loadingText,
  successText,
}: ToolCallMessageProps) => {
  const status = toolInvocation.state;
  const isLoading = status === "partial-call" || status === "call";

  return (
    <div className="py-2 px-4 rounded-3xl bg-zinc-100 text-zinc-400 text-sm self-start">
      {isLoading ? (
        <div className="flex items-center gap-2">
          <span>
            <Settings className="animate-spin w-4 h-4" />
          </span>
          <span>{loadingText}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span>
            <Settings className="w-4 h-4" />
          </span>
          <span>{successText}</span>
        </div>
      )}
    </div>
  );
};
