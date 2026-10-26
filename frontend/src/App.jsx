
import { useMemo, useState } from "react";
import "./App.css";
import butterfly from "./assets/butterfly.png";

const initialTickets = [
  {
    id: "TASK-101",
    title: "Créer la page de connexion",
    description: "Développer le formulaire de connexion.",
    type: "Story",
    priority: "Haute",
    status: "En cours",
    assignee: "Sarah",
    feature: "Authentification",
    dueDate: "2026-11-02",
  },
  {
    id: "TASK-102",
    title: "Corriger le menu de navigation",
    description: "Corriger l'affichage du menu.",
    type: "Bug",
    priority: "Moyenne",
    status: "À faire",
    assignee: "Amel",
    feature: "Interface",
    dueDate: "2026-11-05",
  },
  {
    id: "TASK-103",
    title: "Tester le formulaire",
    description: "Vérifier les champs du formulaire.",
    type: "Task",
    priority: "Haute",
    status: "En test",
    assignee: "Sarah",
    feature: "Authentification",
    dueDate: "2026-10-30",
  },
  {
    id: "TASK-104",
    title: "Créer le tableau Kanban",
    description: "Afficher les tickets par statut.",
    type: "Story",
    priority: "Basse",
    status: "Terminé",
    assignee: "Amel",
    feature: "Gestion des tickets",
    dueDate: "2026-10-25",
  },
  {
    id: "TASK-105",
    title: "Créer la page des projets",
    description: "Afficher les projets de l'équipe.",
    type: "Task",
    priority: "Moyenne",
    status: "À faire",
    assignee: "Sarah",
    feature: "Gestion des projets",
    dueDate: "2026-11-08",
  },
];

const initialFeatures = [
  {
    id: 1,
    name: "Authentification",
    description: "Inscription et connexion des utilisateurs.",
  },
  {
    id: 2,
    name: "Gestion des tickets",
    description: "Création et suivi des tickets.",
  },
  {
    id: 3,
    name: "Interface",
    description: "Navigation et expérience utilisateur.",
  },
  {
    id: 4,
    name: "Gestion des projets",
    description: "Organisation des projets de l'équipe.",
  },
];

const statuses = ["À faire", "En cours", "En test", "Terminé"];

const navigation = [
  { label: "Dashboard", icon: "⌂", section: "ESPACE DE TRAVAIL" },
  { label: "Mes tickets", icon: "▤" },
  { label: "Kanban", icon: "▥" },
  { label: "Projets", icon: "▣" },
  { label: "Features", icon: "◇" },
  { label: "Équipe", icon: "♧", section: "ORGANISATION" },
];

function Butterfly({ small = false }) {
  return (
    <img
      src={butterfly}
      alt="Logo TaskFlow"
      className={`butterfly-logo ${small ? "small" : ""}`}
    />
  );
}

function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => setPage("Dashboard")}>
        <Butterfly />
        <span>Task<span className="brand-pink">Flow</span></span>
      </button>

      <p className="side-label">MENU PRINCIPAL</p>

      <nav className="side-nav">
        {navigation.map((item) => (
          <div key={item.label}>
            {item.section && item.label !== "Dashboard" && (
              <p className="side-label section-label">{item.section}</p>
            )}
            <button
              className={`nav-link ${page === item.label ? "selected" : ""}`}
              onClick={() => setPage(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="avatar avatar-pink">SL</div>
        <div className="user-info">
          <strong>Sarah Loukkal</strong>
          <span>Équipe Frontend</span>
        </div>
        <Butterfly small />
      </div>
    </aside>
  );
}

function Header({ page, query, setQuery }) {
  return (
    <header className="topbar">
      <div className="search-box">
        <span>⌕</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un ticket, un projet..."
          aria-label="Rechercher"
        />
      </div>
      <div className="header-right">
        <span className="header-butterfly"><Butterfly small /></span>
        <div className="avatar avatar-pink">SL</div>
      </div>
    </header>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "À faire": "todo",
    "En cours": "progress",
    "En test": "testing",
    "Terminé": "done",
  };
  return <span className={`badge ${styles[status] || "todo"}`}>{status}</span>;
}

function PriorityBadge({ priority }) {
  return (
    <span className={`priority priority-${priority.toLowerCase()}`}>
      {priority}
    </span>
  );
}

function TicketTable({ tickets, onOpen }) {
  if (tickets.length === 0) {
    return <div className="empty-state">Aucun ticket trouvé.</div>;
  }

  return (
    <div className="table-scroll">
      <table className="ticket-table">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Type</th>
            <th>Priorité</th>
            <th>Statut</th>
            <th>Responsable</th>
            <th>Échéance</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => onOpen(ticket)}
              className="clickable-row"
            >
              <td>
                <span className="ticket-id">{ticket.id}</span>
                <strong className="table-ticket-title">{ticket.title}</strong>
              </td>
              <td>{ticket.type}</td>
              <td><PriorityBadge priority={ticket.priority} /></td>
              <td><StatusBadge status={ticket.status} /></td>
              <td><span className="assignee-avatar">{ticket.assignee[0]}</span>{ticket.assignee}</td>
              <td>{ticket.dueDate || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Dashboard({ tickets, setPage, onOpen }) {
  const counts = [
    { label: "Total des tickets", value: tickets.length, icon: "▤", color: "pink" },
    { label: "À faire", value: tickets.filter((t) => t.status === "À faire").length, icon: "○", color: "purple" },
    { label: "En cours", value: tickets.filter((t) => t.status === "En cours").length, icon: "◷", color: "coral" },
    { label: "Terminés", value: tickets.filter((t) => t.status === "Terminé").length, icon: "✓", color: "green" },
  ];

  return (
    <>
      <div className="welcome-row">
        <div>
          <p className="eyebrow">VOTRE ESPACE DE TRAVAIL</p>
          <h1>Bonjour Sarah <span>✿</span></h1>
          <p className="muted">Voici le résumé de votre activité sur TaskFlow.</p>
        </div>
        <div className="welcome-art">
          <Butterfly />
          <span>De grandes choses<br />se construisent ensemble ♡</span>
        </div>
      </div>

      <section className="stats-grid">
        {counts.map((item) => (
          <article className="stat-card" key={item.label}>
            <div className={`stat-symbol ${item.color}`}>{item.icon}</div>
            <p>{item.label}</p>
            <strong>{item.value}</strong>
            <span className="stat-note">Sur votre espace TaskFlow</span>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <h2>Tickets récents</h2>
              <p className="muted">Suivez les dernières tâches de l'équipe</p>
            </div>
            <button className="text-button" onClick={() => setPage("Mes tickets")}>Voir tout →</button>
          </div>
          <TicketTable tickets={tickets.slice(0, 4)} onOpen={onOpen} />
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Activité récente</h2>
              <p className="muted">Les dernières actions de l'équipe</p>
            </div>
          </div>
          {[
            ["SL", "Sarah", "a créé un ticket", "Il y a 10 min"],
            ["AM", "Amel", "a modifié un statut", "Il y a 30 min"],
            ["HZ", "Hamza", "a ajouté un commentaire", "Il y a 1 h"],
            ["RD", "Reda", "a assigné un ticket", "Il y a 2 h"],
          ].map((activity) => (
            <div className="activity-item" key={activity[0] + activity[2]}>
              <div className="avatar avatar-soft">{activity[0]}</div>
              <div>
                <p><strong>{activity[1]}</strong> {activity[2]}</p>
                <span className="muted">{activity[3]}</span>
              </div>
            </div>
          ))}
        </article>
      </section>

      <section className="panel projects-shortcut">
        <div className="panel-heading">
          <div>
            <h2>Mes projets</h2>
            <p className="muted">Accédez rapidement à vos projets</p>
          </div>
          <button className="text-button" onClick={() => setPage("Projets")}>Voir tout →</button>
        </div>
        <div className="project-mini-grid">
          {["TaskFlow", "E-commerce", "Mobile App"].map((project, index) => (
            <button className="project-mini" key={project} onClick={() => setPage("Projets")}>
              <div className={`project-icon project-${index}`}>{["🦋", "✿", "◇"][index]}</div>
              <div><strong>{project}</strong><span>{[5, 4, 3][index]} membres · {[12, 8, 6][index]} tickets</span></div>
              <span className="project-arrow">›</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function KanbanBoard({ tickets, onOpen, onStatusChange }) {
  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">PROJET TASKFLOW</p><h1>Tableau Kanban</h1><p className="muted">Visualisez l'avancement des tickets.</p></div>
      </div>
      <div className="kanban-board">
        {statuses.map((status) => {
          const columnTickets = tickets.filter((ticket) => ticket.status === status);
          return (
            <section className="kanban-column" key={status}>
              <div className="column-heading">
                <h3><span className={`column-dot dot-${statuses.indexOf(status)}`} />{status}</h3>
                <span className="count-pill">{columnTickets.length}</span>
              </div>
              {columnTickets.map((ticket) => (
                <article className="kanban-card" key={ticket.id}>
                  <button className="card-title" onClick={() => onOpen(ticket)}>{ticket.title}</button>
                  <p className="ticket-id">{ticket.id}</p>
                  <div className="kanban-card-footer">
                    <PriorityBadge priority={ticket.priority} />
                    <span className="assignee-avatar">{ticket.assignee[0]}</span>
                  </div>
                  <select
                    aria-label={`Modifier le statut de ${ticket.id}`}
                    value={ticket.status}
                    onChange={(event) => onStatusChange(ticket.id, event.target.value)}
                  >
                    {statuses.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </article>
              ))}
              {columnTickets.length === 0 && <p className="empty-column">Aucun ticket</p>}
            </section>
          );
        })}
      </div>
    </>
  );
}

function TicketList({ tickets, onOpen }) {
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [priorityFilter, setPriorityFilter] = useState("Toutes");

  const filtered = tickets.filter((ticket) =>
    (statusFilter === "Tous" || ticket.status === statusFilter) &&
    (priorityFilter === "Toutes" || ticket.priority === priorityFilter)
  );

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">SUIVI DU TRAVAIL</p><h1>Mes tickets</h1><p className="muted">Consultez et filtrez les tickets.</p></div>
      </div>
      <section className="panel">
        <div className="filters">
          <label>Statut
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>Tous</option>{statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>Priorité
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option>Toutes</option>{["Haute", "Moyenne", "Basse"].map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <button className="secondary-button" onClick={() => { setStatusFilter("Tous"); setPriorityFilter("Toutes"); }}>Réinitialiser</button>
        </div>
        <TicketTable tickets={filtered} onOpen={onOpen} />
      </section>
    </>
  );
}

function Features({ features, tickets, onAddFeature }) {
  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">ORGANISATION DU PROJET</p><h1>Features</h1><p className="muted">Organisez les fonctionnalités et leurs tickets.</p></div>
        <button className="primary-button" onClick={onAddFeature}>+ Nouvelle feature</button>
      </div>
      <div className="features-grid">
        {features.map((feature, index) => {
          const linked = tickets.filter((ticket) => ticket.feature === feature.name);
          const done = linked.filter((ticket) => ticket.status === "Terminé").length;
          const progress = linked.length ? Math.round(done / linked.length * 100) : 0;
          return (
            <article className="panel feature-card" key={feature.id}>
              <div className={`feature-icon feature-color-${index % 4}`}>◇</div>
              <h3>{feature.name}</h3>
              <p className="muted">{feature.description}</p>
              <div className="progress-label"><span>Progression</span><strong>{progress}%</strong></div>
              <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
              <p className="muted">{linked.length} ticket(s) associé(s)</p>
              <div className="feature-ticket-list">
                {linked.map((ticket) => <button key={ticket.id} onClick={() => window.alert(`${ticket.id} — ${ticket.title}`)}>{ticket.id} · {ticket.title}</button>)}
                {linked.length === 0 && <span className="muted">Aucun ticket associé</span>}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function Projects({ setPage }) {
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">ESPACE DE TRAVAIL</p><h1>Mes projets</h1><p className="muted">Retrouvez les projets de votre équipe.</p></div></div>
      <div className="features-grid">
        {[
          ["TaskFlow", "Application de gestion de tickets", "5 membres", "12 tickets"],
          ["E-commerce", "Site de vente en ligne", "4 membres", "8 tickets"],
          ["Mobile App", "Application mobile", "3 membres", "6 tickets"],
        ].map((project, index) => (
          <article className="panel feature-card" key={project[0]}>
            <div className={`project-icon project-${index}`}>{["🦋", "✿", "◇"][index]}</div>
            <h3>{project[0]}</h3><p className="muted">{project[1]}</p>
            <div className="project-facts"><span>{project[2]}</span><span>{project[3]}</span></div>
            <button className="primary-button full-button" onClick={() => setPage("Kanban")}>Ouvrir le tableau</button>
          </article>
        ))}
      </div>
    </>
  );
}

function Team() {
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">ORGANISATION</p><h1>Mon équipe</h1><p className="muted">Les membres qui collaborent sur vos projets.</p></div></div>
      <section className="panel">
        {[
          ["SL", "Sarah Loukkal", "Frontend", "Administratrice"],
          ["AM", "Amel", "Frontend", "Développeuse"],
          ["HZ", "Hamza", "Backend", "Développeur"],
          ["RD", "Reda", "Backend", "Développeur"],
        ].map((member) => (
          <div className="team-row" key={member[0]}>
            <div className="avatar avatar-soft">{member[0]}</div>
            <div className="team-name"><strong>{member[1]}</strong><span className="muted">{member[2]}</span></div>
            <span className="role-pill">{member[3]}</span>
          </div>
        ))}
      </section>
    </>
  );
}

function TicketModal({ ticket, onClose, onSave }) {
  const [form, setForm] = useState(ticket || {
    title: "", description: "", type: "Task", priority: "Moyenne",
    status: "À faire", assignee: "Sarah", feature: "Authentification", dueDate: "",
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="ticket-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-heading">
          <div><p className="eyebrow">{ticket ? "MODIFICATION" : "NOUVEAU TICKET"}</p><h2>{ticket ? ticket.id : "Créer un ticket"}</h2></div>
          <button type="button" className="close-button" onClick={onClose}>×</button>
        </div>
        <label>Titre du ticket *
          <input required value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Ex. Créer la page d'accueil" />
        </label>
        <label>Description
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Décrivez le travail à réaliser..." rows="3" />
        </label>
        <div className="form-grid">
          <label>Type
            <select value={form.type} onChange={(e) => update("type", e.target.value)}>{["Task", "Bug", "Story"].map((v) => <option key={v}>{v}</option>)}</select>
          </label>
          <label>Priorité
            <select value={form.priority} onChange={(e) => update("priority", e.target.value)}>{["Basse", "Moyenne", "Haute"].map((v) => <option key={v}>{v}</option>)}</select>
          </label>
          <label>Statut
            <select value={form.status} onChange={(e) => update("status", e.target.value)}>{statuses.map((v) => <option key={v}>{v}</option>)}</select>
          </label>
          <label>Responsable
            <select value={form.assignee} onChange={(e) => update("assignee", e.target.value)}>{["Sarah", "Amel", "Hamza", "Reda"].map((v) => <option key={v}>{v}</option>)}</select>
          </label>
          <label>Feature
            <select value={form.feature} onChange={(e) => update("feature", e.target.value)}>{initialFeatures.map((v) => <option key={v.id}>{v.name}</option>)}</select>
          </label>
          <label>Date limite
            <input type="date" value={form.dueDate || ""} onChange={(e) => update("dueDate", e.target.value)} />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Annuler</button>
          <button className="primary-button" type="submit">Enregistrer</button>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [tickets, setTickets] = useState(initialTickets);
  const [features, setFeatures] = useState(initialFeatures);
  const [query, setQuery] = useState("");
  const [editingTicket, setEditingTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const searchedTickets = useMemo(() => tickets.filter((ticket) =>
    `${ticket.id} ${ticket.title} ${ticket.assignee} ${ticket.feature}`
      .toLowerCase().includes(query.toLowerCase())
  ), [tickets, query]);

  function saveTicket(form) {
    if (form.id) {
      setTickets((current) => current.map((t) => t.id === form.id ? form : t));
    } else {
      const number = Math.max(100, ...tickets.map((t) => Number(t.id.split("-")[1]))) + 1;
      setTickets((current) => [...current, { ...form, id: `TASK-${number}` }]);
    }
    setModalOpen(false);
    setEditingTicket(null);
  }

  function changeStatus(id, status) {
    setTickets((current) => current.map((ticket) => ticket.id === id ? { ...ticket, status } : ticket));
  }

  function addFeature() {
    const name = window.prompt("Nom de la nouvelle feature :");
    if (name?.trim()) {
      setFeatures((current) => [...current, {
        id: Date.now(), name: name.trim(), description: "Nouvelle fonctionnalité du projet.",
      }]);
    }
  }

  function renderPage() {
    if (page === "Dashboard") {
      return <Dashboard tickets={searchedTickets} setPage={setPage} onOpen={(ticket) => { setEditingTicket(ticket); setModalOpen(true); }} />;
    }
    if (page === "Kanban") {
      return <KanbanBoard tickets={searchedTickets} onStatusChange={changeStatus} onOpen={(ticket) => { setEditingTicket(ticket); setModalOpen(true); }} />;
    }
    if (page === "Mes tickets") {
      return <TicketList tickets={searchedTickets} onOpen={(ticket) => { setEditingTicket(ticket); setModalOpen(true); }} />;
    }
    if (page === "Features") {
      return <Features features={features} tickets={tickets} onAddFeature={addFeature} />;
    }
    if (page === "Projets") return <Projects setPage={setPage} />;
    if (page === "Équipe") return <Team />;
    return null;
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} />
      <main className="main-area">
        <Header page={page} query={query} setQuery={setQuery} />
        <div className="page-content">
          {renderPage()}
          <footer className="app-footer"><Butterfly small /> TaskFlow · Organisez, collaborez, réussissez.</footer>
        </div>
      </main>

      <button className="floating-add" onClick={() => { setEditingTicket(null); setModalOpen(true); }} aria-label="Créer un ticket">+</button>

      {modalOpen && (
        <TicketModal
          ticket={editingTicket}
          onClose={() => { setModalOpen(false); setEditingTicket(null); }}
          onSave={saveTicket}
        />
      )}
    </div>
  );
}
