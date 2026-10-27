
import Badge from "./Badge";
import StatCard from "./StatCard";
import { STATUSES, statusClass, statusTone } from "./constants";

export default function Dashboard({
  tickets,
  features,
  onCreate,
  onSelect,
  onNavigate,
  Butterfly,
}) {
  const done = tickets.filter((ticket) => ticket.status === "Terminé").length;
  const inProgress = tickets.filter((ticket) => ticket.status === "En cours").length;
  const todo = tickets.filter((ticket) => ticket.status === "À faire").length;
  const progress = Math.round((done / Math.max(tickets.length, 1)) * 100);

  return (
    <>
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">ESPACE DE TRAVAIL</p>
          <h2>
            Bonjour Sarah <span className="pink-text">✦</span>
          </h2>
          <p>
            Voici ce qui se passe sur ton espace de travail aujourd'hui.
          </p>
          <button className="primary-button" onClick={onCreate}>
            ＋ Créer un ticket
          </button>
        </div>

        <div className="welcome-art">
          <div className="art-circle">
            <Butterfly />
          </div>
          <span className="sparkle sparkle-one">✦</span>
          <span className="sparkle sparkle-two">✧</span>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard label="Total des tickets" value={tickets.length} icon="▤" detail="Tickets du projet" />
        <StatCard label="À faire" value={todo} icon="◷" detail="Tickets à démarrer" />
        <StatCard label="En cours" value={inProgress} icon="◌" detail="Tickets en progression" />
        <StatCard label="Terminés" value={done} icon="✓" detail="Tickets finalisés" />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Tickets récents</h2>
              <p>Les dernières activités du projet</p>
            </div>
            <button className="text-button" onClick={() => onNavigate("Mes tickets")}>
              Voir tout →
            </button>
          </div>

          <div className="recent-list">
            {tickets.slice(0, 4).map((ticket) => (
              <div
                className="recent-row"
                key={ticket.id}
                onClick={() => onSelect(ticket)}
              >
                <div className="recent-icon">◇</div>
                <div className="recent-info">
                  <strong>{ticket.title}</strong>
                  <span>{ticket.id} · {ticket.assignee}</span>
                </div>
                <Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Avancement</h2>
              <p>État global des tickets</p>
            </div>
            <strong className="progress-percent">{progress}%</strong>
          </div>

          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="progress-legend">
            {STATUSES.map((status) => (
              <div key={status}>
                <span className={`legend-dot ${statusClass(status)}`} />
                {status}
                <strong>
                  {tickets.filter((ticket) => ticket.status === status).length}
                </strong>
              </div>
            ))}
          </div>

          <div className="mini-feature">
            <div className="feature-icon">◇</div>
            <div>
              <strong>Features du projet</strong>
              <p>{features.length} fonctionnalités suivies</p>
            </div>
            <button className="arrow-button" onClick={() => onNavigate("Features")}>
              →
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
