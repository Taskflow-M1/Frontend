
import Badge from "./Badge";
import { statusTone } from "./constants";

export default function Features({ features, tickets, onNavigate }) {
  return (
    <div className="feature-grid">
      {features.map((feature) => {
        const featureTickets = tickets.filter(
          (ticket) => ticket.feature === feature.name
        );

        return (
          <article className="feature-card" key={feature.name}>
            <div className="feature-card-icon">◇</div>

            <div className="feature-card-title">
              <h3>{feature.name}</h3>
              <Badge tone={statusTone(feature.status)}>{feature.status}</Badge>
            </div>

            <p>{feature.description}</p>

            <div className="feature-card-footer">
              <span>☷ {featureTickets.length} ticket(s)</span>
              <button
                className="text-button"
                onClick={() => onNavigate(feature.name)}
              >
                Voir les tickets →
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
