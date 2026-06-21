import React, { useState } from "react";
import { Plus, Wifi, WifiOff, Loader2 } from "lucide-react";
import { useSocket } from "../hooks/useSocket";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import StatsChart from "./StatsChart";

/**
 * List of columns configured for the Kanban Board.
 * @type {Array<{id: 'todo'|'in_progress'|'done', title: string, bgHeader: string}>}
 */
const COLUMNS = [
  { id: "todo", title: "To Do", bgHeader: "border-t-indigo-500" },
  { id: "in_progress", title: "In Progress", bgHeader: "border-t-amber-500" },
  { id: "done", title: "Done", bgHeader: "border-t-emerald-500" }
];

/**
 * KanbanBoard component - The main board container that coordinates
 * columns, task creation, editing, optimistic drag-and-drop, and websocket connectivity indicators.
 *
 * @component
 */
function KanbanBoard() {
  const {
    tasks,
    loading,
    isConnected,
    connectionStatus,
    createTask,
    updateTask,
    moveTask,
    deleteTask
  } = useSocket();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState({});

  // Derive active connection status (connected, reconnecting, disconnected)
  // Fall back to isConnected boolean to guarantee test suite compatibility.
  const activeStatus = connectionStatus || (isConnected ? "connected" : "disconnected");

  // Drag and Drop handlers for Columns
  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (!draggedOverColumn[columnId]) {
      setDraggedOverColumn((prev) => ({ ...prev, [columnId]: true }));
    }
  };

  const handleDragLeave = (columnId) => {
    setDraggedOverColumn((prev) => ({ ...prev, [columnId]: false }));
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    setDraggedOverColumn((prev) => ({ ...prev, [columnId]: false }));
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      moveTask(taskId, columnId);
    }
  };

  const handleOpenAddModal = () => {
    setActiveTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setActiveTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    if (activeTask) {
      updateTask(taskData);
    } else {
      createTask(taskData);
    }
  };

  /**
   * Renders the dynamic connection status badge in the header.
   */
  const renderConnectionBadge = () => {
    switch (activeStatus) {
      case "connected":
        return (
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            data-testid="connection-status"
          >
            <Wifi size={12} /> Live
          </span>
        );
      case "reconnecting":
        return (
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
            data-testid="connection-status"
          >
            <Loader2 size={12} className="animate-spin" /> Reconnecting...
          </span>
        );
      case "disconnected":
      default:
        return (
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20"
            data-testid="connection-status"
          >
            <WifiOff size={12} /> Offline
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4" data-testid="loading-indicator">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-slate-400 font-medium tracking-wide">Syncing board with server...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/40">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            Kanban Board
            {renderConnectionBadge()}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Collaborative real-time task manager with automated live metrics
          </p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl hover:-translate-y-0.5 transition duration-200 cursor-pointer"
          data-testid="add-task-button"
          aria-label="Add a new task"
        >
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Analytics Dashboard */}
      <StatsChart tasks={tasks} />

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isOver = draggedOverColumn[col.id];

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => handleDragLeave(col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col bg-slate-900/40 backdrop-blur-md rounded-2xl border-t-2 ${
                col.bgHeader
              } border border-slate-800/40 p-4 min-h-[450px] transition-all duration-200 ${
                isOver ? "bg-slate-900/60 border-blue-500 border-dashed" : ""
              }`}
              data-testid={`column-${col.id}`}
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/40">
                <h3 className="font-bold text-slate-300 text-sm tracking-wide uppercase">
                  {col.title}
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-md">
                  {colTasks.length}
                </span>
              </div>

              {/* Task list container */}
              <div className="flex-1 overflow-y-auto space-y-1">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleOpenEditModal}
                      onDelete={deleteTask}
                    />
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-12 text-slate-500 border border-dashed border-slate-800/40 rounded-xl">
                    <p className="text-xs font-medium text-slate-500">No tasks in this column</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal (Create/Edit) */}
      <TaskModal
        task={activeTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
      />
      
    </div>
  );
}

export default KanbanBoard;

