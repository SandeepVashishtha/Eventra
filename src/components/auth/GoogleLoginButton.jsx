import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const GoogleLoginButton = () => {

  const navigate = useNavigate();

  const { setAuthSession } = useAuth();

  const handleSuccess = async (
    credentialResponse
  ) => {

    try {

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/google`,
        {
          token: credentialResponse.credential,
        }
      );

      // Use AuthContext session handler
      setAuthSession(
        res.data.token,
        res.data
      );

      console.log(
        "Google Login Success:",
        res.data
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
        console.log("Login Failed")
      }
    />
  );
};

export default GoogleLoginButton;