import { Moon, Sun } from 'lucide-react';

import Button from '../common/Button';

const ThemeToggle = ({ isDarkMode, toggleTheme }) => (
  <Button
    variant="primary"
    onClick={toggleTheme}
    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    aria-pressed={isDarkMode}
    title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    {isDarkMode ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
  </Button>
);

export default ThemeToggle;
