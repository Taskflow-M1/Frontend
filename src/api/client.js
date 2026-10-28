
const API_URL = (import.meta.env.VITE_API_URL || "https://backend-production-76b88.up.railway.app/api").replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error?.message || `Erreur API : ${response.status}`);
    error.code = data?.error?.code;
    error.status = response.status;
    throw error;
  }

  return data;
}
