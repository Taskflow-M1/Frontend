import butterfly from "../assets/butterfly.png";
import "./MemberList.css";

function MemberList({ setPage }) {
  const members = [
    {
      id: 1,
      name: "Amel",
      email: "amel@example.com",
      role: "Administratrice",
      team: "Équipe Design",
      initials: "AM",
      color: "pink",
    },
    {
      id: 2,
      name: "Sarah",
      email: "sarah@example.com",
      role: "Responsable",
      team: "Équipe Développement",
      initials: "SL",
      color: "purple",
    },
    {
      id: 3,
      name: "Julie Martin",
      email: "julie@example.com",
      role: "Membre",
      team: "Équipe Design",
      initials: "JM",
      color: "blue",
    },
    {
      id: 4,
      name: "Lucas Bernard",
      email: "lucas@example.com",
      role: "Membre",
      team: "Équipe Marketing",
      initials: "LB",
      color: "green",
    },
  ];

  return (
    <main className="memberlist-page">
      <header className="memberlist-header">
        <button
          className="memberlist-brand"
          type="button"
          onClick={() => setPage("Home")}
        >
          <img src={butterfly} alt="Logo TaskFlow" />
          <span>
            Task<span className="memberlist-brand-pink">Flow</span>
          </span>
        </button>

        <nav className="memberlist-navigation">
          <button
            type="button"
            onClick={() => setPage("TeamList")}
          >
            Mes équipes
          </button>

          <button
            type="button"
            className="active"
            onClick={() => setPage("MemberList")}
          >
            Membres
          </button>

          <button
            type="button"
            onClick={() => setPage("Profile")}
          >
            Mon profil
          </button>

          <button
            type="button"
            onClick={() => setPage("Settings")}
          >
            Paramètres
          </button>
        </nav>
      </header>

      <section className="memberlist-content">
        <div className="memberlist-heading">
          <div>
            <p className="memberlist-eyebrow">VOTRE ESPACE DE TRAVAIL</p>
            <h1>Les membres <span>♡</span></h1>
            <p className="memberlist-description">
              Retrouvez les personnes qui collaborent sur vos projets.
            </p>
          </div>

          <button
            className="memberlist-add-button"
            type="button"
            onClick={() => setPage("AddMemberForm")}
          >
            + Ajouter un membre
          </button>
        </div>

        <div className="memberlist-stats">
          <div className="memberlist-stat-card">
            <div className="memberlist-stat-icon pink">♧</div>
            <div>
              <span>Total des membres</span>
              <strong>{members.length}</strong>
            </div>
          </div>

          <div className="memberlist-stat-card">
            <div className="memberlist-stat-icon purple">✿</div>
            <div>
              <span>Administrateurs</span>
              <strong>
                {members.filter(
                  (member) => member.role === "Administratrice"
                ).length}
              </strong>
            </div>
          </div>
        </div>

        <div className="memberlist-table-card">
          <div className="memberlist-table-heading">
            <h2>Annuaire des membres</h2>
            <span>{members.length} personnes</span>
          </div>

          <div className="memberlist-table-wrapper">
            <table className="memberlist-table">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Rôle</th>
                  <th>Équipe</th>
                  <th>Statut</th>
                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="memberlist-person">
                        <div
                          className={`memberlist-avatar ${member.color}`}
                        >
                          {member.initials}
                        </div>

                        <div className="memberlist-person-info">
                          <strong>{member.name}</strong>
                          <span>{member.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="memberlist-role">
                        {member.role}
                      </span>
                    </td>

                    <td>{member.team}</td>

                    <td>
                      <span className="memberlist-status">
                        <span className="memberlist-status-dot"></span>
                        Actif
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="memberlist-tip">
          <span>💡</span>
          <p>
            <strong>Astuce :</strong> ajoutez les membres de votre équipe
            pour faciliter la collaboration sur vos projets.
          </p>
        </div>
      </section>

      <footer className="memberlist-footer">
        🦋 TaskFlow · Organisez, collaborez, réussissez.
      </footer>
    </main>
  );
}

export default MemberList;