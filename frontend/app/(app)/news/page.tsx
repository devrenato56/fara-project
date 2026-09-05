"use client";

import React from "react";
import { ExternalLink, Clock, Tag } from "lucide-react";
import { MOCK_NEWS } from "@/lib/mock-data";

export default function NewsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          News
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Descubre las nuevas tendencias y actualizaciones tecnológicas día a día.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_NEWS.map((item) => (
          <article
            key={item.id}
            className="flex flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs transition hover:border-neutral-400 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  <Tag className="h-3 w-3" />
                  {item.tag}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.date}
                </span>
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                {item.title}
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                {item.summary}
              </p>
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 hover:underline dark:text-white"
              >
                <span>Ver nota completa en la web</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
