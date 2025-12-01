
import React from 'react';
import { useAppStore } from '../store/useAppStore';

const PrivacyPage: React.FC = () => {
    const { contentPages } = useAppStore();
    const pageData = contentPages.find(p => p.slug === 'privacy');

    return (
        <div className="pt-20 bg-white dark:bg-gray-800">
            <header className="py-24 bg-gray-50 dark:bg-gray-700/50 text-center">
                <div className="container mx-auto px-6">
                    <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">{pageData?.title || 'Política de Privacidade'}</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">Última atualização: {new Date(pageData?.lastUpdated || Date.now()).toLocaleDateString()}</p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-20 max-w-4xl">
                <div className="prose dark:prose-invert prose-lg max-w-none text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {pageData?.content}
                </div>
            </main>
        </div>
    );
};

export default PrivacyPage;
