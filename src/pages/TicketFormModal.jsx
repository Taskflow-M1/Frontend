
import { PRIORITIES, STATUSES } from "./constants";

export default function TicketFormModal({
  editingTicket,
  form,
  setForm,
  features,
  members = [],
  onClose,
  onSave,
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">
              {editingTicket ? "MODIFICATION" : "NOUVEAU TICKET"}
            </p>
            <h2>
              {editingTicket ? "Modifier le ticket" : "Créer un ticket"}
            </h2>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={onSave}>
          <label className="form-field full">
            Titre du ticket *
            <input
              required
              autoFocus
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              placeholder="Ex. : Créer la page de profil"
            />
          </label>

          <label className="form-field full">
            Description
            <textarea
              rows="3"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Décris le travail à réaliser..."
            />
          </label>

          <div className="form-grid">
            <label className="form-field">
              Statut
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                {STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              Priorité
              <select
                value={form.priority}
                onChange={(event) =>
                  setForm({ ...form, priority: event.target.value })
                }
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              Type
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                <option value="task">Tâche</option><option value="bug">Anomalie</option><option value="story">User story</option><option value="improvement">Amélioration</option>
              </select>
            </label>

            <label className="form-field">
              Échéance
              <input type="date" value={form.dueDate || ""} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
            </label>

            <label className="form-field">
              Assigné à
              <select
                value={form.assignee}
                onChange={(event) =>
                  setForm({ ...form, assignee: event.target.value })
                }
              >
                <option value="">Non assigné</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{[member.firstName, member.lastName].filter(Boolean).join(" ") || member.email}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              Feature
              <select
                value={form.feature}
                onChange={(event) =>
                  setForm({ ...form, feature: event.target.value })
                }
              >
                <option value="">Aucune feature</option>
                {features.map((feature) => (
                  <option key={feature.name}>{feature.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Annuler
            </button>
            <button type="submit" className="primary-button">
              {editingTicket ? "Enregistrer" : "Créer le ticket"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
