import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';

interface AppointmentTrackingModalProps {
    appointment: Appointment;
    onClose: () => void;
}

const AppointmentTrackingModal: React.FC<AppointmentTrackingModalProps> = ({ appointment, onClose }) => {
    const totalDuration = 20 * 60; // 20 minutes in seconds
    const [eta, setEta] = useState(totalDuration);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setEta(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setProgress(100);
                    return 0;
                }
                const newEta = prev - 1;
                setProgress(((totalDuration - newEta) / totalDuration) * 100);
                return newEta;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [totalDuration]);

    const formatTime = (seconds: number) => {
        if (seconds <= 0) return "Chegando!";
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl animate-scale-in overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Acompanhando Chegada</h2>
                        <p className="text-gray-500 dark:text-gray-400">{appointment.caregiverName} está a caminho.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                
                <div className="p-8">
                    <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-700/50 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-inner flex items-center p-8">
                         <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full relative">
                            <div className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: `${progress}%`, transition: 'width 1s linear' }}></div>
                             <div 
                                className="absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center border-2 border-indigo-500"
                                style={{ left: `calc(${progress}% - 20px)`, transition: 'left 1s linear' }}
                            >
                                <span className="text-2xl">{appointment.caregiverPhoto}</span>
                            </div>
                         </div>
                         <div className="absolute top-4 left-8 text-center">
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-lg">🏠</div>
                            <p className="text-xs font-semibold text-gray-500 mt-1">Início</p>
                        </div>
                        <div className="absolute top-4 right-8 text-center">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-lg">📍</div>
                            <p className="text-xs font-semibold text-gray-500 mt-1">Destino</p>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-lg text-gray-600 dark:text-gray-400">Tempo estimado de chegada:</p>
                        <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{formatTime(eta)}</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AppointmentTrackingModal;