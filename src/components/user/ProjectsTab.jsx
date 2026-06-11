import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FolderOpen, Plus } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import { DashboardItemCardSkeleton } from "../common/SkeletonLoaders";
import SearchEmptyState from "../common/SearchEmptyState";

const ProjectsTab = ({ projects, loading, fadeUp }) => (
  <motion.div key="projects" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ud-content">
    <div className="ud-tab-header">
      <h2 className="ud-page-title"><FolderOpen size={20} /> My Projects</h2>
      <Link to="/submit-project" className="ud-btn-primary"><Plus size={15} /> Submit Project</Link>
    </div>
    
    {!loading && projects.length === 0 ? (
      <div className="mt-4 w-full">
        <SearchEmptyState
          query=""
          itemLabel="projects"
          browseLabel="Browse Projects"
          browsePath="/projects"
          onClear={() => {}}
          suggestions={[
            "Check out open source projects",
            "Submit your own project",
            "Collaborate with others",
          ]}
        />
      </div>
    ) : (
      <div className="ud-items-grid">
        {loading
          ? [...Array(2)].map((_, i) => <DashboardItemCardSkeleton key={i} />)
          : projects.map((p, i) => (
        <motion.div key={p.id} custom={i} variants={fadeUp} initial="hidden" animate="visible" className="ud-item-card">
          <div className="ud-item-top">
            <span className="ud-item-type" style={{ background: "#8b5cf618", color: "#8b5cf6" }}><FolderOpen size={13} /> Project</span>
            <StatusBadge status={p.projectStatus} />
          </div>
          <h3 className="ud-item-title">{p.title}</h3>
          <div className="ud-item-meta">
            <span>Updated: {p.lastUpdate}</span>
          </div>
          <div className="ud-item-footer">
            <StatusBadge status={p.participationType} />
          </div>
        </motion.div>
      ))}
      </div>
    )}
  </motion.div>
);

export default ProjectsTab;
