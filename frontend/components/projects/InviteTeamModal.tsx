"use client";

import React, { useState } from "react";
import { X, Copy, Check, Users } from "lucide-react";
import { ProjectMember } from "@/types";

interface InviteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteToken?: string;
  projectId: string;
  members: ProjectMember[];
}

export function InviteTeamModal({
  isOpen,
  onClose,
  inviteToken = "inv_fara_task_api_99x",
  projectId,
  members,
}: InviteTeamModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/projects/${projectId}/invite?token=${inviteToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              Tu equipo (Your Team)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Enlace de invitación */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Compartir enlace de invitación
            </label>
            <p className="mt-0.5 text-xs text-neutral-400">
              Permite a otros desarrolladores (incluso externos a la organización) unirse para duelos en este proyecto.
            </p>

            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2 font-mono text-xs text-neutral-700 select-all dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          {/* Miembros actuales */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Miembros del proyecto ({members.length})
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 rounded-xl border border-neutral-100 p-2 dark:border-neutral-800">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  <div className="flex items-center gap-2.5">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.username}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
                        {member.username.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      {member.username}
                    </span>
                  </div>

                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      member.isExternal
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                        : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    {member.isExternal ? "Invitado Externo" : "Miembro Org"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
