import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { X, Upload, FileText, Image as ImageIcon } from "lucide-react";

const priorityOptions = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" }
];

const categoryOptions = [
  { value: "Bug", label: "Bug" },
  { value: "Feature", label: "Feature" },
  { value: "Enhancement", label: "Enhancement" }
];

// Custom styling to make react-select fit the dark theme perfectly
const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#1e293b",
    borderColor: state.isFocused ? "#3b82f6" : "#475569",
    color: "#f1f5f9",
    borderRadius: "0.75rem",
    padding: "0.125rem",
    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#3b82f6" : "#64748b"
    }
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#1e293b",
    border: "1px solid #475569",
    borderRadius: "0.75rem"
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
      ? "#334155"
      : "transparent",
    color: "#f1f5f9",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "#2563eb"
    }
  }),
  singleValue: (base) => ({
    ...base,
    color: "#f1f5f9"
  })
};

function TaskModal({ task, isOpen, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(priorityOptions[0]);
  const [category, setCategory] = useState(categoryOptions[2]);
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(priorityOptions.find((o) => o.value === task.priority) || priorityOptions[0]);
      setCategory(categoryOptions.find((o) => o.value === task.category) || categoryOptions[2]);
      setAttachments(task.attachments || []);
    } else {
      setTitle("");
      setDescription("");
      setPriority(priorityOptions[0]);
      setCategory(categoryOptions[2]);
      setAttachments([]);
    }
    setError("");
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setError("");

    const newAttachments = [];
    for (let file of files) {
      // Validate formats: Only support common images and PDFs
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        setError("Unsupported file format. Please upload JPEG, PNG, GIF, or PDF.");
        continue;
      }

      newAttachments.push({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file)
      });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    onSave({
      id: task?.id,
      title,
      description,
      priority: priority.value,
      category: category.value,
      attachments,
      status: task ? task.status : "todo",
      createdAt: task ? task.createdAt : new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">
            {task ? "Edit Task" : "Create New Task"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl"
              role="alert"
              data-testid="error-message"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="task-title" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Task Title *
            </label>
            <input
              id="task-title"
              type="text"
              required
              placeholder="e.g. Implement WebSockets"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-blue-500 transition"
              data-testid="task-title-input"
            />
          </div>

          <div>
            <label htmlFor="task-desc" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              id="task-desc"
              rows={3}
              placeholder="Add more details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-blue-500 transition resize-none"
              data-testid="task-desc-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div data-testid="priority-select-container">
              <label htmlFor="priority-select" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Priority
              </label>
              <Select
                id="priority-select"
                options={priorityOptions}
                value={priority}
                onChange={setPriority}
                styles={selectStyles}
              />
            </div>
            <div data-testid="category-select-container">
              <label htmlFor="category-select" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <Select
                id="category-select"
                options={categoryOptions}
                value={category}
                onChange={setCategory}
                styles={selectStyles}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Attachments
            </label>
            <div className="flex gap-2">
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,application/pdf"
                data-testid="file-upload-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl hover:text-white transition w-full justify-center font-medium cursor-pointer"
                data-testid="file-upload-button"
              >
                <Upload size={16} />
                <span>Upload Files</span>
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4" data-testid="attachments-preview-list">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative group border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50 aspect-video flex flex-col items-center justify-center p-2"
                  >
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="absolute top-1.5 right-1.5 bg-slate-950/80 hover:bg-rose-600/90 text-white rounded-full p-1 transition opacity-0 group-hover:opacity-100"
                      aria-label="Remove Attachment"
                    >
                      <X size={12} />
                    </button>
                    {file.type && file.type.startsWith("image/") ? (
                      <>
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white bg-slate-950/80 px-1 py-0.5 rounded truncate">
                          {file.name}
                        </span>
                      </>
                    ) : (
                      <div className="text-center p-1 w-full">
                        <FileText size={20} className="mx-auto text-blue-400 mb-1" />
                        <span className="text-[10px] text-slate-300 block truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold block">
                          PDF
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
              data-testid="save-task-button"
            >
              {task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default TaskModal;
