
import React from 'react';
import { useAppStore } from '../store/useAppStore';

const AboutPage: React.FC = () => {
    const { contentPages, systemSettings } = useAppStore();
    const pageData = contentPages.find(p => p.slug === 'about');

    return (
        <div className="pt-20 bg-white dark:bg-gray-800">
            <header className="py-32 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 text-center">
                <div className="container mx-auto px-6">
                    <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4">{pageData?.title || `Sobre a ${systemSettings.appName}`}</h1>
                    <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Conectando cuidado, tecnologia e humanidade para transformar vidas.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-20">
                <section className="mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gradient mb-6">Nossa Missão</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {pageData?.content || `Na ${systemSettings.appName}, nossa missão é revolucionar o setor de cuidados...`}
                            </p>
                        </div>
                        <div className="p-8 bg-gray-100 dark:bg-gray-700 rounded-3xl">
                             <img src="https://images.unsplash.com/photo-1576765608866-5b438b495a3d?q=80&w=2070&auto=format&fit=crop" alt="Cuidador ajudando idoso" className="rounded-2xl shadow-xl w-full h-auto" />
                        </div>
                    </div>
                </section>

                <section className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gradient mb-4">Nossos Valores</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700">
                            <div className="text-4xl mb-4">🤝</div>
                            <h3 className="text-2xl font-bold mb-2">Confiança</h3>
                            <p className="text-gray-600 dark:text-gray-400">Construímos relações baseadas na transparência e segurança, com verificações rigorosas.</p>
                        </div>
                         <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700">
                            <div className="text-4xl mb-4">💡</div>
                            <h3 className="text-2xl font-bold mb-2">Inovação</h3>
                            <p className="text-gray-600 dark:text-gray-400">Utilizamos tecnologia de ponta, como IA, para criar a melhor experiência de matching.</p>
                        </div>
                         <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700">
                            <div className="text-4xl mb-4">❤️</div>
                            <h3 className="text-2xl font-bold mb-2">Empatia</h3>
                            <p className="text-gray-600 dark:text-gray-400">Colocamos as pessoas em primeiro lugar, entendendo as necessidades de cada família e cuidador.</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AboutPage;
