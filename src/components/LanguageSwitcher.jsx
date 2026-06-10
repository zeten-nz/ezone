import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-100 transition bg-white"
    >
      {language === 'uz' ? 'RU' : 'UZ'}
    </button>
  );
};

export default LanguageSwitcher;
