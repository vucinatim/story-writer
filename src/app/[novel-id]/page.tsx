"use client";

import { useParams } from "next/navigation";

import NovelConfigurator from "./novel-configurator";
import NovelWriter from "./novel-writer";
import { useNovel } from "@/lib/stores/novels-store";
import { useEditorStore } from "@/lib/stores/editor-store";
import { Button } from "@/components/ui/button";

export default function NovelPage() {
  const { "novel-id": novelId } = useParams();
  const novel = useNovel(novelId);
  const setShowSettings = useEditorStore((state) => state.setShowSettings);
  const isSettingsOpen = useEditorStore((state) => state.showSettings);

  if (!novel) return <p className="text-center">Novel not found.</p>;

  return (
    <div className="max-w-3xl h-full w-full mx-auto p-6">
      {isSettingsOpen ? (
        <NovelConfigurator novel={novel} />
      ) : novel.status === "valid" ? (
        <NovelWriter novel={novel} />
      ) : (
        <div className="w-full h-full flex flex-col gap-y-2 text-zinc-500 items-center justify-center">
          <p className="font-semibold">Novel not configured.</p>
          <p className="text-sm">
            Please configure your novel before using the novel writer.
          </p>
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            Open Settings
          </Button>
        </div>
      )}
    </div>
  );
}
