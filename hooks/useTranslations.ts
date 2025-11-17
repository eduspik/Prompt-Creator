import { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations, TranslationKey } from '../i18n';

export const useTranslations = () => {
    const { language } = useLanguage();

    const t = useCallback((key: TranslationKey): string => {
        return translations[language]?.[key] || translations['es'][key];
    }, [language]);

    return t;
};
