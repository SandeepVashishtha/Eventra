import React, { useState } from 'react';
        
export default function EventAgendaBuilder() {
    const [sessions, setSessions] = useState([]);
    
    return (
        <div className="agenda-builder p-4 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Event Agenda Builder</h2>
            <button onClick={() => setSessions([...sessions, { id: Date.now(), title: 'New Session' }])} 
                    className="bg-blue-500 text-white px-4 py-2 rounded">
                Add Session
            </button>
            <div className="mt-4">
                {sessions.map(s => <div key={s.id} className="p-2 border-b">{s.title}</div>)}
            </div>
        </div>
    );
}
