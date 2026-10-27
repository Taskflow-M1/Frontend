
import { STATUSES, statusClass } from "./constants";
import TicketCard from "./TicketCard";

export default function Kanban({
  tickets,
  onSelect,
  onEdit,
  onCreate,
}) {
  return (
    <div className="kanban-board">
      {STATUSES.map((status) => {
        const columnTickets = tickets.filter(
          (ticket) => ticket.status === status
        );

        return (
          <section className="kanban-column" key={status}>
            <div className="kanban-column-heading">
              <span className={`legend-dot ${statusClass(status)}`} />
              <h3>{status}</h3>
              <span className="column-count">{columnTickets.length}</span>
              <button
                className="icon-button"
                title="Ajouter un ticket"
                onClick={onCreate}
              >
                ＋
              </button>
            </div>

            <div className="kanban-cards">
              {columnTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={onSelect}
                  onEdit={onEdit}
                />
              ))}
              {columnTickets.length === 0 && (
                <div className="empty-column">Aucun ticket</div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
