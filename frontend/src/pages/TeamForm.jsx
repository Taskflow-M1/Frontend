import butterfly from "../assets/butterfly.png";
import "./TeamForm.css";

function TeamForm({ setPage }) {
  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const team = {
      name: formData.get("teamName"),
      description: formData.get("teamDescription"),
      category: formData.get("teamCategory"),
    };

    // Pour le moment, on affiche les informations saisies.
    alert(
      `Équipe créée !\n\nNom : ${team.name}\nCatégorie : ${team.category}`
    );

    console.log("Nouvelle équipe :", team);

    setPage("TeamList");
  }

  return (
    <main className="teamform-page">
      <header className="teamform-header">
        <button
          className="teamform-brand"
          type="button"
          onClick={() => setPage("Home")}
        >
          <img src={butterfly} alt="Logo TaskFlow" />

          <span>
            Task<span className="teamform-brand-pink">Flow</span>
          </span>
        </button>

        <button
          className="teamform-back"
          type="button"
          onClick={() => setPage("TeamList")}
        >
          ← Retour aux équipes
        </button>
      </header>

      <section className="teamform-content">
        <div className="teamform-card">
          <div className="teamform-icon">✿</div>

          <p className="teamform-eyebrow">GESTION DES ÉQUIPES</p>

          <h1>Créer une équipe</h1>

          <p className="teamform-description">
            Donnez un nom à votre équipe et présentez son objectif.
          </p>

          <form className="teamform-form" onSubmit={handleSubmit}>
            <div className="teamform-field">
              <label htmlFor="teamName">Nom de l'équipe *</label>

              <input
                id="teamName"
                name="teamName"
                type="text"
                placeholder="Ex. : Équipe Design"
                required
                maxLength={60}
              />
            </div>

            <div className="teamform-field">
              <label htmlFor="teamDescription">Description</label>

              <textarea
                id="teamDescription"
                name="teamDescription"
                placeholder="Décrivez les objectifs de cette équipe..."
                rows={4}
                maxLength={300}
              />
            </div>

            <div className="teamform-field">
              <label htmlFor="teamCategory">Catégorie *</label>

              <select
                id="teamCategory"
                name="teamCategory"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Choisir une catégorie
                </option>

                <option value="Design">Design</option>
                <option value="Développement">Développement</option>
                <option value="Marketing">Marketing</option>
                <option value="Gestion de projet">Gestion de projet</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="teamform-actions">
              <button
                className="teamform-cancel"
                type="button"
                onClick={() => setPage("TeamList")}
              >
                Annuler
              </button>

              <button className="teamform-submit" type="submit">
                + Créer l'équipe
              </button>
            </div>
          </form>
        </div>

        <p className="teamform-footer">
          🦋 TaskFlow · Organisez, collaborez, réussissez.
        </p>
      </section>
    </main>
  );
}

export default TeamForm;