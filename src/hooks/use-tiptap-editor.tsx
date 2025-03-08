import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Paragraph } from "@tiptap/extension-paragraph";
import { TextStyle } from "@tiptap/extension-text-style";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { ListItem } from "@tiptap/extension-list-item";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";

export const useTipTapEditor = (
  content: string,
  onUpdate?: (content: string) => void
) => {
  return useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false, // Disable default lists, use custom ones
        orderedList: false,
      }),
      Markdown, // Enable Markdown support
      Paragraph.extend({
        renderHTML() {
          return ["p", { class: "mt-2 first:mt-0" }, 0]; // Match MarkdownRenderer
        },
      }),
      TextStyle,
      Bold,
      Italic,
      ListItem,
      BulletList.extend({
        renderHTML() {
          return [
            "ul",
            { class: "flex flex-col mb-4 first:mt-0 list-disc pl-5" },
            0,
          ];
        },
      }),
      OrderedList.extend({
        renderHTML() {
          return [
            "ol",
            { class: "flex flex-col mb-4 first:mt-0 list-decimal pl-5" },
            0,
          ];
        },
      }),
    ],
    content,
    autofocus: true,
    editable: true,
    onUpdate: ({ editor }) => onUpdate?.(editor.storage.markdown.getMarkdown()), // Store Markdown format
  });
};
