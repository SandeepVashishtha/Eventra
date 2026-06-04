import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const toggle = () => {
    i18n.changeLanguage(isHindi ? 'en' : 'hi');
  };

  return (
    <button
      onClick={toggle}
      title={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
      aria-label="Toggle language"
      style={{
        background: 'transparent',
        border: '1px solid rgba(99,102,241,0.4)',
        borderRadius: '8px',
        padding: '4px 10px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        color: 'inherit',
        minWidth: '42px'
      }}
    >
      {isHindi ? 'EN' : 'हि'}
    </button>
  );
};

export default LanguageToggle;