import { apiUtils, API_ENDPOINTS } from "../config/api";

export const fetchHackathons = async () => {
  const response = await apiUtils.get(API_ENDPOINTS.HACKATHONS.LIST);
  const data = response.data;

  if (Array.isArray(data) && data.length > 0) {
    return data;
  }
  throw new Error("Hackathons API returned no data");
};

export const hostHackathon = async (hackathonData, config) => {
  return apiUtils.post(API_ENDPOINTS.HACKATHONS.HOST, hackathonData, config);
};
