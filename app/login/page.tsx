"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react"

import { PartnersStrip, type Partner } from "@/components/login/partners-strip"
import { normalizeLoginRedirect } from "@/lib/auth/login-redirect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import styles from "./login.module.css"

const partners: Partner[] = [
  { name: "Association des Comités Nationaux Olympiques d’Afrique", shortName: "ACNOA", logo: "/images/partners/acnoa.jpeg", logoVariant: "standard" },
  { name: "Association des Comités Nationaux Olympiques", shortName: "ANOC", logo: "/images/partners/anoc.jpg", logoVariant: "wide-canvas" },
  { name: "Comité International Olympique", shortName: "CIO", logo: "/images/partners/cio.png", logoVariant: "compact" },
]

type LoginError = "credentials" | "service" | "validation" | null
type SubmissionPhase = "idle" | "request" | "redirect"

const errorMessages: Record<Exclude<LoginError, null>, string> = {
  credentials: "Les informations saisies ne permettent pas d’accéder au système. Vérifiez votre adresse e-mail et votre mot de passe.",
  service: "Le service de connexion est momentanément indisponible. Veuillez réessayer dans quelques instants.",
  validation: "Vérifiez les informations saisies puis réessayez.",
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [phase, setPhase] = useState<SubmissionPhase>("idle")
  const [error, setError] = useState<LoginError>(null)
  const submissionLocked = useRef(false)
  const loading = phase !== "idle"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submissionLocked.current) return
    submissionLocked.current = true
    setError(null)
    setPhase("request")
    let authenticated = false

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) setError("credentials")
        else if (response.status === 400) setError("validation")
        else setError("service")
        return
      }

      const result = await response.json()
      authenticated = true
      setPhase("redirect")
      // Une connexion change l'état d'authentification côté serveur. Une
      // navigation complète évite de réutiliser un arbre RSC préchargé avant
      // la pose du cookie de session, ce qui provoquait un retour vers /login.
      window.location.replace(normalizeLoginRedirect(result.redirectTo))
    } catch {
      setError("service")
    } finally {
      if (!authenticated) {
        submissionLocked.current = false
        setPhase("idle")
      }
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="institution-title">
        <Image src="/images/login/delegation-rdc.jpeg" alt="Délégation sportive de la République démocratique du Congo réunie dans un stade" fill priority sizes="(min-width: 1440px) calc(100vw - 520px), calc(100vw - 440px)" className={styles.heroImage} />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Portail institutionnel du mouvement sportif congolais</p>
          <h1 id="institution-title">Ensemble, portons plus haut les couleurs de la RDC.</h1>
          <p className={styles.introduction}>Une plateforme unifiée pour structurer, administrer et valoriser les données du Comité Olympique Congolais.</p>
        </div>
        <div className={styles.nationalLine} aria-hidden="true" />
      </section>

      <aside className={styles.loginPanel} aria-labelledby="login-title">
        <div className={styles.panelContent}>
          <div className={styles.logoWrap}>
            <Image src="/images/logo-coc.png" alt="Comité Olympique Congolais" width={400} height={570} priority className={styles.cocLogo} />
          </div>
          <div className={styles.welcome}>
            <p className={styles.panelEyebrow}>Espace sécurisé</p>
            <h2 id="login-title">Bienvenue</h2>
            <p>Accédez à votre espace de gestion du Comité Olympique Congolais.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} aria-busy={loading}>
            <div className={styles.field}>
              <Label htmlFor="email">Adresse e-mail</Label>
              <div className={styles.inputWrap}>
                <Mail aria-hidden="true" />
                <Input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading} aria-invalid={error === "credentials" || error === "validation"} required />
              </div>
            </div>

            <div className={styles.field}>
              <Label htmlFor="password">Mot de passe</Label>
              <div className={styles.inputWrap}>
                <LockKeyhole aria-hidden="true" />
                <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} aria-invalid={error === "credentials" || error === "validation"} aria-describedby={error ? "login-error" : undefined} required />
                <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className={styles.messageSlot}>
              {error && <p id="login-error" className={styles.error} role="alert">{errorMessages[error]}</p>}
            </div>
            <Button type="submit" className={styles.submit} disabled={loading}>
              {loading && <LoaderCircle className={styles.spinner} aria-hidden="true" />}
              {phase === "redirect" ? "Redirection en cours…" : loading ? "Connexion en cours…" : "Se connecter"}
            </Button>
          </form>

          <p className={styles.help}>Un problème d’accès ? Contactez l’administrateur du système.</p>
          <p className={styles.signature} aria-label="Design par DS Concept"><span>Design by</span><strong>DS Concept</strong></p>
        </div>
      </aside>

      <PartnersStrip partners={partners} />
    </main>
  )
}
