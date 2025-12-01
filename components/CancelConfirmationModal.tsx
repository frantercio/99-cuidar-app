import React from 'react';
import { Appointment } from '../types';

interface CancelConfirmationModalProps {
    appointment: Appointment;
    onClose: () => void;
    onConfirm: () => void;
}

const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({ appointment, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md animate-scale-in p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Confirmar Cancelamento</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Tem certeza que deseja cancelar o agendamento com <span className="font-semibold">{appointment.caregiverName}</span> para o dia {new Date(appointment.date).toLocaleDateString('pt-BR')}?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={onConfirm}
                        className="w-full sm:w-auto flex-grow bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition-all duration-300"
                    >
                        Sim, cancelar
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full sm:w-auto flex-grow bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-3 px-8 rounded-xl text-lg transition-colors"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelConfirmationModal;
