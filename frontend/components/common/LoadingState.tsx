"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface LoadingStateProps {
  title: string;
  subtitle?: string;
  targetPercent?: number;
  durationMs?: number;
  onComplete?: () => void;
}

export function LoadingState({
  title,
  subtitle,
  targetPercent = 100,
  durationMs = 2500,
  onComplete,
}: LoadingStateProps) {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const stepTime = 50;
    const totalSteps = durationMs / stepTime;
    const increment = (targetPercent - 15) / totalSteps;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= targetPercent) {
          clearInterval(interval);
          if (onComplete) setTimeout(onComplete, 400);
          return targetPercent;
        }
        return next;
      });
    }, stepTime);

    return () => clearInterval(interval);
  }, [targetPercent, durationMs, onComplete]);

  return (
    <div className="flex min-h-[420px] w-full flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-900 text-neutral-100 shadow-xl border border-neutral-800">
        <Sparkles className="h-10 w-10 animate-pulse text-amber-400" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
          {subtitle}
        </p>
      )}

      <div className="mt-8 w-full max-w-xs">
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full bg-neutral-900 transition-all duration-150 ease-out dark:bg-neutral-100"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>
        <div className="mt-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}
