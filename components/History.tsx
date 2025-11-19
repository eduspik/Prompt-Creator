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
        <div className="mt-16 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 px-2">
                <h2 className="text-xl font-bold text-gray-200 flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-md shadow-lg">
                         <ClockIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    {t('historyTitle')}
                </h2>
                <button
                    onClick={onClear}
                    className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-900/20 border border-transparent hover:border-red-900/30"
                >
                    {t('clearHistory')}
                </button>
            </div>
            
            <div className="space-y-4">
                {history.map(item => {
                    const persona = PERSONAS[item.personaId];
                    return (
                        <div key={item.id} className="group relative bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-4 transition-all hover:bg-white/10 hover:border-white/10 shadow-md hover:shadow-xl">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm" style={{ backgroundColor: persona.color }}>
                                            {persona.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide border border-white/10 px-2 py-0.5 rounded-full bg-black/20">
                                            {item.contentType === ContentType.IMAGE_PROMPT ? t('imagePrompts').replace(/^[📷✍️]\s*/, '') : t('postTexts').replace(/^[📷✍️]\s*/, '')}
                                        </span>
                                        <span className="text-[10px] text-gray-500">
                                             {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300 font-medium truncate pr-4">{item.englishPrompt}</p>
                                </div>
                                
                                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onReuse(item)}
                                        className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-lg hover:brightness-110 transition-all"
                                        style={{ backgroundColor: persona.color, boxShadow: `0 2px 10px ${persona.color}40` }}
                                        aria-label={t('reusePrompt')}
                                    >
                                        {t('reusePrompt')}
                                    </button>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-black/30 border border-transparent hover:border-white/10"
                                        aria-label={t('deletePrompt')}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {history.length === 0 && (
                     <div className="text-center py-12 text-gray-500 text-sm border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                        No history yet. Generate something amazing!
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;