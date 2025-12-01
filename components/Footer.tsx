
import React from 'react';
import { Page } from '../types';
import { useAppStore } from '../store/useAppStore';

interface FooterProps {
    onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    const { systemSettings } = useAppStore();

    return (
        <footer className="bg-gray-900 text-white py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 opacity-50"></div>
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full animate-pulse-soft"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full animate-float"></div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div>
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg text-2xl">
                                {systemSettings.logo.startsWith('http') ? 
                                    <img src={systemSettings.logo} alt="Logo" className="w-full h-full object-cover rounded-2xl"/> : 
                                    <span role="img" aria-label="Logo">{systemSettings.logo}</span>
                                }
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">{systemSettings.appName}</h3>
                                <p className="text-indigo-300 text-sm">Cuidado e Tecnologia</p>
                            </div>
                        </div>
                        <p className="text-gray-300 mb-8 leading-relaxed">
                            A plataforma mais avançada do Brasil para conectar cuidadores 
                            profissionais com famílias que precisam de cuidados especializados.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xl font-bold mb-8 text-indigo-300">Para Cuidadores</h4>
                        <ul className="space-y-4 text-gray-300">
                            <li><button onClick={() => onNavigate('howItWorks')} className="hover:text-white transition-colors hover:translate-x-2 inline-block transform">🚀 Como Funciona</button></li>
                            <li><button onClick={() => onNavigate('register')} className="hover:text-white transition-colors hover:translate-x-2 inline-block transform">📝 Cadastre-se Grátis</button></li>
                            <li><button onClick={() => onNavigate('training')} className="hover:text-white transition-colors hover:translate-x-2 inline-block transform">🎓 Treinamentos</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xl font-bold mb-8 text-green-300">Para Famílias</h4>
                        <ul className="space-y-4 text-gray-300">
                            <li><button onClick={() => onNavigate('findCaregiversGuide')} className="hover:text-white transition-colors hover:translate-x-2 inline-block transform">🔍 Encontrar Cuidadores</button></li>
                            <li><button onClick={() => onNavigate('howToChoose')} className="hover:text-white transition-colors hover:translate-x-2 inline-block transform">✅ Como Escolher</button></li>
                            <li><button onClick={() => onNavigate('security')} className="hover:text-white transition-colors hover:translate-x-2 inline-block transform">🛡️ Segurança Total</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xl font-bold mb-8 text-purple-300">Empresa</h4>
                        <ul className="space-y-4 text-gray-300">
                            <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors hover:translate-x-2 inline-block transform">🏢 Sobre Nós</button></li>
                            <li><button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors hover:translate-x-2 inline-block transform">🔒 Privacidade</button></li>
                            <li><button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors hover:translate-x-2 inline-block transform">📜 Termos de Uso</button></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-20 pt-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                        <div className="text-center lg:text-left">
                            <p className="text-gray-400 text-lg">&copy; 2024 {systemSettings.appName}. Todos os direitos reservados.</p>
                        </div>
                        <div className="text-center">
                            <p className="text-indigo-300 font-semibold text-lg">Conectando cuidado com tecnologia de ponta</p>
                        </div>
                        <div className="text-center lg:text-right">
                            <p className="text-gray-400">Desenvolvido com ❤️ para transformar vidas</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
