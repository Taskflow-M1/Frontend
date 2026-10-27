
import Badge from "./Badge";
import Filters from "./Filters";
import { statusTone } from "./constants";

export default function TicketList({
  tickets,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  onCreate,
  onSelect,
  onEdit,
  onResetFilters,
}) {
  return (
    <section className="panel tickets-panel">
      <div className="section-heading">
        <div>
          <h2>Tous les tickets</h2>
          <p>{tickets.length} ticket(s) trouvé(s)</p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          ＋ Nouveau ticket
        </button>
      </div>

      <Filters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
      />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Projet</th>
              <th>Statut</th>
              <th>Priorité</th>
              <th>Assigné à</th>
              <th>Mis à jour</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} onClick={() => onSelect(ticket)}>
                <td>
                  <span className="table-ticket-id">{ticket.id}</span>
                  <strong>{ticket.title}</strong>
                </td>
                <td>{ticket.project}</td>
                <td>
                  <Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge>
                </td>
                <td>
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
                </td>
                <td>
                  <span className="assignee-cell">
                    <span className="avatar">{ticket.assignee.charAt(0)}</span>
                    {ticket.assignee}
                  </span>
                </td>
                <td>{ticket.updated}</td>
                <td>
                  <button
                    className="icon-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(ticket);
                    }}
                  >
                    ···
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tickets.length === 0 && (
          <div className="empty-state">
            Aucun ticket ne correspond à ta recherche.
            <br />
            <button className="text-button" onClick={onResetFilters}>
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
