import { FaGithub, FaTwitter, FaLinkedin, FaDiscord, FaTelegram } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    community: [
      { name: 'Create Event', href: '/create-event' },
      { name: 'Event Templates', href: '#templates' },
      { name: 'Community Events', href: '#community' },
      { name: 'Documentation', href: '#docs' }
    ],
    company: [
      { name: 'About', href: '/about' },
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
    {
      name: 'GitHub',
      href: 'https://github.com/sandeepvashishtha/Eventra',
      icon: <FaGithub size={20} />,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/#',
      icon: <FaTwitter size={20} />,
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/sandeepvashishtha/',
      icon: <FaLinkedin size={20} />,
    },
    {
      name: 'Discord',
      href: '#discord',
      icon: <FaDiscord size={20} />,
    },
    {
      name: 'Telegram',
      href: 'https://t.me/eventra',
      icon: <FaTelegram size={20} />,
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-white to-indigo-50 border-t border-gray-200 pt-12 pb-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Eventra</h3>
            <p className="text-gray-600">
              Open-source event management for communities worldwide.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  title={link.name}
                  className="group p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:bg-indigo-50"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{link.name}</span>
                  <span className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors">
                    {link.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key} className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-indigo-600 hover:pl-1 transition-all duration-200 text-sm inline-block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © {currentYear} Eventra - Made with ❤️ by{' '}
              <a 
                href="https://github.com/sandeepvashishtha" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Sandeep Vashishtha
              </a>{' '}
              & contributors
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
