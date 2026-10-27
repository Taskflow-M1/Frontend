
import { STATUSES } from "./constants";

export default function TicketDetailsModal({
  ticket,
  onClose,
  onMove,
  onEdit,
}) {
  if (!ticket) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal-card detail-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <span className="ticket-id">{ticket.id}</span>
            <h2>{ticket.title}</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <p className="detail-description">
          {ticket.description || "Aucune description."}
        </p>

        <div className="detail-fields">
          <div>
            <span>Statut</span>
            <select
              value={ticket.status}
              onChange={(event) => onMove(ticket, event.target.value)}
            >
              {STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <span>Priorité</span>
            <strong>{ticket.priority}</strong>
          </div>
          <div>
            <span>Assigné à</span>
            <strong>{ticket.assignee}</strong>
          </div>
          <div>
            <span>Feature</span>
            <strong>{ticket.feature}</strong>
          </div>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>
            Fermer
          </button>
          <button className="primary-button" onClick={() => onEdit(ticket)}>
            Modifier le ticket
          </button>
        </div>
      </section>
    </div>
  );
}
