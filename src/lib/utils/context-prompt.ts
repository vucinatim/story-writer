import { Chapter, Novel } from "../schemas";

interface GetContextPromptParams {
  novel: Novel;
  chapterId: string;
  paragraphId: string;
}

export const getContextPrompt = ({
  novel,
  chapterId,
  paragraphId,
}: GetContextPromptParams) => {
  const chapterIndex = novel.chapters.findIndex((ch) => ch.id === chapterId);
  if (chapterIndex === -1) {
    console.error("Invalid chapter ID:", chapterId);
    console.error("Chapters:", novel.chapters);
    throw new Error("Invalid chapter ID");
  }
  const chapter = novel.chapters[chapterIndex];

  const paragraphIndex = chapter.paragraphs.findIndex(
    (p) => p.id === paragraphId
  );
  if (paragraphIndex === -1) throw new Error("Invalid paragraph ID");

  // Convert novel config to string
  const novelConfigString = JSON.stringify(novel.config);

  const contextPrompt = `
    **Novel Configuration:**
    ${novelConfigString}

    **Previous Chapters Summary:**
    ${getChaptersSummary({ novel, chapterIndex })}

    **Current Chapter Content:**
    ${getChapterContent({ chapter, paragraphIndex })}
    `;

  console.log("💭 Context Prompt:", contextPrompt);

  return contextPrompt;
};

interface GetChaptersSummaryParams {
  novel: Novel;
  chapterIndex: number;
}
// Generate summaries of previous chapters
const getChaptersSummary = ({
  novel,
  chapterIndex,
}: GetChaptersSummaryParams) => {
  if (chapterIndex === 0) {
    return "This is the first chapter, no previous summary exists.";
  }
  let summary = "";
  for (let i = 0; i < chapterIndex; i++) {
    summary += `Chapter ${i} - ${novel.chapters[i].title}: ${novel.chapters[i].summary}\n`;
  }

  const previousChapter = novel.chapters[chapterIndex - 1];
  const lastParagraph =
    previousChapter.paragraphs[previousChapter.paragraphs.length - 1];

  summary += `Last paragraph in previous chapter: ${lastParagraph.content}`;

  return summary;
};

interface GetChapterContentParams {
  chapter: Chapter;
  paragraphIndex: number;
}
// Get content of current chapter
const getChapterContent = ({
  chapter,
  paragraphIndex,
}: GetChapterContentParams) => {
  if (paragraphIndex === 0) {
    return "This is the first paragraph in this chapter, no previous summary exists.";
  }

  let summary = "";
  for (let i = 0; i < paragraphIndex; i++) {
    summary += `${chapter.paragraphs[i].content}\n`;
  }

  return summary;
};

interface GetCurrentParagraphContentParams {
  novel: Novel;
  chapterId: string;
  paragraphId: string;
}

export const getCurrentParagraphContent = ({
  novel,
  chapterId,
  paragraphId,
}: GetCurrentParagraphContentParams) => {
  const chapter = novel.chapters.find((ch) => ch.id === chapterId);
  if (!chapter) return "";
  const paragraph = chapter.paragraphs.find((p) => p.id === paragraphId);
  if (!paragraph) return "";
  return paragraph.content;
};
