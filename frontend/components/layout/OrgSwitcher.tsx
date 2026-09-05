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
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-2.5 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700/60 cursor-pointer"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-slate-300">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="truncate">{currentOrg.name}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
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
          <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800 p-1.5 shadow-xl">
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
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
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors cursor-pointer min-h-[40px] ${
                      isSelected
                        ? "bg-emerald-500/10 font-semibold text-emerald-400"
                        : "text-slate-400 hover:bg-slate-700/60 hover:text-slate-200"
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-1 border-t border-slate-700/60 pt-1">
              {isCreating ? (
                <form onSubmit={handleCreate} className="p-1">
                  <input
                    type="text"
                    placeholder="Nombre de la org..."
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    autoFocus
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
                  />
                  <div className="mt-1.5 flex gap-1">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-emerald-500 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-700 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-500 hover:bg-slate-700/60 hover:text-slate-300 cursor-pointer min-h-[40px]"
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
