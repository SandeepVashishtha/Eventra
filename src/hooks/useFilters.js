import { useSearchParams } from "react-router-dom";

const parseArrayParam = (value) => {
  if (!value) return [];
  return value.split(",").filter(Boolean);
};

export default function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    search: searchParams.get("search") || "",
    category: parseArrayParam(searchParams.get("category")),
    mode: parseArrayParam(searchParams.get("mode")),
    status: parseArrayParam(searchParams.get("status")),
    sort: searchParams.get("sort") || "Newest",
    view: searchParams.get("view") || "grid",
  };

  const updateFilters = (updates) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(key);
      } else {
        params.set(
          key,
          Array.isArray(value)
            ? value.join(",")
            : value,
        );
      }
    });

    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return {
    filters,
    updateFilters,
    clearFilters,
  };
}
export const getActiveFiltersLimit = () => 10;
