import { displayName } from "./utils";
import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../api/client";
import { Alert, Avatar, Empty, Modal } from "./ui";
import "./Account.css";

// Keep the encoded picture below the API's 150,000-character avatar limit.
async function prepareAvatar(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choisissez une image JPG, PNG ou WebP.");
  }
  if (file.size > 10 * 1024 * 1024) throw new Error("L’image doit faire moins de 10 Mo.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const picture = new Image();
      picture.onload = () => resolve(picture);
      picture.onerror = () => reject(new Error("Cette image ne peut pas être lue."));
      picture.src = objectUrl;
    });
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("Cette image est vide.");
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 320;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Le navigateur ne permet pas de préparer cette photo.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 320, 320);
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, 320, 320);
    for (const quality of [0.86, 0.7, 0.5]) {
      const data = canvas.toDataURL("image/jpeg", quality);
      if (data.length <= 100_000) return data;
    }
    throw new Error("Cette photo est trop volumineuse. Choisissez une autre image.");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function ProfilePage({ user, onUserChanged }) {
  const [form, setForm] = useState(() => ({ firstName: user?.firstName || "", lastName: user?.lastName || "", avatarUrl: user?.avatarUrl || null }));
  const [busy, setBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const fileInput = useRef(null);
  const profileMutation = useRef(false);
  const passwordMutation = useRef(false);
  const preparingImage = useRef(false);

  async function choosePhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || preparingImage.current || profileMutation.current) return;
    preparingImage.current = true;
    setImageBusy(true); setError(""); setSuccess("");
    try {
      const avatarUrl = await prepareAvatar(file);
      setForm((current) => ({ ...current, avatarUrl }));
    } catch (err) { setError(err.message); }
    finally { preparingImage.current = false; setImageBusy(false); }
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (profileMutation.current || preparingImage.current) return;
    profileMutation.current = true;
    setBusy(true); setError(""); setSuccess("");
    try {
      const updated = await apiRequest("/users/me", { method: "PATCH", body: JSON.stringify({ ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim() }) });
      await onUserChanged(updated);
      setForm({ firstName: updated.firstName, lastName: updated.lastName, avatarUrl: updated.avatarUrl });
      setSuccess("Votre profil a été enregistré.");
    } catch (err) { setError(err.message); }
    finally { profileMutation.current = false; setBusy(false); }
  }

  async function changePassword(event) {
    event.preventDefault();
    if (passwordMutation.current) return;
    setPasswordError(""); setPasswordSuccess("");
    if (passwords.newPassword !== passwords.confirmPassword) { setPasswordError("Les mots de passe ne correspondent pas."); return; }
    if (passwords.currentPassword === passwords.newPassword) { setPasswordError("Choisissez un mot de passe différent du mot de passe actuel."); return; }
    passwordMutation.current = true;
    setPasswordBusy(true);
    try {
      const result = await apiRequest("/users/me/password", { method: "PATCH", body: JSON.stringify(passwords) });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordSuccess(result.message || "Votre mot de passe a été modifié.");
    } catch (err) { setPasswordError(err.message); }
    finally { passwordMutation.current = false; setPasswordBusy(false); }
  }

  return <div className="account-grid">
    <section className="panel">
      <h2>Mon profil</h2>
      <p className="account-description">Votre identité et votre photo sont partagées avec les membres de vos équipes.</p>
      <form onSubmit={saveProfile}>
        <div className="account-avatar-editor">
          <Avatar user={{ ...user, ...form }} />
          <div><strong>{displayName(user)}</strong><p>JPG, PNG ou WebP · 10 Mo maximum. La photo sera recadrée au centre.</p>
            <div className="account-actions">
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} hidden aria-label="Choisir une photo de profil" />
              <button type="button" className="secondary-button" disabled={busy || imageBusy} onClick={() => fileInput.current?.click()}>{imageBusy ? "Préparation…" : "Choisir une photo"}</button>
              {form.avatarUrl && <button type="button" className="text-button" disabled={busy || imageBusy} onClick={() => setForm((current) => ({ ...current, avatarUrl: null }))}>Retirer la photo</button>}
            </div>
          </div>
        </div>
        <div className="form-grid">
          <label className="form-field">Prénom<input autoComplete="given-name" maxLength={60} value={form.firstName} disabled={busy} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></label>
          <label className="form-field">Nom<input autoComplete="family-name" maxLength={60} value={form.lastName} disabled={busy} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></label>
        </div>
        <label className="form-field">Adresse e-mail<input type="email" value={user?.email || ""} readOnly /><small>L’adresse vérifiée du compte ne peut pas être modifiée.</small></label>
        {error && <Alert>{error}</Alert>}
        {success && <p className="account-success" role="status">{success}</p>}
        <div className="modal-actions"><button className="secondary-button" type="button" disabled={busy || imageBusy} onClick={() => { setForm({ firstName: user?.firstName || "", lastName: user?.lastName || "", avatarUrl: user?.avatarUrl || null }); setError(""); setSuccess(""); }}>Annuler les changements</button><button className="primary-button" disabled={busy || imageBusy}>{busy ? "Enregistrement…" : "Enregistrer le profil"}</button></div>
      </form>
    </section>
    <section className="panel">
      <h2>Sécurité du compte</h2>
      <p className="account-description">Utilisez un mot de passe d’au moins huit caractères.</p>
      <form onSubmit={changePassword}>
        <label className="form-field">Mot de passe actuel<input type="password" autoComplete="current-password" required maxLength={128} value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} disabled={passwordBusy} /></label>
        <label className="form-field">Nouveau mot de passe<input type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} disabled={passwordBusy} /></label>
        <label className="form-field">Confirmer le nouveau mot de passe<input type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} disabled={passwordBusy} /></label>
        {passwordError && <Alert>{passwordError}</Alert>}
        {passwordSuccess && <p className="account-success" role="status">{passwordSuccess}</p>}
        <div className="modal-actions"><button className="primary-button" disabled={passwordBusy}>{passwordBusy ? "Modification…" : "Changer le mot de passe"}</button></div>
      </form>
    </section>
  </div>;
}

const TASK_LABELS = { todo: "À faire", doing: "En cours", done: "Terminé" };
const emptyTask = { title: "", description: "", status: "todo", dueDate: "" };

export function TasksPage({ revision = 0 }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyTask);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [reload, setReload] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const mutation = useRef(false);
  const pendingRead = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    pendingRead.current = controller;
    async function load() {
      // Yield so effect setup/cleanup in StrictMode can cancel the obsolete read.
      await Promise.resolve();
      if (controller.signal.aborted) return;
      setLoading(true); setLoadFailed(false); setError("");
      try {
        const result = await apiRequest("/tasks", { signal: controller.signal });
        if (!controller.signal.aborted && !mutation.current) setTasks(result.items);
      } catch (err) {
        if (!controller.signal.aborted && !mutation.current) { setError(err.message); setLoadFailed(true); }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [reload, revision]);

  function beginMutation() {
    if (mutation.current) return false;
    mutation.current = true;
    pendingRead.current?.abort();
    setLoading(false);
    return true;
  }

  function endMutation() {
    // A global refresh can begin while the mutation is in flight.
    pendingRead.current?.abort();
    mutation.current = false;
    setLoading(false);
  }

  function edit(task) { setEditing(task || {}); setForm(task ? { title: task.title, description: task.description || "", status: task.status, dueDate: task.dueDate || "" } : { ...emptyTask }); setFormError(""); }

  async function save(event) {
    event.preventDefault();
    if (!editing || !beginMutation()) return;
    setSaving(true); setFormError("");
    try {
      const task = await apiRequest(editing.id ? `/tasks/${editing.id}` : "/tasks", { method: editing.id ? "PATCH" : "POST", body: JSON.stringify({ ...form, title: form.title.trim(), dueDate: form.dueDate || null }) });
      setTasks((current) => editing.id && current.some((item) => item.id === task.id) ? current.map((item) => item.id === task.id ? task : item) : [task, ...current.filter((item) => item.id !== task.id)]);
      setLoadFailed(false);
      setEditing(null);
    } catch (err) { setFormError(err.message); }
    finally { endMutation(); setSaving(false); }
  }

  async function updateStatus(task, status) {
    if (!beginMutation()) return;
    setBusyId(task.id); setError("");
    try {
      const updated = await apiRequest(`/tasks/${task.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setTasks((current) => current.map((item) => item.id === task.id ? updated : item));
      setLoadFailed(false);
    } catch (err) { setError(err.message); }
    finally { endMutation(); setBusyId(null); }
  }

  async function remove(task) {
    if (mutation.current) return;
    if (!window.confirm(`Supprimer la tâche « ${task.title} » ? Cette action est définitive.`)) return;
    if (!beginMutation()) return;
    setBusyId(task.id); setError("");
    try {
      await apiRequest(`/tasks/${task.id}`, { method: "DELETE" });
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setLoadFailed(false);
    } catch (err) { setError(err.message); }
    finally { endMutation(); setBusyId(null); }
  }

  const visible = tasks.filter((task) => (!filter || task.status === filter) && `${task.title} ${task.description}`.toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr")));
  return <section className="panel">
    <div className="section-heading"><div><h2>Mes tâches personnelles</h2><p>Ces tâches sont privées et indépendantes des tickets des équipes.</p></div><button className="primary-button" disabled={loading || saving || busyId !== null || loadFailed} onClick={() => edit(null)}>＋ Nouvelle tâche</button></div>
    {error && <Alert>{error} <button className="text-button" disabled={saving || busyId !== null} onClick={() => { setLoading(true); setError(""); setReload((value) => value + 1); }}>Réessayer</button></Alert>}
    <div className="filters"><label className="form-field">Rechercher<input type="search" placeholder="Titre ou description" value={search} onChange={(e) => setSearch(e.target.value)} /></label><label className="form-field">Statut<select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">Tous les statuts</option>{Object.entries(TASK_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>
    {loading && <p role="status">Chargement des tâches…</p>}
    {!loading && !loadFailed && visible.length === 0 ? <Empty>{tasks.length ? "Aucune tâche ne correspond à ces filtres." : "Vous n’avez pas encore de tâche personnelle. Créez la première."}</Empty> : visible.length > 0 && <div className="account-task-list">
      {visible.map((task) => <article key={task.id} className="account-task-row">
        <div className="account-task-content"><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}<small>{task.dueDate ? `Échéance : ${new Date(`${task.dueDate}T12:00:00`).toLocaleDateString("fr-FR")}` : "Sans échéance"}</small></div>
        <label className="form-field">Statut de {task.title}<select aria-label={`Statut de ${task.title}`} disabled={loading || saving || busyId !== null} value={task.status} onChange={(e) => updateStatus(task, e.target.value)}>{Object.entries(TASK_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <div className="account-actions"><button className="secondary-button" disabled={loading || saving || busyId !== null} onClick={() => edit(task)}>Modifier</button><button className="text-button" disabled={loading || saving || busyId !== null} onClick={() => remove(task)}>Supprimer</button></div>
      </article>)}
    </div>}
    {editing && <Modal title={editing.id ? "Modifier la tâche" : "Nouvelle tâche personnelle"} onClose={() => { if (!mutation.current) setEditing(null); }}>
      <form onSubmit={save}>
        <label className="form-field">Titre<input autoFocus required maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} disabled={saving} /></label>
        <label className="form-field">Description<textarea rows={4} maxLength={1000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={saving} /></label>
        <div className="form-grid"><label className="form-field">Statut<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} disabled={saving}>{Object.entries(TASK_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="form-field">Échéance<input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} disabled={saving} /></label></div>
        {formError && <Alert>{formError}</Alert>}
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setEditing(null)} disabled={saving}>Annuler</button><button className="primary-button" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button></div>
      </form>
    </Modal>}
  </section>;
}

