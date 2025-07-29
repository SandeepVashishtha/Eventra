import React from 'react';
import './shared-layout.css';

import { useTheme } from '../ThemeContext'; // ✅ Theme integration
const Footer = () => {
  
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();

  const footerLinks = {
    community: [
      { name: 'Create Event', href: '/create-event' },
      { name: 'Event Templates', href: '#templates' },
      { name: 'Community Events', href: '#community' },
      { name: 'Documentation', href: '#docs' }
    ],
    company: [
      { name: 'About', href: '#about' },
      { name: 'Open Source', href: '#opensource' },
      { name: 'GitHub', href: 'https://github.com/sandeepvashishtha/Eventra' },
      { name: 'Changelog', href: '#changelog' },
      { name: 'Privacy', href: '#privacy' },
      { name: 'Terms', href: '#terms' }
    ],
    support: [
      { name: 'Help Center', href: '#help' },
      { name: 'Contact Us', href: '#contact' },
      { name: 'API Docs', href: '#api' },
      { name: 'Status', href: '#status' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com', icon: '🐦' },
    { name: 'Discord', href: '#discord', icon: '💬' },
    { name: 'Telegram', href: 'https://t.me/eventra', icon: '📱' },
    { name: 'GitHub', href: 'https://github.com/sandeepvashishtha', icon: '💻' },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: '💼' }
  ];

  return (
    <footer className={`footer ${theme === 'dark' ? 'footer-dark' : 'footer-light'}`}>
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="text-gradient">Eventra</h3>
            <p className="footer-tagline">
              Open-source event management for communities worldwide.
            </p>
            <div className="social-links">
              {socialLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  className="social-link"
                  title={link.name}
                >
                  <span className="social-icon">{link.icon}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h4 className="link-group-title">Community</h4>
              <ul className="link-list">
                {footerLinks.community.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="footer-link">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-group">
              <h4 className="link-group-title">Company</h4>
              <ul className="link-list">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="footer-link">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-group">
              <h4 className="link-group-title">Support</h4>
              <ul className="link-list">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="footer-link">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-tech">
            <p>
              Built with ❤️ using React.js, Spring Boot, and MySQL. 
              Open-source and designed for communities by communities. 
              Powered by passionate developers worldwide.
            </p>
          </div>
          <div className="footer-copyright">
            <p>© {currentYear}, Eventra - Created by Sandeep Vashishtha</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
