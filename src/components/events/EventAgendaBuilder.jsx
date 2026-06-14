import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Clock, User, Tag } from 'lucide-react';

const AddSessionForm = ({ newSession, setNewSession, handleAddSession }) => (
  <form onSubmit={handleAddSession} className="space-y-4 mb-8 bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl">
    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Add New Session</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Session Title *</label>
        <input 
          type="text" 
          required
          placeholder="e.g. Keynote Address"
          className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={newSession.title}
          onChange={(e) => setNewSession({...newSession, title: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Speaker</label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="e.g. Jane Doe"
            className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={newSession.speaker}
            onChange={(e) => setNewSession({...newSession, speaker: e.target.value})}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date</label>
        <input 
          type="date" 
          className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={newSession.date}
          onChange={(e) => setNewSession({...newSession, date: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Time *</label>
        <div className="relative">
          <Clock size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="time" 
            required
            className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={newSession.time}
            onChange={(e) => setNewSession({...newSession, time: e.target.value})}
          />
        </div>
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Track / Room</label>
        <div className="relative">
          <Tag size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="e.g. Main Stage, Room 101, Track A"
            className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={newSession.track}
            onChange={(e) => setNewSession({...newSession, track: e.target.value})}
          />
        </div>
      </div>
    </div>
    <div className="flex justify-end pt-2">
      <button 
        type="submit"
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
      >
        <Plus size={16} /> Add Session
      </button>
    </div>
  </form>
);

const SessionList = ({ sessions, handleRemoveSession }) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Current Agenda ({sessions.length} sessions)</h4>
    {sessions.length === 0 ? (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
        No sessions added yet. Build your agenda above.
      </div>
    ) : (
      <div className="space-y-3">
        {sessions.sort((a, b) => {
          if (a.date !== b.date) return (a.date || '').localeCompare(b.date || '');
          return (a.time || '').localeCompare(b.time || '');
        }).map((session) => (
          <div key={session.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:border-indigo-300 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 dark:text-white">{session.title}</span>
                {session.track && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                    {session.track}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                {session.date && session.time && (
                  <span className="flex items-center gap-1"><Clock size={12} /> {session.date} at {session.time}</span>
                )}
                {session.speaker && (
                  <span className="flex items-center gap-1"><User size={12} /> {session.speaker}</span>
                )}
              </div>
            </div>
            <button 
              onClick={() => handleRemoveSession(session.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
              aria-label="Remove session"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default function EventAgendaBuilder({ initialSessions = [], onChange }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [newSession, setNewSession] = useState({
    id: '',
    title: '',
    speaker: '',
    time: '',
    date: '',
    track: '',
  });

  const handleAddSession = (e) => {
    e.preventDefault();
    if (!newSession.title || !newSession.time) return;
    
    const session = {
      ...newSession,
      id: Date.now().toString(),
    };
    
    const updatedSessions = [...sessions, session];
    setSessions(updatedSessions);
    if (onChange) onChange(updatedSessions);
    
    setNewSession({
      id: '',
      title: '',
      speaker: '',
      time: '',
      date: newSession.date, // keep date to make adding multiple sessions on same day easier
      track: newSession.track, // keep track
    });
  };

  const handleRemoveSession = (id) => {
    const updatedSessions = sessions.filter(s => s.id !== id);
    setSessions(updatedSessions);
    if (onChange) onChange(updatedSessions);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Calendar className="text-indigo-600" />
        Event Agenda Builder
      </h3>
      
      <AddSessionForm 
        newSession={newSession} 
        setNewSession={setNewSession} 
        handleAddSession={handleAddSession} 
      />

      <SessionList 
        sessions={sessions} 
        handleRemoveSession={handleRemoveSession} 
      />
    </div>
  );
}
