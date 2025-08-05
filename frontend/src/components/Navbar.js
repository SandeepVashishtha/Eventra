import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './shared-layout.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Events', href: '/events' },
    { name: 'Hackathons', href: '/hackathons' },
    { name: 'Projects', href: '/projects' },
    { name: 'About', href: '/about' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
   <motion.nav 
  className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="navbar-container">
        
        <Link 
          to="/"
          className="nav-link navbar-brand"
          style={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          <h2 className="text-gradient">Eventra</h2>
        </Link>

        {/* Desktop Navigation */}
        <ul className="navbar-nav desktop-nav">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link to={item.href} className="nav-link">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth Buttons */}
        <div className="navbar-right desktop-nav">
          {isAuthenticated() ? (
            <>
              <span className="user-greeting">Hi, {user?.name || user?.email}!</span>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Sign In</Link>
              <Link to="/signup" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
     
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          className="mobile-menu"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          {navItems.map((item) => (
            <Link 
              key={item.name}
              to={item.href} 
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="mobile-auth">
            {isAuthenticated() ? (
              <>
                <span className="user-greeting">Hi, {user?.name || user?.email}!</span>
                <button onClick={handleLogout} className="btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary" onClick={() => setIsMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
