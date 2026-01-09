import React from 'react';
import { Flower2, Moon, Sun, Globe } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const Header: React.FC = () => {
  const { theme, setTheme, language, setLanguage, t } = useSettings();

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const toggleLanguage = () => setLanguage(language === 'en' ? 'zh' : 'en');

  return (
    <header className="w-full flex flex-col">
      {/* Top Row: Settings Controls aligned to right */}
      <div className="w-full flex justify-end px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1 font-sans text-sm font-medium"
            title="Switch Language"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'en' ? 'EN' : '中文'}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Row: Centered and padded */}
      <div className="flex flex-col items-center justify-center text-center px-4 pb-8 pt-2">
        <div className="flex items-center gap-3 mb-2">
          <Flower2 className="w-10 h-10 text-rose-500" strokeWidth={1.5} />
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
            {t.appName}
          </h1>
        </div>
        <p className="text-stone-500 dark:text-stone-400 text-lg font-light italic">
          {t.appTagline}
        </p>
      </div>
    </header>
  );
};

export default Header;