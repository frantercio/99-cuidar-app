

import React, { useEffect, useState } from 'react';
import { AlertMessage } from '../types';

interface AlertProps {
    alert: AlertMessage;
    onDismiss: (id: number) => void;
}

const Alert: React.FC<AlertProps> = ({ alert, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    const typeClasses = {
        success: { bg: 'bg-green-500', iconBg: 'bg-green-600', title: 'Sucesso!', icon: <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/> },
        error: { bg: 'bg-red-500', iconBg: 'bg-red-600', title: 'Erro!', icon: <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/> },
        info: { bg: 'bg-blue-500', iconBg: 'bg-blue-600', title: 'Aviso', icon: <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /> }
    };

    const currentType = typeClasses[alert.type || 'info'];

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            const exitTimer = setTimeout(() => onDismiss(alert.id), 500);
            return () => clearTimeout(exitTimer);
        }, 4500);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alert.id]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(alert.id), 500);
    };

    return (
        <div className={`
            p-6 rounded-2xl shadow-2xl max-w-sm text-white
            ${currentType.bg}
            transition-all duration-500 ease-in-out
            ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
        `}>
            <div className="flex items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${currentType.iconBg}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        {currentType.icon}
                    </svg>
                </div>
                <div>
                    <div className="font-semibold text-lg">{currentType.title}</div>
                    <div className="text-sm opacity-90">{alert.message}</div>
                </div>
                <button onClick={handleDismiss} className="ml-4 text-white/80 hover:text-white flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Alert;