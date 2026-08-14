import React, { useState } from "react";
import { Plus, X } from "lucide-react";

export default function KanbanColumn({
  status,
  tasks,
  onDragStart,
  onDrop,
  onDragOver,
  onAddTask,
  newTaskText,
  setNewTaskText
}) {
  const [showInput, setShowInput] = useState(false);

  const getTitle = () => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in-progress":
        return "In Progress";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400";
      case "medium":
        return "bg-amber-50 text-amber-650 dark:bg-amber-955/20 dark:text-amber-400";
      default:
        return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="kanban-column bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex flex-col min-h-[400px] shadow-sm"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white capitalize">
          {getTitle()} ({tasks.length})
        </h3>
        <button
          onClick={() => setShowInput(!showInput)}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-500 dark:text-slate-400"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showInput && (
        <div className="mb-4 flex flex-col gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
          <input
            type="text"
            placeholder="Add task title..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg text-xs focus:outline-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowInput(false)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                onAddTask(status);
                setShowInput(false);
              }}
              className="bg-indigo-650 text-white text-[10px] font-bold px-3 py-1 rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 flex-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            className="kanban-card p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl cursor-grab active:cursor-grabbing hover:border-slate-300 dark:hover:border-slate-700 transition-all select-none"
          >
            <div className="flex justify-between items-start gap-3 mb-2">
              <p className="text-xs font-semibold text-slate-850 dark:text-slate-100 leading-normal">
                {task.title}
              </p>
            </div>
            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
