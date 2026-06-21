import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export function useSocket() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:3001");
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
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

  const createTask = (task) => {
    if (socketRef.current) {
      socketRef.current.emit("task:create", task);
    }
  };

  const updateTask = (task) => {
    if (socketRef.current) {
      socketRef.current.emit("task:update", task);
    }
  };

  const moveTask = (id, status) => {
    if (socketRef.current) {
      socketRef.current.emit("task:move", { id, status });
    }
  };

  const deleteTask = (id) => {
    if (socketRef.current) {
      socketRef.current.emit("task:delete", id);
    }
  };

  return {
    tasks,
    loading,
    isConnected,
    createTask,
    updateTask,
    moveTask,
    deleteTask
  };
}
