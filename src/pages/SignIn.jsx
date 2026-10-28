import butterfly from "../assets/butterfly.png";
import { useState } from "react";
import { apiRequest } from "../api/client";
import "./SignIn.css";

function SignIn({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault();
    setError(""); setBusy(true);
    try {
      const result = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      setPage("Dashboard");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <main className="signin-page">
      <header className="signin-header">
        <button
          className="signin-brand"
          onClick={() => setPage("Home")}
          type="button"
        >
          <img src={butterfly} alt="Logo TaskFlow" />
          <span>
            Task<span className="signin-brand-pink">Flow</span>
          </span>
        </button>

        <button
          className="signin-back-button"
          onClick={() => setPage("Home")}
          type="button"
        >
          ← Retour à l'accueil
        </button>
      </header>

      <section className="signin-content">
        <div className="signin-decoration">
          <img src={butterfly} alt="" />
        </div>

        <div className="signin-card">
          <div className="signin-icon">♡</div>

          <p className="signin-eyebrow">RAVIE DE VOUS REVOIR</p>

          <h1>Bon retour !</h1>

          <p className="signin-description">
            Connectez-vous pour retrouver vos projets et votre équipe.
          </p>

          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="signin-field">
              <label htmlFor="signin-email">Adresse e-mail</label>

              <input
                id="signin-email"
                type="email"
                placeholder="exemple@email.com"
                required value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="signin-field">
              <label htmlFor="signin-password">Mot de passe</label>

              <input
                id="signin-password"
                type="password"
                placeholder="Entrez votre mot de passe"
                required value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p role="alert" className="form-error">{error}</p>}
            <button className="signin-submit" type="submit" disabled={busy}>
              {busy ? "Connexion…" : "Se connecter →"}
            </button>
          </form>

          <p className="signin-register">
            Pas encore de compte ?{" "}
            <button
              type="button"
              onClick={() => setPage("SignUp")}
            >
              Créer un compte
            </button>
          </p>
        </div>

        <p className="signin-footer">
          🦋 TaskFlow · Organisez, collaborez, réussissez.
        </p>
      </section>
    </main>
  );
}

export default SignIn;
