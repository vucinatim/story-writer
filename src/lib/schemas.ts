import { z } from "zod";
import {
  personalityTypes,
  speechStyles,
  coreMotivations,
} from "./character-options";
import {
  genres,
  writingStyles,
  perspectives,
  storyLengths,
} from "./novel-options";

/**
 * Continuation Suggestion Schema
 */
export const ContinuationSuggestionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  continuationPrompt: z.string().min(1, "Continuation prompt is required"),
  explanation: z.string().min(1, "Explanation is required"),
});
export type ContinuationSuggestion = z.infer<
  typeof ContinuationSuggestionSchema
>;

/**
 * Paragraph Schema
 */
export const ParagraphSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1, "Content cannot be empty"),
  prompt: z.string().min(1, "Prompt cannot be empty"),
  suggestions: z.array(ContinuationSuggestionSchema).min(3).max(3).optional(),
  image: z.string().optional(),
  createdAt: z.string().datetime(),
  editedAt: z.string().datetime(),
});
export type Paragraph = z.infer<typeof ParagraphSchema>;

/**
 * Chapter Schema
 */
export const ChapterSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Chapter title cannot be empty"),
  summary: z.string(),
  paragraphs: z
    .array(ParagraphSchema)
    .min(1, "Each chapter must have at least one paragraph"),
});
export type Chapter = z.infer<typeof ChapterSchema>;

/**
 * Character Schema
 */
export const CharacterSchema = z.object({
  name: z.string().min(1, "Character name is required"),
  personality: z.enum(personalityTypes), // Ensure personality is one of the predefined types
  speechStyle: z.enum(speechStyles), // Validate speech style
  coreMotivation: z.enum(coreMotivations), // Validate core motivation
  appearance: z.string().min(1, "Appearance description is required"),
  bio: z.string().optional(),
});
export type Character = z.infer<typeof CharacterSchema>;

/**
 * Novel Config Schema
 */
export const NovelConfigSchema = z.object({
  title: z.string().min(1, "Title is required"),
  blurb: z.string().min(1, "Blurb is required"),
  premise: z.string().min(1, "Story premise is required"),
  genre: z
    .array(z.enum(genres)) // Ensure genre is from the predefined list
    .min(1, "At least one genre must be selected"),
  writingStyle: z.enum(writingStyles), // Writing style must match the predefined values
  characters: z.array(CharacterSchema),
  perspective: z.enum(perspectives), // Perspective must be valid
  storyLength: z.enum(storyLengths), // Validate story length
});
export type NovelConfig = z.infer<typeof NovelConfigSchema>;

/**
 * Novel Status
 */
export const NovelStatusSchema = z.enum(["valid", "invalid"]);
export type NovelStatus = z.infer<typeof NovelStatusSchema>;

/**
 * Novel Schema
 */
export const NovelSchema = z.object({
  id: z.string().uuid(),
  status: NovelStatusSchema,
  config: NovelConfigSchema,
  createdAt: z.string().datetime(),
  editedAt: z.string().datetime(),
  chapters: z
    .array(ChapterSchema)
    .min(1, "A novel must have at least one chapter"),
});
export type Novel = z.infer<typeof NovelSchema>;

/**
 * Update Novel Schema (for Partial Updates)
 */
export const UpdateNovelConfigSchema = NovelConfigSchema.partial();
export type UpdateNovelConfig = z.infer<typeof UpdateNovelConfigSchema>;
