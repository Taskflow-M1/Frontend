
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import butterfly from "./assets/butterfly.png";

import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import TeamList from "./pages/TeamList";
import TeamForm from "./pages/TeamForm";
import MemberList from "./pages/MemberList";
import AddMemberForm from "./pages/AddMemberForm";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import Dashboard from "./pages/Dashboard";
import Kanban from "./pages/Kanban";
import TicketList from "./pages/TicketList";
import Features from "./pages/Features";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import TicketFormModal from "./pages/TicketFormModal";
import TicketDetailsModal from "./pages/TicketDetailsModal";

import { NAV_ITEMS } from "./pages/constants";
import { apiRequest } from "./api/client";
import { API_STATUS, API_PRIORITY, UI_STATUS, UI_PRIORITY } from "./pages/constants";
import { useCallback } from "react";

function Butterfly({ small = false }) {
  return (
    <img
      src={butterfly}
      alt="Logo TaskFlow"
      className={`butterfly-logo ${small ? "small" : ""}`}
    />
  );
}

export default function App() {
  const [page, setPage] = useState(localStorage.getItem("token") ? "Dashboard" : "Home");
  const [tickets, setTickets] = useState([]);
  const [features, setFeatures] = useState([]);
  const [members, setMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } });
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous les statuts");
  const [priorityFilter, setPriorityFilter] = useState("Toutes les priorités");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const emptyForm = {
    title: "",
    project: "",
    status: "À faire",
    priority: "Moyenne",
    type: "task",
    dueDate: "",
    assignee: "",
    description: "",
    feature: "",
  };

  const [form, setForm] = useState(emptyForm);

  const normalizedTickets = useMemo(() => tickets.map((ticket) => ({
    ...ticket,
    apiId: ticket.id,
    id: ticket.key || ticket.id,
    status: UI_STATUS[ticket.status] || ticket.status,
    priority: UI_PRIORITY[ticket.priority] || ticket.priority,
    project: project?.name || "Projet",
    feature: features.find((feature) => feature.id === ticket.featureId)?.title || "Sans feature",
    assignee: ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`.trim() || ticket.assignee.email : "Non assigné",
    updated: ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString("fr-FR") : "",
  })), [tickets, project, features]);

  const refreshWorkspace = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    setLoading(true); setApiError("");
    try {
      let teams = (await apiRequest("/teams")).items;
      let activeTeam = teams[0];
      if (!activeTeam) activeTeam = await apiRequest("/teams", { method: "POST", body: JSON.stringify({ name: "Mon équipe" }) });
      let projects = (await apiRequest(`/projects?teamId=${activeTeam.id}`)).items;
      let activeProject = projects[0];
      if (!activeProject) activeProject = await apiRequest("/projects", { method: "POST", body: JSON.stringify({ teamId: activeTeam.id, name: "Mon projet", key: "TASK" }) });
      const [ticketResult, featureResult, memberResult] = await Promise.all([
        apiRequest(`/projects/${activeProject.id}/tickets?limit=100`),
        apiRequest(`/projects/${activeProject.id}/features`),
        apiRequest(`/teams/${activeTeam.id}/members`),
      ]);
      setProject(activeProject); setTickets(ticketResult.items); setFeatures(featureResult.items); setMembers(memberResult.items);
    } catch (error) {
      setApiError(error.message);
      if (error.status === 401) { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); setPage("SignIn"); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refreshWorkspace(); }, [refreshWorkspace]);

  const filteredTickets = useMemo(() => {
    const query = search.toLowerCase();

    return normalizedTickets.filter((ticket) => {
      const matchesSearch = [
        ticket.title,
        ticket.id,
        ticket.assignee,
        ticket.project,
        ticket.feature,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "Tous les statuts" ||
        ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "Toutes les priorités" ||
        ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [normalizedTickets, search, statusFilter, priorityFilter]);

  function openCreate() {
    setEditingTicket(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  }

  function openEdit(ticket) {
    setEditingTicket(ticket);
    setForm({ title: ticket.title, description: ticket.description || "", status: ticket.status, priority: ticket.priority, type: ticket.type || "task", dueDate: ticket.dueDate || "", assignee: ticket.assignedTo || "", feature: ticket.feature });
    setSelectedTicket(null);
    setModalOpen(true);
  }

  async function saveTicket(event) {
    event.preventDefault();
    if (!form.title.trim() || !project) return;
    try {
      const payload = { title: form.title, description: form.description, status: API_STATUS[form.status], priority: API_PRIORITY[form.priority], type: form.type, dueDate: form.dueDate || null, featureId: features.find((item) => item.title === form.feature)?.id || null, assignedTo: form.assignee || null };
      if (editingTicket) await apiRequest(`/tickets/${editingTicket.apiId}`, { method: "PATCH", body: JSON.stringify(payload) });
      else await apiRequest("/tickets", { method: "POST", body: JSON.stringify({ ...payload, projectId: project.id }) });
      setModalOpen(false); await refreshWorkspace();
    } catch (error) { setApiError(error.message); }
  }

  async function moveTicket(ticket, status) {
    try {
      await apiRequest(`/tickets/${ticket.apiId || ticket.id}/status`, { method: "PATCH", body: JSON.stringify({ status: API_STATUS[status] }) });
      await refreshWorkspace();
      setSelectedTicket((current) => current?.id === ticket.id ? { ...current, status } : current);
    } catch (error) { setApiError(error.message); }
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("Tous les statuts");
    setPriorityFilter("Toutes les priorités");
  }

  const amelPages = {
    Home,
    SignIn,
    SignUp,
    TeamList,
    TeamForm,
    MemberList,
    AddMemberForm,
    Profile,
    Settings,
  };

  if (amelPages[page]) {
    const PageComponent = amelPages[page];
    return <PageComponent setPage={setPage} />;
  }

  if (!localStorage.getItem("token")) return <Home setPage={setPage} />;

  const descriptions = {
    Dashboard: "Retrouve les informations importantes de ton espace.",
    Kanban: "Organise le travail en faisant avancer les tickets.",
    "Mes tickets": "Consulte, filtre et gère les tickets du projet.",
    Features: "Regroupe les tickets par fonctionnalité.",
    Projets: "Retrouve les espaces de travail de ton équipe.",
    Équipe: "Les personnes qui construisent TaskFlow avec toi.",
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Butterfly />
          <div>
            <strong>TaskFlow</strong>
            <span>WORKSPACE</span>
          </div>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">T</div>
          <div>
            <strong>Mon espace</strong>
            <span>Projet étudiant</span>
          </div>
          <span className="chevron">⌄</span>
        </div>

        <p className="nav-label">MENU PRINCIPAL</p>

        <nav className="main-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => {
                setPage(item.id);
                resetFilters();
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.id}
              {item.id === "Mes tickets" && (
                <span className="nav-count">{normalizedTickets.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-sparkle">✦</div>
            <strong>Besoin d'aide ?</strong>
            <p>Retrouve les conseils pour mieux organiser ton travail.</p>
            <button
              onClick={() =>
                window.alert("Centre d'aide bientôt disponible.")
              }
            >
              Centre d'aide <span>→</span>
            </button>
          </div>

          <div className="sidebar-profile">
            <div className="avatar profile-avatar">{user?.firstName?.[0] || "U"}</div>
            <div>
              <strong>{[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Mon compte"}</strong>
              <span>{user?.email || ""}</span>
            </div>
          </div>

        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span>/</span>
            <strong>{page}</strong>
          </div>

          <div className="topbar-actions">
            <label className="global-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher..."
              />
            </label>
            <button className="notification-button" title="Notifications">
              ♧<i />
            </button>
            <button className="text-button" onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); setTickets([]); setPage("Home"); }}>Se déconnecter</button>
          </div>
        </header>

        <div className="page-content">
          {apiError && <div role="alert" className="api-notice">{apiError} <button onClick={refreshWorkspace}>Réessayer</button></div>}
          {loading && <div className="api-notice">Chargement des données…</div>}
          <div className="page-heading">
            <div>
              <p className="eyebrow">TASKFLOW / WORKSPACE</p>
              <h1>{page}</h1>
              <p>{descriptions[page]}</p>
            </div>

            {page === "Kanban" && (
              <button className="primary-button" onClick={openCreate}>
                ＋ Nouveau ticket
              </button>
            )}
          </div>

          {page === "Dashboard" && (
            <Dashboard
              tickets={normalizedTickets}
              features={features.map((feature) => ({ ...feature, name: feature.title, status: "En cours" }))}
              onCreate={openCreate}
              onSelect={setSelectedTicket}
              onNavigate={(nextPage) => setPage(nextPage)}
              Butterfly={Butterfly}
            />
          )}

          {page === "Kanban" && (
            <Kanban
              tickets={filteredTickets}
              onSelect={setSelectedTicket}
              onEdit={openEdit}
              onCreate={openCreate}
            />
          )}

          {page === "Mes tickets" && (
            <TicketList
              tickets={filteredTickets}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              onCreate={openCreate}
              onSelect={setSelectedTicket}
              onEdit={openEdit}
              onResetFilters={resetFilters}
            />
          )}

          {page === "Features" && (
            <Features
              features={features.map((feature) => ({ ...feature, name: feature.title, status: "En cours" }))}
              tickets={normalizedTickets}
              onNavigate={(featureName) => {
                setPage("Mes tickets");
                setSearch(featureName);
              }}
            />
          )}

          {page === "Projets" && (
            <Projects tickets={normalizedTickets} Butterfly={Butterfly} project={project} />
          )}

          {page === "Équipe" && <Team members={members} />}

          <footer className="app-footer">
            <span>
              <Butterfly small /> TaskFlow
            </span>
            <span>
              Organise ton travail, simplement. <b>♥</b>
            </span>
            <span>© 2026 TaskFlow</span>
          </footer>
        </div>
      </main>

      {modalOpen && (
        <TicketFormModal
          editingTicket={editingTicket}
          form={form}
          setForm={setForm}
          features={features.map((feature) => ({ ...feature, name: feature.title }))}
          members={members.map((member) => member.user)}
          onClose={() => setModalOpen(false)}
          onSave={saveTicket}
        />
      )}

      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onMove={moveTicket}
          onEdit={openEdit}
        />
      )}
    </div>
  );
}
