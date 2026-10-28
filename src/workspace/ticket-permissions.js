export const ticketStatuses = { todo: "À faire", doing: "En cours", testing: "En test", done: "Terminé" };
export const ownsTicket = (ticket, user) => Boolean(user?.id && (ticket?.createdBy === user.id || ticket?.assignedTo === user.id));

// Mirrors the server workflow so controls offer only transitions the role can use.
// The API remains responsible for enforcing these permissions.
export function allowedTicketStatuses(ticket, role, user) {
  if (["admin", "project_manager"].includes(role)) return Object.keys(ticketStatuses);
  if (!ticket) return role === "developer" ? ["todo", "doing", "testing"] : role === "tester" ? Object.keys(ticketStatuses) : [];
  if (!["developer", "tester"].includes(role)) return [ticket.status];
  const dev = { todo: ["doing"], doing: ["todo", "testing"], testing: ["doing"], done: [] };
  const qa = { todo: [], doing: [], testing: ["done", "doing"], done: ["testing", "doing"] };
  const targets = role === "developer" ? dev[ticket.status] : [...qa[ticket.status], ...(ownsTicket(ticket, user) ? dev[ticket.status] : [])];
  return [...new Set([ticket.status, ...targets])];
}

export function ticketPayload(ticket, form, projectId) {
  const values = { ...form, title: form.title.trim(), description: form.description.trim(), featureId: form.featureId || null, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null };
  return ticket ? Object.fromEntries(Object.entries(values).filter(([key, value]) => value !== (ticket[key] ?? null))) : { ...values, projectId };
}
