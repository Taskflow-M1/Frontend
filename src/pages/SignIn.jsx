import butterfly from "../assets/butterfly.png";
import "./SignIn.css";

function SignIn({ setPage }) {
  function handleSubmit(event) {
    event.preventDefault();

    // Pour le moment, le formulaire est uniquement visuel.
    alert("La connexion sera bientôt disponible !");
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
                required
              />
            </div>

            <div className="signin-field">
              <label htmlFor="signin-password">Mot de passe</label>

              <input
                id="signin-password"
                type="password"
                placeholder="Entrez votre mot de passe"
                required
              />
            </div>

            <button className="signin-submit" type="submit">
              Se connecter →
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