import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../../../context/AuthContext";
import { toast } from "react-toastify";

const useNavbarState = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [navHeight, setNavHeight] = useState(0);

  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const navRef = useRef(null);

  const touchStartXRef = useRef(null);
  const touchCurrentXRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const primaryLine =
    (user && user.fullName && user.fullName.trim()) ||
    ([user && user.firstName, user && user.lastName].filter(Boolean).join(" ").trim()) ||
    (user && user.username && user.username.trim()) ||
    (user && user.email && user.email.trim()) ||
    "User";

  const secondaryCandidate =
    (user && user.email && user.email.trim()) ||
    (user && user.username && user.username.trim()) ||
    "";

  const secondaryLine =
    secondaryCandidate && secondaryCandidate !== primaryLine
      ? secondaryCandidate
      : null;

  const closeAllMenus = () => {
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  useEffect(() => {
    closeAllMenus();
  }, [location.pathname]);

  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }

    const handleResize = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchCurrentXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchCurrentXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const start = touchStartXRef.current;
    const end = touchCurrentXRef.current;

    if (typeof start !== "number" || typeof end !== "number") return;

    const deltaX = end - start;

    if (deltaX > 50) {
      closeAllMenus();
    }

    touchStartXRef.current = null;
    touchCurrentXRef.current = null;
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowProfileDropdown(false);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);

    logout();

    toast.success("You have been logged out successfully.", {
      className: "custom-toast",
      autoClose: 3000,
    });

    navigate("/");
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    showProfileDropdown,
    setShowProfileDropdown,
    openDropdown,
    setOpenDropdown,
    showLogoutModal,
    navHeight,
    drawerRef,
    closeBtnRef,
    toggleBtnRef,
    navRef,
    user,
    isAuthenticated,
    primaryLine,
    secondaryLine,
    location,
    closeAllMenus,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleLogoutClick,
    handleConfirmLogout,
    handleCancelLogout,
  };
};

export default useNavbarState;