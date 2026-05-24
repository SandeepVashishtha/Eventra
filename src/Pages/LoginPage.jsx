import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";

// Page Imports
import DashboardHome from "../../Pages/DashboardHome"; // Adjust if names differ locally
import Settings from "../../Pages/Settings";
import Signup from "../auth/Signup";
import LoginPage from "../../Pages/LoginPage"; 

/**
 * Generates the set of routes that require a valid user session.
 */
export const getProtectedRoutes = () => [
  <Route
    key="/dashboard"
    path="/dashboard"
    element={
      <ProtectedRoute>
        <DashboardHome />
      </ProtectedRoute>
    }
  />,
  <Route
    key="/settings"
    path="/settings"
    element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    }
  />
];

/**
 * Generates authentication gateway routes (Login / Signup).
 */
export const getAuthRoutes = () => [
  <Route 
    key="/login" 
    path="/login" 
    element={<LoginPage />} 
  />,
  <Route 
    key="/signup" 
    path="/signup" 
    element={<Signup />} 
  />
];