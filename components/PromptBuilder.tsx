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
    activeColor: string;
    onRefreshCategory: (categoryId: string) => void;
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
    activeColor,
    onRefreshCategory,
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
    
    return (
        <div className="space-y-8">
            <div className="relative group">
                <div className="absolute -inset-1 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" style={{ background: `linear-gradient(to right, ${activeColor}, #a855f7)` }}></div>
                <textarea
                    value={mainAction}
                    onChange={(e) => onMainActionChange(e.target.value)}
                    placeholder={t('mainActionPlaceholder')}
                    rows={3}
                    className="relative w-full bg-gray-900/80 backdrop-blur-md border border-white/10 text-gray-100 rounded-xl p-4 shadow-inner focus:ring-1 focus:outline-none transition-all placeholder-gray-500"
                    style={{ caretColor: activeColor, borderColor: selections ? 'rgba(255,255,255,0.1)' : undefined, '--tw-ring-color': activeColor } as React.CSSProperties}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {categories.map((category) => {
                    const fullCategoryConfig = activeConfig.find(c => c.id === category.id);
                    const totalOptionsCount = fullCategoryConfig ? fullCategoryConfig.optionsPool.length : 0;
                    const canShowMore = category.options.length < totalOptionsCount;
                    const hasSelection = selections[category.id]?.length > 0;

                    return (
                        <div 
                            key={category.id} 
                            className={`
                                flex flex-col h-full rounded-2xl p-5 transition-all duration-300 backdrop-blur-md
                                ${hasSelection ? 'bg-white/10 border-white/20 shadow-xl' : 'bg-white/5 border-white/5 hover:border-white/20'}
                                border
                            `}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h4 className={`text-sm font-bold tracking-wide uppercase ${hasSelection ? 'text-white' : 'text-gray-400'} drop-shadow-sm`}>
                                    {category.label}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => onRefreshCategory(category.id)}
                                    className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                                    aria-label={`${t('refreshAria')} ${category.label}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5m-5 2a9 9 0 0115.46-4.06M20 20v-5h-5m5-2a9 9 0 01-15.46 4.06"/></svg>
                                </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {category.options.map(value => {
                                    const isSelected = selections[category.id]?.some(sel => sel.en === value.en);
                                    
                                    return (
                                        <button
                                            type="button"
                                            key={value.en}
                                            onClick={() => onSelectionChange(category.id, value, category.singleSelect)}
                                            style={isSelected ? { backgroundColor: activeColor, borderColor: activeColor, boxShadow: `0 2px 10px -2px ${activeColor}80` } : {}}
                                            className={`
                                                px-3 py-1.5 text-xs font-medium rounded-full border transition-all active:scale-95
                                                ${isSelected 
                                                    ? 'text-white' 
                                                    : 'bg-black/20 border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200 hover:bg-white/5'}
                                            `}
                                        >
                                            {value[language] || value.es}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <div className="mt-auto pt-2">
                                {canShowMore && (
                                    <button
                                        type="button"
                                        onClick={() => onViewMoreCategory(category.id)}
                                        className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-300 border border-dashed border-white/10 rounded-lg hover:border-white/30 transition-colors hover:bg-white/5"
                                    >
                                        {t('viewMoreOptions')}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-12 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl drop-shadow-md">💡</span>
                        <h4 className="text-lg font-bold text-white drop-shadow-md">{t('needInspiration')}</h4>
                    </div>
                    <button
                        type="button"
                        onClick={onRefreshIdeas}
                        className="p-2 rounded-full bg-black/30 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M20 4h-5v5M4 20h5v-5"/></svg>
                    </button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {shuffledIdeas.slice(0, visibleIdeasCount).map(idea => {
                        const isSelected = mainAction === (idea[language] || idea.es);
                        return (
                            <button
                                type="button"
                                key={idea.en}
                                onClick={() => onThemeIdeaClick(idea)}
                                style={isSelected ? { backgroundColor: activeColor, borderColor: activeColor, boxShadow: `0 4px 15px ${activeColor}60` } : {}}
                                className={`
                                    px-4 py-2 text-xs font-medium rounded-full border transition-all hover:-translate-y-0.5
                                    ${isSelected 
                                        ? 'text-white' 
                                        : 'bg-black/20 border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200 hover:bg-white/5'}
                                `}
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
                        className="block w-full text-center mt-6 py-2 text-xs text-gray-500 hover:text-white uppercase tracking-widest font-semibold transition-colors"
                    >
                        {t('loadMoreIdeas')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PromptBuilder;