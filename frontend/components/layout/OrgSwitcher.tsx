"use client";

import { useState } from "react";
import type { Organization } from "@/types";

// TODO Fase 1: reemplazar por GET /organizations vía Supabase.
const MOCK_ORGANIZATIONS: Organization[] = [
  { id: "1", name: "Renato's org" },
  { id: "2", name: "Tom's org" },
];

export function OrgSwitcher() {
  const [activeOrgId, setActiveOrgId] = useState(MOCK_ORGANIZATIONS[0].id);

  return (
    <select
      value={activeOrgId}
      onChange={(e) => setActiveOrgId(e.target.value)}
      className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
    >
      {MOCK_ORGANIZATIONS.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name} ▾
        </option>
      ))}
    </select>
  );
}
