import { ToastContainer } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";
import "react-toastify/dist/ReactToastify.css";

const NotificationToastContainer = () => {
  const { isDarkMode } = useTheme();

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      closeButton
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={isDarkMode ? "dark" : "light"}
      limit={3}
      style={{
        zIndex: 10050,
        marginBottom: "1rem",
      }}
    />
  );
};

export default NotificationToastContainer;
