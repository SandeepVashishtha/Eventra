/**
 * Get all unique categories
 */
export const getCategories = (resources = []) => {
  return [...new Set(resources.map((resource) => resource.category))];
};

/**
 * Search resources by title or description
 */
export const searchResources = (resources = [], query = "") => {
  if (!query.trim()) return resources;

  const keyword = query.toLowerCase();

  return resources.filter((resource) => {
    return (
      resource.title?.toLowerCase().includes(keyword) ||
      resource.description?.toLowerCase().includes(keyword)
    );
  });
};

/**
 * Filter resources by category
 */
export const filterResources = (
  resources = [],
  category = "All"
) => {
  if (category === "All") return resources;

  return resources.filter(
    (resource) => resource.category === category
  );
};

/**
 * Sort resources alphabetically
 */
export const sortResources = (resources = []) => {
  return [...resources].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
};

/**
 * Add a resource
 */
export const addResource = (
  resources = [],
  resource
) => {
  return [
    ...resources,
    {
      id: Date.now(),
      ...resource,
    },
  ];
};

/**
 * Remove a resource
 */
export const removeResource = (
  resources = [],
  resourceId
) => {
  return resources.filter(
    (resource) => resource.id !== resourceId
  );
};

/**
 * Group resources by category
 */
export const groupResourcesByCategory = (
  resources = []
) => {
  return resources.reduce((groups, resource) => {
    const category = resource.category || "Other";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(resource);

    return groups;
  }, {});
};

/**
 * Count resources by category
 */
export const getCategoryCounts = (
  resources = []
) => {
  return resources.reduce((counts, resource) => {
    const category = resource.category || "Other";

    counts[category] = (counts[category] || 0) + 1;

    return counts;
  }, {});
};

/**
 * Get featured resources
 */
export const getFeaturedResources = (
  resources = []
) => {
  return resources.filter(
    (resource) => resource.featured === true
  );
};

/**
 * Get recent resources
 */
export const getRecentResources = (
  resources = [],
  limit = 5
) => {
  return [...resources]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, limit);
};