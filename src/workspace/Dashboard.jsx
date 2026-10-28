/* oxlint-disable react/set-state-in-effect -- These effects synchronize request loading and session state with the API. */
import { displayName } from "./utils";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { ticketStatuses as UI_STATUS } from "./ticket-permissions";
import { Alert, Avatar, Empty } from "./ui";

export function WorkspaceDashboard({ user, project, team, revision, onCreate, onNavigate, onTicket }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const projectId = project?.id;
  const teamId = team?.id;
  useEffect(() => {
    const controller = new AbortController();
    const query = projectId ? `?projectId=${projectId}` : teamId ? `?teamId=${teamId}` : "";
    setLoading(true); setError("");
    apiRequest(`/dashboard${query}`, { signal: controller.signal }).then((result) => { if (!controller.signal.aborted) setData(result); }).catch((err) => { if (!controller.signal.aborted) setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [projectId, teamId, revision, retry]);
  return <>
    <section className="welcome-panel"><div><p className="eyebrow">VOTRE ESPACE DE TRAVAIL</p><h2>Bonjour {user.firstName || displayName(user)} <span className="pink-text">✦</span></h2><p>{project ? `Voici l’activité de ${project.name}.` : "Retrouvez vos projets et vos tâches personnelles."}</p><button className="primary-button" onClick={project ? onCreate : () => onNavigate(team ? "Projets" : "Équipe")}>{project ? "＋ Créer un ticket" : team ? "Créer mon premier projet" : "Créer ma première équipe"}</button></div><Avatar user={user} /></section>
    {loading && <p role="status">Chargement des statistiques…</p>}
    {error && <><Alert>{error}</Alert><button className="secondary-button" onClick={() => setRetry((value) => value + 1)}>Réessayer</button></>}
    {data && !loading && !error && <>
      <div className="stats-grid">{[["Tickets", data.summary.totalTicketsCount], ["À faire", data.summary.statusCounts.todo], ["En cours et en test", data.summary.inProgressCount], ["Terminés", data.summary.statusCounts.done]].map(([label, value]) => <article className="stat-card" key={label}><span>{label}</span><strong className="stat-value">{value}</strong></article>)}</div>
      <div className="dashboard-grid"><section className="panel"><div className="section-heading"><h2>Tickets qui me sont assignés</h2><button className="text-button" onClick={() => onNavigate("Mes tickets")}>Tous les tickets →</button></div>{data.assignedTickets.length ? data.assignedTickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} enabled={ticket.projectId === project?.id} onTicket={onTicket} />) : <Empty>Aucun ticket ne vous est assigné.</Empty>}</section>
      <section className="panel"><div className="section-heading"><h2>Avancement</h2><strong>{data.summary.completionRatePercent}%</strong></div><progress max="100" value={data.summary.completionRatePercent} aria-label="Tickets terminés" />{Object.entries(data.summary.statusCounts).map(([status, count]) => <p className="summary-row" key={status}><span>{UI_STATUS[status]}</span><strong>{count}</strong></p>)}<p>{data.summary.overdueCount} ticket(s) en retard</p><p>{data.summary.assignedToMeCount} ticket(s) assigné(s) à vous</p></section></div>
      <div className="dashboard-grid"><section className="panel"><h2>Échéances dépassées</h2>{data.overdueTickets.length ? data.overdueTickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} enabled={ticket.projectId === project?.id} onTicket={onTicket} />) : <Empty>Aucun ticket en retard.</Empty>}</section>
      <section className="panel"><div className="section-heading"><h2>Mes tâches personnelles</h2><button className="text-button" onClick={() => onNavigate("Tasks")}>Gérer →</button></div><p>{data.personalTasks.total} tâche(s) · {data.personalTasks.done} terminée(s) · {data.personalTasks.overdue} en retard</p><progress max="100" value={data.personalTasks.completionRatePercent} aria-label="Tâches personnelles terminées" /></section></div>
      <section className="panel activity-panel"><h2>Activité récente</h2>{data.recentActivity.length ? <ol className="activity-list">{data.recentActivity.map((item) => <li key={item.id}><Avatar user={item.actor} /><div><strong>{item.summary}</strong><p>{item.ticketKey || item.projectName} · {displayName(item.actor)} · <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString("fr-FR")}</time></p></div>{item.projectId === project?.id && <button className="text-button" onClick={() => onTicket({ id: item.ticketId })}>Ouvrir</button>}</li>)}</ol> : <Empty>Aucune activité pour cet espace.</Empty>}</section>
    </>}
  </>;
}
function TicketRow({ ticket, enabled, onTicket }) {
  return <div className="recent-row"><div className="recent-info"><strong>{ticket.key} — {ticket.title}</strong><span>{UI_STATUS[ticket.status]}{ticket.dueDate ? ` · Échéance ${ticket.dueDate}` : ""}</span></div>{enabled && <button className="text-button" onClick={() => onTicket(ticket)}>Ouvrir →</button>}</div>;
}



