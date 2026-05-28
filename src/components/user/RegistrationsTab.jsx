import { motion } from "framer-motion";
import { Users, Calendar, Trophy, FolderOpen } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import { DashboardTableSkeleton } from "../common/SkeletonLoaders";
import { getSmartDateLabel } from "../../utils/relativeTime";

const TYPE_ICON = {
  Event: <Calendar className="ud-type-icon" style={{ color: "#6366f1" }} />,
  Hackathon: <Trophy className="ud-type-icon" style={{ color: "#ec4899" }} />,
  Project: <FolderOpen className="ud-type-icon" style={{ color: "#8b5cf6" }} />,
};

const RegistrationsTab = ({
  filteredData,
  loading,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  setSelectedTicketEvent
}) => (
  <motion.div key="registrations" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ud-content">
    <div className="ud-tab-header">
      <h2 className="ud-page-title"><Users size={20} /> All Registrations</h2>
      <div className="ud-filter-row">
        <select className="ud-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          {["All", "Event", "Hackathon", "Project"].map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="ud-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {["All", "Upcoming", "Completed", "In Progress", "Done"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
    </div>

    {loading ? (
      <DashboardTableSkeleton rows={6} />
    ) : (
    <div className="ud-table-wrap">
      <table className="ud-table">
        <thead>
          <tr>
            <th>Type</th><th>Title</th><th>Date</th><th>Location / Info</th><th>Status</th><th>Participation</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0
            ? <tr><td colSpan={6} className="ud-table-empty">No records match your filters.</td></tr>
            : filteredData.map(item => (
              <tr key={item.id}>
                <td><span className="ud-table-type">{TYPE_ICON[item.type]}{item.type}</span></td>
                <td className="ud-table-title" title={item.title}>{item.title}</td>
                <td title={item.date || ""}>{item.date ? getSmartDateLabel(item.date) : "—"}</td>
                <td title={item.location || item.lastUpdate || "—"}>{item.location || item.lastUpdate || "—"}</td>
                <td>
                  <StatusBadge status={item.projectStatus !== "-" ? item.projectStatus : item.status} />
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <StatusBadge status={item.participationType} />
                    {(item.type === "Event" || item.type === "Hackathon") && item.participationType === "Registered" && (
                      <button aria-label="button"
                        onClick={() => setSelectedTicketEvent(item)}
                        className="ud-btn-ticket"
                      >
                        View Ticket
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
    )}
  </motion.div>
);

export default RegistrationsTab;
