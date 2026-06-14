import { apiUtils, API_ENDPOINTS } from "../config/api";

const getPage = async (eventId, page) => {
  const res = await apiUtils.get(`${API_ENDPOINTS.EVENTS.REGISTRANTS(eventId)}?page=${page}&limit=500`);
  return { 
    data: res.data?.data || res.data || [], 
    totalPages: res.data?.totalPages || 1 
  };
};

export const fetchRegistrantsForExport = async (eventId) => {
  let allRegistrants = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const { data, totalPages } = await getPage(eventId, page);
    if (Array.isArray(data)) {
      allRegistrants.push(...data);
    }
    hasMore = page < totalPages && data.length >= 500;
    page++;
  }
  return allRegistrants;
};
