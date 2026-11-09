import { apiFetch } from "../api/client.ts"

export async function requestUserCreation(payload: Record<string, unknown>, fetcher?: typeof fetch): Promise<string> {
  const response = await apiFetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    timeoutMs: 60_000,
    fetcher,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok) {
    const message = result?.error || `La création du compte a échoué (HTTP ${response.status}).`
    throw new Error(result?.existingUserId ? `${message} Compte : ${result.existingUserId}` : message)
  }
  if (response.status !== 201 || result?.ok !== true || typeof result.user?.id_user !== "string" || !result.user.id_user || typeof result.temporaryAccess !== "string" || !result.temporaryAccess) {
    throw new Error(`Création non confirmée (HTTP ${response.status}). Vérifiez la liste des utilisateurs avant de réessayer.`)
  }
  return result.temporaryAccess
}
