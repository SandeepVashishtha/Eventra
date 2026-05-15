import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../common/ConfirmationModal';
import { toast } from 'react-toastify';

import {
  Home,
  Calendar,
  Sparkles,
  FolderKanban,
  Users,
  Trophy,
  Info,
  MessageSquare,
  Book,
  HelpCircle,
} from 'lucide-react';

import DesktopNavbar from './DesktopNavbar';
import MobileDrawer from './MobileDrawer';

// ---------------------------------------------------------------------------
// Static data – defined outside the component so it is never recreated
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
  { name: 'Home', href: '/', icon: <Home className="w-5 h-5" /> },
  { name: 'Events', href: '/events', icon: <Calendar className="w-5 h-5" /> },
  { name: 'Hackathons', href: '/hackathons', icon: <Sparkles className="w-5 h-5" /> },
  { name: 'Projects', href: '/projects', icon: <FolderKanban className="w-5 h-5" /> },
  {
    name: 'Community',
    icon: <Users className="w-5 h-5" />,
    subItems: [
      { name: 'Leaderboard', href: '/leaderBoard', icon: <Trophy className="w-5 h-5" /> },
      { name: 'Contributors', href: '/contributors', icon: <Users className="w-5 h-5" /> },
      { name: 'Contributors Guide', href: '/contributorguide', icon: <Book className="w-5 h-5" /> },
      { name: 'Community Events', href: '/communityEvent', icon: <Users className="w-5 h-5" /> },
    ],
  },
  { name: 'About', href: '/about', icon: <Info className="w-5 h-5" /> },
  { name: 'FAQ', href: '/faq', icon: <HelpCircle className="w-5 h-5" /> },
  { name: 'Contact', href: '/contact', icon: <MessageSquare className="w-5 h-5" /> },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const lockBodyScroll = (scrollY) => {
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
};

const unlockBodyScroll = () => {
  const stored = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  if (stored) window.scrollTo(0, parseInt(stored, 10) * -1 || 0);
};

const getUserDisplayNames = (user) => {
  const primaryLine =
    (user?.fullName && user.fullName.trim()) ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    (user?.username && user.username.trim()) ||
    (user?.email && user.email.trim()) ||
    'User';

  const secondaryCandidate =
    (user?.email && user.email.trim()) ||
    (user?.username && user.username.trim()) ||
    '';

  const secondaryLine =
    secondaryCandidate && secondaryCandidate !== primaryLine ? secondaryCandidate : null;

  return { primaryLine, secondaryLine };
};

// ---------------------------------------------------------------------------
// Navbar – state management + composition only
// ---------------------------------------------------------------------------
const Navbar = ({ cursorEnabled, toggleCursor }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [navHeight, setNavHeight] = useState(0);

  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchCurrentXRef = useRef(null);
  const navRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { primaryLine, secondaryLine } = getUserDisplayNames(user);

  // -- close all menus ---------------------------------------------------------
  const closeAllMenus = () => {
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    try { unlockBodyScroll(); } catch (_) { /* ignore */ }
    try { toggleBtnRef.current?.focus(); } catch (_) { /* ignore */ }
  };

  // -- body scroll lock --------------------------------------------------------
  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      lockBodyScroll(scrollY);
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    } else {
      unlockBodyScroll();
    }
    return () => { try { unlockBodyScroll(); } catch (_) { /* ignore */ } };
  }, [isMobileMenuOpen]);

  // -- broadcast mobile menu state --------------------------------------------
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mobileMenuToggle', { detail: isMobileMenuOpen }));
  }, [isMobileMenuOpen]);

  // -- close on route change ---------------------------------------------------
  useEffect(() => {
    closeAllMenus();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // -- keyboard trap for drawer ------------------------------------------------
  useEffect(() => {
    if (!isMobileMenuOpen || !drawerRef.current) return;
    const drawer = drawerRef.current;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeAllMenus(); return; }
      if (e.key === 'Tab') {
        const focusable = drawer.querySelectorAll(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // -- nav height tracker ------------------------------------------------------
  useEffect(() => {
    const update = () => navRef.current && setNavHeight(navRef.current.offsetHeight);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // -- touch swipe handlers ----------------------------------------------------
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchCurrentXRef.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => { touchCurrentXRef.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const delta = (touchCurrentXRef.current ?? 0) - (touchStartXRef.current ?? 0);
    if (delta > 50) closeAllMenus();
    touchStartXRef.current = null;
    touchCurrentXRef.current = null;
  };

  // -- logout handlers ---------------------------------------------------------
  const handleLogoutClick = () => { setShowLogoutModal(true); setShowProfileDropdown(false); };
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    toast.success('You have been logged out successfully.', { className: 'custom-toast', autoClose: 3000 });
    navigate('/');
  };
  const handleCancelLogout = () => setShowLogoutModal(false);

  // -- shared props ------------------------------------------------------------
  const sharedProps = {
    navItems: NAV_ITEMS,
    openDropdown,
    setOpenDropdown,
    isAuthenticated,
    user,
    primaryLine,
    secondaryLine,
    showProfileDropdown,
    setShowProfileDropdown,
    handleLogoutClick,
    cursorEnabled,
    toggleCursor,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${
          isMobileMenuOpen || showProfileDropdown || openDropdown || showLogoutModal
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeAllMenus}
      />

      {/* Top nav bar */}
      <nav
        ref={navRef}
        data-aos="fade-down"
        data-aos-once="true"
        data-aos-duration="1000"
        className="fixed top-0 left-0 w-full z-40 shadow-sm
          bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-black/10 dark:border-white/15"
      >
        <div className="w-full flex items-center h-20 px-6 md:px-12 relative">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 z-20">
            <h2
              className="text-3xl font-semibold tracking-tight text-black dark:text-white"
              style={{ fontFamily: '"Anton", sans-serif' }}
            >
              Eventra
            </h2>
          </Link>

          {/* Desktop nav links + actions */}
          <DesktopNavbar {...sharedProps} />

          {/* Mobile hamburger */}
          <div className="lg:hidden ml-auto flex items-center gap-2">
            <button
              ref={toggleBtnRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Open navigation"
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <MobileDrawer
        {...sharedProps}
        drawerRef={drawerRef}
        closeBtnRef={closeBtnRef}
        isMobileMenuOpen={isMobileMenuOpen}
        closeAllMenus={closeAllMenus}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      />

      {/* Logout confirmation */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to log out?"
      />

      {/* Spacer to offset fixed nav */}
      <div style={{ height: navHeight }} />
    </>
  );
};

export default Navbar;
