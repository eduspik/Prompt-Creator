import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';

const LanguageSwitcher = () => {
    const { toggleLanguage } = useLanguage();
    const t = useTranslations();

    return (
        <button
            onClick={toggleLanguage}
            className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 text-gray-300 hover:bg-gray-600/50 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            aria-label="Change language"
        >
            {t('language')}
        </button>
    );
};

export default LanguageSwitcher;
