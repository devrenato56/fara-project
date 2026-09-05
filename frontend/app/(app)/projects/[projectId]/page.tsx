export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Proyecto {projectId}</h1>
      <p className="text-sm text-neutral-500">Problemas propuestos: pendiente de generación.</p>
    </div>
  );
}
