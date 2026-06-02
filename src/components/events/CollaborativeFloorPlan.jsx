import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useCollaboration } from "../../hooks/useCollaboration";
import { Users, CloudLightning, Save, LayoutTemplate } from "lucide-react";

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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg dark:text-white flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-indigo-500" />
            Floor Plan Designer
          </h1>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-2 text-sm">
            {syncStatus === "syncing" && <CloudLightning className="w-4 h-4 text-amber-500 animate-pulse" />}
            {syncStatus === "synced" && <CloudLightning className="w-4 h-4 text-emerald-500" />}
            <span className="text-gray-500 capitalize">{syncStatus}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center -space-x-2">
            {users.map((u, i) => (
              <div 
                key={u.id} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white dark:border-gray-800"
                style={{ backgroundColor: u.color, zIndex: 10 - i }}
                title={u.name}
              >
                {u.name.charAt(0)}
              </div>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Save className="w-4 h-4" /> Save Template
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tools */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 shrink-0 overflow-y-auto">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Elements</h3>
          <div className="space-y-2">
            <button onClick={() => addElement("table")} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-left transition-colors dark:text-gray-200">
              Round Table
            </button>
            <button onClick={() => addElement("stage")} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-left transition-colors dark:text-gray-200">
              Main Stage
            </button>
            <button onClick={() => addElement("booth")} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-left transition-colors dark:text-gray-200">
              Sponsor Booth
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          className="flex-1 relative bg-gray-100 dark:bg-gray-900 overflow-hidden"
          onMouseMove={handleCanvasMove}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          
          {/* Render Elements */}
          {elements.map(el => (
            <div key={el.id} className="absolute p-4 bg-white dark:bg-gray-800 border-2 border-indigo-500 shadow-lg rounded-lg text-sm font-medium dark:text-white cursor-move" style={{ left: el.x, top: el.y }}>
              {el.type}
            </div>
          ))}

          {/* Render Remote Cursors */}
          {isConnected && users.filter(u => u.id !== "u1").map(u => (
            <div 
              key={`cursor-${u.id}`} 
              className="absolute pointer-events-none transition-all duration-100 ease-linear flex items-center gap-1"
              style={{ left: u.cursor.x, top: u.cursor.y, zIndex: 50 }}
            >
              <div style={{ color: u.color }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="2"><path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 01.35-.15h6.8c.45 0 .67-.54.35-.85L6.35 3.21a.5.5 0 00-.85 0z"></path></svg>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: u.color }}>
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
