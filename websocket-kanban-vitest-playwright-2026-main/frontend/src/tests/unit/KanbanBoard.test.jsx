import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";

// Mock the useSocket hook
const mockCreateTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockMoveTask = vi.fn();
const mockDeleteTask = vi.fn();

vi.mock("../../hooks/useSocket", () => ({
  useSocket: () => ({
    tasks: [
      {
        id: "task-1",
        title: "Test Task 1",
        description: "Test Description 1",
        status: "todo",
        priority: "High",
        category: "Bug",
        createdAt: new Date().toISOString(),
        attachments: []
      },
      {
        id: "task-2",
        title: "Test Task 2",
        description: "Test Description 2",
        status: "in_progress",
        priority: "Medium",
        category: "Feature",
        createdAt: new Date().toISOString(),
        attachments: []
      }
    ],
    loading: false,
    isConnected: true,
    createTask: mockCreateTask,
    updateTask: mockUpdateTask,
    moveTask: mockMoveTask,
    deleteTask: mockDeleteTask
  })
}));

test("renders Kanban board title and connection status", () => {
  render(<KanbanBoard />);
  expect(screen.getByText("Kanban Board")).toBeInTheDocument();
  expect(screen.getByTestId("connection-status")).toHaveTextContent("Live");
});

test("renders tasks in their respective columns", () => {
  render(<KanbanBoard />);
  
  // Verify tasks are present
  expect(screen.getByText("Test Task 1")).toBeInTheDocument();
  expect(screen.getByText("Test Task 2")).toBeInTheDocument();

  // Verify columns rendering
  const todoColumn = screen.getByTestId("column-todo");
  const inProgressColumn = screen.getByTestId("column-in_progress");
  
  expect(todoColumn).toContainElement(screen.getByText("Test Task 1"));
  expect(inProgressColumn).toContainElement(screen.getByText("Test Task 2"));
});

test("triggers task creation modal", () => {
  render(<KanbanBoard />);
  
  // Click Add Task button
  const addButton = screen.getByTestId("add-task-button");
  fireEvent.click(addButton);

  // Modal should open, check if modal title is visible
  expect(screen.getByText("Create New Task")).toBeInTheDocument();
});

test("triggers deleteTask handler when trash icon is clicked", () => {
  render(<KanbanBoard />);
  
  // Find delete button on first card
  const deleteButtons = screen.getAllByRole("button", { name: /delete task/i });
  fireEvent.click(deleteButtons[0]);

  // It should invoke deleteTask with correct task id
  expect(mockDeleteTask).toHaveBeenCalledWith("task-1");
});
