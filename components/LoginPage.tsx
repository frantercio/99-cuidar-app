

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import ForgotPasswordModal from './ForgotPasswordModal';

const LoginPage: React.FC = () => {
    const { login, navigate } = useAppStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await login(email, password);
        setIsLoading(false);
    };
    
    return (
        <div className="pt-20 min-h-screen flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-2xl w-full max-w-lg mx-6 my-12 relative overflow-hidden animate-scale-in">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-10 animate-pulse-soft"></div>
                
                <div className="relative z-10">
                    <div className="text-center mb-12">
                        <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-scale-in">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                        </div>
                        <h2 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">Bem-vindo de volta</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-xl">Acesse sua conta de cuidador profissional</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-8 py-5 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-300 hover:border-indigo-300" placeholder="seu@email.com" />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Senha</label>
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPasswordModalOpen(true)}
                                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none"
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-8 py-5 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-300 hover:border-indigo-300" placeholder="••••••••" autoComplete="new-password" />
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full btn-gradient text-white font-bold py-5 px-8 rounded-3xl text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed">
                           {isLoading ? 'Entrando...' : 'Entrar na Plataforma Elite'}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Não tem uma conta? 
                            <button onClick={() => navigate('register')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold ml-1">Cadastre-se gratuitamente</button>
                        </p>
                    </div>
                </div>
            </div>
            {isForgotPasswordModalOpen && <ForgotPasswordModal onClose={() => setIsForgotPasswordModalOpen(false)} />}
        </div>
    );
};

export default LoginPage;