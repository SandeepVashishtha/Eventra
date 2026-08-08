import { useMemo, useState } from "react";
import { Search, Award } from "lucide-react";
import CertificateCard from "./CertificateCard";
import {
  searchCertificates,
  filterCertificates,
  getCertificateYears,
  getCertificateCategories,
} from "../../utils/certificateUtils";

const CertificateTracker = ({ certificates = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const years = useMemo(
    () => ["All", ...getCertificateYears(certificates)],
    [certificates]
  );

  const categories = useMemo(
    () => ["All", ...getCertificateCategories(certificates)],
    [certificates]
  );

  const filteredCertificates = useMemo(() => {
    const searched = searchCertificates(certificates, searchQuery);

    return filterCertificates(
      searched,
      selectedYear,
      selectedCategory,
      selectedStatus
    );
  }, [
    certificates,
    searchQuery,
    selectedYear,
    selectedCategory,
    selectedStatus,
  ]);

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">
        <Award size={28} className="text-indigo-600" />

        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Certificate Tracker
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            View, search and manage your event certificates.
          </p>
        </div>
      </div>

      {/* Search & Filters */}

      <div className="grid gap-4 md:grid-cols-4 mb-8">

        <div className="relative md:col-span-2">
          <Search
            size={18}
            className="absolute left-3 top-3.5 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

      </div>

      <div className="mb-8">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3"
        >
          <option value="All">All Status</option>
          <option value="Issued">Issued</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Certificate Grid */}

      {filteredCertificates.length === 0 ? (
        <div className="text-center py-12">

          <Award
            size={52}
            className="mx-auto text-slate-400 mb-4"
          />

          <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
            No Certificates Found
          </h3>

          <p className="text-slate-500 mt-2">
            Try adjusting your search or filter options.
          </p>

        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {filteredCertificates.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
            />
          ))}

        </div>
      )}

    </section>
  );
};

export default CertificateTracker;