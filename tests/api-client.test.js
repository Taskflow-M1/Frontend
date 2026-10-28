import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { API_URL, apiRequest, clearSession, saveSession } from "../src/api/client.js";

const originalGlobals = { fetch: globalThis.fetch, window: globalThis.window, localStorage: globalThis.localStorage };
let requests;
let events;

function response(status, data, headers = {}) {
  return new Response(status === 204 ? null : JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...headers } });
}

beforeEach(() => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };
  globalThis.window = new EventTarget();
  requests = [];
  events = 0;
  window.addEventListener("taskflow:session", () => { events += 1; });
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return response(200, { items: [] });
  };
});

afterEach(() => {
  for (const [key, value] of Object.entries(originalGlobals)) {
    if (value === undefined) delete globalThis[key];
    else globalThis[key] = value;
  }
});

test("public authentication requests never send an existing account's bearer token", async () => {
  localStorage.setItem("token", "stale-session");
  await apiRequest("/auth/register", { method: "POST", body: JSON.stringify({ email: "person@example.test" }) });
  assert.equal(requests[0].url, `${API_URL}/auth/register`);
  assert.equal(requests[0].options.headers.Authorization, undefined);
  assert.equal(requests[0].options.headers["Content-Type"], "application/json");
  assert.equal(requests[0].options.public, undefined);
});

test("protected requests use the current token without adding an unnecessary JSON content type", async () => {
  localStorage.setItem("token", "current-session");
  assert.deepEqual(await apiRequest("/projects"), { items: [] });
  assert.equal(requests[0].options.headers.Authorization, "Bearer current-session");
  assert.equal(requests[0].options.headers["Content-Type"], undefined);
});

test("successful deletions accept an empty 204 response", async () => {
  globalThis.fetch = async () => response(204);
  assert.equal(await apiRequest("/tasks/example", { method: "DELETE" }), null);
});

test("API error messages, codes and retry delays remain available to the UI", async () => {
  globalThis.fetch = async () => response(429, { error: { message: "Patientez avant de renvoyer un code.", code: "TOO_MANY_REQUESTS" } }, { "Retry-After": "42" });
  await assert.rejects(apiRequest("/auth/register"), (error) => {
    assert.equal(error.message, "Patientez avant de renvoyer un code.");
    assert.equal(error.status, 429);
    assert.equal(error.code, "TOO_MANY_REQUESTS");
    assert.equal(error.retryAfter, 42);
    return true;
  });
});

test("network failures have an actionable message and preserve their original cause", async () => {
  const cause = new TypeError("Failed to fetch");
  globalThis.fetch = async () => { throw cause; };
  await assert.rejects(apiRequest("/projects"), (error) => {
    assert.match(error.message, /Impossible de joindre le serveur/);
    assert.equal(error.cause, cause);
    return true;
  });
});

test("request cancellation remains distinguishable from network failure", async () => {
  const abort = new DOMException("Cancelled", "AbortError");
  const controller = new AbortController();
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.signal, controller.signal);
    throw abort;
  };
  await assert.rejects(apiRequest("/projects", { signal: controller.signal }), (error) => error === abort);
});

test("an expired private session clears local credentials and informs the app", async () => {
  localStorage.setItem("token", "expired-session");
  localStorage.setItem("user", "legacy-profile");
  globalThis.fetch = async () => response(401, { error: { code: "UNAUTHORIZED", message: "Session expirée" } });
  await assert.rejects(apiRequest("/users/me"), { status: 401 });
  assert.equal(localStorage.getItem("token"), null);
  assert.equal(localStorage.getItem("user"), null);
  assert.equal(events, 1);
});

test("a delayed 401 from an old request cannot clear a newly established session", async () => {
  localStorage.setItem("token", "old-session");
  let complete;
  globalThis.fetch = () => new Promise((resolve) => { complete = resolve; });
  const pending = apiRequest("/teams");
  saveSession({ token: "new-session", user: { id: "new-user" } });
  complete(response(401, { error: { code: "UNAUTHORIZED", message: "Old request expired" } }));
  await assert.rejects(pending, { status: 401 });
  assert.equal(localStorage.getItem("token"), "new-session");
  assert.equal(events, 1);
});

test("incorrect current password displays its 401 without logging out the account", async () => {
  localStorage.setItem("token", "valid-session");
  globalThis.fetch = async () => response(401, { error: { code: "UNAUTHORIZED", message: "Mot de passe actuel incorrect" } });
  await assert.rejects(apiRequest("/users/me/password", { method: "PATCH", body: JSON.stringify({ currentPassword: "incorrect", newPassword: "another-password" }) }), { status: 401 });
  assert.equal(localStorage.getItem("token"), "valid-session");
  assert.equal(events, 0);
});

test("failed login never clears a previously saved session", async () => {
  localStorage.setItem("token", "existing-session");
  globalThis.fetch = async () => response(401, { error: { code: "UNAUTHORIZED", message: "Identifiants incorrects" } });
  await assert.rejects(apiRequest("/auth/login", { method: "POST", body: "{}" }), { status: 401 });
  assert.equal(localStorage.getItem("token"), "existing-session");
  assert.equal(events, 0);
});

test("invalid authentication responses cannot create an undefined-token session", () => {
  assert.throws(() => saveSession({ user: { id: "person" } }), /session valide/);
  assert.throws(() => saveSession({ token: "token", user: {} }), /session valide/);
  assert.equal(localStorage.getItem("token"), null);
  assert.equal(events, 0);
});

test("saving and clearing a valid session emits updates and removes legacy profile caches", () => {
  localStorage.setItem("user", "legacy-profile");
  saveSession({ token: "fresh-token", user: { id: "person" } });
  assert.equal(localStorage.getItem("token"), "fresh-token");
  assert.equal(localStorage.getItem("user"), null);
  assert.equal(events, 1);
  clearSession();
  assert.equal(localStorage.getItem("token"), null);
  assert.equal(events, 2);
});
