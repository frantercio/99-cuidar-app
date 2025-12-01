import React from 'react';

interface Feature {
    title: string;
    description: string;
    longDescription: string;
    icon: React.ReactNode;
    gradient: string;
}

interface FeatureModalProps {
    feature: Feature | null;
    onClose: () => void;
}

const FeatureModal: React.FC<FeatureModalProps> = ({ feature, onClose }) => {
    if (!feature) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl animate-scale-in overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`p-8 bg-gradient-to-r ${feature.gradient} text-white flex flex-col sm:flex-row items-center gap-6`}>
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                            {feature.icon}
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-4xl font-bold">{feature.title}</h2>
                        <p className="text-white/80 text-lg mt-1">{feature.description}</p>
                    </div>
                </div>

                <div className="p-8">
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {feature.longDescription}
                    </p>
                </div>

                <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-right">
                     <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl font-semibold transition-all duration-300"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeatureModal;
