import butterfly from "../assets/butterfly.png";
import { useState } from "react";
import { apiRequest } from "../api/client";
import "./SignUp.css";

function SignUp({ setPage }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmation: "", code: "" });
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmation) { setError("Les mots de passe ne correspondent pas."); return; }
    const [firstName, ...lastNameParts] = form.name.trim().split(/\s+/);
    setBusy(true);
    try {
      if (!codeSent) {
        await apiRequest("/auth/send-verification-code", { method: "POST", body: JSON.stringify({ email: form.email, firstName }) });
        setCodeSent(true);
      } else {
        const result = await apiRequest("/auth/verify-email-code", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password, firstName, lastName: lastNameParts.join(" "), code: form.code }) });
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        setPage("Dashboard");
      }
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
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
                required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-email">Adresse e-mail</label>

              <input
                id="signup-email"
                type="email"
                placeholder="exemple@email.com"
                required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} readOnly={codeSent}
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-password">Mot de passe</label>

              <input
                id="signup-password"
                type="password"
                placeholder="Choisissez un mot de passe"
                minLength={8}
                required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                required value={form.confirmation} onChange={(e) => setForm({ ...form, confirmation: e.target.value })}
              />
            </div>

            {codeSent && <div className="signup-field"><label htmlFor="signup-code">Code reçu par e-mail</label><input id="signup-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{4}" maxLength={4} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, "").slice(0, 4) })} required /><small>Entrez le code à quatre chiffres envoyé à votre adresse.</small></div>}
            {error && <p role="alert" className="form-error">{error}</p>}
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
