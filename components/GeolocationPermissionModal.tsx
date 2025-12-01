import React from 'react';

interface GeolocationPermissionModalProps {
    onAllow: () => void;
    onDeny: () => void;
}

const GeolocationPermissionModal: React.FC<GeolocationPermissionModalProps> = ({ onAllow, onDeny }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg animate-scale-in p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Encontrar Cuidadores Próximos</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Para mostrarmos os cuidadores disponíveis na sua região, precisamos acessar sua localização. Seus dados são usados apenas para esta funcionalidade.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={onAllow}
                        className="w-full sm:w-auto flex-grow btn-gradient text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                        Permitir Localização
                    </button>
                    <button 
                        onClick={onDeny}
                        className="w-full sm:w-auto flex-grow bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-3 px-8 rounded-xl text-lg transition-colors"
                    >
                        Agora não
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeolocationPermissionModal;