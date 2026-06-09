import { apiUtils, API_ENDPOINTS } from "../config/api";

export const projectService = {
  getAllProjects: async (config) => {
    return apiUtils.get(API_ENDPOINTS.PROJECTS.LIST, config);
  },
  
  getProjectDetails: async (projectId, config) => {
    return apiUtils.get(API_ENDPOINTS.PROJECTS.DETAIL(projectId), config);
  },
  
  getCategories: async (config) => {
    return apiUtils.get(API_ENDPOINTS.PROJECTS.CATEGORIES, config);
  },
  
  submitProject: async (projectData, config) => {
    return apiUtils.post(API_ENDPOINTS.PROJECTS.SUBMIT, projectData, config);
  }
};
