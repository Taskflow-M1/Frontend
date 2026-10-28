import butterfly from "../assets/butterfly.png";
import "./TeamList.css";

function TeamList({ setPage }) {
  const teams = [
    {
      id: 1,
      name: "Équipe Design",
      description: "Création et amélioration de l'expérience utilisateur.",
      members: 4,
      color: "pink",
      initials: ["AM", "SL", "JD"],
    },
    {
      id: 2,
      name: "Équipe Développement",
      description: "Développement et maintenance de l'application.",
      members: 6,
      color: "purple",
      initials: ["MK", "AL", "SB"],
    },
    {
      id: 3,
      name: "Équipe Marketing",
      description: "Communication et stratégie marketing.",
      members: 3,
      color: "blue",
      initials: ["LM", "EC", "NR"],
    },
  ];

  return (
    <main className="teamlist-page">
      <header className="teamlist-header">
        <button
          className="teamlist-brand"
          type="button"
          onClick={() => setPage("Home")}
        >
          <img src={butterfly} alt="Logo TaskFlow" />
          <span>
            Task<span className="teamlist-brand-pink">Flow</span>
          </span>
        </button>

        <nav className="teamlist-navigation">
          <button
            type="button"
            className="teamlist-nav-button active"
            onClick={() => setPage("TeamList")}
          >
            Mes équipes
          </button>

          <button
            type="button"
            className="teamlist-nav-button"
            onClick={() => setPage("MemberList")}
          >
            Membres
          </button>

          <button
            type="button"
            className="teamlist-nav-button"
            onClick={() => setPage("Profile")}
          >
            Mon profil
          </button>
        </nav>
      </header>

      <section className="teamlist-content">
        <div className="teamlist-heading">
          <div>
            <p className="teamlist-eyebrow">ESPACE DE TRAVAIL</p>
            <h1>Mes équipes <span>♡</span></h1>
            <p className="teamlist-description">
              Retrouvez vos équipes et collaborez sur vos projets.
            </p>
          </div>

          <button
            className="teamlist-add-button"
            type="button"
            onClick={() => setPage("TeamForm")}
          >
            + Créer une équipe
          </button>
        </div>

        <div className="teamlist-summary">
          <div className="teamlist-summary-icon">✿</div>
          <div>
            <span>Nombre total d'équipes</span>
            <strong>{teams.length}</strong>
          </div>
        </div>

        <div className="teamlist-grid">
          {teams.map((team) => (
            <article className="teamlist-card" key={team.id}>
              <div className={`teamlist-card-icon ${team.color}`}>
                ♧
              </div>

              <span className="teamlist-card-label">ÉQUIPE</span>

              <h2>{team.name}</h2>

              <p className="teamlist-card-description">
                {team.description}
              </p>

              <div className="teamlist-card-members">
                <div className="teamlist-avatars">
                  {team.initials.map((initial, index) => (
                    <span key={index}>{initial}</span>
                  ))}
                </div>

                <span>{team.members} membres</span>
              </div>

              <div className="teamlist-card-actions">
                <button
                  type="button"
                  onClick={() => setPage("MemberList")}
                >
                  Voir les membres →
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="teamlist-tip">
          <span>💡</span>
          <p>
            <strong>Un conseil :</strong> créez une équipe pour chaque
            groupe de travail afin de mieux organiser la collaboration.
          </p>
        </div>
      </section>

      <footer className="teamlist-footer">
        🦋 TaskFlow · Organisez, collaborez, réussissez.
      </footer>
    </main>
  );
}

export default TeamList;