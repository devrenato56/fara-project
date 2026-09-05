export default async function ProjectInvitePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Unirte al proyecto</h1>
      <p className="text-sm text-neutral-500">Invitación al proyecto {projectId}.</p>
      <button className="w-fit rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900">
        Aceptar invitación
      </button>
    </div>
  );
}
