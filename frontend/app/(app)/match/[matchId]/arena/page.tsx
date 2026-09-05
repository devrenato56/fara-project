"use client";

import { use, useState } from "react";
import { CodeEditor } from "@/components/code-editor/CodeEditor";

export default function ArenaPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const [code, setCode] = useState("# Write your code here!\n");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Arena — Match {matchId}</h1>
        <span className="font-mono text-lg">5:00</span>
      </div>
      <CodeEditor value={code} onChange={setCode} />
      <button className="w-fit rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900">
        Submit
      </button>
    </div>
  );
}
