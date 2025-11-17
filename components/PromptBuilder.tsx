import React from 'react';
import { PromptOption, Selections } from '../types';
import { PromptCategoryConfig } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';

export interface PromptCategory {
    id: string;
    label: string;
    singleSelect: boolean;
    options: PromptOption[];
}

interface PromptBuilderProps {
    categories: PromptCategory[];
    selections: Selections;
    onSelectionChange: (category: string, value: PromptOption, isSingleSelect: boolean) => void;
    mainAction: string;
    onMainActionChange: (value: string) => void;
    personaColor: string;
    onRefreshCategory: (categoryId: string) => void;
    customCategoryInputs: Record<string, string>;
    onCustomCategoryInputChange: (value: Record<string, string>) => void;
    onCustomCategoryInputAdd: (categoryId: string) => void;
    onViewMoreCategory: (categoryId: string) => void;
    activeConfig: PromptCategoryConfig[];
    shuffledIdeas: PromptOption[];
    visibleIdeasCount: number;
    onThemeIdeaClick: (idea: PromptOption) => void;
    onRefreshIdeas: () => void;
    onLoadMoreIdeas: () => void;
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({
    categories,
    selections,
    onSelectionChange,
    mainAction,
    onMainActionChange,
    personaColor,
    onRefreshCategory,
    customCategoryInputs,
    onCustomCategoryInputChange,
    onCustomCategoryInputAdd,
    onViewMoreCategory,
    activeConfig,
    shuffledIdeas,
    visibleIdeasCount,
    onThemeIdeaClick,
    onRefreshIdeas,
    onLoadMoreIdeas,
}) => {
    const { language } = useLanguage();
    const t = useTranslations();
    
    const handleCustomInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, categoryId: string) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            onCustomCategoryInputAdd(categoryId);
        }
    };

    return (
        <div className="space-y-8">
            <textarea
                value={mainAction}
                onChange={(e) => onMainActionChange(e.target.value)}
                placeholder={t('mainActionPlaceholder')}
                rows={3}
                className="w-full bg-gray-700/50 border border-gray-600 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 focus:outline-none transition-shadow placeholder-gray-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => {
                    const fullCategoryConfig = activeConfig.find(c => c.id === category.id);
                    const totalOptionsCount = fullCategoryConfig ? fullCategoryConfig.optionsPool.length : 0;
                    const canShowMore = category.options.length < totalOptionsCount;

                    return (
                        <div key={category.id} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-semibold text-gray-300">{category.label}</h4>
                                <button
                                    type="button"
                                    onClick={() => onRefreshCategory(category.id)}
                                    className={`text-xs font-semibold transition-colors flex items-center gap-1.5 text-gray-400 hover:text-[${personaColor}]`}
                                    aria-label={`${t('refreshAria')} ${category.label}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5m-5 2a9 9 0 0115.46-4.06M20 20v-5h-5m5-2a9 9 0 01-15.46 4.06"/></svg>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {category.options.map(value => {
                                    const isSelected = selections[category.id]?.some(sel => sel.en === value.en);
                                    const selectedClasses = `bg-[${personaColor}] text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-[${personaColor}]`;
                                    const notSelectedClasses = 'bg-gray-600/70 text-gray-300 hover:bg-gray-500/70';

                                    return (
                                        <button
                                            type="button"
                                            key={value.en}
                                            onClick={() => onSelectionChange(category.id, value, category.singleSelect)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all transform hover:scale-105 ${isSelected ? selectedClasses : notSelectedClasses}`}
                                        >
                                            {value[language] || value.es}
                                        </button>
                                    );
                                })}
                            </div>
                             {canShowMore && (
                                <button
                                    type="button"
                                    onClick={() => onViewMoreCategory(category.id)}
                                    className={`w-full text-center mt-2 text-xs text-[${personaColor}] hover:opacity-80 font-semibold transition-colors`}
                                >
                                    {t('viewMoreOptions')}
                                </button>
                            )}

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="text"
                                    value={customCategoryInputs[category.id] || ''}
                                    onChange={(e) => onCustomCategoryInputChange({ ...customCategoryInputs, [category.id]: e.target.value })}
                                    onKeyDown={(e) => handleCustomInputKeyDown(e, category.id)}
                                    placeholder={t('addYourOwn')}
                                    className="flex-grow w-full bg-gray-700 border border-gray-600 text-gray-200 text-xs rounded-md p-1.5 focus:ring-1 focus:ring-offset-1 focus:ring-offset-gray-800 focus:ring-purple-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => onCustomCategoryInputAdd(category.id)}
                                    className={`px-2.5 py-1.5 text-xs font-bold text-white bg-[${personaColor}] rounded-md hover:opacity-90 transition-opacity flex-shrink-0`}
                                >
                                    {t('add')}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-base font-semibold text-gray-300">{t('needInspiration')}</h4>
                    <button
                        type="button"
                        onClick={onRefreshIdeas}
                        className={`text-xs font-semibold transition-colors flex items-center gap-1.5 text-gray-400 hover:text-[${personaColor}]`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M20 4h-5v5M4 20h5v-5"/></svg>
                    </button>
                </div>
                <p className="text-sm text-gray-400 mb-4">{t('inspirationSubtitle')}</p>
                <div className="flex flex-wrap gap-2">
                    {shuffledIdeas.slice(0, visibleIdeasCount).map(idea => {
                        const isSelected = mainAction === (idea[language] || idea.es);
                        return (
                            <button
                                type="button"
                                key={idea.en}
                                onClick={() => onThemeIdeaClick(idea)}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${isSelected ? `bg-[${personaColor}] text-white` : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}
                            >
                                {idea[language] || idea.es}
                            </button>
                        );
                    })}
                </div>
                {visibleIdeasCount < shuffledIdeas.length && (
                    <button
                        type="button"
                        onClick={onLoadMoreIdeas}
                        className={`w-full text-center mt-3 text-xs text-[${personaColor}] hover:opacity-80 font-semibold transition-colors`}
                    >
                        {t('loadMoreIdeas')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PromptBuilder;