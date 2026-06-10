import BackToTop from "./BackToTop";

/**
 * @deprecated Use BackToTop component directly. 
 * This remains as a wrapper for backward compatibility.
 */
const BackToTopButton = ({ threshold = 300, positionClass = "bottom-6 right-6" }) => {
  return (
    <BackToTop 
      threshold={threshold} 
      className={positionClass} 
      showProgress={false} 
    />
  );
};

export default BackToTopButton;
