import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import ModernSearchInput from "../../../components/common/ModernSearchInput";
import useDebouncedSearch from "../../../hooks/useDebouncedSearch";
import { eventService } from "../../../services/eventService";
import hackathonsData from "../../Hackathons/hackathonMockData.json";
import projectsData from "../../Projects/mockProjectsData.json";

const SEARCH_RESULT_LIMIT = 5;

const createSearchItem = (item, type, searchType) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  location: item.location,
  tags: item.tags,
  techStack: item.techStack,
  type,
  searchType,
});

const getItemPath = (item) => {
  if (item.type === "hackathon") return `/hackathons/${item.id}`;
  if (item.type === "project") return `/projects/${item.id}`;
  return `/events/${item.id}`;
};

export default function HomeEventSearch() {
  const { t } = useTranslation();
  const [eventsData, setEventsData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let cancelled = false;
    eventService
      .getAllEvents()
      .then((res) => {
        if (cancelled) return;
        const raw = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
        setEventsData(raw);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const searchIndex = useMemo(() => {
    const allSearchItems = [
      ...eventsData.map((i) => createSearchItem(i, "event", "Events")),
      ...hackathonsData.map((i) => createSearchItem(i, "hackathon", "Hackathons")),
      ...projectsData.map((i) => createSearchItem(i, "project", "Projects")),
    ];
    return new Fuse(allSearchItems, {
      keys: ["title", "description", "location", "tags", "techStack", "type"],
      threshold: 0.3,
      includeScore: true,
    });
  }, [eventsData]);

  const { searchTerm, debouncedTerm, setSearchTerm } = useDebouncedSearch("", 300);

  useEffect(() => {
    const trimmed = debouncedTerm.trim();
    setSearchResults(trimmed ? searchIndex.search(trimmed).slice(0, SEARCH_RESULT_LIMIT) : []);
    setShowResults(!!trimmed);
  }, [debouncedTerm, searchIndex]);

  return (
    <section
      className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10"
      aria-label={t("landing.search.ariaLabel")}
    >
      <div className="text-center">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
          {t("landing.search.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("landing.search.subtitle")}
        </p>
      </div>

      <div className="relative mt-4">
        <ModernSearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("landing.search.placeholder")}
          aria-label={t("landing.search.placeholder")}
        />

        {showResults && searchResults.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
            role="listbox"
            aria-label={t("landing.hero.searchResults")}
          >
            {searchResults.map(({ item }) => (
              <li key={`${item.type}-${item.id}`} role="option">
                <Link
                  to={getItemPath(item)}
                  className="block border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-violet-50 dark:border-slate-800 dark:hover:bg-slate-800/80"
                >
                  <span className="text-xs font-medium uppercase tracking-wide text-violet-600 dark:text-violet-400">
                    {t(`landing.hero.searchTypes.${item.searchType}`)}
                  </span>
                  <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                  {item.description && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}
