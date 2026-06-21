import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

/**
 * @typedef {Object} Attachment
 * @property {string} name - File name
 * @property {string} type - MIME type
 * @property {string} url - Object URL or network URL
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Task ID
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {'todo'|'in_progress'|'done'} status - Task column status
 * @property {'Low'|'Medium'|'High'} priority - Task priority
 * @property {'Bug'|'Feature'|'Enhancement'} category - Task category
 * @property {string} createdAt - ISO date string
 * @property {Attachment[]} attachments - File attachments
 */

/**
 * Custom React hook to manage WebSocket connection and Kanban task synchronization with optimistic UI updates.
 * @returns {{
 *   tasks: Task[],
 *   loading: boolean,
 *   isConnected: boolean,
 *   connectionStatus: 'connected'|'reconnecting'|'disconnected',
 *   createTask: function(Omit<Task, 'id'|'createdAt'>): void,
 *   updateTask: function(Partial<Task> & {id: string}): void,
 *   moveTask: function(string, 'todo'|'in_progress'|'done'): void,
 *   deleteTask: function(string): void
 * }}
 */
export function useSocket() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const socketRef = useRef(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || "http://localhost:3001";
    const socket = io(wsUrl);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionStatus("connected");
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      if (reason === "io client disconnect") {
        setConnectionStatus("disconnected");
      } else {
        setConnectionStatus("reconnecting");
      }
    });

    socket.on("connect_error", () => {
      setIsConnected(false);
      setConnectionStatus("reconnecting");
    });

    // Handle synchronization of tasks
    socket.on("sync:tasks", (initialTasks) => {
      setTasks(initialTasks);
      setLoading(false);
    });

    // Handle task:create
    socket.on("task:create", (newTask) => {
      setTasks((prev) => {
        if (prev.some((t) => t.id === newTask.id)) return prev;
        return [...prev, newTask];
      });
    });

    // Handle task:update
    socket.on("task:update", (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    });

    // Handle task:move
    socket.on("task:move", (movedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === movedTask.id ? movedTask : t))
      );
    });

    // Handle task:delete
    socket.on("task:delete", (deletedId) => {
      setTasks((prev) => prev.filter((t) => t.id !== deletedId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /**
   * Creates a new task, performing an optimistic local state update before emitting.
   * @param {Omit<Task, 'id'|'createdAt'>} newTaskData
   */
  const createTask = (newTaskData) => {
    const newTask = {
      ...newTaskData,
      id: newTaskData.id || Date.now().toString(),
      attachments: newTaskData.attachments || [],
      createdAt: newTaskData.createdAt || new Date().toISOString()
    };
    
    // Optimistic Update
    setTasks((prev) => {
      if (prev.some((t) => t.id === newTask.id)) return prev;
      return [...prev, newTask];
    });

    if (socketRef.current) {
      socketRef.current.emit("task:create", newTask);
    }
  };

  /**
   * Updates an existing task, performing an optimistic local state update before emitting.
   * @param {Partial<Task> & {id: string}} updatedTaskData
   */
  const updateTask = (updatedTaskData) => {
    // Optimistic Update
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTaskData.id ? { ...t, ...updatedTaskData } : t))
    );

    if (socketRef.current) {
      socketRef.current.emit("task:update", updatedTaskData);
    }
  };

  /**
   * Moves a task to a different column, performing an optimistic local state update before emitting.
   * @param {string} id
   * @param {'todo'|'in_progress'|'done'} status
   */
  const moveTask = (id, status) => {
    // Optimistic Update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );

    if (socketRef.current) {
      socketRef.current.emit("task:move", { id, status });
    }
  };

  /**
   * Deletes a task, performing an optimistic local state update before emitting.
   * @param {string} id
   */
  const deleteTask = (id) => {
    // Optimistic Update
    setTasks((prev) => prev.filter((t) => t.id !== id));

    if (socketRef.current) {
      socketRef.current.emit("task:delete", id);
    }
  };

  return {
    tasks,
    loading,
    isConnected,
    connectionStatus,
    createTask,
    updateTask,
    moveTask,
    deleteTask
  };
}

