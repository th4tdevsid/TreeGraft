import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import { resolve } from "path";
import { copyFileSync } from "fs";
import type { Plugin } from "vite";

// ---------------------------------------------------------------------------
// wasmMimePlugin
//
// Vite's built-in static server (sirv) does not register application/wasm
// for .wasm files. This plugin:
//   1. In dev: intercepts requests for .wasm files under /tree-sitter/ and
//      sets the correct Content-Type header so WebAssembly streaming compile
//      works (avoiding the graceful-but-slow ArrayBuffer fallback).
//   2. In build: copies tree-sitter.wasm from node_modules into the public
//      assets so it ends up in dist/ for production Electron.
// ---------------------------------------------------------------------------
function wasmMimePlugin(): Plugin {
  return {
    name: "treegraft:wasm-mime",

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith(".wasm")) {
          res.setHeader("Content-Type", "application/wasm");
        }
        next();
      });
    },

    buildStart() {
      // Keep public/tree-sitter/tree-sitter.wasm in sync with installed
      // web-tree-sitter version during every build.
      copyFileSync(
        resolve(__dirname, "node_modules/web-tree-sitter/tree-sitter.wasm"),
        resolve(__dirname, "public/tree-sitter/tree-sitter.wasm"),
      );
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main process entry
        entry: "src/main/index.ts",
        onstart(options) {
          options.startup();
        },
        vite: {
          build: {
            outDir: "dist-electron/main",
            rollupOptions: {
              external: ["electron"],
            },
          },
        },
      },
      {
        // IPC preload (renderer-accessible bridge)
        entry: "src/ipc/index.ts",
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: "dist-electron/ipc",
            rollupOptions: {
              external: ["electron"],
            },
          },
        },
      },
    ]),
    renderer(),
    wasmMimePlugin(),
  ],
  resolve: {
    alias: {
      "@core": resolve(__dirname, "src/core"),
      "@ui": resolve(__dirname, "src/ui"),
      "@ipc": resolve(__dirname, "src/ipc"),
      "@config": resolve(__dirname, "src/config"),
    },
  },
  build: {
    outDir: "dist",
  },
});
