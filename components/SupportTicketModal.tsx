
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface SupportTicketModalProps {
    onClose: () => void;
}

const SupportTicketModal: React.FC<SupportTicketModalProps> = ({ onClose }) => {
    const { currentUser, createTicket, addAlert } = useAppStore();
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !description.trim()) {
            addAlert('Preencha todos os campos.', 'error');
            return;
        }

        setIsSubmitting(true);
        
        await createTicket({
            userId: currentUser!.id,
            userName: currentUser!.name,
            userRole: currentUser!.role as 'client' | 'caregiver',
            subject,
            description,
            status: 'open',
            date: new Date().toISOString(),
            priority
        });

        setIsSubmitting(false);
        addAlert('Ticket de suporte criado com sucesso!', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md animate-scale-in">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Abrir Chamado</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Assunto</label>
                        <input 
                            type="text" 
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ex: Problema com pagamento"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Prioridade</label>
                        <select 
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                        >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            placeholder="Descreva seu problema em detalhes..."
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full btn-gradient text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar Ticket'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SupportTicketModal;
