
import { useMemo, useState } from "react";
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
import { INITIAL_TICKETS, INITIAL_FEATURES } from "./pages/tickets";

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
  const [page, setPage] = useState("Dashboard");
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [features] = useState(INITIAL_FEATURES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous les statuts");
  const [priorityFilter, setPriorityFilter] = useState("Toutes les priorités");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const emptyForm = {
    title: "",
    project: "TaskFlow",
    status: "À faire",
    priority: "Moyenne",
    assignee: "Sarah",
    description: "",
    feature: "Dashboard",
  };

  const [form, setForm] = useState(emptyForm);

  const filteredTickets = useMemo(() => {
    const query = search.toLowerCase();

    return tickets.filter((ticket) => {
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
  }, [tickets, search, statusFilter, priorityFilter]);

  function openCreate() {
    setEditingTicket(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  }

  function openEdit(ticket) {
    setEditingTicket(ticket);
    setForm({ ...ticket });
    setSelectedTicket(null);
    setModalOpen(true);
  }

  function saveTicket(event) {
    event.preventDefault();
    if (!form.title.trim()) return;

    if (editingTicket) {
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === editingTicket.id
            ? { ...ticket, ...form, updated: "À l'instant" }
            : ticket
        )
      );
    } else {
      const nextNumber =
        Math.max(
          100,
          ...tickets.map((ticket) => Number(ticket.id.replace("TF-", "")))
        ) + 1;

      const newTicket = {
        ...form,
        id: `TF-${nextNumber}`,
        updated: "À l'instant",
      };

      setTickets((current) => [newTicket, ...current]);
    }

    setModalOpen(false);
  }

  function moveTicket(ticket, status) {
    setTickets((current) =>
      current.map((item) =>
        item.id === ticket.id
          ? { ...item, status, updated: "À l'instant" }
          : item
      )
    );

    setSelectedTicket((current) =>
      current?.id === ticket.id ? { ...current, status } : current
    );
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
                <span className="nav-count">{tickets.length}</span>
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
            <div className="avatar profile-avatar">S</div>
            <div>
              <strong>Sarah Loukkal</strong>
              <span>Administratrice</span>
            </div>
          </div>

          <div className="sidebar-profile">
            <button className="text-button" onClick={() => setPage("Home")}>
              Ouvrir les pages de l'équipe
            </button>
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
            <div className="avatar profile-avatar">S</div>
          </div>
        </header>

        <div className="page-content">
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
              tickets={tickets}
              features={features}
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
              features={features}
              tickets={tickets}
              onNavigate={(featureName) => {
                setPage("Mes tickets");
                setSearch(featureName);
              }}
            />
          )}

          {page === "Projets" && (
            <Projects tickets={tickets} Butterfly={Butterfly} />
          )}

          {page === "Équipe" && <Team />}

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
          features={features}
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
