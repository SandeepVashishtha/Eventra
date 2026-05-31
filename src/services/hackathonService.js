import { apiUtils, API_ENDPOINTS } from "../config/api";
import mockHackathons from "../Pages/Hackathons/hackathonMockData.json";

export const fetchHackathons = async () => {
  try {
    const response = await apiUtils.get(API_ENDPOINTS.HACKATHONS.LIST);
    
    // axios returns response.data directly, not response.json()
    const data = response.data;
    
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (error) {
    console.warn(
      "Failed to fetch hackathons from API, falling back to mock data",
      error
    );
  }
  
  return mockHackathons;
};