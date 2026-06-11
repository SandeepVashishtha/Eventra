import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useCollaboration } from "../../hooks/useCollaboration";
import { CloudLightning, Save, LayoutTemplate } from "lucide-react";

const CollaborativeFloorPlan = () => {
  const { eventId } = useParams();
  const { users, isConnected, syncStatus, updateCursor, broadcastChange } = useCollaboration(eventId);
  const [elements, setElements] = useState([]);

  const handleCanvasMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    updateCursor(x, y);
  };

  const addElement = (type) => {
    const newEl = { id: Date.now(), type, x: 100, y: 100 };
    setElements([...elements, newEl]);
    broadcastChange("add", newEl);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Top Toolbar */}
      <div className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="flex items-center gap-2 text-lg font-bold dark:text-white">
            <LayoutTemplate className="h-5 w-5 text-indigo-500" />
            Floor Plan Designer
          </h1>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-2 text-sm">
            {syncStatus === "syncing" && <CloudLightning className="h-4 w-4 animate-pulse text-amber-500" />}
            {syncStatus === "synced" && <CloudLightning className="h-4 w-4 text-emerald-500" />}
            <span className="text-gray-500 capitalize">{syncStatus}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center -space-x-2">
            {users.map((u, i) => (
              <div 
                key={u.id} 
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white dark:border-gray-800"
                style={{ backgroundColor: u.color, zIndex: 10 - i }}
                title={u.name}
              >
                {u.name.charAt(0)}
              </div>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
            <Save className="h-4 w-4" /> Save Template
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tools */}
        <div className="w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-xs font-bold tracking-wider text-gray-500 uppercase">Elements</h3>
          <div className="space-y-2">
            <button onClick={() => addElement("table")} className="w-full rounded-xl border border-gray-200 p-3 text-left transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-indigo-900/20">
              Round Table
            </button>
            <button onClick={() => addElement("stage")} className="w-full rounded-xl border border-gray-200 p-3 text-left transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-indigo-900/20">
              Main Stage
            </button>
            <button onClick={() => addElement("booth")} className="w-full rounded-xl border border-gray-200 p-3 text-left transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-indigo-900/20">
              Sponsor Booth
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          className="relative flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900"
          onMouseMove={handleCanvasMove}
        >
          {/* Grid Background */}
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          
          {/* Render Elements */}
          {elements.map(el => (
            <div key={el.id} className="absolute cursor-move rounded-lg border-2 border-indigo-500 bg-white p-4 text-sm font-medium shadow-lg dark:bg-gray-800 dark:text-white" style={{ left: el.x, top: el.y }}>
              {el.type}
            </div>
          ))}

          {/* Render Remote Cursors */}
          {isConnected && users.filter(u => u.id !== "u1").map(u => (
            <div 
              key={`cursor-${u.id}`} 
              className="pointer-events-none absolute flex items-center gap-1 transition-all duration-100 ease-linear"
              style={{ left: u.cursor.x, top: u.cursor.y, zIndex: 50 }}
            >
              <div style={{ color: u.color }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="2"><path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 01.35-.15h6.8c.45 0 .67-.54.35-.85L6.35 3.21a.5.5 0 00-.85 0z"></path></svg>
              </div>
              <span className="rounded px-2 py-0.5 text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: u.color }}>
                {u.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollaborativeFloorPlan;
