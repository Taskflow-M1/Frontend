import butterfly from "../assets/butterfly.png";
import "./Profile.css";

export default function Profile({ setPage }) {
  function handleSubmit(event) {
    event.preventDefault();

    alert("Les modifications du profil ont été préparées !");
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-brand">
          <img src={butterfly} alt="Logo TaskFlow" />
          <span>TaskFlow</span>
        </div>

        <nav className="profile-nav">
          <button onClick={() => setPage("TeamList")}>Équipes</button>
          <button onClick={() => setPage("MemberList")}>Membres</button>
          <button onClick={() => setPage("Settings")}>Paramètres</button>
          <button className="profile-active">Mon profil</button>
        </nav>
      </header>

      <main className="profile-container">
        <div className="profile-heading">
          <span className="profile-badge">ESPACE PERSONNEL</span>
          <h1>Mon profil</h1>
          <p>Consulte et modifie tes informations personnelles.</p>
        </div>

        <section className="profile-card">
          <div className="profile-avatar">A</div>

          <h2>Mon compte</h2>
          <p className="profile-description">
            Gère les informations associées à ton compte TaskFlow.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="profile-field">
              <label htmlFor="profile-name">Nom complet</label>
              <input
                id="profile-name"
                type="text"
                name="name"
                defaultValue="Amel"
                required
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email">Adresse e-mail</label>
              <input
                id="profile-email"
                type="email"
                name="email"
                placeholder="amel@email.com"
                defaultValue=""
                required
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-role">Rôle</label>
              <input
                id="profile-role"
                type="text"
                defaultValue="Membre"
                readOnly
              />
            </div>

            <button type="submit" className="profile-save">
              Enregistrer les modifications
            </button>
          </form>
        </section>

        <button
          className="profile-logout"
          onClick={() => setPage("Home")}
        >
          Se déconnecter
        </button>
      </main>
    </div>
  );
}