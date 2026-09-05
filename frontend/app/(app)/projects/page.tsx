export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-neutral-400">Put your capacities into action</p>
        </div>
        <button className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900">
          + New project
        </button>
      </div>

      <p className="text-sm text-neutral-500">Todavía no tienes proyectos.</p>
    </div>
  );
}
