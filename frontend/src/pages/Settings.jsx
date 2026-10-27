import butterfly from "../assets/butterfly.png";
import "./Settings.css";

export default function Settings({ setPage }) {
  function handleSubmit(event) {
    event.preventDefault();

    alert("Tes préférences ont été prises en compte pour cette démonstration !");
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div className="settings-brand">
          <img src={butterfly} alt="Logo TaskFlow" />
          <span>TaskFlow</span>
        </div>

        <nav className="settings-nav">
          <button onClick={() => setPage("TeamList")}>Équipes</button>
          <button onClick={() => setPage("MemberList")}>Membres</button>
          <button onClick={() => setPage("Profile")}>Mon profil</button>
          <button className="settings-active">Paramètres</button>
        </nav>
      </header>

      <main className="settings-container">
        <div className="settings-heading">
          <span className="settings-badge">PERSONNALISATION</span>
          <h1>Paramètres</h1>
          <p>Personnalise ton expérience sur TaskFlow.</p>
        </div>

        <form className="settings-card" onSubmit={handleSubmit}>
          <section className="settings-section">
            <div className="settings-section-icon">🔔</div>

            <div className="settings-section-content">
              <h2>Notifications</h2>
              <p>Choisis les notifications que tu souhaites recevoir.</p>

              <label className="settings-option">
                <span>
                  <strong>Notifications par e-mail</strong>
                  <small>Recevoir les informations importantes par e-mail.</small>
                </span>
                <input type="checkbox" name="emailNotifications" defaultChecked />
              </label>

              <label className="settings-option">
                <span>
                  <strong>Nouveaux membres</strong>
                  <small>Être informée lorsqu'un membre rejoint une équipe.</small>
                </span>
                <input type="checkbox" name="memberNotifications" defaultChecked />
              </label>
            </div>
          </section>

          <div className="settings-divider" />

          <section className="settings-section">
            <div className="settings-section-icon">🎨</div>

            <div className="settings-section-content">
              <h2>Apparence</h2>
              <p>Choisis la langue de ton interface.</p>

              <label className="settings-label" htmlFor="settings-language">
                Langue
              </label>

              <select
                id="settings-language"
                name="language"
                defaultValue="fr"
                className="settings-select"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </section>

          <div className="settings-divider" />

          <section className="settings-section">
            <div className="settings-section-icon">🔒</div>

            <div className="settings-section-content">
              <h2>Sécurité</h2>
              <p>Quelques conseils pour protéger ton compte.</p>

              <div className="settings-security-note">
                <strong>Conseil de sécurité</strong>
                <p>
                  Utilise un mot de passe unique et suffisamment long pour
                  protéger ton compte.
                </p>
              </div>
            </div>
          </section>

          <button type="submit" className="settings-save">
            Enregistrer les préférences
          </button>
        </form>

        <button
          className="settings-back"
          onClick={() => setPage("TeamList")}
        >
          ← Retour aux équipes
        </button>
      </main>
    </div>
  );
}