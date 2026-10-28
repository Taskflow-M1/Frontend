export const API_URL = (import.meta.env?.VITE_API_URL || "https://backend-production-76b88.up.railway.app/api").replace(/\/$/, "");

export function saveSession({ token, user }) {
  if (!token || !user?.id) throw new Error("La réponse du serveur ne contient pas de session valide.");
  localStorage.setItem("token", token);
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("taskflow:session"));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("taskflow:session"));
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  const { public: isPublic = path.startsWith("/auth/"), ...requestOptions } = options;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...requestOptions,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(!isPublic && token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.", { cause: error });
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error?.message || `Erreur API : ${response.status}`);
    error.code = data?.error?.code;
    error.status = response.status;
    error.retryAfter = Number(response.headers.get("Retry-After")) || 0;
    if (!isPublic && path !== "/users/me/password" && response.status === 401 && localStorage.getItem("token") === token) clearSession();
    throw error;
  }

  return data;
}
