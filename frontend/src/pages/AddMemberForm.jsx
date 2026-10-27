import butterfly from "../assets/butterfly.png";
import "./AddMemberForm.css";

export default function AddMemberForm({ setPage }) {
  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const member = {
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      team: formData.get("team"),
    };

    console.log("Nouveau membre :", member);

    alert(`Le membre ${member.name} a été préparé !`);
    setPage("MemberList");
  }

  return (
    <div className="add-member-page">
      <header className="add-member-header">
        <div className="add-member-brand">
          <img src={butterfly} alt="Logo TaskFlow" />
          <span>TaskFlow</span>
        </div>

        <button
          className="add-member-back"
          onClick={() => setPage("MemberList")}
        >
          ← Retour aux membres
        </button>
      </header>

      <main className="add-member-container">
        <div className="add-member-heading">
          <span className="add-member-badge">ÉQUIPE</span>
          <h1>Ajouter un membre</h1>
          <p>Invite une nouvelle personne à rejoindre ton équipe.</p>
        </div>

        <form className="add-member-card" onSubmit={handleSubmit}>
          <div className="add-member-field">
            <label htmlFor="member-name">Nom complet</label>
            <input
              id="member-name"
              name="name"
              type="text"
              placeholder="Ex. Amel Benali"
              required
            />
          </div>

          <div className="add-member-field">
            <label htmlFor="member-email">Adresse e-mail</label>
            <input
              id="member-email"
              name="email"
              type="email"
              placeholder="exemple@email.com"
              required
            />
          </div>

          <div className="add-member-field">
            <label htmlFor="member-role">Rôle</label>
            <select id="member-role" name="role" defaultValue="" required>
              <option value="" disabled>
                Choisir un rôle
              </option>
              <option value="Administrateur">Administrateur</option>
              <option value="Chef de projet">Chef de projet</option>
              <option value="Développeur">Développeur</option>
              <option value="Designer">Designer</option>
              <option value="Membre">Membre</option>
            </select>
          </div>

          <div className="add-member-field">
            <label htmlFor="member-team">Équipe</label>
            <select id="member-team" name="team" defaultValue="" required>
              <option value="" disabled>
                Choisir une équipe
              </option>
              <option value="Design">Équipe Design</option>
              <option value="Développement">Équipe Développement</option>
              <option value="Marketing">Équipe Marketing</option>
            </select>
          </div>

          <div className="add-member-actions">
            <button
              type="button"
              className="add-member-cancel"
              onClick={() => setPage("MemberList")}
            >
              Annuler
            </button>

            <button type="submit" className="add-member-submit">
              + Ajouter le membre
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}