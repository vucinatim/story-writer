"use client";

import { memo, useRef, useState } from "react";
import { useNovelStore } from "@/lib/stores/novels-store";
import { Chapter, Novel, Paragraph } from "@/lib/schemas";
import WriterHUD from "@/components/common/writer-hud";
import { Button } from "@/components/ui/button";
import { Check, Info, Pencil, Plus, Trash2 } from "lucide-react";
import { generateParagraph } from "../actions/generate-paragraph";
import { readStreamableValue } from "ai/rsc";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "@/components/common/markdown-renderer";
import { useEditorStore } from "@/lib/stores/editor-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NovelWriterProps {
  novel: Novel;
}

const NovelWriter = ({ novel }: NovelWriterProps) => {
  const addParagraph = useNovelStore((state) => state.addParagraph);
  const addChapter = useNovelStore((state) => state.addChapter);
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(
    null
  );

  const isIndexActive = (chapterIndex: number, paragraphIndex: number) => {
    const paragraph = novel.chapters[chapterIndex].paragraphs[paragraphIndex];
    return paragraph?.id === activeParagraphId;
  };

  return (
    <div className="flex flex-col gap-y-4 items-center justify-center py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">
        {novel.config.title}
      </h1>
      <div className="flex flex-col gap-y-4 w-full max-w-3xl">
        {novel.chapters.map((chapter, chapterIndex) => (
          <div key={chapter.id} className="flex flex-col">
            <div>
              <h2 className="text-lg font-semibold text-center text-zinc-400">
                Chapter {chapterIndex + 1}
              </h2>
              <h2 className="text-2xl font-bold text-center">
                {chapter.title}
              </h2>
              <p className="text-xs italic text-zinc-400 mt-4 text-justify">
                {chapter.summary}
              </p>
            </div>
            <div>
              {chapter.paragraphs.map((paragraph, paragraphIndex) => (
                <div key={paragraph.id}>
                  <div
                    className={cn(
                      "relative w-full py-6 opacity-70 md:opacity-0 hover:opacity-100 transition-opacity",
                      (paragraph.id === activeParagraphId ||
                        isIndexActive(chapterIndex, paragraphIndex - 1)) &&
                        "invisible",
                      paragraph.id === activeParagraphId && "py-2"
                    )}
                  >
                    <div className="h-px w-full bg-border" />
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute left-1/2 rounded-full -translate-y-1/2 -translate-x-1/2 p-2 bg-white border flex items-center justify-center"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        const newParagraphId = addParagraph(
                          novel.id,
                          chapter.id,
                          {
                            content: "Empty paragraph",
                            prompt: "no prompt",
                          },
                          paragraphIndex
                        );
                        setActiveParagraphId(newParagraphId);
                      }}
                    >
                      <Plus />
                    </Button>
                  </div>
                  <NovelParagraph
                    novel={novel}
                    chapter={chapter}
                    chapterIndex={chapterIndex}
                    paragraph={paragraph}
                    paragraphIndex={paragraphIndex}
                    isActive={paragraph.id === activeParagraphId}
                    onActiveChange={(isActive) => {
                      if (isActive) {
                        setActiveParagraphId(paragraph.id);
                      } else {
                        setActiveParagraphId(null);
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            <Button
              data-ignore-blur
              variant="outline"
              className="rounded-3xl py-6 mt-8 font-bold text-zinc-500"
              onClick={() => {
                const newParagraphId = addParagraph(novel.id, chapter.id, {
                  content: "Empty paragraph",
                  prompt: "no prompt",
                });
                setActiveParagraphId(newParagraphId);
              }}
            >
              <Plus strokeWidth={3} /> Add Paragraph
            </Button>
            <div className="flex items-center gap-x-6 justify-between py-20">
              <div className="flex-1 h-px bg-zinc-300" />
              <p className="font-semibold text-sm text-zinc-400">
                End of chapter {chapterIndex + 1}
              </p>
              <div className="flex-1 h-px bg-zinc-300" />
            </div>
          </div>
        ))}
        <Button
          data-ignore-blur
          variant="outline"
          className="rounded-3xl py-6 font-bold text-zinc-500"
          onClick={() => {
            addChapter(novel.id, {
              title: "Chapter Title",
              summary: "",
              paragraphs: [],
            });
          }}
        >
          <Plus strokeWidth={3} /> Add Chapter
        </Button>
      </div>
    </div>
  );
};

export default NovelWriter;

interface NovelParagraphProps {
  novel: Novel;
  chapter: Chapter;
  chapterIndex: number;
  paragraph: Paragraph;
  paragraphIndex: number;
  isActive?: boolean;
  onActiveChange?: (isActive: boolean) => void;
}

const NovelParagraph = memo(
  ({
    novel,
    chapter,
    chapterIndex,
    paragraph,
    paragraphIndex,
    isActive,
    onActiveChange,
  }: NovelParagraphProps) => {
    const paragraphRef = useRef<HTMLDivElement | null>(null);
    const updateParagraph = useNovelStore((state) => state.updateParagraph);
    const deleteParagraph = useNovelStore((state) => state.deleteParagraph);
    const showPrevPrompt = useEditorStore((state) => state.showPrevPrompt);
    const [generatedParagraph, setGeneratedParagraph] = useState<string | null>(
      null
    );
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateParagraph = async (prompt: string) => {
      setIsGenerating(true);
      setGeneratedParagraph("");

      let newParagraph = ""; // Local variable to store the generated text

      const { output } = await generateParagraph({
        novel,
        chapterId: chapter.id,
        paragraphId: paragraph.id,
        prompt,
      });

      for await (const delta of readStreamableValue(output)) {
        newParagraph += delta; // Append streamed content to local variable
        setGeneratedParagraph(newParagraph); // Update state
      }

      setIsGenerating(false);
      setGeneratedParagraph(null);

      updateParagraph(novel.id, chapter.id, paragraph.id, {
        content: newParagraph, // Use local variable instead of state
        prompt,
      });
    };

    const displayedParagraph = generatedParagraph ?? paragraph.content;

    return (
      <div
        key={paragraph.id}
        ref={paragraphRef}
        tabIndex={0} // Makes the div focusable
        className={cn(
          "relative text-zinc-700 space-y-2",
          isActive &&
            "outline outline-zinc-500 rounded-3xl p-4 -mx-4 mt-4 text-black"
        )}
        onFocus={() => {
          onActiveChange?.(true);
        }}
        onBlur={(event) => {
          const nextFocusedElement = event.relatedTarget as HTMLElement | null;

          // 🛑 Ignore blur if clicking a button or other interactive elements
          if (nextFocusedElement?.dataset.ignoreBlur) return;

          // Only deactivate if the next focused element is outside the paragraph
          if (!paragraphRef.current?.contains(nextFocusedElement)) {
            // onActiveChange?.(false);
          }
        }}
      >
        {/* Display generated paragraph */}
        {displayedParagraph && (
          <div className={cn("text-base text-justify pb-2")}>
            <MarkdownRenderer>{displayedParagraph}</MarkdownRenderer>
          </div>
        )}
        {showPrevPrompt && isActive && (
          <p className="text-xs text-gray-500 italic p-4 bg-zinc-50 rounded-xl">
            <span className="font-semibold not-italic">Prompt:</span>{" "}
            {paragraph.prompt}
          </p>
        )}
        <Toolbar
          isActive={isActive}
          paragraph={paragraph}
          chapterIndex={chapterIndex}
          paragraphIndex={paragraphIndex}
          onDelete={() => deleteParagraph(novel.id, chapter.id, paragraph.id)}
          onEdit={() => {}}
          onMarkDone={() => {}}
        />
        {isActive && (
          <div>
            <WriterHUD
              paragraph={paragraph}
              placeholder="What should this paragraph be about?"
              onSubmit={handleGenerateParagraph}
              isGenerating={isGenerating}
            />
          </div>
        )}
      </div>
    );
  }
);

NovelParagraph.displayName = "NovelParagraph";

interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
  chapterIndex: number;
  paragraphIndex: number;
  paragraph: Paragraph;
  onDelete: () => void;
  onEdit: () => void;
  onMarkDone: () => void;
}

const Toolbar = ({
  isActive,
  className,
  paragraph,
  chapterIndex,
  paragraphIndex,
  onDelete,
  onEdit,
  onMarkDone,
  ...props
}: ToolbarProps) => {
  const showPrevPrompt = useEditorStore((state) => state.showPrevPrompt);
  const togglePrevPrompt = useEditorStore((state) => state.togglePrevPrompt);
  return (
    <div
      className={cn(
        "sticky items-center z-10 justify-center bottom-2 rounded-full w-full hidden border border-input bg-background shadow-sm",
        isActive && "flex",
        className
      )}
      {...props}
    >
      <div className="px-4 flex items-center grow gap-x-2 text-xs text-zinc-500">
        <span>
          Ch <span className="font-semibold">{chapterIndex + 1}</span> | Pa{" "}
          <span className="font-semibold">{paragraphIndex + 1}</span>
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-zinc-400">
                {`(${paragraph.content.length.toLocaleString("en-US", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                })} Words)`}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>This paragraph has {paragraph.content.length} words.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Button
        data-state={showPrevPrompt ? "open" : "closed"}
        tooltip="Show previous prompt"
        variant="icon"
        onClick={togglePrevPrompt}
      >
        <Info />
      </Button>
      <Button variant="icon" tooltip="Delete paragraph" onClick={onDelete}>
        <Trash2 />
      </Button>
      <Button variant="icon" tooltip="Edit paragraph" onClick={onEdit}>
        <Pencil />
      </Button>
      <Button
        variant="icon"
        tooltip="Mark paragraph as done"
        onClick={onMarkDone}
      >
        <Check />
      </Button>
    </div>
  );
};
