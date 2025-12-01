
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface ForgotPasswordModalProps {
    onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
    const { addAlert, users } = useAppStore.getState();
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
            // For security, show the same message whether the email exists or not
            addAlert('Se este email estiver cadastrado, um link de recuperação será enviado.', 'info');
            setIsSent(true);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md animate-scale-in">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recuperar Senha</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                {isSent ? (
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Verifique seu Email</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Se uma conta com o email fornecido existir, enviamos um link para você redefinir sua senha.</p>
                        <button 
                            onClick={onClose}
                            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-3 px-8 rounded-xl text-lg transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="p-8 space-y-6">
                            <p className="text-gray-600 dark:text-gray-400">
                                Por favor, digite seu endereço de email. Enviaremos um link para você redefinir sua senha.
                            </p>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                                    placeholder="seu@email.com" 
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl">
                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full btn-gradient text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
