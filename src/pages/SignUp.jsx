import butterfly from "../assets/butterfly.png";
import { useEffect, useRef, useState } from "react";
import { apiRequest, saveSession } from "../api/client";
import "./SignUp.css";

function SignUp({ setPage }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmation: "", code: "" });
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const sending = useRef(false);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (sending.current) return;
    setError("");
    if (form.password !== form.confirmation) { setError("Les mots de passe ne correspondent pas."); return; }
    const [firstName, ...lastNameParts] = form.name.trim().split(/\s+/);
    if (!firstName || firstName.length > 60 || lastNameParts.join(" ").length > 60) { setError("Le prénom et le nom doivent chacun contenir au maximum 60 caractères."); return; }
    sending.current = true;
    setBusy(true);
    try {
      if (!codeSent) {
        const result = await apiRequest("/auth/register", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password, firstName, ...(lastNameParts.length ? { lastName: lastNameParts.join(" ") } : {}) }) });
        setCooldown(result.cooldownSeconds || 60);
        setCodeSent(true);
      } else {
        const result = await apiRequest("/auth/verify-email-code", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password, firstName, ...(lastNameParts.length ? { lastName: lastNameParts.join(" ") } : {}), code: form.code }) });
        if (!result?.token || !result?.user) throw new Error("La validation n’a pas retourné de session. Veuillez réessayer.");
        saveSession(result);
        setPage("Dashboard");
      }
    } catch (err) { setError(err.message); }
    finally { sending.current = false; setBusy(false); }
  }

  return (
    <main className="signup-page">
      <header className="signup-header">
        <button
          className="signup-brand"
          type="button"
          onClick={() => setPage("Home")}
        >
          <img src={butterfly} alt="Logo TaskFlow" />
          <span>
            Task<span className="signup-brand-pink">Flow</span>
          </span>
        </button>

        <button
          className="signup-back-button"
          type="button"
          onClick={() => setPage("Home")}
        >
          ← Retour à l'accueil
        </button>
      </header>

      <section className="signup-content">
        <div className="signup-card">
          <div className="signup-icon">✿</div>

          <p className="signup-eyebrow">REJOIGNEZ TASKFLOW</p>

          <h1>Créez votre compte</h1>

          <p className="signup-description">
            Rejoignez votre équipe et organisez vos projets
            dans un espace de travail unique.
          </p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="signup-field">
              <label htmlFor="signup-name">Nom complet</label>

              <input
                id="signup-name"
                type="text"
                placeholder="Votre nom complet"
                required maxLength={121} autoComplete="name" value={form.name} readOnly={codeSent || busy} onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-email">Adresse e-mail</label>

              <input
                id="signup-email"
                type="email"
                placeholder="exemple@email.com"
                required maxLength={254} autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} readOnly={codeSent || busy}
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-password">Mot de passe</label>

              <input
                id="signup-password"
                type="password"
                placeholder="Choisissez un mot de passe"
                minLength={8}
                required maxLength={128} autoComplete="new-password" value={form.password} readOnly={codeSent || busy} onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <small>8 caractères minimum.</small>
            </div>

            <div className="signup-field">
              <label htmlFor="signup-confirm-password">
                Confirmer le mot de passe
              </label>

              <input
                id="signup-confirm-password"
                type="password"
                placeholder="Répétez votre mot de passe"
                minLength={8}
                required maxLength={128} autoComplete="new-password" value={form.confirmation} readOnly={codeSent || busy} onChange={(e) => setForm({ ...form, confirmation: e.target.value })}
              />
            </div>

            {codeSent && <div className="signup-field"><label htmlFor="signup-code">Code reçu par e-mail</label><input id="signup-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{4}" maxLength={4} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, "").slice(0, 4) })} required /><small>Entrez le code à quatre chiffres envoyé à votre adresse.</small></div>}
            {error && <p role="alert" className="form-error">{error}</p>}
            {codeSent && <div className="account-actions"><button type="button" className="text-button" disabled={busy || cooldown > 0} onClick={async () => {
              if (sending.current) return;
              sending.current = true; setBusy(true); setError("");
              try { const result = await apiRequest("/auth/send-verification-code", { method: "POST", body: JSON.stringify({ email: form.email, firstName: form.name.trim().split(/\s+/)[0] }) }); setCooldown(result.cooldownSeconds || 60); }
              catch (err) { setError(err.message); setCooldown(err.retryAfter || 0); }
              finally { sending.current = false; setBusy(false); }
            }}>{cooldown ? `Renvoyer le code dans ${cooldown} s` : "Renvoyer le code"}</button><button type="button" className="text-button" disabled={busy} onClick={() => { setCodeSent(false); setForm({ ...form, code: "" }); setError(""); }}>Corriger mes informations</button></div>}
            <button className="signup-submit" type="submit" disabled={busy}>
              {busy ? "Veuillez patienter…" : codeSent ? "Valider et créer mon compte →" : "Créer mon compte →"}
            </button>
          </form>

          <p className="signup-login">
            Vous avez déjà un compte ?{" "}
            <button
              type="button"
              onClick={() => setPage("SignIn")}
            >
              Se connecter
            </button>
          </p>
        </div>

        <p className="signup-footer">
          🦋 TaskFlow · Organisez, collaborez, réussissez.
        </p>
      </section>
    </main>
  );
}

export default SignUp;
