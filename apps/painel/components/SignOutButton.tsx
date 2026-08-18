"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await signOut();
        router.replace("/login");
        router.refresh();
      }}
      className="rounded border border-white/15 px-3 py-1.5 text-white/70 transition hover:border-white/30 hover:text-white disabled:opacity-50"
    >
      Sair
    </button>
  );
}
