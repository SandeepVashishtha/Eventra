import { useState } from 'react';

const VenueMapBuilder = () => {
  const [elements, setElements] = useState([]);
  
  const addTable = () => {
    setElements([...elements, {
      id: Date.now(),
      type: "round-table",
      label: "New Table",
      x: 100, y: 100,
      width: 120, height: 120,
      seatsCount: 6
    }]);
  };

  const saveLayout = () => {
    localStorage.setItem('eventra_floorplan_default', JSON.stringify(elements));
    alert('Layout saved successfully!');
  };

  return (
    <div className="p-4 bg-slate-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Interactive Venue Map Builder (Preview)</h2>
      <div className="flex gap-4 mb-4">
        <button onClick={addTable} className="bg-blue-600 px-4 py-2 rounded">Add Round Table</button>
        <button onClick={saveLayout} className="bg-green-600 px-4 py-2 rounded">Save Layout</button>
      </div>
      <div className="w-full h-150 bg-slate-800 border border-slate-700 relative overflow-hidden">
        {elements.map(el => (
          <div 
            key={el.id} 
            className="absolute bg-blue-500 rounded-full flex items-center justify-center cursor-move"
            style={{ left: el.x, top: el.y, width: el.width, height: el.height }}
          >
            {el.label}
          </div>
        ))}
      </div>
      <p className="mt-4 text-slate-400">Drag and drop functionality will be implemented in the next iteration.</p>
    </div>
  );
};

export default VenueMapBuilder;
