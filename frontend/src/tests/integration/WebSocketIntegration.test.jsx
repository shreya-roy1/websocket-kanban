import React from "react";
import { render, screen, act } from "@testing-library/react";
import { vi } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";

// Socket event registration interceptor
const listeners = {};
const mockSocket = {
  on: vi.fn((event, callback) => {
    listeners[event] = callback;
  }),
  emit: vi.fn(),
  disconnect: vi.fn()
};

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => mockSocket)
}));

test("WebSocket receives task sync and updates UI", async () => {
  render(<KanbanBoard />);

  // Should start with loading indicator
  expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();

  // Simulate server sending initial tasks
  act(() => {
    listeners["sync:tasks"]([
      {
        id: "task-abc",
        title: "Integration Sync Task",
        description: "Verify integration works",
        status: "todo",
        priority: "Low",
        category: "Enhancement",
        createdAt: new Date().toISOString(),
        attachments: []
      }
    ]);
  });

  // Verify loading state resolved and task is visible
  expect(screen.queryByTestId("loading-indicator")).not.toBeInTheDocument();
  expect(screen.getByText("Integration Sync Task")).toBeInTheDocument();
});

test("WebSocket receives task:create and appends to UI", async () => {
  render(<KanbanBoard />);

  // Sync initial state
  act(() => {
    listeners["sync:tasks"]([]);
  });

  // Simulate task:create event from socket
  act(() => {
    listeners["task:create"]({
      id: "task-new",
      title: "Real-time Spawned Task",
      description: "Added dynamically",
      status: "in_progress",
      priority: "Medium",
      category: "Feature",
      createdAt: new Date().toISOString(),
      attachments: []
    });
  });

  expect(screen.getByText("Real-time Spawned Task")).toBeInTheDocument();
  expect(screen.getByTestId("column-in_progress")).toContainElement(
    screen.getByText("Real-time Spawned Task")
  );
});

test("WebSocket receives task:update and updates content in UI", async () => {
  render(<KanbanBoard />);

  // Sync initial state
  act(() => {
    listeners["sync:tasks"]([
      {
        id: "task-up",
        title: "Old Title",
        description: "Old description",
        status: "todo",
        priority: "Low",
        category: "Bug",
        createdAt: new Date().toISOString(),
        attachments: []
      }
    ]);
  });

  expect(screen.getByText("Old Title")).toBeInTheDocument();

  // Simulate task:update event from socket
  act(() => {
    listeners["task:update"]({
      id: "task-up",
      title: "Newly Edited Title",
      description: "Old description",
      status: "todo",
      priority: "Low",
      category: "Bug",
      createdAt: new Date().toISOString(),
      attachments: []
    });
  });

  expect(screen.queryByText("Old Title")).not.toBeInTheDocument();
  expect(screen.getByText("Newly Edited Title")).toBeInTheDocument();
});

test("WebSocket receives task:delete and removes from UI", async () => {
  render(<KanbanBoard />);

  // Sync initial state
  act(() => {
    listeners["sync:tasks"]([
      {
        id: "task-del",
        title: "Delete Me Task",
        description: "To be removed",
        status: "todo",
        priority: "Low",
        category: "Bug",
        createdAt: new Date().toISOString(),
        attachments: []
      }
    ]);
  });

  expect(screen.getByText("Delete Me Task")).toBeInTheDocument();

  // Simulate task:delete event from socket
  act(() => {
    listeners["task:delete"]("task-del");
  });

  expect(screen.queryByText("Delete Me Task")).not.toBeInTheDocument();
});
