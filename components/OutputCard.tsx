import React, { useState, useCallback } from 'react';
import { GeneratedPosts } from '../types';
import { ClipboardIcon, CheckIcon, TwitterIcon, InstagramIcon, FanvueIcon } from './icons';
import { useTranslations } from '../hooks/useTranslations';

type Platform = 'fanvue' | 'instagram' | 'twitter';

interface OutputCardProps {
    content: string | GeneratedPosts;
    personaColor: string;
}

const PostContentDisplay: React.FC<{ post: GeneratedPosts, personaColor: string }> = ({ post, personaColor }) => {
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
        { id: 'fanvue', icon: <FanvueIcon className="w-5 h-5 mr-2" />, name: 'Fanvue' },
        { id: 'instagram', icon: <InstagramIcon className="w-5 h-5 mr-2" />, name: 'Instagram' },
        { id: 'twitter', icon: <TwitterIcon className="w-5 h-5 mr-2" />, name: 'Twitter' },
    ];
    
    const activeColorStyle = {
      color: personaColor,
      borderColor: personaColor,
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={activeTab === tab.id ? activeColorStyle : {}}
                            className={`${
                                activeTab === tab.id
                                    ? `border-b-2 font-semibold`
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            } whitespace-nowrap py-3 px-1 font-medium text-sm flex items-center transition-colors`}
                        >
                            {tab.icon}
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="relative flex-grow mt-4">
                <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed pb-12">
                    {post[activeTab]}
                </p>
                <button
                    onClick={handleCopy}
                    className="absolute bottom-0 right-0 p-2 text-gray-400 hover:text-white transition-colors bg-gray-700/50 hover:bg-gray-600 rounded-md"
                    aria-label={t('copyToClipboard')}
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
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
        <div className="relative h-full">
            <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed pb-12">
                {text}
            </p>
            <button
                onClick={handleCopy}
                className="absolute bottom-0 right-0 p-2 text-gray-400 hover:text-white transition-colors bg-gray-700/50 hover:bg-gray-600 rounded-md"
                aria-label={t('copyToClipboard')}
            >
                {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
            </button>
        </div>
    );
}

const OutputCard: React.FC<OutputCardProps> = ({ content, personaColor }) => {
    const gradientStyle = {
      background: `linear-gradient(to bottom right, ${personaColor}, #8B5CF6)`
    };

    return (
         <div className="rounded-xl shadow-lg p-0.5" style={gradientStyle}>
            <div className="bg-gray-800 rounded-lg p-5 min-h-[200px] h-full">
                {typeof content === 'string' ? (
                    <PromptContentDisplay text={content} />
                ) : (
                    <PostContentDisplay post={content} personaColor={personaColor}/>
                )}
            </div>
        </div>
    );
};

export default OutputCard;
