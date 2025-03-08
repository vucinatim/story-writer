import { create } from "zustand";

type EditorStore = {
  showSettings: boolean;
  toggleSettings: () => void;
  setShowSettings: (showSettings: boolean) => void;

  showPrevPrompt: boolean;
  togglePrevPrompt: () => void;
  setShowPrevPrompt: (showPrevPrompt: boolean) => void;
};

export const useEditorStore = create<EditorStore>((set) => ({
  showSettings: false, // Default: Settings are hidden
  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
  setShowSettings: (showSettings) =>
    set(() => ({ showSettings: showSettings })),
  showPrevPrompt: false, // Default: Prev prompt is hidden
  togglePrevPrompt: () =>
    set((state) => ({ showPrevPrompt: !state.showPrevPrompt })),
  setShowPrevPrompt: (showPrevPrompt) =>
    set(() => ({ showPrevPrompt: showPrevPrompt })),
}));
