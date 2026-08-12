import { useMemo, useState } from "react";
import { Search, FolderOpen } from "lucide-react";
import ResourceCard from "./ResourceCard";
import {
  searchResources,
  filterResources,
  getCategories,
} from "../../utils/resourceLibraryUtils";

const ResourceLibrary = ({ resources = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...getCategories(resources)],
    [resources]
  );

  const filteredResources = useMemo(() => {
    let result = searchResources(resources, searchQuery);
    result = filterResources(result, selectedCategory);
    return result;
  }, [resources, searchQuery, selectedCategory]);

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">
        <FolderOpen size={28} className="text-indigo-600" />

        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Event Resource Library
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Browse event documents, presentations, links, FAQs, and other resources.
          </p>
        </div>
      </div>

      {/* Search & Filter */}

      <div className="flex flex-col md:flex-row gap-4 mb-8">

        <div className="relative flex-1">

          <Search
            size={18}
            className="absolute left-3 top-3.5 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
          />

        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3"
        >
          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>

      </div>

      {/* Resource Grid */}

      {filteredResources.length === 0 ? (
        <div className="text-center py-12">

          <FolderOpen
            size={48}
            className="mx-auto text-slate-400 mb-4"
          />

          <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
            No Resources Found
          </h3>

          <p className="text-slate-500 mt-2">
            Try changing your search or category filter.
          </p>

        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
            />
          ))}
        </div>
      )}

    </section>
  );
};

export default ResourceLibrary;