
import React, { useState, useEffect } from 'react';
import { Appointment, CareLog } from '../types';
import { useAppStore } from '../store/useAppStore';

interface CareLogViewerModalProps {
    appointment: Appointment;
    onClose: () => void;
}

const activitiesOptions: {[key: string]: { label: string; icon: string }} = {
    'medication': { label: 'Medicação', icon: '💊' },
    'bath': { label: 'Banho', icon: '🚿' },
    'meal': { label: 'Alimentação', icon: '🍽️' },
    'hydration': { label: 'Hidratação', icon: '💧' },
    'exercise': { label: 'Exercícios', icon: '🤸' },
    'bathroom': { label: 'Necessidades', icon: '🚽' },
    'sleep': { label: 'Sono', icon: '😴' },
    'leisure': { label: 'Lazer', icon: '📺' }
};

const moodOptions: {[key: string]: { label: string; icon: string; color: string }} = {
    'happy': { label: 'Feliz', icon: '😊', color: 'text-green-600' },
    'calm': { label: 'Calmo', icon: '😌', color: 'text-blue-600' },
    'sad': { label: 'Triste', icon: '😢', color: 'text-indigo-600' },
    'agitated': { label: 'Agitado', icon: '😠', color: 'text-red-600' },
    'confused': { label: 'Confuso', icon: '😕', color: 'text-yellow-600' }
};

const CareLogViewerModal: React.FC<CareLogViewerModalProps> = ({ appointment, onClose }) => {
    const { getCareLog } = useAppStore();
    const [log, setLog] = useState<CareLog | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLog = async () => {
            const data = await getCareLog(appointment.id);
            setLog(data);
            setIsLoading(false);
        };
        fetchLog();
    }, [appointment.id, getCareLog]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg animate-scale-in max-h-[90vh] flex flex-col">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Diário de Cuidados</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Cuidador: {appointment.caregiverName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-grow">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : log ? (
                        <div className="space-y-8">
                            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                                <p className="text-gray-500 dark:text-gray-400 mb-2 font-medium">Estado Emocional</p>
                                <div className="text-6xl mb-2">{moodOptions[log.mood]?.icon}</div>
                                <p className={`text-xl font-bold ${moodOptions[log.mood]?.color}`}>{moodOptions[log.mood]?.label}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">📋</span> Atividades Realizadas
                                </h3>
                                {log.activities.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {log.activities.map(act => (
                                            <div key={act} className="flex items-center p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
                                                <span className="text-2xl mr-3">{activitiesOptions[act]?.icon}</span>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{activitiesOptions[act]?.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">Nenhuma atividade registrada.</p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="bg-yellow-100 text-yellow-600 p-1.5 rounded-lg">📝</span> Observações
                                </h3>
                                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{log.notes || "Sem observações adicionais."}</p>
                                </div>
                            </div>
                            
                            <p className="text-xs text-center text-gray-400 mt-4">
                                Registrado em: {new Date(log.timestamp).toLocaleString()}
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Nenhum diário encontrado para este agendamento.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CareLogViewerModal;
