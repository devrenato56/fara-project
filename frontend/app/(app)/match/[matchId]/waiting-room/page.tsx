export default async function WaitingRoomPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;

  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-xl font-semibold">Sala de espera</h1>
      <p className="text-sm text-neutral-500">
        Esperando rival para el match {matchId}...
      </p>
    </div>
  );
}
