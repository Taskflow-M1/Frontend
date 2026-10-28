import butterfly from "../assets/butterfly.png";
import "./Home.css";

function Home({ setPage }) {
  return (
    <main className="home-page">
      <header className="home-header">
        <div className="home-brand">
          <img src={butterfly} alt="Logo TaskFlow" />
          <span>Task<span className="home-brand-pink">Flow</span></span>
        </div>

        <div className="home-header-actions">
          <button onClick={() => setPage("SignIn")}>
            Se connecter
          </button>
          <button
            className="home-primary-button"
            onClick={() => setPage("SignUp")}
          >
            Créer un compte
          </button>
        </div>
      </header>

      <section className="home-hero">
        <p className="home-eyebrow">BIENVENUE SUR TASKFLOW</p>

        <h1>
          Organisez vos projets,
          <br />
          <span>boostez votre équipe.</span>
        </h1>

        <p className="home-description">
          Organisez vos tâches, gérez vos équipes et collaborez
          efficacement dans un espace de travail unique.
        </p>

        <button
          className="home-primary-button home-hero-button"
          onClick={() => setPage("SignUp")}
        >
          Commencer gratuitement →
        </button>

        <div className="home-butterfly">
          <img src={butterfly} alt="" />
        </div>
      </section>

      <section className="home-features">
        <article className="home-feature-card">
          <span>✿</span>
          <h2>Gestion des projets</h2>
          <p>Organisez le travail et suivez son avancement.</p>
        </article>

        <article className="home-feature-card">
          <span>♡</span>
          <h2>Gestion des équipes</h2>
          <p>Retrouvez vos collaborateurs et répartissez les rôles.</p>
        </article>

        <article className="home-feature-card">
          <span>◇</span>
          <h2>Suivi des tickets</h2>
          <p>Visualisez les tâches à faire et celles terminées.</p>
        </article>
      </section>

      <footer className="home-footer">
        🦋 TaskFlow · Organisez, collaborez, réussissez.
      </footer>
    </main>
  );
}

export default Home;