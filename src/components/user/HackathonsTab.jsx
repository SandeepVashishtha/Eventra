import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, Calendar, MapPin, Plus } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import { DashboardItemCardSkeleton } from "../common/SkeletonLoaders";

const HackathonsTab = ({ hackathons, loading, fadeUp }) => (
  <motion.div key="hackathons" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ud-content">
    <div className="ud-tab-header">
      <h2 className="ud-page-title"><Trophy size={20} /> My Hackathons</h2>
      <Link to="/hackathons" className="ud-btn-primary"><Plus size={15} /> Explore Hackathons</Link>
    </div>
    <div className="ud-items-grid">
      {loading
        ? [...Array(3)].map((_, i) => <DashboardItemCardSkeleton key={i} />)
        : hackathons.map((h, i) => (
        <motion.div key={h.id} custom={i} variants={fadeUp} initial="hidden" animate="visible" className="ud-item-card">
          <div className="ud-item-top">
            <span className="ud-item-type" style={{ background: "#ec489918", color: "#ec4899" }}><Trophy size={13} /> Hackathon</span>
            <StatusBadge status={h.status} />
          </div>
          <h3 className="ud-item-title">{h.title}</h3>
          <div className="ud-item-meta">
            <span><Calendar size={13} /> {h.date}</span>
            <span><MapPin size={13} /> {h.location}</span>
          </div>
          <div className="ud-item-footer">
            <StatusBadge status={h.participationType} />
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default HackathonsTab;
