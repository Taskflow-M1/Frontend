import { test } from "node:test";
import assert from "node:assert/strict";
import { allowedTicketStatuses, ticketPayload } from "../src/workspace/ticket-permissions.js";

const user = { id: "alice" };
const ticket = { id: "mongo-ticket", createdBy: "bob", assignedTo: null, status: "todo", title: "Titre", description: "", priority: "medium", type: "task", dueDate: null, featureId: "mongo-feature" };

test("developers cannot skip QA, complete a ticket, or reopen a completed ticket", () => {
  assert.deepEqual(allowedTicketStatuses(ticket, "developer", user), ["todo", "doing"]);
  assert.deepEqual(allowedTicketStatuses({ ...ticket, status: "doing" }, "developer", user), ["doing", "todo", "testing"]);
  assert.deepEqual(allowedTicketStatuses({ ...ticket, status: "testing" }, "developer", user), ["testing", "doing"]);
  assert.deepEqual(allowedTicketStatuses({ ...ticket, status: "done" }, "developer", user), ["done"]);
  assert.ok(!allowedTicketStatuses(null, "developer", user).includes("done"));
});

test("testers validate QA for any ticket, but only start work on their own tickets", () => {
  assert.deepEqual(allowedTicketStatuses(ticket, "tester", user), ["todo"]);
  assert.deepEqual(allowedTicketStatuses({ ...ticket, assignedTo: "alice" }, "tester", user), ["todo", "doing"]);
  assert.ok(allowedTicketStatuses({ ...ticket, status: "testing" }, "tester", user).includes("done"));
  assert.ok(allowedTicketStatuses({ ...ticket, status: "done" }, "tester", user).includes("testing"));
  assert.ok(!allowedTicketStatuses({ ...ticket, status: "done" }, "tester", user).includes("todo"));
});

test("managers can use every state; an unknown role cannot mutate state", () => {
  assert.equal(allowedTicketStatuses(ticket, "admin", user).length, 4);
  assert.equal(allowedTicketStatuses(ticket, "project_manager", user).length, 4);
  assert.deepEqual(allowedTicketStatuses(ticket, undefined, user), ["todo"]);
});

test("an unchanged feature and assignee are omitted from edits to avoid forbidden patches", () => {
  const form = { title: "Nouveau titre", description: "", status: "todo", priority: "medium", type: "task", dueDate: "", assignedTo: "", featureId: "mongo-feature" };
  assert.deepEqual(ticketPayload(ticket, form, "mongo-project"), { title: "Nouveau titre" });
});

test("creation preserves database IDs and normalizes optional blank values", () => {
  const form = { title: "  Un ticket  ", description: " Description ", status: "todo", priority: "high", type: "bug", dueDate: "", assignedTo: "alice", featureId: "mongo-feature" };
  const payload = ticketPayload(null, form, "mongo-project");
  assert.equal(payload.projectId, "mongo-project");
  assert.equal(payload.featureId, "mongo-feature");
  assert.equal(payload.assignedTo, "alice");
  assert.equal(payload.title, "Un ticket");
  assert.equal(payload.dueDate, null);
  assert.ok(!Object.hasOwn(payload, "id"));
});
