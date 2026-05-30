import { apiUtils, API_ENDPOINTS } from "../config/api";
import mockHackathons from "../Pages/Hackathons/hackathonMockData.json";

export const fetchHackathons = async () => {
  try {
    const response = await apiUtils.get(API_ENDPOINTS.HACKATHONS.LIST);
    
    // 🔥 FIX 1: Explicitly check for HTTP errors so the catch block handles them
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // 🔥 FIX 2: Return data if it exists, even if it is an empty array.
    // Previously, an empty database (data.length === 0) accidentally triggered mock data.
    if (data) {
      return data;
    }
  } catch (error) {
    console.warn("Failed to fetch hackathons from API, falling back to mock data", error);
  }
  
  return mockHackathons;
};