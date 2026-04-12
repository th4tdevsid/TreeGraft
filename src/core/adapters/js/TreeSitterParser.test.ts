import { describe, it, expect } from "vitest";
import { TreeSitterParser } from "./TreeSitterParser";

const parser = new TreeSitterParser();

describe("TreeSitterParser.detectLanguage", () => {
  it("detects TypeScript from .ts extension", () => {
    expect(parser.detectLanguage("file.ts")).toBe("typescript");
  });

  it("detects TypeScript from .tsx extension", () => {
    expect(parser.detectLanguage("file.tsx")).toBe("typescript");
  });

  it("detects JavaScript from .js extension", () => {
    expect(parser.detectLanguage("file.js")).toBe("javascript");
  });

  it("detects JavaScript from .jsx extension", () => {
    expect(parser.detectLanguage("file.jsx")).toBe("javascript");
  });

  it("detects JavaScript from .mjs extension", () => {
    expect(parser.detectLanguage("file.mjs")).toBe("javascript");
  });

  it("detects JavaScript from .cjs extension", () => {
    expect(parser.detectLanguage("file.cjs")).toBe("javascript");
  });

  it("detects Python from .py extension", () => {
    expect(parser.detectLanguage("file.py")).toBe("python");
  });

  it("detects Java from .java extension", () => {
    expect(parser.detectLanguage("file.java")).toBe("java");
  });

  it("detects Rust from .rs extension", () => {
    expect(parser.detectLanguage("file.rs")).toBe("rust");
  });

  it("returns null for an unknown extension", () => {
    expect(parser.detectLanguage("file.xyz")).toBeNull();
  });

  it("returns null for a file with no extension", () => {
    expect(parser.detectLanguage("Makefile")).toBeNull();
  });

  it("returns null for .txt files", () => {
    expect(parser.detectLanguage("readme.txt")).toBeNull();
  });

  it("is case-insensitive for extensions", () => {
    expect(parser.detectLanguage("FILE.TS")).toBe("typescript");
    expect(parser.detectLanguage("script.PY")).toBe("python");
    expect(parser.detectLanguage("main.RS")).toBe("rust");
  });

  it("handles full paths correctly", () => {
    expect(parser.detectLanguage("/home/user/project/src/main.rs")).toBe(
      "rust",
    );
    expect(parser.detectLanguage("C:\\Users\\dev\\app\\index.ts")).toBe(
      "typescript",
    );
  });
});
