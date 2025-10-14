import { ToastContainer } from "react-toastify";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import "react-toastify/dist/ReactToastify.css";

const ToastProvider = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <ToastContainer
      key={theme} 
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      pauseOnHover
      draggable
      theme={theme === "dark" ? "dark" : "light"} 
    />
  );
};

export default ToastProvider;
