// Global type declaration for the IPC bridge exposed by the preload script.
// Import this file or reference it in tsconfig so the renderer knows the shape
// of window.electronAPI.
import type { FileContent } from "@core/interfaces/types";

declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<FileContent | null>;
    };
  }
}

export {};
