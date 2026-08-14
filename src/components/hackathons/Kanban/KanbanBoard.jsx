import React, { useState } from "react";
import { Plus, Trello } from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import "./kanban.css";

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([
    { id: "1", title: "Setup Vite project with Tailwind", status: "todo", priority: "high" },
    { id: "2", title: "Integrate Axios API config handlers", status: "in-progress", priority: "medium" },
    { id: "3", title: "Write Playwright tests", status: "done", priority: "low" }
  ]);

  const [newTaskText, setNewTaskText] = useState("");

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e, targetStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const addTask = (status) => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: newTaskText,
      status,
      priority: "medium"
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText("");
  };

  return (
    <div className="kanban-board-container p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm max-w-5xl mx-auto my-8">
      <div className="flex items-center gap-2 border-b border-slate-250 dark:border-slate-800 pb-4 mb-6">
        <Trello className="text-indigo-650 dark:text-indigo-400 w-6 h-6" />
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">Hackathon Project Kanban Board</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["todo", "in-progress", "done"].map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onDragStart={handleDragStart}
            onDrop={(e) => handleDrop(e, status)}
            onDragOver={handleDragOver}
            onAddTask={addTask}
            newTaskText={newTaskText}
            setNewTaskText={setNewTaskText}
          />
        ))}
      </div>
    </div>
  );
}
