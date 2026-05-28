import { useEffect } from "react";

import {
  useLocation,
} from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } =
    useLocation();

  useEffect(() => {
    // Disable browser automatic
    // scroll restoration
    if (
      "scrollRestoration" in
      window.history
    ) {
     window.scrollTo({
  top: 0,
  behavior: "smooth",
});
    }

    // Scroll to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;