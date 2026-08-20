export function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input {...props} className="input" />
      {hint ? <span className="field__hint">{hint}</span> : null}
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
    <button type="submit" disabled={pending} className="btn btn--primary w-full justify-center">
      {pending ? "Aguarde…" : children}
    </button>
  );
}

export function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
    >
      {children}
    </p>
  );
}

/** Casca das telas de entrada: login, segundo fator e cadastro do TOTP. */
export function Card({
  title,
  description,
  children,
  wide,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className={`rise w-full ${wide ? "max-w-md" : "max-w-sm"} space-y-6`}>
        <p className="text-center text-sm font-semibold tracking-tight">
          Painel <span className="text-[--amber]">Biancardine</span>
        </p>
        <div className="panel space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="text-sm leading-relaxed text-[--muted]">{description}</p>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
