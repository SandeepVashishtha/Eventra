import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NotificationToastContainer = () => {
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
      theme="colored"
      limit={3}
      style={{ 
        zIndex: 10050,
        marginBottom: '1rem'
      }}
    />
  );
};

export default NotificationToastContainer;
