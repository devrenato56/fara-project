"use client";

import React, { useState } from "react";
import { Users, Heart, MessageSquare, Share2, Send, Sparkles } from "lucide-react";
import { MOCK_COMMUNITY_POSTS } from "@/lib/mock-data";
import { useApp } from "@/context/AppContext";

export default function CommunityPage() {
  const { user } = useApp();
  const [posts, setPosts] = useState(MOCK_COMMUNITY_POSTS);
  const [newPostText, setNewPostText] = useState("");

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost = {
      id: `post-${Date.now()}`,
      author: user.username,
      handle: `@${user.username.toLowerCase().replace(/\s+/g, "_")}`,
      avatar: user.avatarUrl || "",
      timeAgo: "Hace un momento",
      content: newPostText.trim(),
      likes: 1,
      comments: 0,
      tags: ["Go", "Fara"],
    };

    setPosts([newPost, ...posts]);
    setNewPostText("");
  };

  const handleLike = (id: string) => {
    setPosts(
      posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Community
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Conecta y aprende con otros desarrolladores que están migrando de stack.
        </p>
      </div>

      {/* Composer de nuevo post */}
      <form
        onSubmit={handleCreatePost}
        className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white dark:bg-white dark:text-neutral-900">
              {user.username.charAt(0)}
            </div>
          )}
          <textarea
            rows={3}
            placeholder="Comparte un snippet, un tip de concurrencia o tu experiencia migrando código..."
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            className="w-full resize-none rounded-xl border border-neutral-200 p-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
          <span className="text-xs text-neutral-400">
            Formato markdown compatible
          </span>
          <button
            type="submit"
            disabled={!newPostText.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            <Send className="h-3.5 w-3.5" />
            Publicar
          </button>
        </div>
      </form>

      {/* Feed de posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {post.avatar ? (
                  <img
                    src={post.avatar}
                    alt={post.author}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white dark:bg-white dark:text-neutral-900">
                    {post.author.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">
                    {post.author}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {post.handle} · {post.timeAgo}
                  </div>
                </div>
              </div>

              <div className="flex gap-1">
                {post.tags?.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
              {post.content}
            </p>

            <div className="mt-5 flex items-center gap-6 border-t border-neutral-100 pt-4 text-xs font-semibold text-neutral-500 dark:border-neutral-800">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-1.5 transition hover:text-rose-600"
              >
                <Heart className="h-4 w-4" />
                <span>{post.likes}</span>
              </button>

              <button className="flex items-center gap-1.5 transition hover:text-neutral-900 dark:hover:text-white">
                <MessageSquare className="h-4 w-4" />
                <span>{post.comments}</span>
              </button>

              <button className="flex items-center gap-1.5 transition hover:text-neutral-900 dark:hover:text-white">
                <Share2 className="h-4 w-4" />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
