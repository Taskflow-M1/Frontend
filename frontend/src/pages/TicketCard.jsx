
import Badge from "./Badge";

export default function TicketCard({ ticket, onSelect, onEdit }) {
  return (
    <article
      className="ticket-card"
      key={ticket.id}
      onClick={() => onSelect(ticket)}
    >
      <div className="ticket-card-top">
        <span className="ticket-id">{ticket.id}</span>
        <button
          className="icon-button"
          title="Modifier le ticket"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(ticket);
          }}
        >
          ···
        </button>
      </div>

      <h3>{ticket.title}</h3>
      <p className="ticket-description">
        {ticket.description || "Aucune description."}
      </p>

      <div className="ticket-meta">
        <Badge
          tone={
            ticket.priority === "Haute"
              ? "high"
              : ticket.priority === "Basse"
                ? "low"
                : "medium"
          }
        >
          {ticket.priority}
        </Badge>

        <span className="avatar">{ticket.assignee.charAt(0)}</span>
        <span className="muted small-text">{ticket.assignee}</span>
      </div>
    </article>
  );
}
