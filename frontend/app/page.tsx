"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Phone, Cpu, Code2 } from "lucide-react";
import { GithubIcon } from "@/components/common/Icons";

export default function LandingPage() {
  const router = useRouter();

  const handleLogin = () => {
    // Redirige al dashboard autenticado
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="flex h-20 w-full items-center justify-between border-b border-neutral-100 px-8 dark:border-neutral-900">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
            Fara
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-neutral-700 transition hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
          >
            Iniciar sesión
          </Link>
          <button
            onClick={handleLogin}
            className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            Comenzar gratis
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Columna Izquierda: Copy + Auth */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Adaptabilidad continua en el Future of Work
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white leading-[1.15]">
              Convierte tu experiencia en la ventaja que necesitas para lo que viene.
            </h1>

            <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400 max-w-lg leading-relaxed">
              Practica nuevas tecnologías sobre código real que ya escribiste.
              Aprende más rápido, compite contra una IA calibrada y demuestra tu progreso profesional.
            </p>

            {/* Opciones de Registro / Inicio */}
            <div className="mt-8 flex w-full max-w-md flex-col gap-3">
              <button
                onClick={handleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white py-3 px-4 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continuar con Google
              </button>

              <button
                onClick={handleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white py-3 px-4 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                <GithubIcon className="h-5 w-5 text-neutral-900 dark:text-white" />
                Continuar con GitHub
              </button>

              <button
                onClick={handleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white py-3 px-4 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                <Phone className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                Continuar con teléfono
              </button>

              <p className="mt-2 text-center text-xs text-neutral-400">
                Al continuar, aceptas nuestros Términos y Privacidad.
              </p>
            </div>
          </div>

          {/* Columna Derecha: Arte Visual e Ilustración */}
          <div className="flex justify-center">
            <div className="relative flex h-[460px] w-full max-w-[420px] flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100 p-8 shadow-2xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950">
              {/* Bloque geométrico FARA */}
              <div className="flex h-36 w-36 items-center justify-center rounded-3xl bg-neutral-900 text-white shadow-2xl dark:bg-white dark:text-neutral-900">
                <Zap className="h-20 w-20 fill-current" />
              </div>

              {/* Badges flotantes */}
              <div className="absolute -left-4 top-16 flex items-center gap-2.5 rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                <Code2 className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">Código Real</div>
                  <div className="text-[10px] text-neutral-500">Tus propios repos de GitHub</div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-24 flex items-center gap-2.5 rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                <Cpu className="h-5 w-5 text-amber-500" />
                <div className="text-left">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">Modo Versus IA</div>
                  <div className="text-[10px] text-neutral-500">Aprende del debugging real</div>
                </div>
              </div>

              <div className="mt-12 text-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Arquitectura Agéntica
                </span>
                <p className="mt-1 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  Identifica conceptos transferibles vs nuevos en segundos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
