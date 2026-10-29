/* oxlint-disable react/set-state-in-effect -- These effects synchronize request loading and session state with the API. */
import { displayName } from "./workspace/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import "./workspace/workspace.css";
import butterfly from "./assets/butterfly.png";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { apiRequest, clearSession } from "./api/client";
import { Alert, Avatar, Empty } from "./workspace/ui";
import { TeamsPage, ProjectsPage, FeaturesPage } from "./workspace/Management";
import { ProfilePage, TasksPage } from "./workspace/Account";
import { TicketsPage, TicketEditor, TicketDetails } from "./workspace/Tickets";
import { WorkspaceDashboard } from "./workspace/Dashboard";

const ROUTES = { Dashboard: "dashboard", Kanban: "kanban", "Mes tickets": "tickets", Features: "features", Projets: "projects", Équipe: "teams", Profile: "profile", Tasks: "tasks", Home: "home", SignIn: "login", SignUp: "register", Help: "help" };
const MENU = [["Dashboard", "⌂", "Tableau de bord"], ["Kanban", "▦", "Kanban"], ["Mes tickets", "☷", "Tickets"], ["Features", "◇", "Features"], ["Projets", "▣", "Projets"], ["Équipe", "♧", "Équipes et membres"], ["Tasks", "✓", "Mes tâches"], ["Profile", "◉", "Mon profil"], ["Help", "?", "Aide"]];
const PUBLIC = ["Home", "SignIn", "SignUp"];
const COPYRIGHT_YEAR = new Date().getFullYear();
function readPage() { const route = window.location.hash.slice(2).split("?")[0]; return Object.keys(ROUTES).find((key) => ROUTES[key] === route) || (localStorage.getItem("token") ? "Dashboard" : "Home"); }
function usePage() {
  const [page, update] = useState(readPage);
  useEffect(() => { const change = () => update(readPage()); window.addEventListener("hashchange", change); return () => window.removeEventListener("hashchange", change); }, []);
  const navigate = useCallback((next) => { window.location.hash = `/${ROUTES[next] || "dashboard"}`; update(next); }, []);
  return [page, navigate];
}

export default function App() {
  const [page, navigate] = usePage();
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(token));
  const [authError, setAuthError] = useState("");
  const [authRetry, setAuthRetry] = useState(0);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamId, setTeamId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [scope, setScope] = useState({ key: "", members: [], features: [] });
  const [loading, setLoading] = useState(false);
  const [scopeLoading, setScopeLoading] = useState(false);
  const [error, setError] = useState("");
  const [scopeError, setScopeError] = useState("");
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [featureId, setFeatureId] = useState("");
  const [createTicket, setCreateTicket] = useState(false);
  const [detail, setDetail] = useState(null);
  const workspaceSequence = useRef(0);
  const userId = user?.id;
  const activeTeam = teams.find((item) => item.id === teamId) || teams[0] || null;
  const teamProjects = projects.filter((item) => item.teamId === activeTeam?.id);
  const project = teamProjects.find((item) => item.id === projectId) || teamProjects[0] || null;
  const scopeKey = `${activeTeam?.id || ""}:${project?.id || ""}`;
  const activeTeamKey = activeTeam?.id;
  const activeProjectKey = project?.id;
  const members = scope.key === scopeKey ? scope.members : [];
  const features = scope.key === scopeKey ? scope.features : [];

  useEffect(() => {
    const changed = () => { const nextToken = localStorage.getItem("token"); workspaceSequence.current += 1; setUser(null); setToken(nextToken); setAuthLoading(Boolean(nextToken)); setAuthRetry((value) => value + 1); };
    const storage = (event) => { if (event.key === "token" || event.key === null) changed(); };
    window.addEventListener("taskflow:session", changed); window.addEventListener("storage", storage);
    return () => { window.removeEventListener("taskflow:session", changed); window.removeEventListener("storage", storage); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setAuthError(""); setUser(null);
    setTeams([]); setProjects([]); setScope({ key: "", members: [], features: [] }); setDetail(null); setCreateTicket(false);
    if (!token) { setAuthLoading(false); return; }
    setAuthLoading(true);
    apiRequest("/users/me", { signal: controller.signal }).then((profile) => {
      if (controller.signal.aborted) return;
      setUser(profile);
      setTeamId(localStorage.getItem(`taskflow:team:${profile.id}`) || "");
      setProjectId(localStorage.getItem(`taskflow:project:${profile.id}`) || "");
    }).catch((err) => { if (!controller.signal.aborted) setAuthError(err.message); }).finally(() => { if (!controller.signal.aborted) setAuthLoading(false); });
    return () => controller.abort();
  }, [token, authRetry]);
  const loadWorkspace = useCallback(async (signal) => {
    if (!userId || !token || token !== localStorage.getItem("token")) return false;
    const sequence = ++workspaceSequence.current;
    setLoading(true); setError("");
    try {
      const [teamData, projectData] = await Promise.all([apiRequest("/teams", { signal }), apiRequest("/projects", { signal })]);
      if (signal?.aborted || sequence !== workspaceSequence.current || token !== localStorage.getItem("token")) return false;
      setTeams(teamData.items); setProjects(projectData.items);
      return true;
    } catch (err) { if (!signal?.aborted && sequence === workspaceSequence.current && token === localStorage.getItem("token")) setError(err.message); return false; }
    finally { if (!signal?.aborted && sequence === workspaceSequence.current) setLoading(false); }
  }, [userId, token]);
  useEffect(() => { const controller = new AbortController(); loadWorkspace(controller.signal); return () => controller.abort(); }, [loadWorkspace]);
  const refresh = useCallback(async () => { if (await loadWorkspace()) setRevision((value) => value + 1); }, [loadWorkspace]);
  useEffect(() => {
    const controller = new AbortController();
    setScopeError(""); setScopeLoading(true);
    const requests = [activeTeamKey ? apiRequest(`/teams/${activeTeamKey}/members`, { signal: controller.signal }) : Promise.resolve({ items: [] }), activeProjectKey ? apiRequest(`/projects/${activeProjectKey}/features`, { signal: controller.signal }) : Promise.resolve({ items: [] })];
    Promise.all(requests).then(([memberData, featureData]) => { if (!controller.signal.aborted) setScope({ key: scopeKey, members: memberData.items, features: featureData.items }); }).catch((err) => { if (!controller.signal.aborted) setScopeError(err.message); }).finally(() => { if (!controller.signal.aborted) setScopeLoading(false); });
    return () => controller.abort();
  }, [activeTeamKey, activeProjectKey, scopeKey, revision]);
  useEffect(() => { setFeatureId(""); setDetail(null); setCreateTicket(false); }, [project?.id]);
  const selectTeam = (id) => { setTeamId(id); setProjectId(""); if (user) { localStorage.setItem(`taskflow:team:${user.id}`, id); localStorage.removeItem(`taskflow:project:${user.id}`); } };
  const selectProject = (id, teamHint) => { const nextTeamId = teamHint || projects.find((item) => item.id === id)?.teamId; if (nextTeamId) selectTeam(nextTeamId); setProjectId(id); if (user) localStorage.setItem(`taskflow:project:${user.id}`, id); };
  const go = (next) => { setSearch(""); setFeatureId(""); navigate(next); };

  if (PUBLIC.includes(page)) {
    const Page = { Home, SignIn, SignUp }[page];
    return <Page setPage={navigate} />;
  }
  if (!token) return <SignIn setPage={navigate} />;
  if (authLoading) return <main className="session-state" aria-busy="true">Chargement de votre compte…</main>;
  if (!user) return <main className="session-state"><Alert>{authError || "Impossible de charger votre compte."}</Alert><button className="primary-button" onClick={() => setAuthRetry((value) => value + 1)}>Réessayer</button><button className="text-button" onClick={() => { clearSession(); navigate("SignIn"); }}>Se reconnecter</button></main>;
  const title = MENU.find(([id]) => id === page)?.[2] || "Page introuvable";
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#/dashboard"><img className="butterfly-logo" src={butterfly} alt="" /><div><strong>TaskFlow</strong><span>WORKSPACE</span></div></a>
      <p className="nav-label">MON ESPACE</p>
      <nav className="main-nav" aria-label="Navigation principale">{MENU.map(([id, icon, label]) => <a key={id} className={`nav-item ${page === id ? "active" : ""}`} href={`#/${ROUTES[id]}`} aria-label={label} title={label} aria-current={page === id ? "page" : undefined} onClick={() => { setSearch(""); setFeatureId(""); }}><span className="nav-icon" aria-hidden="true">{icon}</span><span className="nav-text">{label}</span></a>)}</nav>
      <div className="sidebar-bottom"><button className="sidebar-profile profile-link" onClick={() => go("Profile")}><Avatar user={user} /><div><strong>{displayName(user)}</strong><span>{user.email}</span></div></button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>Mon espace</span><span>/</span><strong>{title}</strong></div><div className="topbar-actions"><button className="secondary-button" onClick={refresh} disabled={loading}>Actualiser</button><button className="text-button" onClick={() => { clearSession(); navigate("Home"); }}>Se déconnecter</button></div></header>
      <div className="page-content">
        <div className="page-heading"><div><p className="eyebrow">TASKFLOW / {activeTeam?.name || "MON ESPACE"}</p><h1>{title}</h1></div></div>
        <div className="scope-controls"><label>Équipe<select value={activeTeam?.id || ""} onChange={(event) => selectTeam(event.target.value)} disabled={!teams.length}><option value="" disabled>Choisir une équipe</option>{teams.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Projet<select value={project?.id || ""} onChange={(event) => selectProject(event.target.value)} disabled={!teamProjects.length}><option value="" disabled>Choisir un projet</option>{teamProjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
        <Alert>{error}</Alert>{error && <button className="secondary-button" onClick={refresh}>Recharger l’espace</button>}
        {loading && <p role="status">Chargement de l’espace…</p>}
        <Alert>{scopeError}</Alert>{scopeError && <button className="secondary-button" onClick={() => setRevision((value) => value + 1)}>Recharger le projet</button>}
        {page === "Dashboard" && <WorkspaceDashboard key={`${user.id}:${project?.id || activeTeam?.id || "all"}`} user={user} project={project} team={activeTeam} revision={revision} onCreate={() => setCreateTicket(true)} onNavigate={go} onTicket={(ticket) => setDetail(ticket.id)} />}
        {["Mes tickets", "Kanban"].includes(page) && <>{project ? scope.key !== scopeKey ? <p role="status">{scopeLoading ? "Chargement du projet…" : "Les données du projet ne sont pas disponibles. Réessayez le chargement."}</p> : <TicketsPage key={`${project.id}:${page}`} project={project} features={features} members={members} user={user} onChanged={refresh} featureId={featureId} onFeatureChange={setFeatureId} mode={page === "Kanban" ? "kanban" : "list"} search={search} /> : <Empty>Créez ou sélectionnez un projet pour gérer ses tickets. <button className="primary-button" onClick={() => go(teams.length ? "Projets" : "Équipe")}>Configurer mon espace</button></Empty>}</>}
        {page === "Équipe" && <TeamsPage teams={teams} activeTeamId={activeTeam?.id || ""} onTeamChange={selectTeam} onChanged={refresh} user={user} />}
        {page === "Projets" && <ProjectsPage projects={projects} teams={teams} activeTeamId={activeTeam?.id || ""} onProjectChange={(id, teamHint) => { selectProject(id, teamHint); navigate("Dashboard"); }} onChanged={refresh} />}
        {page === "Features" && (scope.key !== scopeKey ? <p role="status">{scopeLoading ? "Chargement des features…" : "Les features ne sont pas disponibles. Réessayez le chargement."}</p> : <FeaturesPage key={project?.id || "none"} project={project} features={features} onChanged={refresh} onViewTickets={(id) => { setFeatureId(id); setSearch(""); navigate("Mes tickets"); }} />)}
        {page === "Profile" && <ProfilePage key={user.id} user={user} onUserChanged={(updated) => { if (updated.id === userId && localStorage.getItem("token") === token) setUser(updated); }} />}
        {page === "Tasks" && <TasksPage revision={revision} />}
        {page === "Help" && <Help onNavigate={go} />}
        <footer className="app-footer"><span><img className="butterfly-logo small" src={butterfly} alt="" />TaskFlow</span><span>Organisez votre travail, ensemble.</span><span>© {COPYRIGHT_YEAR} TaskFlow</span></footer>
      </div>
    </main>
    {createTicket && project && <TicketEditor project={project} features={features} members={members} user={user} onClose={() => setCreateTicket(false)} onSaved={async () => { setCreateTicket(false); await refresh(); }} />}
    {detail && project && <TicketDetails ticketId={detail} project={project} features={features} members={members} user={user} onClose={() => setDetail(null)} onChanged={refresh} />}
  </div>;
}

function Help({ onNavigate }) {
  const [showHelp, setShowHelp] = useState(false);
  const heading = useRef(null);
  useEffect(() => { if (showHelp) heading.current?.focus(); }, [showHelp]);

  if (!showHelp) return <section className="panel help-choice" aria-labelledby="help-choice-title">
    <span className="help-choice-sparkle" aria-hidden="true">✦</span>
    <p className="eyebrow">UN PETIT COUP DE MAIN ?</p>
    <h2 id="help-choice-title">C’est quoi ton mood ?</h2>
    <p>Un peu d’aide ou tu gères déjà comme une queen ?</p>
    <div className="help-choice-actions">
      <button className="help-choice-card" onClick={() => setShowHelp(true)}><span className="help-choice-emoji" aria-hidden="true">🎀</span><strong>I'm just a girl</strong><span>Un petit guide, s’il te plaît</span></button>
      <button className="help-choice-card help-choice-independent" onClick={() => onNavigate("Dashboard")}><span className="help-choice-emoji" aria-hidden="true">💪</span><strong>Strong independent women</strong><span>Je gère, retour au tableau de bord</span></button>
    </div>
  </section>;

  return <><div className="help-back"><button className="text-button" onClick={() => setShowHelp(false)}>← Changer de mood</button></div><div ref={heading} tabIndex={-1} aria-label="Guide d’aide"><HelpGuide onNavigate={onNavigate} /></div></>;
}

function HelpGuide({ onNavigate }) {
  return <section className="panel help-page"><h2>Bien démarrer</h2><ol><li>Créez votre équipe, puis ajoutez vos collaborateurs par leur adresse e-mail. Ils doivent déjà avoir un compte TaskFlow.</li><li>Créez un projet avec une clé courte qui identifiera ses tickets.</li><li>Regroupez le travail dans des features et créez vos tickets depuis le tableau de bord, la liste ou le Kanban.</li><li>Assignez les tickets, échangez dans les commentaires et suivez les changements dans l’historique.</li></ol><h3>Les rôles</h3><p>Les administrateurs gèrent l’équipe et ses membres. Les chefs de projet gèrent les projets et les features. Les développeurs font avancer leurs tickets jusqu’à la recette ; les testeurs peuvent valider la recette et rouvrir les tickets. Les permissions sont contrôlées par le serveur.</p><h3>Votre espace personnel</h3><p>Votre profil permet de changer votre photo et votre mot de passe. Vos tâches personnelles restent privées.</p><div className="management-actions"><button className="primary-button" onClick={() => onNavigate("Équipe")}>Gérer mes équipes</button><button className="secondary-button" onClick={() => onNavigate("Profile")}>Mon profil</button></div></section>;
}
