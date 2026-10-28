import butterfly from "../assets/butterfly.png";
import "./SignUp.css";

function SignUp({ setPage }) {
  function handleSubmit(event) {
    event.preventDefault();

    // L'inscription réelle sera ajoutée plus tard.
    alert("L'inscription sera bientôt disponible !");
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
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-email">Adresse e-mail</label>

              <input
                id="signup-email"
                type="email"
                placeholder="exemple@email.com"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-password">Mot de passe</label>

              <input
                id="signup-password"
                type="password"
                placeholder="Choisissez un mot de passe"
                minLength={8}
                required
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
                required
              />
            </div>

            <button className="signup-submit" type="submit">
              Créer mon compte →
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