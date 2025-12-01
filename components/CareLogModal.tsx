
import React, { useState } from 'react';
import { Appointment } from '../types';
import { useAppStore } from '../store/useAppStore';

interface CareLogModalProps {
    appointment: Appointment;
    onClose: () => void;
}

const activitiesOptions = [
    { id: 'medication', label: 'Medicação', icon: '💊' },
    { id: 'bath', label: 'Banho', icon: '🚿' },
    { id: 'meal', label: 'Alimentação', icon: '🍽️' },
    { id: 'hydration', label: 'Hidratação', icon: '💧' },
    { id: 'exercise', label: 'Exercícios', icon: '🤸' },
    { id: 'bathroom', label: 'Necessidades', icon: '🚽' },
    { id: 'sleep', label: 'Sono', icon: '😴' },
    { id: 'leisure', label: 'Lazer', icon: '📺' }
];

const moodOptions = [
    { id: 'happy', label: 'Feliz', icon: '😊', color: 'bg-green-100 text-green-700 border-green-300' },
    { id: 'calm', label: 'Calmo', icon: '😌', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { id: 'sad', label: 'Triste', icon: '😢', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { id: 'agitated', label: 'Agitado', icon: '😠', color: 'bg-red-100 text-red-700 border-red-300' },
    { id: 'confused', label: 'Confuso', icon: '😕', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' }
];

const CareLogModal: React.FC<CareLogModalProps> = ({ appointment, onClose }) => {
    const { addCareLog } = useAppStore();
    const [mood, setMood] = useState<string>('');
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleActivity = (id: string) => {
        setSelectedActivities(prev => 
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mood) return;

        setIsSubmitting(true);
        await addCareLog({
            appointmentId: appointment.id,
            date: new Date().toISOString(),
            mood: mood as any,
            activities: selectedActivities,
            notes
        });
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg animate-scale-in max-h-[90vh] flex flex-col">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Diário de Cuidados</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Cliente: {appointment.clientName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-grow">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Mood Selection */}
                        <div>
                            <label className="block text-lg font-bold text-gray-800 dark:text-white mb-4">Como estava o paciente hoje?</label>
                            <div className="grid grid-cols-5 gap-2">
                                {moodOptions.map(option => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setMood(option.id)}
                                        className={`flex flex-col items-center p-2 rounded-xl transition-all border-2 ${mood === option.id ? option.color : 'bg-gray-50 dark:bg-gray-700 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                    >
                                        <span className="text-3xl mb-1">{option.icon}</span>
                                        <span className="text-xs font-semibold">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Activities Checklist */}
                        <div>
                            <label className="block text-lg font-bold text-gray-800 dark:text-white mb-4">Atividades Realizadas</label>
                            <div className="grid grid-cols-2 gap-3">
                                {activitiesOptions.map(activity => (
                                    <button
                                        key={activity.id}
                                        type="button"
                                        onClick={() => toggleActivity(activity.id)}
                                        className={`flex items-center p-3 rounded-xl border-2 transition-all text-left ${selectedActivities.includes(activity.id) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'}`}
                                    >
                                        <span className="text-2xl mr-3">{activity.icon}</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{activity.label}</span>
                                        {selectedActivities.includes(activity.id) && (
                                            <svg className="w-5 h-5 ml-auto text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-lg font-bold text-gray-800 dark:text-white mb-2">Observações Adicionais</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Alguma intercorrência? Algum detalhe importante sobre o dia?"
                            />
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl flex-shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={!mood || isSubmitting}
                        className="w-full btn-gradient text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Salvando...' : 'Salvar Diário'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CareLogModal;
