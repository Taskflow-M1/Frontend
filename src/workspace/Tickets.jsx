/* oxlint-disable react/set-state-in-effect -- These effects synchronize request loading and session state with the API. */
import { displayName, isManager } from "./utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "../api/client";
import { Modal, Alert, Empty, Avatar } from "./ui";
import { ticketStatuses, allowedTicketStatuses, ownsTicket as own, ticketPayload } from "./ticket-permissions";
import "./Tickets.css";

const priorities = { low: "Basse", medium: "Moyenne", high: "Haute", critical: "Critique" };
const types = { task: "Tâche", bug: "Anomalie", story: "User story", improvement: "Amélioration" };
const dateTime = (value) => value ? new Date(value).toLocaleString("fr-FR") : "—";
const dateOnly = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString("fr-FR") : "Aucune";
const memberUsers = (members) => members.map((member) => member.user || member);
const tone = (status) => ({ todo: "todo-badge", doing: "progress", testing: "testing-badge", done: "done" })[status];

function Options({ values }) {
  return Object.entries(values).map(([value, label]) => <option key={value} value={value}>{label}</option>);
}

export function TicketEditor({ ticket, project, features = [], members = [], user, initialStatus = "todo", onClose, onSaved }) {
  const statuses = allowedTicketStatuses(ticket, project?.myRole, user);
  const [form, setForm] = useState(() => ({
    title: ticket?.title || "", description: ticket?.description || "", status: ticket?.status || (statuses.includes(initialStatus) ? initialStatus : "todo"),
    priority: ticket?.priority || "medium", type: ticket?.type || "task", dueDate: ticket?.dueDate || "", featureId: ticket?.featureId || "", assignedTo: ticket?.assignedTo || "",
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const manager = isManager(project?.myRole);
  const canEditContent = !ticket || manager || own(ticket, user);
  const users = memberUsers(members);
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  async function save(event) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    const payload = ticketPayload(ticket, form, project.id);
    if (!Object.keys(payload).length) { onClose(); return; }
    submitting.current = true; setBusy(true);
    try {
      const saved = await apiRequest(ticket ? `/tickets/${ticket.id}` : "/tickets", { method: ticket ? "PATCH" : "POST", body: JSON.stringify(payload) });
      onSaved(saved);
    } catch (err) { setError(err.message); }
    finally { submitting.current = false; setBusy(false); }
  }

  return <Modal title={ticket ? `Modifier ${ticket.key}` : "Créer un ticket"} onClose={busy ? undefined : onClose}>
    <p className="muted">Projet : {project?.name}</p>
    <form onSubmit={save}>
      {error && <Alert>{error}</Alert>}
      <fieldset disabled={busy} className="ticket-fieldset">
        <label className="form-field">Titre *<input autoFocus required maxLength={120} disabled={!canEditContent} value={form.title} onChange={(e) => setField("title", e.target.value)} /></label>
        <label className="form-field">Description<textarea maxLength={2000} rows={4} disabled={!canEditContent} value={form.description} onChange={(e) => setField("description", e.target.value)} /></label>
        <div className="form-grid">
          <label className="form-field">Statut<select value={form.status} onChange={(e) => setField("status", e.target.value)}>{statuses.map((status) => <option value={status} key={status}>{ticketStatuses[status]}</option>)}</select></label>
          <label className="form-field">Priorité<select disabled={!canEditContent} value={form.priority} onChange={(e) => setField("priority", e.target.value)}><Options values={priorities} /></select></label>
          <label className="form-field">Type<select disabled={!canEditContent} value={form.type} onChange={(e) => setField("type", e.target.value)}><Options values={types} /></select></label>
          <label className="form-field">Échéance<input type="date" disabled={!canEditContent} value={form.dueDate} onChange={(e) => setField("dueDate", e.target.value)} /></label>
          <label className="form-field">Feature<select disabled={!!ticket && !manager} value={form.featureId} onChange={(e) => setField("featureId", e.target.value)}><option value="">Sans feature</option>{features.map((feature) => <option key={feature.id} value={feature.id}>{feature.title}</option>)}</select></label>
          <label className="form-field">Assigné à<select disabled={!!ticket && !manager && !!ticket.assignedTo} value={form.assignedTo} onChange={(e) => setField("assignedTo", e.target.value)}><option value="">Non assigné</option>{users.filter((member) => manager || member.id === user?.id || member.id === ticket?.assignedTo).map((member) => <option key={member.id} value={member.id}>{displayName(member)}</option>)}</select></label>
        </div>
        {!manager && <p className="muted">Votre rôle détermine les transitions disponibles. Vous pouvez prendre un ticket libre et modifier le contenu de vos tickets.</p>}
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" type="submit">{busy ? "Enregistrement…" : ticket ? "Enregistrer" : "Créer le ticket"}</button></div>
      </fieldset>
    </form>
  </Modal>;
}

export function TicketDetails({ ticketId, project, features = [], members = [], user, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const alive = useRef(true);
  const loadSequence = useRef(0);
  const mutation = useRef(false);

  const load = useCallback(async () => {
    const sequence = ++loadSequence.current;
    setLoading(true); setError("");
    try {
      const [ticket, comments, history] = await Promise.all([apiRequest(`/tickets/${ticketId}`), apiRequest(`/tickets/${ticketId}/comments`), apiRequest(`/tickets/${ticketId}/history?order=desc`)]);
      if (alive.current && sequence === loadSequence.current) setData({ ticket, comments: comments.items, history: history.items });
    } catch (err) { if (alive.current && sequence === loadSequence.current) setError(err.message); }
    finally { if (alive.current && sequence === loadSequence.current) setLoading(false); }
  }, [ticketId]);
  useEffect(() => { alive.current = true; load(); return () => { alive.current = false; loadSequence.current += 1; }; }, [load]);

  async function mutate(action, after) {
    if (mutation.current) return;
    mutation.current = true; setBusy(true); setError("");
    try { await action(); if (after) after(); else await load(); onChanged?.(); }
    catch (err) { setError(err.message); }
    finally { mutation.current = false; setBusy(false); }
  }
  const ticket = data?.ticket;
  const manager = isManager(project?.myRole);
  if (editing && ticket) return <TicketEditor ticket={ticket} project={project} features={features} members={members} user={user} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); load(); onChanged?.(); }} />;

  return <Modal title={ticket ? `${ticket.key} · ${ticket.title}` : "Détail du ticket"} onClose={busy ? undefined : onClose}>
    {error && <Alert>{error} <button className="text-button" onClick={load} disabled={busy}>Réessayer</button></Alert>}
    {loading ? <p role="status">Chargement du ticket…</p> : ticket && <>
      <p className="ticket-description-full">{ticket.description || "Aucune description."}</p>
      <div className="detail-fields">
        <label className="form-field">Statut<select value={ticket.status} disabled={busy} onChange={(e) => mutate(() => apiRequest(`/tickets/${ticket.id}/status`, { method: "PATCH", body: JSON.stringify({ status: e.target.value }) }))}>{allowedTicketStatuses(ticket, project?.myRole, user).map((status) => <option key={status} value={status}>{ticketStatuses[status]}</option>)}</select></label>
        <div><span>Priorité</span><strong>{priorities[ticket.priority]}</strong></div>
        <div><span>Type</span><strong>{types[ticket.type]}</strong></div>
        <div><span>Échéance</span><strong>{dateOnly(ticket.dueDate)}</strong></div>
        <div><span>Assigné à</span><strong>{ticket.assignee ? displayName(ticket.assignee) : "Non assigné"}</strong></div>
        <div><span>Feature</span><strong>{features.find((feature) => feature.id === ticket.featureId)?.title || "Sans feature"}</strong></div>
        <div><span>Créé par</span><strong>{displayName(ticket.creator)}</strong></div>
        <div><span>Mis à jour</span><strong>{dateTime(ticket.updatedAt)}</strong></div>
      </div>
      <div className="ticket-actions">
        {(manager || own(ticket, user)) && <button disabled={busy} className="secondary-button" onClick={() => setEditing(true)}>Modifier le ticket</button>}
        {!manager && !ticket.assignedTo && <button disabled={busy} className="secondary-button" onClick={() => mutate(() => apiRequest(`/tickets/${ticket.id}/assign`, { method: "PATCH", body: JSON.stringify({ assignedTo: user.id }) }))}>M’assigner ce ticket</button>}
        {manager && <button className="danger-button" disabled={busy} onClick={() => { if (window.confirm(`Supprimer ${ticket.key}, ses commentaires et son historique ? Cette action est définitive.`)) mutate(() => apiRequest(`/tickets/${ticket.id}`, { method: "DELETE" }), onClose); }}>Supprimer</button>}
      </div>
      <section className="ticket-discussion"><h3>Commentaires ({data.comments.length})</h3>
        <form onSubmit={(e) => { e.preventDefault(); if (!content.trim()) return; mutate(() => apiRequest(editingComment ? `/comments/${editingComment}` : `/tickets/${ticket.id}/comments`, { method: editingComment ? "PATCH" : "POST", body: JSON.stringify({ content: content.trim() }) }), () => { setContent(""); setEditingComment(null); load(); }); }}>
          <label className="form-field">{editingComment ? "Modifier votre commentaire" : "Ajouter un commentaire"}<textarea required maxLength={2000} rows={3} value={content} disabled={busy} onChange={(e) => setContent(e.target.value)} /></label>
          <div className="ticket-actions"><button className="primary-button" disabled={busy || !content.trim()}>{editingComment ? "Enregistrer" : "Commenter"}</button>{editingComment && <button className="secondary-button" type="button" disabled={busy} onClick={() => { setEditingComment(null); setContent(""); }}>Annuler</button>}</div>
        </form>
        {!data.comments.length && <p className="muted">Aucun commentaire pour le moment.</p>}
        <div className="ticket-comments">{data.comments.map((comment) => <article className="ticket-comment" key={comment.id}><div className="ticket-comment-author"><Avatar user={comment.author} /><strong>{displayName(comment.author)}</strong><small>{dateTime(comment.createdAt)}{comment.isEdited ? " · modifié" : ""}</small></div><p>{comment.content}</p><div className="ticket-actions">{comment.authorId === user?.id && <button disabled={busy} className="text-button" onClick={() => { setEditingComment(comment.id); setContent(comment.content); }}>Modifier</button>}{(comment.authorId === user?.id || manager) && <button disabled={busy} className="text-button" onClick={() => { if (window.confirm("Supprimer ce commentaire ?")) mutate(() => apiRequest(`/comments/${comment.id}`, { method: "DELETE" }), () => { if (editingComment === comment.id) { setEditingComment(null); setContent(""); } load(); }); }}>Supprimer</button>}</div></article>)}</div>
      </section>
      <section className="ticket-history"><h3>Historique</h3>{data.history.length ? <ol>{data.history.map((entry) => <li key={entry.id}><strong>{entry.summary}</strong><span>{displayName(entry.actor)} · {dateTime(entry.createdAt)}</span></li>)}</ol> : <p className="muted">Aucune activité enregistrée.</p>}</section>
    </>}
  </Modal>;
}

const defaultFilters = { status: "", priority: "", type: "", assignedTo: "", overdue: "", dueBefore: "" };

export function TicketsPage({ project, features = [], members = [], user, onChanged, featureId = "", onFeatureChange, mode = "list", search = "" }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [query, setQuery] = useState(search);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [movingId, setMovingId] = useState(null);
  const requestSequence = useRef(0);
  const moving = useRef(false);
  useEffect(() => { setQuery(search); setPage(1); }, [search]);
  useEffect(() => { setPage(1); }, [featureId]);

  useEffect(() => {
    const sequence = ++requestSequence.current;
    setLoading(true); setError("");
    if (!project?.id) { setResult(null); setLoading(false); return; }
    const timer = setTimeout(async () => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) if (value && !(mode === "kanban" && (key === "status" || key === "dueBefore"))) params.set(key, value);
      if (featureId) params.set("featureId", featureId);
      if (query.trim()) params.set("search", query.trim().slice(0, 100));
      if (mode !== "kanban") { params.set("page", String(page)); params.set("limit", "25"); }
      try {
        const response = await apiRequest(`/projects/${project.id}/${mode === "kanban" ? "kanban" : "tickets"}?${params}`);
        if (sequence === requestSequence.current) {
          if (mode !== "kanban" && page > Math.max(1, response.pagination.totalPages)) setPage(Math.max(1, response.pagination.totalPages));
          else setResult(response);
        }
      } catch (err) { if (sequence === requestSequence.current) setError(err.message); }
      finally { if (sequence === requestSequence.current) setLoading(false); }
    }, 200);
    return () => { clearTimeout(timer); requestSequence.current += 1; };
  }, [project?.id, filters, featureId, mode, query, page, revision]);

  const reload = () => { setRevision((value) => value + 1); onChanged?.(); };
  const filter = (key, value) => { setPage(1); setFilters((current) => ({ ...current, [key]: value })); };
  const manager = isManager(project?.myRole);
  async function move(ticket, status) {
    if (moving.current || status === ticket.status) return;
    moving.current = true; setMovingId(ticket.id); setError("");
    try { await apiRequest(`/tickets/${ticket.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); reload(); }
    catch (err) { setError(err.message); }
    finally { moving.current = false; setMovingId(null); }
  }
  const selectStatus = (ticket) => <select aria-label={`Statut de ${ticket.key}`} value={ticket.status} disabled={!!movingId} onChange={(e) => move(ticket, e.target.value)}>{allowedTicketStatuses(ticket, project?.myRole, user).map((status) => <option value={status} key={status}>{ticketStatuses[status]}</option>)}</select>;

  if (!project) return <Empty>Choisissez ou créez un projet pour gérer ses tickets.</Empty>;
  return <>
    <section className="panel tickets-panel">
      <div className="section-heading"><div><h2>{mode === "kanban" ? "Tableau Kanban" : "Tickets du projet"}</h2><p>{loading ? "Chargement…" : `${mode === "kanban" ? result?.totalTickets || 0 : result?.pagination.total || 0} ticket(s)`} · {project.name}</p></div><button className="primary-button" onClick={() => setEditor({})}>＋ Nouveau ticket</button></div>
      <div className="ticket-filters">
        <label className="form-field">Rechercher<input placeholder="Titre ou clé du ticket" maxLength={100} value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} /></label>
        {mode !== "kanban" && <label className="form-field">Statut<select value={filters.status} onChange={(e) => filter("status", e.target.value)}><option value="">Tous les statuts</option><Options values={ticketStatuses} /></select></label>}
        <label className="form-field">Priorité<select value={filters.priority} onChange={(e) => filter("priority", e.target.value)}><option value="">Toutes les priorités</option><Options values={priorities} /></select></label>
        <label className="form-field">Type<select value={filters.type} onChange={(e) => filter("type", e.target.value)}><option value="">Tous les types</option><Options values={types} /></select></label>
        <label className="form-field">Feature<select value={featureId} onChange={(e) => { onFeatureChange?.(e.target.value); setPage(1); }}><option value="">Toutes les features</option><option value="none">Sans feature</option>{features.map((feature) => <option key={feature.id} value={feature.id}>{feature.title}</option>)}</select></label>
        <label className="form-field">Assignation<select value={filters.assignedTo} onChange={(e) => filter("assignedTo", e.target.value)}><option value="">Tous les membres</option><option value="me">Assignés à moi</option><option value="unassigned">Non assignés</option>{memberUsers(members).map((member) => <option key={member.id} value={member.id}>{displayName(member)}</option>)}</select></label>
        <label className="form-field">Retard<select value={filters.overdue} onChange={(e) => filter("overdue", e.target.value)}><option value="">Toutes les échéances</option><option value="true">En retard</option><option value="false">Sans retard</option></select></label>
        {mode !== "kanban" && <label className="form-field">Échéance avant le<input type="date" value={filters.dueBefore} onChange={(e) => filter("dueBefore", e.target.value)} /></label>}
      </div>
      <div className="ticket-actions"><button className="text-button" onClick={() => { setFilters(defaultFilters); setQuery(""); setPage(1); onFeatureChange?.(""); }}>Réinitialiser les filtres</button><button className="text-button" onClick={() => setRevision((value) => value + 1)}>Actualiser</button></div>
      {error && <Alert>{error} <button className="text-button" onClick={() => setRevision((value) => value + 1)}>Réessayer</button></Alert>}
      {loading ? <p role="status">Chargement des tickets…</p> : !error && result && (mode === "kanban" ? <div className="kanban-board ticket-kanban">{result.columns.map((column) => <section className="kanban-column" key={column.status}><div className="kanban-column-heading"><h3>{column.label}</h3><span className="column-count">{column.count}</span><button className="icon-button" aria-label={`Créer un ticket ${column.label}`} onClick={() => setEditor({ initialStatus: column.status })}>＋</button></div><div className="kanban-cards">{column.items.map((ticket) => <article className="ticket-card" key={ticket.id}><button className="ticket-open" onClick={() => setSelectedId(ticket.id)}><span className="ticket-id">{ticket.key}</span><h3>{ticket.title}</h3></button><p className="ticket-description">{ticket.description || "Aucune description"}</p><div className="ticket-meta"><span className={`badge ${ticket.priority === "critical" || ticket.priority === "high" ? "high" : ticket.priority === "low" ? "low" : "medium"}`}>{priorities[ticket.priority]}</span><Avatar user={ticket.assignee} /><span className="small-text">{ticket.assignee ? displayName(ticket.assignee) : "Non assigné"}</span></div>{ticket.dueDate && <p className="muted">Échéance : {dateOnly(ticket.dueDate)}</p>}{selectStatus(ticket)}</article>)}{!column.items.length && <p className="empty-column">Aucun ticket</p>}</div></section>)}</div> : <><div className="table-wrap"><table><thead><tr><th>Ticket</th><th>Statut</th><th>Priorité / type</th><th>Assigné à</th><th>Échéance</th><th>Actions</th></tr></thead><tbody>{result.items.map((ticket) => <tr key={ticket.id}><td><button className="ticket-open" onClick={() => setSelectedId(ticket.id)}><span className="table-ticket-id">{ticket.key}</span><strong>{ticket.title}</strong></button></td><td><span className={`badge ${tone(ticket.status)}`}>{ticketStatuses[ticket.status]}</span></td><td>{priorities[ticket.priority]}<br />{types[ticket.type]}</td><td><span className="ticket-comment-author"><Avatar user={ticket.assignee} />{ticket.assignee ? displayName(ticket.assignee) : "Non assigné"}</span></td><td>{dateOnly(ticket.dueDate)}</td><td>{(manager || own(ticket, user)) && <button className="text-button" onClick={() => setEditor({ ticket })}>Modifier</button>}<button className="text-button" onClick={() => setSelectedId(ticket.id)}>Ouvrir</button></td></tr>)}</tbody></table></div>{!result.items.length && <Empty>Aucun ticket ne correspond à ces filtres.</Empty>}<div className="ticket-pagination"><button className="secondary-button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Précédent</button><span>Page {page} / {Math.max(1, result.pagination.totalPages)}</span><button className="secondary-button" disabled={page >= result.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Suivant</button></div></>)}
    </section>
    {editor && <TicketEditor {...editor} project={project} features={features} members={members} user={user} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); reload(); }} />}
    {selectedId && <TicketDetails ticketId={selectedId} project={project} features={features} members={members} user={user} onClose={() => setSelectedId(null)} onChanged={reload} />}
  </>;
}


