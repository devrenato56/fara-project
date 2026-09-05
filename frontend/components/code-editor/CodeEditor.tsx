"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  height?: string;
}

export function CodeEditor({ value, onChange, language = "python", height = "24rem" }: CodeEditorProps) {
  return (
    <div className="overflow-hidden rounded-md border border-neutral-800">
      <Editor
        height={height}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange?.(v ?? "")}
        options={{ minimap: { enabled: false }, fontSize: 14 }}
      />
    </div>
  );
}
