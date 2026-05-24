import React from "react";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-4xl font-extrabold text-red-600 dark:text-red-400 mb-2">
        Access Denied
      </h1>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
        Your current account profile does not possess the permissions or roles required to view this administrative zone.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors"
      >
        Return to Safety
      </button>
    </div>
  );
};

export default UnauthorizedPage;