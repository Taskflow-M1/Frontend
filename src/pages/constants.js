
export const STATUSES = ["À faire", "En cours", "En test", "Terminé"];
export const API_STATUS = { "À faire": "todo", "En cours": "doing", "En test": "testing", "Terminé": "done" };
export const UI_STATUS = Object.fromEntries(Object.entries(API_STATUS).map(([label, value]) => [value, label]));

export const PRIORITIES = ["Basse", "Moyenne", "Haute", "Critique"];
export const API_PRIORITY = { "Basse": "low", "Moyenne": "medium", "Haute": "high", "Critique": "critical" };
export const UI_PRIORITY = Object.fromEntries(Object.entries(API_PRIORITY).map(([label, value]) => [value, label]));

export const MEMBERS = ["Sarah", "Amel", "Hamza", "Reda"];

export const NAV_ITEMS = [
  { id: "Dashboard", icon: "⌂" },
  { id: "Kanban", icon: "▦" },
  { id: "Mes tickets", icon: "☷" },
  { id: "Features", icon: "◇" },
  { id: "Projets", icon: "▣" },
  { id: "Équipe", icon: "♧" },
];

export function statusClass(status) {
  return {
    "À faire": "todo",
    "En cours": "doing",
    "En test": "testing",
    "Terminé": "completed",
  }[status] || "todo";
}

export function statusTone(status) {
  return {
    "À faire": "todo-badge",
    "En cours": "progress",
    "En test": "testing-badge",
    "Terminé": "done",
  }[status] || "";
}
