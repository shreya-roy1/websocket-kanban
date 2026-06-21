import React from "react";
import PropTypes from "prop-types";
import { Edit2, Trash2, Paperclip, Calendar } from "lucide-react";

/**
 * TaskCard component - Displays a single task card inside a column with details like
 * title, description, attachments, priority, category, and action buttons.
 *
 * @component
 * @param {Object} props
 * @param {import('../hooks/useSocket').Task} props.task - The task details to render
 * @param {function(import('../hooks/useSocket').Task): void} props.onEdit - Callback invoked when editing the task
 * @param {function(string): void} props.onDelete - Callback invoked when deleting the task
 */
function TaskCard({ task, onEdit, onDelete }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Low":
      default:
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Bug":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "Feature":
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      case "Enhancement":
      default:
        return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
    }
  };

  const formattedDate = new Date(task.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="glass-panel bg-slate-900/60 backdrop-blur-md p-4 mb-3 rounded-xl hover:bg-slate-900/80 hover:border-slate-700/50 transition-all duration-200 border border-slate-800/40 border-l-2 border-l-blue-500 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md"
      data-testid={`task-card-${task.id}`}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h4 className="font-semibold text-slate-100 text-base leading-snug break-words flex-1">
          {task.title}
        </h4>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition"
            aria-label={`Edit task: ${task.title}`}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
            aria-label={`Delete task: ${task.title}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-4 line-clamp-3 break-words whitespace-pre-wrap">
        {task.description || "No description provided."}
      </p>

      {/* Attachments section */}
      {task.attachments && task.attachments.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Paperclip size={12} />
            <span>Attachments ({task.attachments.length})</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {task.attachments.map((file, idx) => (
              <div
                key={idx}
                className="relative group border border-slate-800/60 rounded-lg overflow-hidden bg-slate-950/40 aspect-video flex flex-col items-center justify-center p-1"
              >
                {file.type && file.type.startsWith("image/") ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="text-center p-1 w-full">
                    <span className="text-[10px] text-slate-400 block truncate" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold">
                      {file.type ? file.type.split("/")[1] || "File" : "File"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-3 border-t border-slate-800/40">
        <div className="flex flex-wrap gap-1.5">
          <span className={`px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority || "Low"}
          </span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${getCategoryColor(task.category)}`}>
            {task.category || "Enhancement"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <Calendar size={12} />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.oneOf(["todo", "in_progress", "done"]).isRequired,
    priority: PropTypes.oneOf(["Low", "Medium", "High"]).isRequired,
    category: PropTypes.oneOf(["Bug", "Feature", "Enhancement"]).isRequired,
    createdAt: PropTypes.string.isRequired,
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        type: PropTypes.string,
        url: PropTypes.string.isRequired
      })
    )
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default TaskCard;

