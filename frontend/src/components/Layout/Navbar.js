import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Connect to AuthContext
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();


  // Close dropdown when clicking outside or on overlay
  const closeAllMenus = () => {
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  const navItems = [
    { name: 'Events', href: '/events' },
    { name: 'Hackathons', href: '/hackathons' },
    { name: 'Projects', href: '/projects' },
    { name: 'Contributors', href: '/contributors' },
    { name: 'LeaderBoard', href: '/leaderBoard' },
    { name: 'About', href: '/about' }    
  ];

  const handleLogout = async () => {
    logout();
    setShowProfileDropdown(false);
    navigate('/');
  };

  const renderAuthSection = () => {
    if (isAuthenticated()) {
      return (
        <div className="hidden md:flex items-center space-x-4">
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileDropdown(!showProfileDropdown);
              }}
            >
              <img
                src={user?.profilePicture || '/default-avatar.png'}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <span className="text-gray-800 font-medium">
                {user?.firstName || user?.email?.split('@')[0] || 'User'}
              </span>
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-[49]">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user?.profilePicture || '/default-avatar.png'}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user?.email}
                      </div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                </div>
                <Link to="/dashboard" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
                  <svg className="w-5 h-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Dashboard
                </Link>
                <Link to="/profile" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
                  <svg className="w-5 h-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-50 flex items-center"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 text-gray-800 font-medium hover:text-indigo-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      );
    }
  };

  const renderMobileAuthSection = () => {
    if (isAuthenticated()) {
      return (
        <div className="mt-auto border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center space-x-3 px-2 py-2">
              <img
                src={user?.profilePicture || '/default-avatar.png'}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg mx-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Dashboard
            </Link>
            <Link
              to="/profile"
              className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg mx-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Edit Profile
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center px-4 py-2.5 text-left text-red-600 hover:bg-gray-50 rounded-lg mx-1"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="mt-auto border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-sm text-gray-500 mb-3 text-center">Sign in to access more features</p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full text-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="block w-full text-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Create Account
            </Link>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {/* Overlay with smooth transition */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${isMobileMenuOpen || showProfileDropdown ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={closeAllMenus}
        aria-hidden="true"
      />

      <nav className={`sticky top-0 w-full z-50 bg-white shadow-md py-3`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Brand */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h2 className="text-2xl font-bold text-indigo-600">Eventra</h2>
            </Link>

            {/* Center: Navigation - Desktop only */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right: Auth section */}
            {renderAuthSection()}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 z-50 transition-colors duration-200"
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu with slide-in animation */}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
            <button
              onClick={closeAllMenus}
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            <div className="px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-lg mx-1 transition-colors"
                  onClick={closeAllMenus}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {renderMobileAuthSection()}
        </div>
      </nav>
    </>
  );
};

export default Navbar;

