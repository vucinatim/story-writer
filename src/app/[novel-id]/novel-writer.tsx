"use client";

import { memo, useRef, useState } from "react";
import { useNovelStore } from "@/lib/stores/novels-store";
import { Chapter, Novel, Paragraph } from "@/lib/schemas";
import WriterHUD from "@/components/common/writer-hud";
import { Button } from "@/components/ui/button";
import { Check, Info, Pencil, Plus, Trash2, X } from "lucide-react";
import { generateParagraph } from "../actions/generate-paragraph";
import { readStreamableValue } from "ai/rsc";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/lib/stores/editor-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BubbleMenu, Editor, EditorContent, FloatingMenu } from "@tiptap/react";
import { useTipTapEditor } from "@/hooks/use-tiptap-editor";

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
    const togglePrevPrompt = useEditorStore((state) => state.togglePrevPrompt);
    const [generatedParagraph, setGeneratedParagraph] = useState<string | null>(
      null
    );
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEdited, setIsEdited] = useState(false);

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

    const editor = useTipTapEditor(paragraph.content, (updatedParagraph) => {
      console.log("updatedParagraph", updatedParagraph);
      console.log("paragraph.content", paragraph.content);
      if (updatedParagraph !== paragraph.content) {
        setIsEdited(true);
      } else {
        setIsEdited(false);
      }
    });

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
            onActiveChange?.(false);
          }
        }}
      >
        {/* Display generated paragraph */}
        {/* <div className={cn("text-base text-justify")}>
            <MarkdownRenderer>{displayedParagraph}</MarkdownRenderer>
          </div> */}
        {displayedParagraph && editor && (
          <>
            <TiptapMenu editor={editor} />
            <EditorContent
              editor={editor}
              className="text-base text-justify prose max-w-none"
            />
          </>
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
          actionButtons={[
            {
              icon: <Info />,
              tooltip: "Show previous prompt",
              onClick: togglePrevPrompt,
              isActive: showPrevPrompt,
            },
            {
              icon: <Trash2 />,
              tooltip: "Delete paragraph",
              onClick: () =>
                deleteParagraph(novel.id, chapter.id, paragraph.id),
            },
            {
              icon: <Pencil />,
              tooltip: "Edit paragraph",
              onClick: () => {},
            },
            {
              icon: <X />,
              tooltip: "Revert changes",
              onClick: () => {
                // revert all changes in the editor
                editor?.commands.setContent(paragraph.content);
                setIsEdited(false);
                onActiveChange?.(false);
              },
            },
            {
              icon: <Check />,
              tooltip: "Mark paragraph as done",
              hidden: !isEdited,
              onClick: () => {
                // update paragraph in the store
                updateParagraph(novel.id, chapter.id, paragraph.id, {
                  content: editor?.storage.markdown.getMarkdown(),
                });
                setIsEdited(false);
                // mark paragraph as done
                onActiveChange?.(false);
              },
            },
          ]}
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

const TiptapMenu = memo(({ editor }: { editor: Editor }) => {
  return (
    <>
      <BubbleMenu
        className="bg-white border border-input shadow-sm rounded-full px-3 py-2 text-sm flex items-center gap-3"
        tippyOptions={{ duration: 100 }}
        editor={editor}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "hover:opacity-50",
            editor.isActive("bold") ? "text-sky-500" : ""
          )}
        >
          <span className="font-semibold">Bold</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "hover:opacity-50",
            editor.isActive("italic") ? "is-active" : ""
          )}
        >
          <span className="italic">Italic</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            "hover:opacity-50",
            editor.isActive("strike") ? "is-active" : ""
          )}
        >
          <span className="line-through">Strike</span>
        </button>
      </BubbleMenu>

      <FloatingMenu
        className="floating-menu"
        tippyOptions={{ duration: 100 }}
        editor={editor}
      >
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          Bullet list
        </button>
      </FloatingMenu>
    </>
  );
});

TiptapMenu.displayName = "TiptapMenu";

type ActionButton = {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  isActive?: boolean;
  hidden?: boolean;
};

interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
  chapterIndex: number;
  paragraphIndex: number;
  paragraph: Paragraph;
  actionButtons: ActionButton[];
}

const Toolbar = ({
  isActive,
  className,
  paragraph,
  chapterIndex,
  paragraphIndex,
  actionButtons,
  ...props
}: ToolbarProps) => {
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
      {actionButtons.map(
        (button) =>
          !button.hidden && (
            <Button
              key={button.tooltip}
              data-state={button.isActive ? "open" : "closed"}
              tooltip={button.tooltip}
              variant="icon"
              onClick={button.onClick}
            >
              {button.icon}
            </Button>
          )
      )}
    </div>
  );
};
