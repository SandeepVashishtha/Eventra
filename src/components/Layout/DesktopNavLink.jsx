import { Link } from "react-router-dom";

const DesktopNavLink = ({ item, isActive }) => (
  <Link
    to={item.href}
    className={`relative group text-[12px] font-semibold transition-all duration-200 whitespace-nowrap px-1 py-1.5 rounded-full ${
      isActive
        ? "text-indigo-700 dark:text-indigo-300"
        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
    }`}
    style={
      isActive
        ? {
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            border: '1.5px solid rgba(99, 102, 241, 0.45)',
            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.08)',
          }
        : { border: '1.5px solid transparent' }
    }
  >
    {item.name}
  </Link>
);

export default DesktopNavLink;
