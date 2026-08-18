import "server-only";

import { headers } from "next/headers";
import { auth } from "./auth";

/** Sessão verificada de verdade: assinatura, validade e usuário no banco. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
