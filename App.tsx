import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AccountType, ContentType, GeneratedContent, PromptOption, Selections, HistoryItem } from './types';
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

// --- Types for Theme ---
type ThemeMode = 'static' | 'rgb';
type RGBSpeed = 'slow' | 'normal' | 'fast';

// --- Helper Components ---

const ThemeCustomizer: React.FC<{
    activeColor: string;
    staticColor: string;
    onStaticColorChange: (color: string) => void;
    mode: ThemeMode;
    onModeChange: (mode: ThemeMode) => void;
    rgbSpeed: RGBSpeed;
    onRgbSpeedChange: (speed: RGBSpeed) => void;
}> = ({ activeColor, staticColor, onStaticColorChange, mode, onModeChange, rgbSpeed, onRgbSpeedChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-black/40 hover:bg-black/60 border border-white/10 rounded-full px-4 py-2 transition-all backdrop-blur-md group shadow-lg"
            >
                <div 
                    className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ backgroundColor: activeColor }}
                ></div>
                <span className="text-xs font-bold text-gray-300 group-hover:text-white uppercase tracking-wider">
                    {mode === 'rgb' ? 'RGB Mode' : 'Theme'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5 animate-[fadeIn_0.2s_ease-out]">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <span>🎨</span> Customization
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Mode Selector */}
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => onModeChange('static')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'static' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Static
                            </button>
                            <button
                                onClick={() => onModeChange('rgb')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'rgb' ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                RGB 🌈
                            </button>
                        </div>

                        {mode === 'static' ? (
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-medium">Pick Color</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1 h-10 rounded-lg overflow-hidden ring-1 ring-white/20">
                                        <input 
                                            type="color" 
                                            value={staticColor}
                                            onChange={(e) => onStaticColorChange(e.target.value)}
                                            className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] cursor-pointer"
                                        />
                                    </div>
                                    <div className="text-xs font-mono text-gray-500">{staticColor}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-medium">Cycle Speed</label>
                                <div className="flex justify-between gap-2">
                                    {(['slow', 'normal', 'fast'] as RGBSpeed[]).map(speed => (
                                        <button
                                            key={speed}
                                            onClick={() => onRgbSpeedChange(speed)}
                                            className={`
                                                flex-1 py-1.5 text-[10px] uppercase font-bold rounded border transition-colors
                                                ${rgbSpeed === speed 
                                                    ? 'border-white/30 bg-white/10 text-white' 
                                                    : 'border-transparent bg-black/20 text-gray-500 hover:text-gray-300'}
                                            `}
                                        >
                                            {speed}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

interface ImageReferenceUploaderProps {
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
    onDescribeImage: () => void;
    imagePreviewUrl: string | null;
    isDescribing: boolean;
    activeColor: string;
}

const ImageReferenceUploader: React.FC<ImageReferenceUploaderProps> = ({
    onImageChange,
    onRemoveImage,
    onDescribeImage,
    imagePreviewUrl,
    isDescribing,
    activeColor,
}) => {
    const t = useTranslations();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="mb-8 bg-white/5 backdrop-blur-sm border border-dashed border-white/10 hover:border-white/30 transition-colors rounded-xl p-6 text-center group">
            <input
                type="file"
                ref={fileInputRef}
                onChange={onImageChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
            />
            {!imagePreviewUrl && (
                <div className="flex flex-col items-center justify-center py-4 cursor-pointer" onClick={handleUploadClick}>
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h4 className="text-sm font-medium text-gray-200 mb-1">{t('imageReferenceLabel')}</h4>
                    <span className="text-xs text-gray-400">{t('uploadImage')}</span>
                </div>
            )}
            {imagePreviewUrl && (
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group/image">
                        <img src={imagePreviewUrl} alt="Reference Preview" className="max-h-64 rounded-lg shadow-2xl border border-white/10" />
                        <button
                            type="button"
                            onClick={onRemoveImage}
                            className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 text-white rounded-full p-2 transition-all opacity-0 group-hover/image:opacity-100 backdrop-blur-md"
                            aria-label={t('removeImage')}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={onDescribeImage}
                        disabled={isDescribing}
                        style={{ backgroundColor: activeColor, boxShadow: `0 4px 20px -5px ${activeColor}80` }}
                        className={`w-full max-w-xs py-2.5 px-6 rounded-lg text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-all flex items-center justify-center gap-2`}
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
    activeColor: string;
    staticColor: string;
    onStaticColorChange: (color: string) => void;
    mode: ThemeMode;
    onModeChange: (mode: ThemeMode) => void;
    rgbSpeed: RGBSpeed;
    onRgbSpeedChange: (speed: RGBSpeed) => void;
}> = ({ 
    selectedAccount, 
    onAccountChange, 
    activeColor,
    staticColor,
    onStaticColorChange,
    mode,
    onModeChange,
    rgbSpeed,
    onRgbSpeedChange
}) => {
    const t = useTranslations();
    
    return (
        <header className="relative flex flex-col items-center text-center py-8 md:py-12 px-4">
            <div className="absolute top-4 left-4 md:left-auto md:right-4 flex items-center gap-3">
                 <ThemeCustomizer 
                    activeColor={activeColor}
                    staticColor={staticColor}
                    onStaticColorChange={onStaticColorChange}
                    mode={mode}
                    onModeChange={onModeChange}
                    rgbSpeed={rgbSpeed}
                    onRgbSpeedChange={onRgbSpeedChange}
                />
                <LanguageSwitcher />
            </div>
            
            <div className="inline-block mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 tracking-wider uppercase backdrop-blur-md shadow-lg">
                AI Content Studio
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-3 drop-shadow-2xl">
                Fanvue <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, #ec4899, ${activeColor}, #6366f1)` }}>Architect</span>
            </h1>
            <p className="text-gray-300 mb-6 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light tracking-wide">{t('headerSubtitle')}</p>
            
            <div className="bg-black/40 p-1.5 rounded-2xl border border-white/10 inline-flex gap-1 shadow-xl backdrop-blur-md">
                {Object.values(PERSONAS).map((persona) => {
                    const isSelected = selectedAccount === persona.id;
                    return (
                        <button
                            key={persona.id}
                            onClick={() => onAccountChange(persona.id)}
                            style={isSelected ? { backgroundColor: activeColor, boxShadow: `0 0 20px -5px ${activeColor}60` } : {}}
                            className={`
                                relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                                ${isSelected ? 'text-white transform scale-100' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
                            `}
                        >
                            {persona.name}
                        </button>
                    );
                })}
            </div>
        </header>
    );
};

const ContentTypeSelector: React.FC<{
    selected: ContentType;
    onChange: (type: ContentType) => void;
    activeColor: string;
    t: (key: TranslationKey) => string;
}> = ({ selected, onChange, activeColor, t }) => {
    return (
        <div className="grid grid-cols-2 gap-4 mb-8">
            {[ContentType.IMAGE_PROMPT, ContentType.POST_TEXT].map((type) => {
                const isSelected = selected === type;
                const label = type === ContentType.IMAGE_PROMPT ? t('imagePrompts') : t('postTexts');
                const icon = type === ContentType.IMAGE_PROMPT ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                );

                return (
                    <button
                        key={type}
                        type="button"
                        onClick={() => onChange(type)}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 backdrop-blur-md ${
                            isSelected 
                                ? 'bg-white/10 border-transparent shadow-xl transform scale-[1.02]' 
                                : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20 text-gray-400'
                        }`}
                        style={isSelected ? { borderColor: activeColor, color: 'white', boxShadow: `0 0 25px -5px ${activeColor}40` } : {}}
                    >
                        <div className="mb-2 drop-shadow-md">{icon}</div>
                        <span className="font-bold text-sm tracking-wide">{label.replace(/^[📷✍️]\s*/, '')}</span>
                    </button>
                );
            })}
        </div>
    );
};


const getRandomSubset = <T,>(arr: T[], size: number) => arr.sort(() => 0.5 - Math.random()).slice(0, size);

const App: React.FC = () => {
    const { language } = useLanguage();
    const t = useTranslations();
    const [selectedAccount, setSelectedAccount] = useState<AccountType>(AccountType.CASSANDRA19);
    const [contentType, setContentType] = useState<ContentType>(ContentType.IMAGE_PROMPT);
    
    // Theme State
    const [themeMode, setThemeMode] = useState<ThemeMode>('static');
    const [rgbSpeed, setRgbSpeed] = useState<RGBSpeed>('normal');
    const [staticThemeColor, setStaticThemeColor] = useState<string>('');
    
    // We maintain a derived activeColor for the UI to consume
    const [activeColor, setActiveColor] = useState<string>('#EC4899');
    const hueRef = useRef<number>(0);
    const animationFrameRef = useRef<number>(0);

    // Background Parallax
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Normalized coordinates -1 to 1
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // RGB Loop Logic
    useEffect(() => {
        if (themeMode === 'rgb') {
            const updateRGB = () => {
                let speedMultiplier = 1;
                if (rgbSpeed === 'slow') speedMultiplier = 0.2;
                if (rgbSpeed === 'fast') speedMultiplier = 3;

                hueRef.current = (hueRef.current + 0.5 * speedMultiplier) % 360;
                const newColor = `hsl(${hueRef.current}, 80%, 60%)`; // Bright, gaming-style saturation/lightness
                setActiveColor(newColor);
                animationFrameRef.current = requestAnimationFrame(updateRGB);
            };
            updateRGB();
        } else {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            // Revert to static selection or default persona color
            setActiveColor(staticThemeColor || PERSONAS[selectedAccount].color);
        }

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [themeMode, rgbSpeed, staticThemeColor, selectedAccount]);

    // Keep static color updated when switching accounts if in static mode and no custom override
    useEffect(() => {
        if (themeMode === 'static' && !staticThemeColor) {
            setActiveColor(PERSONAS[selectedAccount].color);
        }
    }, [selectedAccount, themeMode, staticThemeColor]);

    const [mainAction, setMainAction] = useState<string>('');
    const [promptSelections, setPromptSelections] = useState<Selections>({});
    const [userPrompt, setUserPrompt] = useState<string>('');
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

            const result = await generateContent(PERSONAS[selectedAccount], contentType, finalTheme);
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
    }, [userPrompt, isLoading, contentType, t, mainAction, promptSelections, selectedAccount, language]);

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
        <div className="min-h-screen bg-black text-gray-200 font-sans p-4 pb-20 relative selection:bg-white/20 overflow-hidden">
             {/* Interactive Background */}
             <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
                {/* Primary Blob - follows mouse inversely or floats */}
                <div 
                    className="absolute w-[60%] h-[60%] rounded-full blur-[130px] opacity-30 transition-transform duration-1000 ease-out will-change-transform"
                    style={{ 
                        backgroundColor: activeColor,
                        top: '-10%',
                        left: '-10%',
                        transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`
                    }}
                ></div>
                
                {/* Secondary Blob */}
                <div 
                    className="absolute w-[70%] h-[70%] rounded-full blur-[150px] opacity-20 transition-transform duration-1000 ease-out will-change-transform"
                    style={{ 
                        backgroundColor: activeColor,
                        bottom: '-20%',
                        right: '-10%',
                         transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`
                    }}
                ></div>

                {/* Center/Accent Blob - Static but pulsing */}
                <div 
                    className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-indigo-900/30 blur-[100px] animate-pulse-slow"
                ></div>
             </div>

            <main className="max-w-5xl mx-auto relative z-10">
                <Header 
                    selectedAccount={selectedAccount} 
                    onAccountChange={setSelectedAccount} 
                    activeColor={activeColor}
                    staticColor={staticThemeColor}
                    onStaticColorChange={setStaticThemeColor}
                    mode={themeMode}
                    onModeChange={setThemeMode}
                    rgbSpeed={rgbSpeed}
                    onRgbSpeedChange={setRgbSpeed}
                />

                <div 
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl relative overflow-hidden transition-colors duration-500"
                    style={{ borderColor: `${activeColor}20` }}
                >
                     <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                    <form onSubmit={handleSubmit} className="relative z-10">
                        
                        <ContentTypeSelector 
                            selected={contentType} 
                            onChange={setContentType} 
                            activeColor={activeColor}
                            t={t}
                        />

                        <div className="mb-8">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2 drop-shadow-md">
                                        {t('promptBuilderLabel')}
                                    </h2>
                                    <p className="text-sm text-gray-400 font-light">Select keywords to build your scene.</p>
                                </div>
                                 <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={resetInputs}
                                        className="text-xs font-medium transition-all flex items-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-gray-300 hover:text-white backdrop-blur-md"
                                    >
                                        <ResetIcon className="h-3.5 w-3.5" />
                                        {t('resetSelections')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleGenerateRandomIdea}
                                        className="text-xs font-bold transition-all hover:brightness-110 flex items-center gap-1.5 py-2 px-3 rounded-lg text-white shadow-lg backdrop-blur-md"
                                        style={{ backgroundColor: activeColor, boxShadow: `0 4px 15px -3px ${activeColor}60` }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                                activeColor={activeColor}
                            />
                            
                            <PromptBuilder
                                categories={promptBuilderCategories}
                                selections={promptSelections}
                                onSelectionChange={handleSelectionChange}
                                mainAction={mainAction}
                                onMainActionChange={setMainAction}
                                activeColor={activeColor}
                                onRefreshCategory={handleRefreshCategory}
                                onViewMoreCategory={handleViewMoreCategory}
                                activeConfig={activePromptConfig}
                                shuffledIdeas={shuffledIdeas}
                                visibleIdeasCount={visibleIdeasCount}
                                onThemeIdeaClick={handleThemeIdeaClick}
                                onRefreshIdeas={handleRefreshIdeas}
                                onLoadMoreIdeas={handleLoadMore}
                            />

                             <div className="mt-8 bg-black/30 p-5 rounded-2xl border border-white/10 shadow-inner focus-within:border-white/30 transition-colors">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">{t('previewLabel')}</label>
                                <textarea
                                    value={userPrompt}
                                    onChange={(e) => setUserPrompt(e.target.value)}
                                    rows={3}
                                    className="w-full bg-transparent border-0 text-gray-200 text-sm font-mono focus:ring-0 resize-none leading-relaxed placeholder-gray-600"
                                    placeholder={t('previewPlaceholder')}
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isLoading || !userPrompt.trim()}
                            className={`group relative w-full py-4 px-6 rounded-2xl shadow-2xl text-lg font-black tracking-wide text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-all transform active:scale-[0.99] overflow-hidden`}
                            style={{ 
                                background: `linear-gradient(135deg, ${activeColor}, #1f2937)`,
                                boxShadow: isLoading ? 'none' : `0 10px 40px -10px ${activeColor}80`
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <span className="relative flex items-center justify-center gap-3">
                                {isLoading ? (
                                    <>
                                        {t('generatingButton')}
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        {t('generateButton')}
                                    </>
                                )}
                            </span>
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

                <div className="mt-12 scroll-mt-10" id="results">
                    {isLoading && <Spinner color={activeColor} />}
                    {error && <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl text-center backdrop-blur-sm animate-pulse shadow-lg">{error}</div>}
                    {generatedContent && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.6s_ease-out]">
                            {generatedContent.map((contentItem, index) => (
                                <OutputCard key={index} content={contentItem} activeColor={activeColor} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;