import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Novel,
  Paragraph,
  NovelConfigSchema,
  NovelStatus,
  UpdateNovelConfig,
  Chapter,
} from "../schemas";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { generateChapterSummary } from "@/app/actions/generate-chapter-summary";
import { generateSuggestions } from "@/app/actions/generate-suggestions";

type NovelStore = {
  novels: Record<string, Novel>;
  getNovel: (id?: string | string[]) => Novel | null;
  createNovel: () => string; // Creates a new novel and returns its ID
  updateNovel: (novelId: string, updates: UpdateNovelConfig) => void;
  deleteNovel: (novelId: string) => void;
  addChapter: (
    novelId: string,
    chapter: Omit<Chapter, "id" | "createdAt" | "editedAt">
  ) => string;
  updateChapter: (
    novelId: string,
    chapterId: string,
    updates: Partial<Chapter>
  ) => void;
  addParagraph: (
    novelId: string,
    chapterId: string,
    paragraph: Omit<Paragraph, "id" | "createdAt" | "editedAt">,
    index?: number
  ) => string;
  updateParagraph: (
    novelId: string,
    chapterId: string,
    paragraphId: string,
    updates: Partial<Paragraph>
  ) => void;
  deleteParagraph: (
    novelId: string,
    chapterId: string,
    paragraphId: string
  ) => void;
};

export const useNovelStore = create<NovelStore>()(
  persist(
    (set, get) => ({
      novels: {},

      /**
       * Get a novel by ID
       */
      getNovel: (id?: string | string[]) => {
        if (Array.isArray(id) || !id) return null;
        return get().novels[id] ?? null;
      },

      /**
       * Create a new novel and return its ID
       */
      createNovel: () => {
        const id = uuidv4();
        const now = new Date().toISOString();

        const newNovel: Novel = {
          id,
          config: {
            title: "New Untitled Novel",
            genre: [],
            writingStyle: "Lighthearted & Comedic",
            characters: [],
            perspective: "First Person (I, me, my)",
            storyLength: "Short Story (Under 10,000 words)",
            blurb: "New novel blurb",
            premise: "New novel premise",
          },
          createdAt: now,
          editedAt: now,
          chapters: [],
          status: "invalid",
        };

        set((state) => ({
          novels: { ...state.novels, [id]: newNovel },
        }));

        return id;
      },

      /**
       * Update novel details and revalidate status
       */
      updateNovel: (novelId, updates) => {
        set((state) => {
          const novel = state.novels[novelId];
          if (!novel) return state;

          const updatedConfig = { ...novel.config, ...updates };
          const isValid = NovelConfigSchema.safeParse(updatedConfig).success;
          const newStatus: NovelStatus = isValid ? "valid" : "invalid";

          return {
            novels: {
              ...state.novels,
              [novelId]: {
                ...novel,
                config: updatedConfig,
                editedAt: new Date().toISOString(),
                status: newStatus,
              },
            },
          };
        });
      },

      /**
       * Delete a novel
       */
      deleteNovel: (novelId) => {
        set((state) => {
          const newNovels = { ...state.novels };
          delete newNovels[novelId];
          return { novels: newNovels };
        });
      },

      /**
       * Add a chapter to a novel
       */
      addChapter: (novelId, chapter) => {
        const id = uuidv4();
        set((state) => {
          const novel = state.novels[novelId];
          if (!novel) return state;
          const now = new Date().toISOString();
          const newChapter = {
            ...chapter,
            id,
            createdAt: now,
            editedAt: now,
          };

          return {
            novels: {
              ...state.novels,
              [novelId]: {
                ...novel,
                chapters: [...novel.chapters, newChapter],
                editedAt: now,
              },
            },
          };
        });

        return id;
      },

      /**
       * Update a chapter
       */
      updateChapter: (novelId, chapterId, updates) => {
        set((state) => {
          const novel = state.novels[novelId];
          if (!novel) return state;
          const now = new Date().toISOString();
          const chapter = novel.chapters.find((ch) => ch.id === chapterId);
          if (!chapter) return state;

          const newChapter = { ...chapter, ...updates, editedAt: now };

          return {
            novels: {
              ...state.novels,
              [novelId]: {
                ...novel,
                chapters: novel.chapters.map((ch) =>
                  ch.id === chapterId ? newChapter : ch
                ),
                editedAt: now,
              },
            },
          };
        });
      },

      /**
       * Add a paragraph to a chapter
       */
      addParagraph: (novelId, chapterId, paragraph, index) => {
        const id = uuidv4();
        const novel = get().novels[novelId];
        if (!novel) throw new Error(`Novel with ID [${novelId}] not found!`);
        const now = new Date().toISOString();
        const chapter = novel.chapters.find((ch) => ch.id === chapterId);
        if (!chapter)
          throw new Error(`Chapter with ID [${chapterId}] not found!`);

        const newParagraphIndex = index ?? chapter.paragraphs.length;

        const newParagraph = {
          ...paragraph,
          id,
          createdAt: now,
          editedAt: now,
        };

        const updatedNovel = {
          ...novel,
          chapters: novel.chapters.map((ch) =>
            ch.id === chapterId
              ? // Add paragraph at the specified index
                {
                  ...ch,
                  paragraphs: [
                    ...ch.paragraphs.slice(0, newParagraphIndex),
                    newParagraph,
                    ...ch.paragraphs.slice(newParagraphIndex),
                  ],
                }
              : ch
          ),
          editedAt: now,
        };

        set((state) => {
          return {
            novels: {
              ...state.novels,
              [novelId]: updatedNovel,
            },
          };
        });

        // Generate suggestions
        generateSuggestions({
          novel: updatedNovel,
          chapterId,
          paragraphId: id,
        }).then(({ suggestions }) =>
          get().updateParagraph(novelId, chapterId, id, {
            suggestions,
          })
        );

        return id;
      },

      /**
       * Update a paragraph
       */
      updateParagraph: async (novelId, chapterId, paragraphId, updates) => {
        const novel = get().novels[novelId];
        if (!novel) return;
        const now = new Date().toISOString();
        const chapter = novel.chapters.find((ch) => ch.id === chapterId);
        if (!chapter) return;
        const paragraph = chapter.paragraphs.find((p) => p.id === paragraphId);
        if (!paragraph) return;
        set((state) => {
          const newParagraph = { ...paragraph, ...updates, editedAt: now };

          return {
            novels: {
              ...state.novels,
              [novelId]: {
                ...novel,
                chapters: novel.chapters.map((ch) =>
                  ch.id === chapterId
                    ? {
                        ...ch,
                        paragraphs: ch.paragraphs.map((p) =>
                          p.id === paragraphId ? newParagraph : p
                        ),
                      }
                    : ch
                ),
                editedAt: now,
              },
            },
          };
        });
        // Update chapter summary
        const newSummary = await generateChapterSummary({
          chapter,
        });
        get().updateChapter(novelId, chapterId, {
          summary: newSummary,
        });
      },

      /**
       * Delete a paragraph
       */
      deleteParagraph: (novelId, chapterId, paragraphId) => {
        set((state) => {
          const novel = state.novels[novelId];
          if (!novel) return state;
          const now = new Date().toISOString();
          const chapter = novel.chapters.find((ch) => ch.id === chapterId);
          if (!chapter) return state;
          const paragraph = chapter.paragraphs.find(
            (p) => p.id === paragraphId
          );
          if (!paragraph) return state;

          const newChapter = {
            ...chapter,
            paragraphs: chapter.paragraphs.filter((p) => p.id !== paragraphId),
          };

          return {
            novels: {
              ...state.novels,
              [novelId]: {
                ...novel,
                chapters: novel.chapters.map((ch) =>
                  ch.id === chapterId ? newChapter : ch
                ),
                editedAt: now,
              },
            },
          };
        });
      },
    }),
    {
      name: "novel-storage", // Persist novel data in local storage
    }
  )
);

/**
 * Format dates for UI display
 */
export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const useNovel = (id?: string | string[]) => {
  const novels = useNovelStore((state) => state.novels);
  const [novel, setNovel] = useState<Novel | null>(null);

  useEffect(() => {
    if (Array.isArray(id) || !id) return;
    setNovel(novels[id] ?? null);
  }, [id, novels]);

  return novel;
};
