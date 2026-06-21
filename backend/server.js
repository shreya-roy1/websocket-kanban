const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// In-memory tasks store
let tasks = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Sync tasks on connection
  socket.emit("sync:tasks", tasks);

  // Create task
  socket.on("task:create", (newTask) => {
    const task = {
      ...newTask,
      id: newTask.id || Date.now().toString(),
      attachments: newTask.attachments || [],
      createdAt: newTask.createdAt || new Date().toISOString()
    };
    tasks.push(task);
    io.emit("task:create", task);
  });

  // Update task details
  socket.on("task:update", (updatedTask) => {
    tasks = tasks.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
    const finalTask = tasks.find((t) => t.id === updatedTask.id);
    if (finalTask) {
      io.emit("task:update", finalTask);
    }
  });

  // Move task (update status/column)
  socket.on("task:move", ({ id, status }) => {
    tasks = tasks.map((t) => (t.id === id ? { ...t, status } : t));
    const finalTask = tasks.find((t) => t.id === id);
    if (finalTask) {
      io.emit("task:move", finalTask);
    }
  });

  // Delete task
  socket.on("task:delete", (id) => {
    tasks = tasks.filter((t) => t.id !== id);
    io.emit("task:delete", id);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
