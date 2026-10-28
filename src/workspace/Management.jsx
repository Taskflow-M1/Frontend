import { displayName, roleLabel, isManager } from "./utils";
import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../api/client";
import { Modal, Alert, Empty, Avatar } from "./ui";
import "./Management.css";

const ROLES = ["admin", "project_manager", "developer", "tester"];

function EntityForm({ kind, entity, teams = [], defaultTeamId, onClose, onSave }) {
  const [values, setValues] = useState({
    name: entity?.name || "", title: entity?.title || "", description: entity?.description || "",
    key: entity?.key || "", teamId: entity?.teamId || defaultTeamId || teams[0]?.id || "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const isFeature = kind === "feature";
  const labels = { team: "équipe", project: "projet", feature: "feature" };
  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setError(""); setBusy(true);
    try {
      const payload = isFeature
        ? { title: values.title.trim(), description: values.description.trim() }
        : { name: values.name.trim(), description: values.description.trim() };
      if (kind === "project") {
        payload.key = values.key.trim().toUpperCase();
        if (!entity) payload.teamId = values.teamId;
      }
      await onSave(payload);
      onClose();
    } catch (err) { setError(err.message); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <Modal title={`${entity ? "Modifier" : "Créer"} ${kind === "project" ? "un" : "une"} ${labels[kind]}`} onClose={busy ? undefined : onClose}>
    <form onSubmit={submit}>
      {error && <Alert>{error}</Alert>}
      <fieldset disabled={busy} className="management-fieldset">
      <label className="form-field">{isFeature ? "Titre" : "Nom"} *
        <input autoFocus required maxLength={isFeature ? 120 : 100} value={isFeature ? values.title : values.name} onChange={(e) => setValues({ ...values, [isFeature ? "title" : "name"]: e.target.value })} />
      </label>
      {kind === "project" && <>
        {!entity && <label className="form-field">Équipe *<select required value={values.teamId} onChange={(e) => setValues({ ...values, teamId: e.target.value })}>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>}
        <label className="form-field">Clé du projet *<input required pattern="[A-Za-z][A-Za-z0-9]{1,9}" maxLength={10} value={values.key} onChange={(e) => setValues({ ...values, key: e.target.value.toUpperCase() })} placeholder="Ex. TASK" /><small>2 à 10 lettres ou chiffres, commence par une lettre. Cette clé préfixe les tickets.</small></label>
      </>}
      <label className="form-field">Description<textarea rows={4} maxLength={kind === "team" ? 500 : 1000} value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} /></label>
      <div className="modal-actions"><button type="button" className="secondary-button" disabled={busy} onClick={onClose}>Annuler</button><button className="primary-button" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button></div>
      </fieldset>
    </form>
  </Modal>;
}

export function TeamsPage({ teams, activeTeamId, onTeamChange, onChanged, user }) {
  const team = teams.find((item) => item.id === activeTeamId);
  const [editing, setEditing] = useState(undefined);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <div className="management-stack">
    <div className="section-heading"><div><h2>Mes équipes</h2><p>{teams.length} équipe(s)</p></div><button className="primary-button" onClick={() => setEditing(null)}>＋ Créer une équipe</button></div>
    {error && <Alert>{error}</Alert>}
    {!teams.length && <Empty>Créez votre première équipe pour commencer à collaborer et organiser vos projets.</Empty>}
    <div className="team-grid">{teams.map((item) => <article className={`panel management-team ${item.id === activeTeamId ? "selected" : ""}`} key={item.id}>
      <h3>{item.name}</h3><p>{item.description || "Aucune description."}</p><p>{item.memberCount} membre(s) · {roleLabel(item.myRole)}</p>
      <div className="management-actions"><button className="primary-button" disabled={busy || item.id === activeTeamId} onClick={() => onTeamChange(item.id)}>{item.id === activeTeamId ? "Équipe active" : "Ouvrir"}</button>
        {item.myRole === "admin" && <><button className="secondary-button" onClick={() => setEditing(item)}>Modifier</button><button className="text-button danger-text" disabled={busy} onClick={async () => {
          if (!window.confirm(`Supprimer l’équipe « ${item.name} », ses projets, tickets et commentaires ? Cette suppression est définitive.`)) return;
          setError(""); setBusy(true);
          try { await apiRequest(`/teams/${item.id}`, { method: "DELETE" }); await onChanged(); }
          catch (err) { setError(err.message); } finally { setBusy(false); }
        }}>Supprimer</button></>}
      </div>
    </article>)}</div>
    {team && <TeamMembers key={team.id} team={team} user={user} onChanged={onChanged} />}
    {editing !== undefined && <EntityForm kind="team" entity={editing} onClose={() => setEditing(undefined)} onSave={async (payload) => {
      const saved = await apiRequest(editing ? `/teams/${editing.id}` : "/teams", { method: editing ? "PATCH" : "POST", body: JSON.stringify(payload) });
      await onChanged(); if (!editing) onTeamChange(saved.id);
    }} />}
  </div>;
}

function TeamMembers({ team, user, onChanged }) {
  const [members, setMembers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState("");
  const [activityError, setActivityError] = useState("");
  const [activityLoading, setActivityLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [version, setVersion] = useState(0);
  const mutating = useRef(false);
  const alive = useRef(true);
  const admin = team.myRole === "admin";
  const adminCount = members.filter((member) => member.role === "admin").length;
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    const controller = new AbortController();
    apiRequest(`/teams/${team.id}/members`, { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setMembers(result.items); })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    apiRequest(`/teams/${team.id}/activity?limit=20`, { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setActivity(result.items); })
      .catch((err) => { if (!controller.signal.aborted) setActivityError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setActivityLoading(false); });
    return () => controller.abort();
  }, [team, version]);
  function refreshMembers() {
    setLoading(true); setActivityLoading(true); setError(""); setActivityError(""); setVersion((value) => value + 1);
  }
  async function mutate(path, options) {
    if (mutating.current) return false;
    mutating.current = true;
    setError(""); setBusy(true);
    try { await apiRequest(path, options); if (!alive.current) return false; refreshMembers(); await onChanged(); return alive.current; }
    catch (err) { if (alive.current) setError(err.message); return false; }
    finally { mutating.current = false; if (alive.current) setBusy(false); }
  }
  return <>
    <section className="panel">
      <div className="section-heading"><div><h2>Membres de {team.name}</h2><p>Les rôles déterminent les actions disponibles dans les projets.</p></div><button className="secondary-button" disabled={loading || busy} onClick={refreshMembers}>Actualiser</button></div>
      {error && <Alert>{error}</Alert>}
      {loading ? <p role="status">Chargement des membres…</p> : <div className="management-member-list">{members.map((member) => {
        const lastAdmin = member.role === "admin" && adminCount <= 1;
        return <div className="management-member-row" key={member.user.id}><Avatar user={member.user} /><div className="management-member-info"><strong>{displayName(member.user)}{member.user.id === user?.id ? " (vous)" : ""}</strong><span>{member.user.email}</span></div>
          {admin ? <><label className="management-role"><span className="sr-only">Rôle de {displayName(member.user)}</span><select aria-label={`Rôle de ${displayName(member.user)}`} value={member.role} disabled={busy || lastAdmin} title={lastAdmin ? "L’équipe doit conserver au moins un administrateur." : undefined} onChange={(e) => mutate(`/teams/${team.id}/members/${member.user.id}`, { method: "PATCH", body: JSON.stringify({ role: e.target.value }) })}>{ROLES.map((value) => <option key={value} value={value}>{roleLabel(value)}</option>)}</select></label><button className="text-button danger-text" disabled={busy || lastAdmin} title={lastAdmin ? "Dernier administrateur" : undefined} onClick={() => {
            if (window.confirm(`Retirer ${displayName(member.user)} de l’équipe ? Ses tickets ne lui seront plus assignés.`)) mutate(`/teams/${team.id}/members/${member.user.id}`, { method: "DELETE" });
          }}>Retirer</button></> : <span>{roleLabel(member.role)}</span>}
        </div>;
      })}</div>}
      {admin && <form className="management-invite" onSubmit={async (event) => {
        event.preventDefault(); const success = await mutate(`/teams/${team.id}/members`, { method: "POST", body: JSON.stringify({ email: email.trim(), role }) }); if (success) setEmail("");
      }}><h3>Ajouter un membre</h3><p>Le membre doit déjà disposer d’un compte TaskFlow avec cette adresse e-mail.</p><DirectoryLookup members={members} disabled={busy} onSelect={(account) => setEmail(account.email)} /><fieldset disabled={busy} className="management-fieldset"><div className="form-grid"><label className="form-field">Adresse e-mail<input type="email" maxLength={254} required value={email} onChange={(e) => setEmail(e.target.value)} /></label><label className="form-field">Rôle<select value={role} onChange={(e) => setRole(e.target.value)}>{ROLES.map((value) => <option value={value} key={value}>{roleLabel(value)}</option>)}</select></label></div><button className="primary-button" disabled={busy}>{busy ? "Enregistrement…" : "Ajouter à l’équipe"}</button></fieldset></form>}
    </section>
    <section className="panel"><div className="section-heading"><div><h2>Activité de l’équipe</h2><p>Les 20 dernières modifications de tickets.</p></div></div>{activityError && <Alert>{activityError}</Alert>}{activityLoading ? <p role="status">Chargement de l’activité…</p> : !activityError && (!activity.length ? <Empty>Aucune activité pour le moment.</Empty> : <ul className="management-activity">{activity.map((item) => <li key={item.id}><strong>{item.ticketKey || "Ticket"}</strong><span>{item.summary}</span><small>{displayName(item.actor)} · {new Date(item.createdAt).toLocaleString("fr-FR")}</small></li>)}</ul>)}</section>
  </>;
}

function DirectoryLookup({ members, onSelect, disabled }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  useEffect(() => {
    if (query.trim().length < 2 || disabled) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true); setError("");
      apiRequest(`/users?search=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        .then((response) => { if (!controller.signal.aborted) { setResults(response.items); setSearched(true); } })
        .catch((err) => { if (!controller.signal.aborted) setError(err.message); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, disabled]);
  const available = results.filter((account) => !members.some((member) => member.user.id === account.id));
  return <div className="management-directory">
    <label className="form-field">Rechercher dans l’annuaire<input type="search" disabled={disabled} value={query} maxLength={100} autoComplete="off" placeholder="Nom, prénom ou e-mail (2 caractères minimum)" onChange={(event) => { setQuery(event.target.value); setResults([]); setError(""); setSearched(false); setLoading(event.target.value.trim().length >= 2); }} /><small>Sélectionnez un compte pour remplir son adresse e-mail, puis choisissez son rôle.</small></label>
    {!disabled && loading && <p role="status">Recherche de comptes…</p>}
    {!disabled && error && <Alert>{error}</Alert>}
    {!disabled && searched && !loading && !error && !available.length && <p role="status">Aucun autre compte trouvé pour cette recherche.</p>}
    {!disabled && available.length > 0 && <ul className="management-directory-results" aria-label="Comptes trouvés">{available.map((account) => <li key={account.id}><button type="button" className="management-directory-account" onClick={() => { onSelect(account); setQuery(""); setResults([]); setSearched(false); setLoading(false); }}><Avatar user={account} /><span><strong>{displayName(account)}</strong><small>{account.email}</small></span><span aria-hidden="true">＋</span></button></li>)}</ul>}
  </div>;
}

export function ProjectsPage({ projects, teams, activeTeamId, onProjectChange, onChanged }) {
  const [editing, setEditing] = useState(undefined);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const managedTeams = teams.filter((team) => isManager(team.myRole));
  return <div className="management-stack">
    <div className="section-heading"><div><h2>Projets</h2><p>Ouvrez un projet pour accéder à ses tickets, son Kanban et ses features.</p></div>{managedTeams.length > 0 && <button className="primary-button" onClick={() => setEditing(null)}>＋ Créer un projet</button>}</div>
    {error && <Alert>{error}</Alert>}
    {!projects.length && <Empty>{teams.length ? "Aucun projet. Un administrateur ou chef de projet peut en créer un." : "Créez d’abord une équipe dans la page Équipes."}</Empty>}
    <div className="project-grid">{projects.map((project) => <article className="project-card" key={project.id}>
      <span className="badge progress">{project.key}</span><h2>{project.name}</h2><p>{project.description || "Aucune description."}</p><p>{teams.find((team) => team.id === project.teamId)?.name} · {roleLabel(project.myRole)}</p>
      <div className="management-actions"><button className="primary-button" onClick={() => onProjectChange(project.id, project.teamId)}>Ouvrir le projet →</button>{isManager(project.myRole) && <><button className="secondary-button" onClick={() => setEditing(project)}>Modifier</button><button disabled={busy} className="text-button danger-text" onClick={async () => {
        if (!window.confirm(`Supprimer le projet « ${project.name} » et tous ses tickets, features et commentaires ? Cette suppression est définitive.`)) return;
        setError(""); setBusy(true);
        try { await apiRequest(`/projects/${project.id}`, { method: "DELETE" }); await onChanged(); } catch (err) { setError(err.message); } finally { setBusy(false); }
      }}>Supprimer</button></>}</div>
    </article>)}</div>
    {editing !== undefined && <EntityForm kind="project" entity={editing} teams={managedTeams} defaultTeamId={managedTeams.some((team) => team.id === activeTeamId) ? activeTeamId : undefined} onClose={() => setEditing(undefined)} onSave={async (payload) => {
      const saved = await apiRequest(editing ? `/projects/${editing.id}` : "/projects", { method: editing ? "PATCH" : "POST", body: JSON.stringify(payload) });
      await onChanged(); if (!editing) onProjectChange(saved.id, saved.teamId);
    }} />}
  </div>;
}

export function FeaturesPage({ project, features, onChanged, onViewTickets }) {
  const [editing, setEditing] = useState(undefined);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const manage = isManager(project?.myRole);
  if (!project) return <Empty>Sélectionnez ou créez un projet pour gérer ses features.</Empty>;
  return <div className="management-stack">
    <div className="section-heading"><div><h2>Features de {project.name}</h2><p>Regroupez les tickets par fonctionnalité et suivez leur avancement.</p></div>{manage && <button className="primary-button" onClick={() => setEditing(null)}>＋ Nouvelle feature</button>}</div>
    {error && <Alert>{error}</Alert>}
    {!features.length && <Empty>Aucune feature dans ce projet.{manage ? " Créez une fonctionnalité pour y regrouper vos tickets." : " Un administrateur ou chef de projet peut en créer."}</Empty>}
    <div className="feature-grid">{features.map((feature) => <article className="feature-card" key={feature.id}><div className="feature-card-icon" aria-hidden="true">◇</div><h3>{feature.title}</h3><p>{feature.description || "Aucune description."}</p><div className="project-progress-label"><span>{feature.doneTicketCount} / {feature.ticketCount} tickets terminés</span><strong>{feature.progressPercent}%</strong></div><progress className="management-progress" max={100} value={feature.progressPercent} aria-label={`Avancement de ${feature.title}`} /><div className="management-actions"><button className="text-button" onClick={() => onViewTickets(feature.id)}>Voir les tickets →</button>{manage && <><button className="secondary-button" onClick={() => setEditing(feature)}>Modifier</button><button className="text-button danger-text" disabled={busy} onClick={async () => {
      if (!window.confirm(`Supprimer la feature « ${feature.title} » ? Les tickets seront conservés sans cette feature.`)) return;
      setError(""); setBusy(true);
      try { await apiRequest(`/features/${feature.id}`, { method: "DELETE" }); await onChanged(); } catch (err) { setError(err.message); } finally { setBusy(false); }
    }}>Supprimer</button></>}</div></article>)}</div>
    {editing !== undefined && <EntityForm kind="feature" entity={editing} onClose={() => setEditing(undefined)} onSave={async (payload) => {
      await apiRequest(editing ? `/features/${editing.id}` : "/features", { method: editing ? "PATCH" : "POST", body: JSON.stringify(editing ? payload : { ...payload, projectId: project.id }) });
      await onChanged();
    }} />}
  </div>;
}

