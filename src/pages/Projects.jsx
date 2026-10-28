
import Badge from "./Badge";

export default function Projects({ tickets, Butterfly, project }) {
  const done = tickets.filter(
    (ticket) => ticket.status === "Terminé"
  ).length;

  const progress = Math.round((done / Math.max(tickets.length, 1)) * 100);

  return (
    <div className="project-grid">
      <article className="project-card">
        <div className="project-card-top">
          <div className="project-logo">
            <Butterfly small />
          </div>
          <Badge tone="progress">Actif</Badge>
        </div>

        <h2>{project?.name || "Mon projet"}</h2>
        <p>
          Application de gestion de projets et de tickets inspirée des
          outils agiles.
        </p>

        <div className="project-progress-label">
          <span>Avancement</span>
          <strong>{progress}%</strong>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="project-footer">
          <span>☷ {tickets.length} tickets</span>
          <span>♧ Projet connecté</span>
        </div>
      </article>

      <div className="add-project-card">
        <span>＋</span>
        <strong>Nouveau projet</strong>
        <small>La création d’un projet supplémentaire se fait depuis la gestion des équipes.</small>
      </div>
    </div>
  );
}
