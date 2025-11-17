import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AccountType, ContentType, Persona, GeneratedContent, PromptOption, Selections, HistoryItem } from './types';
import { PERSONAS, INFINITE_PROMPT_IDEAS, PROMPT_CATEGORIES_CONFIG, CASSANDRA_PROMPT_CATEGORIES_CONFIG } from './constants';
import { generateContent, translateToEnglish, generatePromptFromImage } from './services/geminiService';
import Spinner from './components/Spinner';
import OutputCard from './components/OutputCard';
import PromptBuilder from './components/PromptBuilder';
import { PromptCategory } from './components/PromptBuilder';
import { useTranslations } from './hooks/useTranslations';
import LanguageSwitcher from './components/LanguageSwitcher';
import { TranslationKey } from './i18n';
import History from './components/History';
import { useLanguage } from './contexts/LanguageContext';
import { ResetIcon, TrashIcon } from './components/icons';

interface ImageReferenceUploaderProps {
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
    onDescribeImage: () => void;
    imagePreviewUrl: string | null;
    isDescribing: boolean;
    personaColor: string;
}

const ImageReferenceUploader: React.FC<ImageReferenceUploaderProps> = ({
    onImageChange,
    onRemoveImage,
    onDescribeImage,
    imagePreviewUrl,
    isDescribing,
    personaColor,
}) => {
    const t = useTranslations();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="mb-6 bg-gray-800/40 border border-dashed border-gray-600 rounded-xl p-4 text-center">
            <input
                type="file"
                ref={fileInputRef}
                onChange={onImageChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
            />
            {!imagePreviewUrl && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('imageReferenceLabel')}</h4>
                    <button
                        type="button"
                        onClick={handleUploadClick}
                        className="text-sm font-semibold transition-colors py-2 px-4 rounded-md bg-gray-700 hover:bg-gray-600"
                    >
                        {t('uploadImage')}
                    </button>
                </div>
            )}
            {imagePreviewUrl && (
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <img src={imagePreviewUrl} alt="Reference Preview" className="max-h-48 rounded-lg shadow-lg" />
                        <button
                            type="button"
                            onClick={onRemoveImage}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                            aria-label={t('removeImage')}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={onDescribeImage}
                        disabled={isDescribing}
                        className={`w-full max-w-xs py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[${personaColor}] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[${personaColor}] transition-all flex items-center justify-center gap-2`}
                    >
                        {isDescribing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {isDescribing ? t('describingImage') : t('describeImage')}
                    </button>
                </div>
            )}
        </div>
    );
};


const Header: React.FC<{ 
    selectedAccount: AccountType;
    onAccountChange: (account: AccountType) => void; 
}> = ({ selectedAccount, onAccountChange }) => {
    const t = useTranslations();
    return (
        <header className="relative text-center p-4 md:p-6">
            <div className="absolute top-0 right-0">
                <LanguageSwitcher />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
                {t('headerTitle')}
            </h1>
            <p className="text-gray-400 mb-6 text-sm md:text-base">{t('headerSubtitle')}</p>
            <div className="inline-flex rounded-lg shadow-sm bg-gray-800 p-1">
                {Object.values(PERSONAS).map((persona) => {
                    const isSelected = selectedAccount === persona.id;
                    const selectedClasses = `bg-[${persona.color}] text-white shadow-lg`;
                    const notSelectedClasses = 'text-gray-300 hover:bg-gray-700/50';

                    return (
                        <button
                            key={persona.id}
                            onClick={() => onAccountChange(persona.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[${persona.color}] ${isSelected ? selectedClasses : notSelectedClasses}`}
                        >
                            {persona.name}
                        </button>
                    );
                })}
            </div>
        </header>
    );
};

const getRandomSubset = <T,>(arr: T[], size: number) => arr.sort(() => 0.5 - Math.random()).slice(0, size);

const App: React.FC = () => {
    const { language } = useLanguage();
    const t = useTranslations();
    const [selectedAccount, setSelectedAccount] = useState<AccountType>(AccountType.CASSANDRA19);
    const [contentType, setContentType] = useState<ContentType>(ContentType.IMAGE_PROMPT);
    
    const [mainAction, setMainAction] = useState<string>('');
    const [promptSelections, setPromptSelections] = useState<Selections>({});
    const [userPrompt, setUserPrompt] = useState<string>('');
    const [customCategoryInputs, setCustomCategoryInputs] = useState<Record<string, string>>({});
    const [promptBuilderCategories, setPromptBuilderCategories] = useState<PromptCategory[]>([]);

    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [visibleIdeasCount, setVisibleIdeasCount] = useState<number>(12);
    const [shuffledIdeas, setShuffledIdeas] = useState<PromptOption[]>([]);
    
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
    const [isDescribingImage, setIsDescribingImage] = useState<boolean>(false);

    const [history, setHistory] = useState<HistoryItem[]>([]);
    const isReusingHistory = useRef(false);
    const reusedSelections = useRef<Selections | null>(null);
    
    const activePersona = PERSONAS[selectedAccount];
    const activePromptConfig = selectedAccount === AccountType.DIVINESLUTS 
        ? PROMPT_CATEGORIES_CONFIG 
        : CASSANDRA_PROMPT_CATEGORIES_CONFIG;

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('promptHistory');
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
        }
    }, []);

    const resetInputs = useCallback(() => {
        setMainAction('');
        setPromptSelections({});
        setUserPrompt('');
        setCustomCategoryInputs({});
    }, []);
    
    useEffect(() => {
        if (isReusingHistory.current) {
            const newCategories = activePromptConfig.map(cat => {
                const selectionsForCat = reusedSelections.current?.[cat.id] || [];
                
                const baseOptions = getRandomSubset(cat.optionsPool, cat.initialVisible);
                
                const finalOptions = [...baseOptions];
                selectionsForCat.forEach((selectedOpt: PromptOption) => {
                    if (!finalOptions.some(opt => opt.en === selectedOpt.en)) {
                        finalOptions.push(selectedOpt);
                    }
                });

                return {
                    ...cat,
                    label: t(cat.label as TranslationKey),
                    options: finalOptions
                };
            });
            setPromptBuilderCategories(newCategories);

            isReusingHistory.current = false;
            reusedSelections.current = null;
            return;
        }

        setPromptBuilderCategories(
            activePromptConfig.map(cat => ({
                ...cat,
                label: t(cat.label as TranslationKey),
                options: getRandomSubset(cat.optionsPool, cat.initialVisible)
            }))
        );
        resetInputs();
        setGeneratedContent(null);
        setError(null);
    }, [selectedAccount, resetInputs, activePromptConfig, t]);


    const handleRefreshIdeas = useCallback(() => {
        setShuffledIdeas([...INFINITE_PROMPT_IDEAS].sort(() => 0.5 - Math.random()));
        setVisibleIdeasCount(12);
    }, []);

    useEffect(() => {
        handleRefreshIdeas();
    }, [handleRefreshIdeas]);

    const handleRefreshCategory = useCallback((categoryId: string) => {
        setPromptBuilderCategories(prevCategories => {
            const newCategories = [...prevCategories];
            const catIndex = newCategories.findIndex(c => c.id === categoryId);
            if (catIndex === -1) return prevCategories;
    
            const category = newCategories[catIndex];
            const config = activePromptConfig.find(c => c.id === categoryId);
            if (!config) return prevCategories;
    
            const currentVisibleEns = new Set(category.options.map(o => o.en));
            const unseenOptions = config.optionsPool.filter(opt => !currentVisibleEns.has(opt.en));
            
            let newSubset: PromptOption[];
    
            if (unseenOptions.length >= config.initialVisible) {
                newSubset = getRandomSubset(unseenOptions, config.initialVisible);
            } else {
                newSubset = getRandomSubset(config.optionsPool, config.initialVisible);
            }
            
            newCategories[catIndex] = { ...category, options: newSubset };
            return newCategories;
        });
    }, [activePromptConfig]);

    const handleViewMoreCategory = useCallback((categoryId: string) => {
        setPromptBuilderCategories(prevCategories => {
            return prevCategories.map(cat => {
                if (cat.id === categoryId) {
                    const fullCategoryConfig = activePromptConfig.find(c => c.id === categoryId);
                    if (fullCategoryConfig) {
                        return { ...cat, options: fullCategoryConfig.optionsPool };
                    }
                }
                return cat;
            });
        });
    }, [activePromptConfig]);

    const handleSelectionChange = (category: string, value: PromptOption, isSingleSelect: boolean) => {
        setPromptSelections(prev => {
            const currentCategorySelections = prev[category] || [];
            let newCategorySelections: PromptOption[];
    
            if (isSingleSelect) {
                if (currentCategorySelections.some(item => item.en === value.en)) {
                    newCategorySelections = []; 
                } else {
                    newCategorySelections = [value]; 
                }
            } else {
                 if (currentCategorySelections.some(item => item.en === value.en)) {
                    newCategorySelections = currentCategorySelections.filter(item => item.en !== value.en);
                } else {
                    newCategorySelections = [...currentCategorySelections, value];
                }
            }
    
            return { ...prev, [category]: newCategorySelections };
        });
    };

    const handleCustomOptionAdd = useCallback((categoryId: string) => {
        const text = customCategoryInputs[categoryId]?.trim();
        if (!text) return;

        const newOption: PromptOption = { es: text, en: text };

        setPromptBuilderCategories(prev => prev.map(cat => {
            if (cat.id === categoryId && !cat.options.some(opt => opt.en === newOption.en)) {
                return { ...cat, options: [...cat.options, newOption] };
            }
            return cat;
        }));

        const categoryConfig = activePromptConfig.find(c => c.id === categoryId);
        if (categoryConfig) {
            handleSelectionChange(categoryId, newOption, categoryConfig.singleSelect);
        }
        
        setCustomCategoryInputs(prev => ({ ...prev, [categoryId]: '' }));
    }, [customCategoryInputs, handleSelectionChange, activePromptConfig]);

    const handleGenerateRandomIdea = useCallback(() => {
        setMainAction('');
    
        const newSelections: Selections = {};
        activePromptConfig.forEach(config => {
            if (config.id === 'style' || config.excludeFromRandom) {
                return;
            }
            if (Math.random() < 0.5) { 
                return;
            }
    
            if (!config.singleSelect) {
                const numToPick = 1 + Math.floor(Math.random() * 2);
                newSelections[config.id] = getRandomSubset(config.optionsPool, numToPick);
            } else {
                const randomIndex = Math.floor(Math.random() * config.optionsPool.length);
                newSelections[config.id] = [config.optionsPool[randomIndex]];
            }
        });
    
        setPromptSelections(newSelections);
    }, [activePromptConfig]);
    
    useEffect(() => {
        const buildUserPrompt = () => {
            const allPrompts: string[] = [];
    
            for (const selectedOptions of Object.values(promptSelections)) {
                if (Array.isArray(selectedOptions) && selectedOptions.length > 0) {
                    const langValues = selectedOptions.map(opt => opt[language] || opt.es);
                    allPrompts.push(...langValues);
                }
            }
    
            let finalPrompt = mainAction.trim();
            if (allPrompts.length > 0) {
                finalPrompt += (finalPrompt ? ", " : "") + allPrompts.join(', ');
            }
            setUserPrompt(finalPrompt);
        };
    
        buildUserPrompt();
    }, [mainAction, promptSelections, language]);


    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!userPrompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);
        
        let finalTheme = '';

        try {
            if (language === 'es') {
                finalTheme = await translateToEnglish(userPrompt);
            } else {
                finalTheme = userPrompt;
            }

            if (!finalTheme) {
                 throw new Error('TRANSLATION_FAILED');
            }

            const result = await generateContent(activePersona, contentType, finalTheme);
            setGeneratedContent(result);
            
            const newHistoryItem: HistoryItem = {
                id: new Date().toISOString() + Math.random(),
                mainAction: mainAction,
                selections: promptSelections,
                englishPrompt: finalTheme,
                contentType: contentType,
                personaId: selectedAccount,
                timestamp: Date.now(),
            };
            setHistory(prevHistory => {
                const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 50);
                localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));
                return updatedHistory;
            });
        } catch (err) {
            console.error(err);
             if (err instanceof Error) {
                if (err.message.includes('SAFETY_BLOCK')) {
                    setError(t('safetyError'));
                } else if (err.message.includes('TRANSLATION_FAILED')) {
                    setError(t('translationError'));
                } else {
                    setError(t('apiError'));
                }
            } else {
                setError(t('apiError'));
            }
        } finally {
            setIsLoading(false);
        }
    }, [userPrompt, isLoading, activePersona, contentType, t, mainAction, promptSelections, selectedAccount, language]);

    const handleThemeIdeaClick = (idea: PromptOption) => {
        const ideaInCurrentLang = idea[language] || idea.es;
        setMainAction(prev => (prev === ideaInCurrentLang ? '' : ideaInCurrentLang));
    };

    const handleLoadMore = () => {
        setVisibleIdeasCount(prevCount => prevCount + 12);
    }

    const handleReuseHistoryItem = useCallback((item: HistoryItem) => {
        isReusingHistory.current = true;
        reusedSelections.current = item.selections;
        
        setSelectedAccount(item.personaId);
        setContentType(item.contentType);
        setMainAction(item.mainAction);
        setPromptSelections(item.selections);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleDeleteHistoryItem = useCallback((itemId: string) => {
        setHistory(prev => {
            const updated = prev.filter(item => item.id !== itemId);
            localStorage.setItem('promptHistory', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const handleClearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem('promptHistory');
    }, []);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setReferenceImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReferenceImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = useCallback(() => {
        setReferenceImage(null);
        setReferenceImagePreview(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    }, []);

    const handleDescribeImage = useCallback(async () => {
        if (!referenceImage || !referenceImagePreview) return;
        setIsDescribingImage(true);
        setError(null);
        try {
            const base64Data = referenceImagePreview.split(',')[1];
            if (!base64Data) throw new Error("Could not read image data.");
            
            const mimeType = referenceImage.type;

            const description = await generatePromptFromImage(base64Data, mimeType, language);
            setMainAction(description);
            handleRemoveImage();

        } catch (err) {
             console.error(err);
             if (err instanceof Error) {
                if (err.message.includes('SAFETY_BLOCK')) {
                    setError(t('safetyError'));
                } else {
                    setError(t('apiError'));
                }
            } else {
                setError(t('apiError'));
            }
        } finally {
            setIsDescribingImage(false);
        }
    }, [referenceImage, referenceImagePreview, language, t, handleRemoveImage]);


    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-grid-gray-700/[0.2] z-0"></div>
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-900 to-black z-1"></div>
             <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-pink-900/40 via-transparent to-purple-900/30 rounded-full blur-3xl filter animate-pulse" style={{ animationDuration: '8s' }}></div>
             <div className="absolute bottom-0 -right-1/4 w-2/3 h-2/3 bg-gradient-to-bl from-purple-900/30 to-indigo-900/40 rounded-full blur-3xl filter animate-pulse" style={{ animationDuration: '10s' }}></div>


            <main className="max-w-7xl mx-auto relative z-10">
                <Header selectedAccount={selectedAccount} onAccountChange={setSelectedAccount} />

                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-2xl mt-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-8">
                             <label className="block text-lg font-semibold text-gray-300 mb-3">{t('contentTypeLabel')}</label>
                            <div className="inline-flex rounded-lg shadow-sm w-full">
                                <button type="button" onClick={() => setContentType(ContentType.IMAGE_PROMPT)} className={`w-1/2 px-4 py-3 text-sm font-medium rounded-l-lg transition-all ${contentType === ContentType.IMAGE_PROMPT ? `bg-[${activePersona.color}] text-white shadow-md` : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                                    {t('imagePrompts')}
                                </button>
                                <button type="button" onClick={() => setContentType(ContentType.POST_TEXT)} className={`w-1/2 px-4 py-3 text-sm font-medium rounded-r-lg transition-all ${contentType === ContentType.POST_TEXT ? `bg-[${activePersona.color}] text-white shadow-md` : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                                    {t('postTexts')}
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <label htmlFor="theme" className="block text-lg font-semibold text-gray-300">{t('promptBuilderLabel')}</label>
                                 <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={resetInputs}
                                        className="text-xs font-semibold transition-colors flex items-center gap-1.5 py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600 text-red-400 hover:text-red-300"
                                    >
                                        <ResetIcon className="h-4 w-4" />
                                        {t('resetSelections')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleGenerateRandomIdea}
                                        className={`text-xs font-semibold transition-colors flex items-center gap-1.5 py-1 px-2 rounded-md bg-gray-700 hover:bg-gray-600 text-[${activePersona.color}]`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {t('generateRandomIdea')}
                                    </button>
                                </div>
                            </div>

                             <ImageReferenceUploader
                                onImageChange={handleImageChange}
                                onRemoveImage={handleRemoveImage}
                                onDescribeImage={handleDescribeImage}
                                imagePreviewUrl={referenceImagePreview}
                                isDescribing={isDescribingImage}
                                personaColor={activePersona.color}
                            />
                            
                             <div className="mb-6">
                                <label className="block text-xs font-medium text-gray-500 mb-2">{t('previewLabel')}</label>
                                <textarea
                                    value={userPrompt}
                                    onChange={(e) => setUserPrompt(e.target.value)}
                                    rows={4}
                                    className="w-full bg-gray-900/60 border border-gray-700 text-gray-400 text-sm rounded-lg p-3 font-mono min-h-[80px] focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 focus:outline-none transition-shadow"
                                    placeholder={t('previewPlaceholder')}
                                />
                            </div>
                            <PromptBuilder
                                categories={promptBuilderCategories}
                                selections={promptSelections}
                                onSelectionChange={handleSelectionChange}
                                mainAction={mainAction}
                                onMainActionChange={setMainAction}
                                personaColor={activePersona.color}
                                onRefreshCategory={handleRefreshCategory}
                                customCategoryInputs={customCategoryInputs}
                                onCustomCategoryInputChange={setCustomCategoryInputs}
                                onCustomCategoryInputAdd={handleCustomOptionAdd}
                                onViewMoreCategory={handleViewMoreCategory}
                                activeConfig={activePromptConfig}
                                shuffledIdeas={shuffledIdeas}
                                visibleIdeasCount={visibleIdeasCount}
                                onThemeIdeaClick={handleThemeIdeaClick}
                                onRefreshIdeas={handleRefreshIdeas}
                                onLoadMoreIdeas={handleLoadMore}
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isLoading || !userPrompt.trim()}
                            className={`w-full py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-500 transition-all transform hover:scale-[1.02] active:scale-100`}
                            style={{ boxShadow: `0 0 20px -5px ${isLoading ? 'transparent' : activePersona.color}`}}
                        >
                            {isLoading ? t('generatingButton') : t('generateButton')}
                        </button>
                    </form>
                </div>

                {history.length > 0 && (
                    <History
                        history={history}
                        onReuse={handleReuseHistoryItem}
                        onDelete={handleDeleteHistoryItem}
                        onClear={handleClearHistory}
                    />
                )}

                <div className="mt-12">
                    {isLoading && <Spinner color={activePersona.color} />}
                    {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-center">{error}</div>}
                    {generatedContent && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.5s_ease-in-out]">
                            {generatedContent.map((contentItem, index) => (
                                <OutputCard key={index} content={contentItem} personaColor={activePersona.color} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;