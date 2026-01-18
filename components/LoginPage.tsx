
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import ForgotPasswordModal from './ForgotPasswordModal';

const LoginPage: React.FC = () => {
    const { login, navigate } = useAppStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await login(email, password);
        setIsLoading(false);
    };
    
    return (
        <div className="pt-24 min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4 lg:p-8">
            <div className="bg-white dark:bg-gray-800 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row min-h-[600px]">
                
                {/* Left Side: Decorative / Brand */}
                <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-600 to-purple-800 p-12 flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse-soft"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
                    
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                        </div>
                        <h2 className="text-4xl font-bold mb-4 leading-tight">Bem-vindo de volta!</h2>
                        <p className="text-indigo-100 text-lg leading-relaxed">
                            Acesse sua conta para gerenciar agendamentos, atualizar seu perfil e conectar-se com quem precisa de cuidado.
                        </p>
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex -space-x-2 mb-3">
                            <img className="w-10 h-10 rounded-full border-2 border-indigo-500" src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" />
                            <img className="w-10 h-10 rounded-full border-2 border-indigo-500" src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
                            <img className="w-10 h-10 rounded-full border-2 border-indigo-500" src="https://randomuser.me/api/portraits/women/68.jpg" alt="User" />
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-500 bg-white text-indigo-600 flex items-center justify-center text-xs font-bold">+2k</div>
                        </div>
                        <p className="text-sm opacity-75">Junte-se à nossa comunidade ativa.</p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="lg:w-7/12 p-8 lg:p-12 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Acessar Plataforma</h1>
                            <p className="text-gray-500 dark:text-gray-400">Digite suas credenciais para continuar.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                                    </div>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                        required 
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all duration-300 outline-none font-medium placeholder-gray-400" 
                                        placeholder="seu@email.com" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Senha</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotPasswordModalOpen(true)}
                                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                    >
                                        Esqueceu a senha?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={password} 
                                        onChange={e => setPassword(e.target.value)} 
                                        required 
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all duration-300 outline-none font-medium placeholder-gray-400" 
                                        placeholder="••••••••" 
                                        autoComplete="current-password" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full btn-gradient text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                               {isLoading ? (
                                   <span className="flex items-center justify-center">
                                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                       Autenticando...
                                   </span>
                               ) : 'Entrar na Conta'}
                            </button>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">Ou entre com</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button className="flex items-center justify-center px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800">
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 mr-2" alt="Google" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Google</span>
                                </button>
                                <button className="flex items-center justify-center px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800">
                                    <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="h-5 w-5 mr-2" alt="Facebook" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Facebook</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600 dark:text-gray-400">
                                Não tem uma conta? 
                                <button onClick={() => navigate('register')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold ml-1 hover:underline transition-all">
                                    Criar conta grátis
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {isForgotPasswordModalOpen && <ForgotPasswordModal onClose={() => setIsForgotPasswordModalOpen(false)} />}
        </div>
    );
};

export default LoginPage;
