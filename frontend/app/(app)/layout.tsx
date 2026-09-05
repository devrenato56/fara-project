"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 pb-20 md:p-6 lg:p-8 lg:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
