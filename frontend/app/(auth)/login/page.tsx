export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Log in to FARA</h1>
      <div className="flex flex-col gap-3">
        <button className="rounded-md border border-neutral-700 px-6 py-2 text-sm">
          Sign in with Google
        </button>
        <button className="rounded-md border border-neutral-700 px-6 py-2 text-sm">
          Sign in with GitHub
        </button>
        <button className="rounded-md border border-neutral-700 px-6 py-2 text-sm">
          Sign in with Phone
        </button>
      </div>
    </div>
  );
}
