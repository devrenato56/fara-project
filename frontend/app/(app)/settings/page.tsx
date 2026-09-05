"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { GithubIcon } from "@/components/common/Icons";
import { useApp } from "@/context/AppContext";

export default function SettingsPage() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"perfil" | "preferencias" | "seguridad" | "notificaciones">("perfil");
  const [name, setName] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Personaliza tu perfil, preferencias de desarrollo y seguridad de cuenta.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl border border-neutral-200 bg-white p-1 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 max-w-fit">
        <button
          onClick={() => setActiveTab("perfil")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "perfil"
              ? "bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-900"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          Perfil
        </button>
        <button
          onClick={() => setActiveTab("preferencias")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "preferencias"
              ? "bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-900"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          Preferencias
        </button>
        <button
          onClick={() => setActiveTab("seguridad")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "seguridad"
              ? "bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-900"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          Seguridad
        </button>
        <button
          onClick={() => setActiveTab("notificaciones")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "notificaciones"
              ? "bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-900"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          Notificaciones
        </button>
      </div>

      {/* Formulario de Perfil */}
      <form
        onSubmit={handleSave}
        className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-6"
      >
        {/* Avatar */}
        <div className="flex items-center gap-5 border-b border-neutral-100 pb-6 dark:border-neutral-800">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 text-xl font-bold text-white dark:bg-white dark:text-neutral-900">
              {user.username.charAt(0)}
            </div>
          )}

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Foto de perfil
            </span>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                className="rounded-xl border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Cambiar foto
              </button>
            </div>
          </div>
        </div>

        {/* Campos de texto */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Nombre completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>
        </div>

        {/* Cuentas conectadas */}
        <div className="border-t border-neutral-100 pt-6 dark:border-neutral-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
            Cuentas conectadas
          </label>

          <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <GithubIcon className="h-5 w-5" />
              <div>
                <div className="text-xs font-bold text-neutral-900 dark:text-white">GitHub</div>
                <div className="text-[11px] text-neutral-400">Permisos de lectura en repositorios</div>
              </div>
            </div>
            <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              Conectado
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <Check className="h-4 w-4" />
              Cambios guardados con éxito
            </span>
          )}
          <button
            type="submit"
            className="ml-auto rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
