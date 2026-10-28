
import { STATUSES, PRIORITIES } from "./constants";

export default function Filters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
}) {
  return (
    <div className="filters">
      <label className="filter-search">
        <span>⌕</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un ticket..."
        />
      </label>

      <select
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
      >
        <option>Tous les statuts</option>
        {STATUSES.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </select>

      <select
        value={priorityFilter}
        onChange={(event) => setPriorityFilter(event.target.value)}
      >
        <option>Toutes les priorités</option>
        {PRIORITIES.map((priority) => (
          <option key={priority}>{priority}</option>
        ))}
      </select>
    </div>
  );
}
