
import React, { useState, useEffect } from 'react';

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        // Optionally, send analytics event with outcome of user choice
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-6 md:bottom-6 md:w-96 animate-slide-up">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-900 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2.5 rounded-xl shadow-inner">
                        <span className="text-2xl">📲</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm">Instalar 99 Cuidar</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Acesse mais rápido e offline.</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <button 
                        onClick={() => setIsVisible(false)} 
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        aria-label="Fechar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <button 
                        onClick={handleInstall} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:scale-105"
                    >
                        Instalar App
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
