import React, { useRef } from "react";
import { Trash2 } from "lucide-react";

export default function DragSeatItem({ seat, onDrag, onDelete }) {
  const elementRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const rect = elementRef.current.offsetParent.getBoundingClientRect();
    
    const onMouseMove = (moveEvent) => {
      const x = moveEvent.clientX - rect.left - 24; // Center offsets
      const y = moveEvent.clientY - rect.top - 24;
      
      // Keep boundaries inside box
      const boundX = Math.max(0, Math.min(x, rect.width - 48));
      const boundY = Math.max(0, Math.min(y, rect.height - 48));
      
      onDrag(seat.id, boundX, boundY);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      style={{ left: seat.x, top: seat.y }}
      className="absolute w-12 h-12 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center cursor-move shadow-md select-none group border-2 border-indigo-400"
    >
      <span className="text-xs">{seat.label}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 p-1 rounded-full text-white hidden group-hover:block transition-all shadow-sm"
      >
        <Trash2 className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}
