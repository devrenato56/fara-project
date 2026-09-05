"use client";

import React, { useState } from "react";
import { ChevronDown, Check, Plus, Building2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function OrgSwitcher() {
  const { currentOrg, organizations, switchOrg, createOrg } = useApp();
  const [open, setOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    createOrg(newOrgName.trim());
    setNewOrgName("");
    setIsCreating(false);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="truncate font-medium">{currentOrg.name}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => {
              setOpen(false);
              setIsCreating(false);
            }}
          />
          <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Tus Organizaciones
            </div>

            <div className="space-y-0.5">
              {organizations.map((org) => {
                const isSelected = org.id === currentOrg.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrg(org.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition ${
                      isSelected
                        ? "bg-neutral-100 font-semibold text-neutral-900 dark:bg-neutral-800 dark:text-white"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/50"
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-1 border-t border-neutral-100 pt-1 dark:border-neutral-800">
              {isCreating ? (
                <form onSubmit={handleCreate} className="p-1">
                  <input
                    type="text"
                    placeholder="Nombre de la org..."
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    autoFocus
                    className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                  <div className="mt-1.5 flex gap-1">
                    <button
                      type="submit"
                      className="flex-1 rounded bg-neutral-900 py-1 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nueva organización
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
