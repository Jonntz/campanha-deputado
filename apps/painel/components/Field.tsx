export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-white/70">{label}</span>
      <input
        {...props}
        className="w-full rounded border border-white/15 bg-black/30 px-3 py-2 outline-none transition focus:border-[var(--color-brand)]"
      />
    </label>
  );
}

export function Submit({
  children,
  pending,
}: {
  children: React.ReactNode;
  pending?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-[var(--color-brand)] px-4 py-2 font-medium text-white transition hover:brightness-110 disabled:opacity-50"
    >
      {pending ? "Aguarde…" : children}
    </button>
  );
}

export function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
    >
      {children}
    </p>
  );
}

export function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto mt-24 w-full max-w-sm space-y-6 rounded-lg border border-white/10 bg-black/20 p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-white/60">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
