import React from 'react';
import { HistoryItem, ContentType } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { ClockIcon, TrashIcon } from './icons';
import { PERSONAS } from '../constants';


interface HistoryProps {
    history: HistoryItem[];
    onReuse: (item: HistoryItem) => void;
    onDelete: (id: string) => void;
    onClear: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onReuse, onDelete, onClear }) => {
    const t = useTranslations();

    return (
        <div className="mt-12 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-300 flex items-center">
                    <ClockIcon className="w-6 h-6 mr-3" />
                    {t('historyTitle')}
                </h2>
                <button
                    onClick={onClear}
                    className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5"
                >
                    <TrashIcon className="w-4 h-4" />
                    {t('clearHistory')}
                </button>
            </div>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {history.map(item => {
                    const persona = PERSONAS[item.personaId];
                    return (
                        <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center justify-between gap-4 animate-[fadeIn_0.3s_ease-in-out]">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-300 truncate font-mono" title={item.englishPrompt}>{item.englishPrompt}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: persona.color }}>
                                        {persona.name}
                                    </span>
                                    <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                                        {item.contentType === ContentType.IMAGE_PROMPT ? t('imagePrompts').substring(2) : t('postTexts').substring(2)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <button
                                    onClick={() => onReuse(item)}
                                    className={`px-3 py-1.5 text-xs font-bold text-white rounded-md hover:opacity-90 transition-opacity`}
                                    style={{ backgroundColor: persona.color }}
                                    aria-label={t('reusePrompt')}
                                >
                                    {t('reusePrompt')}
                                </button>
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-md hover:bg-gray-700"
                                    aria-label={t('deletePrompt')}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default History;
