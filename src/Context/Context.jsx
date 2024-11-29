import { createContext, useContext, useState, useEffect } from 'react';
import { CONSTANTS } from '../constants';
import { useTranslation } from 'react-i18next';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { t } = useTranslation();
  const [showMoreProjects, setShowMoreProjects] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  // Load initial theme from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('userTheme');
    return savedTheme ? JSON.parse(savedTheme) : getSystemTheme();
  });

  // Helper function to determine system theme
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Toggle the 'showMoreProjects' state
  const toggleMoreProjects = () => {
    setShowMoreProjects((prev) => !prev);
  };

  // Scroll handler to detect when at the bottom of the page
  const handleScroll = () => {
    const isPageBottom =
      Math.ceil(window.innerHeight + window.scrollY) >=
      document.documentElement.scrollHeight - CONSTANTS.SPACE_BEFORE_PAGE_BOTTOM;
    setAtBottom(isPageBottom);
  };

  // Update document title based on the selected language
  useEffect(() => {
    document.title = t('app-title');
  }, [t]);

  // Scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Save theme to localStorage and apply it to the body
  useEffect(() => {
    localStorage.setItem('userTheme', JSON.stringify(theme));
    document.body.setAttribute('data-theme', theme); // Optional: Add a data attribute for CSS handling
  }, [theme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AppContext.Provider
      value={{
        showMoreProjects,
        toggleMoreProjects,
        atBottom,
        toggleTheme,
        theme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for accessing the global context
export const useGlobalContext = () => {
  return useContext(AppContext);
};
