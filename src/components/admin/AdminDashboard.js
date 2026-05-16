import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Activity, Shield, LogOut, Plus,
  Search, ChevronRight, BarChart2,
  Trash2, Edit2, CheckCircle, AlertCircle,
  TrendingUp
} from 'lucide-react';
import './AdminDashboard.css';
import { toast } from 'react-toastify';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' }
  })
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } }
};

/* ─── Mock data (replace with real API calls when endpoints are ready) ─── */
const MOCK_USERS = [
  { id: 1, firstName: 'Aarav', lastName: 'Sharma', email: 'aarav@example.com', roles: ['USER'], createdAt: '2025-01-15', status: 'Active' },
  { id: 2, firstName: 'Priya', lastName: 'Mehta',  email: 'priya@example.com', roles: ['EVENT_MANAGER'], createdAt: '2025-02-20', status: 'Active' },
  { id: 3, firstName: 'Rohan', lastName: 'Verma',  email: 'rohan@example.com', roles: ['USER'], createdAt: '2025-03-05', status: 'Inactive' },
  { id: 4, firstName: 'Sneha', lastName: 'Patel',  email: 'sneha@example.com', roles: ['USER'], createdAt: '2025-04-12', status: 'Active' },
  { id: 5, firstName: 'Karan', lastName: 'Joshi',  email: 'karan@example.com', roles: ['EVENT_MANAGER'], createdAt: '2025-05-01', status: 'Active' },
];

const MOCK_EVENTS = [
  { id: 1, title: 'Tech Talk: AI in 2025', date: '2025-06-15', participantCount: 120, status: 'Completed', type: 'Event' },
  { id: 2, title: 'Web Dev Workshop',       date: '2025-09-10', participantCount: 45,  status: 'Upcoming',  type: 'Event' },
  { id: 3, title: 'React Conference 2025',  date: '2025-12-15', participantCount: 300, status: 'Upcoming',  type: 'Event' },
  { id: 4, title: 'Hack for Sustainability',date: '2025-07-20', participantCount: 80,  status: 'Completed', type: 'Hackathon' },
  { id: 5, title: 'Global AI Hackathon',    date: '2025-10-10', participantCount: 200, status: 'Upcoming',  type: 'Hackathon' },
];

const STATUS_COLORS = {
  Active: 'ad-badge-green', Inactive: 'ad-badge-gray',
  Upcoming: 'ad-badge-blue', Completed: 'ad-badge-green',
  USER: 'ad-badge-gray', EVENT_MANAGER: 'ad-badge-blue', ADMIN: 'ad-badge-purple',
};

/* ─── Confirmation Modal ─── */
function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="ad-modal-overlay" onClick={onCancel}>
      <motion.div
        className="ad-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="ad-modal-icon"><AlertCircle size={28} color="#ef4444" /></div>
        <h3 className="ad-modal-title">{title}</h3>
        <p className="ad-modal-msg">{message}</p>
        <div className="ad-modal-actions">
          <button className="ad-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="ad-btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Component ─── */
const AdminDashboard = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [users,  setUsers]  = useState(MOCK_USERS);
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [searchUser,  setSearchUser]  = useState('');
  const [searchEvent, setSearchEvent] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', id: null });

  const firstName = user?.firstName || user?.username || 'Admin';

  /* Stats */
  const totalUsers  = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const totalEvents = events.length;
  const upcoming    = events.filter(e => e.status === 'Upcoming').length;
  const totalParticipants = events.reduce((s, e) => s + e.participantCount, 0);

  /* Delete handlers */
  const confirmDelete = (type, id) => setConfirmModal({ open: true, type, id });

  const handleConfirmDelete = () => {
    const { type, id } = confirmModal;
    if (type === 'user')  setUsers(prev  => prev.filter(u => u.id !== id));
    if (type === 'event') setEvents(prev => prev.filter(e => e.id !== id));
    setConfirmModal({ open: false, type: '', id: null });
    toast.success(`${type === 'user' ? 'User' : 'Event'} deleted successfully.`);
  };

  const filteredUsers  = users.filter(u =>
    (`${u.firstName} ${u.lastName} ${u.email}`).toLowerCase().includes(searchUser.toLowerCase())
  );
  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchEvent.toLowerCase())
  );

  const NAV_ITEMS = [
    { id: 'overview',  icon: <Activity  size={17} />, label: 'Overview'   },
    { id: 'users',     icon: <Users     size={17} />, label: 'Users'      },
    { id: 'events',    icon: <Calendar  size={17} />, label: 'Events'     },
    { id: 'analytics', icon: <BarChart2 size={17} />, label: 'Analytics'  },
  ];

  return (
    <div className="ad-root">
      {/* ── Sidebar ── */}
      <aside className="ad-sidebar">
        <div className="ad-brand">
          <div className="ad-brand-dot" />
          <span>Eventra</span>
          <span className="ad-brand-role">Admin</span>
        </div>

        <nav className="ad-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`ad-nav-item ${activeTab === item.id ? 'ad-nav-active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-bottom">
          <div className="ad-admin-info">
            <div className="ad-admin-avatar">{firstName.charAt(0).toUpperCase()}</div>
            <div>
              <p className="ad-admin-name">{firstName} {user?.lastName || ''}</p>
              <p className="ad-admin-role">Administrator</p>
            </div>
          </div>
          <button
            className="ad-nav-item ad-nav-logout"
            onClick={() => setConfirmModal({ open: true, type: 'logout', id: null })}
          >
            <LogOut size={17} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ad-main">
        {/* Topbar */}
        <header className="ad-topbar">
          <div>
            <p className="ad-greeting">Admin Panel</p>
            <h1 className="ad-page-heading">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="ad-topbar-right">
            {activeTab === 'events' && hasPermission('CREATE_EVENT') && (
              <button className="ad-btn-primary" onClick={() => navigate('/create-event')}>
                <Plus size={15} /> New Event
              </button>
            )}
            <div className="ad-admin-chip">
              <Shield size={13} /> Admin
            </div>
          </div>
        </header>



        <div className="ad-content">
          <AnimatePresence mode="wait">

            {/* ── Overview ── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" variants={stagger} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="ad-section">

                {/* Stat Cards */}
                <motion.div variants={stagger} className="ad-stats-grid">
                  {[
                    { label: 'Total Users',     value: totalUsers,        sub: `${activeUsers} active`,      icon: <Users size={20} />,    color: '#6366f1' },
                    { label: 'Total Events',    value: totalEvents,       sub: `${upcoming} upcoming`,       icon: <Calendar size={20} />, color: '#ec4899' },
                    { label: 'Participants',    value: totalParticipants, sub: 'across all events',          icon: <TrendingUp size={20}/>, color: '#10b981' },
                    { label: 'Inactive Users',  value: totalUsers - activeUsers, sub: 'need attention',     icon: <AlertCircle size={20}/>,color: '#f59e0b' },
                  ].map((s, i) => (
                    <motion.div key={s.label} custom={i} variants={fadeUp} className="ad-stat-card">
                      <div className="ad-stat-icon" style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
                      <div>
                        <p className="ad-stat-label">{s.label}</p>
                        <p className="ad-stat-value">{s.value}</p>
                        <p className="ad-stat-sub">{s.sub}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Recent Users + Recent Events */}
                <div className="ad-two-col">
                  <motion.section custom={1} variants={fadeUp} className="ad-card">
                    <div className="ad-card-head">
                      <span className="ad-card-icon" style={{ background: '#6366f118', color: '#6366f1' }}><Users size={15} /></span>
                      <h3>Recent Users</h3>
                      <button className="ad-card-link" onClick={() => setActiveTab('users')}>See all <ChevronRight size={13} /></button>
                    </div>
                    {users.slice(0, 4).map(u => (
                      <div key={u.id} className="ad-list-item">
                        <div className="ad-list-avatar">{u.firstName.charAt(0)}</div>
                        <div style={{ flex: 1 }}>
                          <p className="ad-list-title">{u.firstName} {u.lastName}</p>
                          <p className="ad-list-sub">{u.email}</p>
                        </div>
                        <span className={`ad-badge ${STATUS_COLORS[u.status] || 'ad-badge-gray'}`}>{u.status}</span>
                      </div>
                    ))}
                  </motion.section>

                  <motion.section custom={2} variants={fadeUp} className="ad-card">
                    <div className="ad-card-head">
                      <span className="ad-card-icon" style={{ background: '#ec489918', color: '#ec4899' }}><Calendar size={15} /></span>
                      <h3>Recent Events</h3>
                      <button className="ad-card-link" onClick={() => setActiveTab('events')}>See all <ChevronRight size={13} /></button>
                    </div>
                    {events.slice(0, 4).map(ev => (
                      <div key={ev.id} className="ad-list-item">
                        <div className="ad-list-dot" style={{ background: ev.status === 'Upcoming' ? '#6366f1' : '#10b981' }} />
                        <div style={{ flex: 1 }}>
                          <p className="ad-list-title">{ev.title}</p>
                          <p className="ad-list-sub">{ev.date} · {ev.participantCount} participants</p>
                        </div>
                        <span className={`ad-badge ${STATUS_COLORS[ev.status] || 'ad-badge-gray'}`}>{ev.status}</span>
                      </div>
                    ))}
                  </motion.section>
                </div>
              </motion.div>
            )}

            {/* ── Users ── */}
            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ad-section">
                <div className="ad-toolbar">
                  <div className="ad-search-wrap">
                    <Search size={14} className="ad-search-icon" />
                    <input
                      className="ad-search"
                      placeholder="Search users…"
                      value={searchUser}
                      onChange={e => setSearchUser(e.target.value)}
                    />
                  </div>
                  <span className="ad-count">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0
                        ? <tr><td colSpan={6} className="ad-table-empty">No users found.</td></tr>
                        : filteredUsers.map(u => (
                          <tr key={u.id}>
                            <td>
                              <div className="ad-table-user">
                                <div className="ad-table-avatar">{u.firstName.charAt(0)}</div>
                                <span>{u.firstName} {u.lastName}</span>
                              </div>
                            </td>
                            <td className="ad-muted">{u.email}</td>
                            <td>
                              {u.roles.map(r => (
                                <span key={r} className={`ad-badge ${STATUS_COLORS[r] || 'ad-badge-gray'}`} style={{ marginRight: '4px' }}>{r}</span>
                              ))}
                            </td>
                            <td className="ad-muted">{u.createdAt}</td>
                            <td><span className={`ad-badge ${STATUS_COLORS[u.status] || 'ad-badge-gray'}`}>{u.status}</span></td>
                            <td>
                              <div className="ad-action-btns">
                                {hasPermission('EDIT_USER') && (
                                  <button className="ad-icon-action" title="Edit" onClick={() => toast.info('Edit coming soon')}>
                                    <Edit2 size={14} />
                                  </button>
                                )}
                                {hasPermission('DELETE_USER') && (
                                  <button className="ad-icon-action ad-icon-danger" title="Delete" onClick={() => confirmDelete('user', u.id)}>
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── Events ── */}
            {activeTab === 'events' && (
              <motion.div key="events" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ad-section">
                <div className="ad-toolbar">
                  <div className="ad-search-wrap">
                    <Search size={14} className="ad-search-icon" />
                    <input
                      className="ad-search"
                      placeholder="Search events…"
                      value={searchEvent}
                      onChange={e => setSearchEvent(e.target.value)}
                    />
                  </div>
                  <span className="ad-count">{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Participants</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.length === 0
                        ? <tr><td colSpan={6} className="ad-table-empty">No events found.</td></tr>
                        : filteredEvents.map(ev => (
                          <tr key={ev.id}>
                            <td className="ad-table-bold">{ev.title}</td>
                            <td>
                              <span className={`ad-badge ${ev.type === 'Hackathon' ? 'ad-badge-purple' : 'ad-badge-blue'}`}>
                                {ev.type}
                              </span>
                            </td>
                            <td className="ad-muted">{ev.date}</td>
                            <td className="ad-muted">{ev.participantCount}</td>
                            <td><span className={`ad-badge ${STATUS_COLORS[ev.status] || 'ad-badge-gray'}`}>{ev.status}</span></td>
                            <td>
                              <div className="ad-action-btns">
                                {hasPermission('EDIT_EVENT') && (
                                  <button className="ad-icon-action" title="Edit" onClick={() => toast.info('Edit coming soon')}>
                                    <Edit2 size={14} />
                                  </button>
                                )}
                                {hasPermission('DELETE_EVENT') && (
                                  <button className="ad-icon-action ad-icon-danger" title="Delete" onClick={() => confirmDelete('event', ev.id)}>
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── Analytics ── */}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ad-section">
                <motion.div variants={stagger} initial="hidden" animate="visible" className="ad-stats-grid">
                  {[
                    { label: 'Total Users',        value: totalUsers,        sub: `${activeUsers} active · ${totalUsers - activeUsers} inactive`,    color: '#6366f1', icon: <Users size={20} /> },
                    { label: 'Events Hosted',       value: totalEvents,       sub: `${upcoming} upcoming · ${totalEvents - upcoming} completed`,      color: '#ec4899', icon: <Calendar size={20} /> },
                    { label: 'Total Participants',  value: totalParticipants, sub: 'across all events',                                              color: '#10b981', icon: <TrendingUp size={20} /> },
                    { label: 'Avg Participants',    value: Math.round(totalParticipants / (totalEvents || 1)), sub: 'per event',                     color: '#f59e0b', icon: <BarChart2 size={20} /> },
                  ].map((s, i) => (
                    <motion.div key={s.label} custom={i} variants={fadeUp} className="ad-stat-card">
                      <div className="ad-stat-icon" style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
                      <div>
                        <p className="ad-stat-label">{s.label}</p>
                        <p className="ad-stat-value">{s.value}</p>
                        <p className="ad-stat-sub">{s.sub}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Event Breakdown */}
                <motion.section custom={1} variants={fadeUp} className="ad-card" style={{ marginTop: '1.5rem' }}>
                  <div className="ad-card-head">
                    <span className="ad-card-icon" style={{ background: '#6366f118', color: '#6366f1' }}><BarChart2 size={15} /></span>
                    <h3>Event Breakdown</h3>
                  </div>
                  <div className="ad-analytics-bars">
                    {events.map(ev => (
                      <div key={ev.id} className="ad-bar-row">
                        <span className="ad-bar-label">{ev.title}</span>
                        <div className="ad-bar-track">
                          <motion.div
                            className="ad-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${(ev.participantCount / totalParticipants) * 100}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                          />
                        </div>
                        <span className="ad-bar-value">{ev.participantCount}</span>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* Role Distribution */}
                <motion.section custom={2} variants={fadeUp} className="ad-card" style={{ marginTop: '1rem' }}>
                  <div className="ad-card-head">
                    <span className="ad-card-icon" style={{ background: '#ec489918', color: '#ec4899' }}><Shield size={15} /></span>
                    <h3>Role Distribution</h3>
                  </div>
                  <div className="ad-role-chips">
                    {['USER', 'EVENT_MANAGER', 'ADMIN'].map(role => {
                      const count = users.filter(u => u.roles.includes(role)).length;
                      return (
                        <div key={role} className="ad-role-chip">
                          <span className={`ad-badge ${STATUS_COLORS[role] || 'ad-badge-gray'}`}>{role}</span>
                          <span className="ad-role-count">{count} user{count !== 1 ? 's' : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirmModal.open && (
          <ConfirmModal
            open={confirmModal.open}
            title={confirmModal.type === 'logout' ? 'Logout?' : `Delete ${confirmModal.type}?`}
            message={
              confirmModal.type === 'logout'
                ? 'You will be logged out of the admin panel.'
                : `This action cannot be undone. Are you sure?`
            }
            onConfirm={
              confirmModal.type === 'logout'
                ? () => { setConfirmModal({ open: false, type: '', id: null }); logout(); navigate('/'); }
                : handleConfirmDelete
            }
            onCancel={() => setConfirmModal({ open: false, type: '', id: null })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;