import React from "react";
import { Link } from "react-router-dom";

const AuthButtons = () => {
  return (
    <div className="flex items-center gap-3">
      <Link to="/login" className="px-4 py-2">
        Sign In
      </Link>

      <Link
        to="/signup"
        className="px-4 py-2 bg-black text-white rounded-lg"
      >
        Get Started
      </Link>
    </div>
  );
};

export default AuthButtons;