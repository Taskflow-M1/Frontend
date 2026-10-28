export const displayName = (user) => [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Utilisateur";
export const roleLabel = (role) => ({ admin: "Administrateur", project_manager: "Chef de projet", developer: "Développeur", tester: "Testeur", individual: "Personnel" })[role] || role;
export const isManager = (role) => ["admin", "project_manager"].includes(role);
