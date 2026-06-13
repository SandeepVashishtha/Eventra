import { Toaster } from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";

const NotificationToastContainer = () => {
  const { isDarkMode } = useTheme();

  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          zIndex: 10050,
        },
        success: {
          style: {
            background: isDarkMode ? "#1f2937" : "#fff",
            color: isDarkMode ? "#e5e7eb" : "#111827",
          },
        },
        error: {
          style: {
            background: isDarkMode ? "#1f2937" : "#fff",
            color: isDarkMode ? "#e5e7eb" : "#111827",
          },
        },
      }}
    />
  );
};

export default NotificationToastContainer;
