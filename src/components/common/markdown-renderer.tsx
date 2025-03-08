import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // GitHub-flavored markdown

const MarkdownRenderer = memo(({ children }: { children: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]} // Enable GitHub-style markdown (tables, strikethrough, etc.)
      components={{
        p({ children }) {
          return <p className="mt-2 first:mt-0">{children}</p>;
        },
        em({ children }) {
          return <em>{children}</em>;
        },
        ul({ children }) {
          return <ul className="flex flex-col mb-4 first:mt-0">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="flex flex-col mb-4 first:mt-0">{children}</ol>;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
});

MarkdownRenderer.displayName = "MarkdownRenderer";

export default MarkdownRenderer;
