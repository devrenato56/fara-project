export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Bienvenido, username</h1>
        <p className="text-neutral-400">¡Llevas una racha de 0 días!</p>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-medium">Últimos proyectos</h2>
        <p className="text-sm text-neutral-500">Todavía no tienes proyectos.</p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Tecnologías aprendidas este mes</h2>
        <p className="text-sm text-neutral-500">Sin actividad todavía.</p>
      </section>
    </div>
  );
}
