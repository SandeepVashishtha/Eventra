import { Toaster } from "react-hot-toast";

const NotificationToastContainer = () => {
  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        zIndex: 10050,
        marginBottom: "1rem",
      }}
      toastOptions={{
        duration: 3000,
      }}
    />
  );
};

export default NotificationToastContainer;
