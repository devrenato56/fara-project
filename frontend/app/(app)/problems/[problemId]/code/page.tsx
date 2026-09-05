"use client";

import { use, useState } from "react";
import { CodeEditor } from "@/components/code-editor/CodeEditor";

export default function ProblemCodePage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const { problemId } = use(params);
  const [code, setCode] = useState("# Write your code here!\n");

  return (
    <div className="grid grid-cols-[2fr_1fr] gap-6">
      <div>
        <h1 className="text-xl font-semibold">Problema {problemId}</h1>
        <div className="mt-4">
          <CodeEditor value={code} onChange={setCode} />
        </div>
        <button className="mt-4 rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900">
          Submit
        </button>
      </div>
      <aside className="rounded-md border border-neutral-800 p-4">
        <h2 className="font-medium">Checker</h2>
        <p className="text-sm text-neutral-500">Idle</p>
      </aside>
    </div>
  );
}
