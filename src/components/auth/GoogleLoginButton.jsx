import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { toast } from "react-toastify";

const GoogleLoginButton = () => {

  const navigate = useNavigate();

  const { setAuthSession } = useAuth();

  const handleSuccess = async (
    credentialResponse
  ) => {

    try {
      const res = await apiUtils.post(
        API_ENDPOINTS.AUTH.GOOGLE,
        {
          token: credentialResponse.credential,
        }
      );
      const data = await res.json();

      // Use AuthContext session handler
      setAuthSession(
        data.token,
        data
      );



      navigate("/dashboard", {
        replace: true
      });

    } catch (error) {

      console.error(
        "Google Login Error:",
        error
      );
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() =>
        toast.error("Google Sign-In failed. Please try again.")
      }
    />
  );
};

export default GoogleLoginButton;
