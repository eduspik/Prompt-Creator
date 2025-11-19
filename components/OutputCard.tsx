import React, { useState, useCallback } from 'react';
import { GeneratedPosts } from '../types';
import { ClipboardIcon, CheckIcon, TwitterIcon, InstagramIcon, FanvueIcon } from './icons';
import { useTranslations } from '../hooks/useTranslations';

type Platform = 'fanvue' | 'instagram' | 'twitter';

interface OutputCardProps {
    content: string | GeneratedPosts;
    activeColor: string;
}

const PostContentDisplay: React.FC<{ post: GeneratedPosts, activeColor: string }> = ({ post, activeColor }) => {
    const [activeTab, setActiveTab] = useState<Platform>('fanvue');
    const [copied, setCopied] = useState(false);
    const t = useTranslations();

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(post[activeTab]).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [post, activeTab]);
    
    const tabs: { id: Platform; icon: React.ReactElement; name: string }[] = [
        { id: 'fanvue', icon: <FanvueIcon className="w-4 h-4 mr-2" />, name: 'Fanvue' },
        { id: 'instagram', icon: <InstagramIcon className="w-4 h-4 mr-2" />, name: 'Instagram' },
        { id: 'twitter', icon: <TwitterIcon className="w-4 h-4 mr-2" />, name: 'Twitter' },
    ];
    
    return (
        <div className="flex flex-col h-full">
            <div className="bg-black/20 rounded-t-lg p-1 flex space-x-1 mb-4 backdrop-blur-md">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={isActive ? { backgroundColor: activeColor, color: 'white', boxShadow: `0 2px 10px ${activeColor}40` } : {}}
                            className={`
                                flex-1 flex items-center justify-center py-2 rounded-md text-xs font-bold transition-all duration-200
                                ${isActive ? 'shadow-md' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
                            `}
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.name}</span>
                        </button>
                    )
                })}
            </div>

            <div className="relative flex-grow bg-white/5 rounded-lg p-4 border border-white/5">
                <p className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed pb-8 font-light tracking-wide">
                    {post[activeTab]}
                </p>
                <button
                    onClick={handleCopy}
                    className="absolute bottom-2 right-2 p-2 text-gray-400 hover:text-white transition-colors bg-black/40 hover:bg-black/60 rounded-lg border border-white/10 hover:border-white/30 backdrop-blur-md"
                    aria-label={t('copyToClipboard')}
                >
                    {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};


const PromptContentDisplay: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const t = useTranslations();
    
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [text]);

    return (
        <div className="relative h-full flex flex-col">
            <div className="flex-grow bg-white/5 rounded-lg p-4 border border-white/5 font-mono text-sm">
                 <p className="text-gray-300 whitespace-pre-wrap leading-relaxed pb-8">
                    {text}
                </p>
            </div>
           
            <button
                onClick={handleCopy}
                className="absolute bottom-3 right-3 p-2 text-gray-400 hover:text-white transition-colors bg-black/40 hover:bg-black/60 rounded-lg border border-white/10 hover:border-white/30 backdrop-blur-md shadow-lg"
                aria-label={t('copyToClipboard')}
            >
                {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
        </div>
    );
}

const OutputCard: React.FC<OutputCardProps> = ({ content, activeColor }) => {
    return (
         <div className="relative group rounded-2xl p-0.5 transition-transform duration-300 hover:-translate-y-1">
            <div 
                className="absolute inset-0 rounded-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-500" 
                style={{ background: `linear-gradient(to bottom right, ${activeColor}, #4B5563)` }}
            ></div>
            <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl p-5 min-h-[240px] h-full border border-white/10 shadow-2xl">
                {typeof content === 'string' ? (
                    <PromptContentDisplay text={content} />
                ) : (
                    <PostContentDisplay post={content} activeColor={activeColor}/>
                )}
            </div>
        </div>
    );
};

export default OutputCard;