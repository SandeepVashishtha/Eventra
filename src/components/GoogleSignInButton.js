import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Props: optional for button styling
const GoogleSignInButton = ({ className }) => {
  const { signInWithGoogle } = useAuth();

  // Load Google script if not already loaded
  useEffect(() => {
    const id = "google-client-script";  
    if (!document.getElementById(id)) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = id;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // Handle Google credential response
  const handleGoogleResponse = (response) => {
    if (response.credential) {
      // Pass credential to AuthContext for login/signup
      signInWithGoogle(response.credential);
    } else {
      console.error("Google Sign-In failed: No credential returned");
      alert("Google Sign-In failed. Please try again.");
    }
  };

  // Render the Google button
  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error(
        "FATAL ERROR: REACT_APP_GOOGLE_CLIENT_ID is missing! Check your .env file or hosting environment variables."
      );
      
      return; 
    }
    
    
    const interval = setInterval(() => {
      if (window.google && window.google.accounts) {
        
        
        window.google.accounts.id.initialize({
          client_id: clientId, 
          callback: handleGoogleResponse,
        });
        
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "outline",
            size: "large",
            width: "100%",
            type: "standard",
          }
        );

        clearInterval(interval); 
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="google-signin-button" className={className}></div>
  );
};

export default GoogleSignInButton;
