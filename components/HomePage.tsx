
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Page } from '../types';
import FeatureModal from './FeatureModal';
import { useAppStore } from '../store/useAppStore';

interface CounterProps {
    target: number;
}

const Counter: React.FC<CounterProps> = ({ target }) => {
    const ref = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    let current = 0;
                    const duration = 2000;
                    const increment = Math.max(1, target / (duration / 16));
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        if (ref.current) {
                            ref.current.textContent = Math.floor(current).toLocaleString('pt-BR');
                        }
                    }, 16);
                }
            },
            { threshold: 0.5 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [target]);

    return <div ref={ref} className="text-5xl font-bold text-gradient mb-2">0</div>;
};

const features = [
    {
        title: "IA Inteligente",
        description: "Sistema de matching automático que conecta cuidadores com famílias baseado em necessidades específicas.",
        longDescription: "Nossa Inteligência Artificial analisa mais de 50 pontos de dados, incluindo especializações do cuidador, necessidades do paciente, localização, personalidade e avaliações anteriores. O resultado é um match preciso e confiável, economizando tempo e garantindo que você encontre o profissional ideal para suas necessidades com uma precisão de 97%.",
        icon: <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />,
        gradient: "from-blue-500 to-indigo-600",
        textColor: "text-blue-600 dark:text-blue-400"
    },
    {
        title: "Geolocalização",
        description: "Encontre cuidadores próximos em tempo real com rastreamento de rota e tempo de chegada estimado.",
        longDescription: "Visualize cuidadores disponíveis no mapa da sua cidade em tempo real. Nossa tecnologia de geolocalização não apenas mostra quem está perto, mas também permite que você acompanhe o trajeto do profissional no dia do serviço, com estimativas de chegada precisas, oferecendo mais segurança e pontualidade.",
        icon: <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />,
        gradient: "from-green-500 to-emerald-600",
        textColor: "text-green-600 dark:text-green-400"
    },
    {
        title: "Pagamentos Integrados",
        description: "Processamento automático de pagamentos, divisão de comissões e relatórios financeiros completos.",
        longDescription: "Diga adeus à burocracia. Nosso sistema de pagamentos integrado processa transações de forma segura e automática via cartão de crédito. Os cuidadores recebem seus pagamentos pontualmente, e as famílias têm um registro completo de todas as despesas. Gerencie tudo em um só lugar, com transparência e segurança.",
        icon: <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />,
        gradient: "from-purple-500 to-pink-600",
        textColor: "text-purple-600 dark:text-purple-400"
    },
    {
        title: "Chat em Tempo Real",
        description: "Comunicação instantânea entre famílias e cuidadores com histórico completo e notificações push.",
        longDescription: "Converse com os cuidadores antes, durante e depois do serviço através do nosso chat seguro e integrado. Troque informações importantes, tire dúvidas e mantenha um registro de toda a comunicação. Nossas notificações em tempo real garantem que você nunca perca uma mensagem importante.",
        icon: <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>,
        gradient: "from-orange-500 to-red-600",
        textColor: "text-orange-600 dark:text-orange-400"
    },
    {
        title: "Analytics Avançado",
        description: "Dashboard completo com métricas de performance, satisfação do cliente e projeções de ganhos.",
        longDescription: "Para os cuidadores, nosso painel de analytics oferece uma visão completa de sua performance: ganhos mensais, serviços mais populares, avaliações de clientes e dicas para otimizar o perfil. Tome decisões baseadas em dados para impulsionar sua carreira profissional.",
        icon: <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />,
        gradient: "from-cyan-500 to-blue-600",
        textColor: "text-cyan-600 dark:text-cyan-400"
    },
    {
        title: "Segurança Total",
        description: "Verificação biométrica, background check completo e seguro contra fraudes com IA.",
        longDescription: "A segurança é nossa prioridade máxima. Todos os cuidadores passam por um rigoroso processo de verificação que inclui checagem de antecedentes criminais, validação de certificados e verificação de identidade. Nossa plataforma também conta com seguro e um sistema de IA que monitora atividades suspeitas para proteger a todos.",
        icon: <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />,
        gradient: "from-yellow-500 to-orange-600",
        textColor: "text-yellow-600 dark:text-yellow-400"
    },
];


interface HomePageProps {
    onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    const [selectedFeature, setSelectedFeature] = useState<(typeof features)[0] | null>(null);
    const { caregivers } = useAppStore();

    const stats = useMemo(() => {
        const totalCaregivers = caregivers.length;
        // Use completedJobs as a proxy for families served/interactions to show a robust number based on data
        const totalServed = caregivers.reduce((acc, c) => acc + (c.completedJobs || 0), 0);
        const avgRating = totalCaregivers > 0 
            ? (caregivers.reduce((acc, c) => acc + c.rating, 0) / totalCaregivers).toFixed(1) 
            : '5.0';
            
        return {
            caregivers: totalCaregivers,
            served: totalServed,
            rating: avgRating
        };
    }, [caregivers]);

    return (
        <div className="pt-20">
            <section className="hero-gradient relative overflow-hidden min-h-screen flex items-center">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
                <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full animate-pulse-soft" style={{ animationDelay: '1s' }}></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="mb-12">
                            <h1 className="text-7xl md:text-9xl font-black text-white mb-8 leading-tight animate-fade-in">
                                99<span className="text-yellow-300 animate-pulse">Cuidar</span>
                            </h1>
                            <div className="w-40 h-2 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 mx-auto mb-10 rounded-full animate-gradient"></div>
                            <p className="text-3xl md:text-4xl text-white/90 mb-6 font-light animate-fade-in" style={{ animationDelay: '0.3s' }}>Plataforma Premium para Cuidadores</p>
                            <p className="text-xl text-white/80 mb-16 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.6s' }}>
                                A mais avançada plataforma de cuidadores do Brasil. Com IA, geolocalização, 
                                sistema de pagamentos integrado e muito mais.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center animate-scale-in" style={{ animationDelay: '0.9s' }}>
                            <button onClick={() => onNavigate('register')} className="group glass-effect text-white px-12 py-5 rounded-3xl font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-110 hover:rotate-1">
                                <span className="flex items-center">
                                    <svg className="w-7 h-7 mr-4 group-hover:animate-wiggle" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                    Seja um Cuidador Pro
                                    <div className="ml-3 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                                </span>
                            </button>
                            <button onClick={() => onNavigate('marketplace')} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-12 py-5 rounded-3xl font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-rotate-1">
                                <span className="flex items-center">
                                    <svg className="w-7 h-7 mr-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                                    Encontrar Cuidadores Elite
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="py-20 bg-white dark:bg-gray-800 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Números que Impressionam</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">Nossa plataforma em constante crescimento</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center group cursor-pointer">
                            <Counter target={stats.caregivers} />
                            <p className="text-gray-600 dark:text-gray-400 font-medium">Cuidadores Ativos</p>
                        </div>
                        <div className="text-center group cursor-pointer">
                            <Counter target={stats.served} />
                            <p className="text-gray-600 dark:text-gray-400 font-medium">Famílias Atendidas</p>
                        </div>
                        <div className="text-center group cursor-pointer">
                            <div className="text-5xl font-bold text-gradient mb-2">{stats.rating}</div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">Avaliação Média</p>
                        </div>
                         <div className="text-center group cursor-pointer">
                            <div className="text-5xl font-bold text-gradient mb-2">24/7</div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">Suporte Disponível</p>
                        </div>
                    </div>
                </div>
            </section>

             <section className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-6xl font-bold text-gray-800 dark:text-white mb-8">
                            Tecnologia de <span className="text-gradient">Ponta</span>
                        </h2>
                        <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Recursos exclusivos que revolucionam o cuidado de idosos
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {features.map((feature, index) => (
                            <div key={index} className="group relative">
                                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-soft`}></div>
                                <div className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col h-full">
                                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            {feature.icon}
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{feature.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 flex-grow">{feature.description}</p>
                                    <button 
                                        onClick={() => setSelectedFeature(feature)}
                                        className={`flex items-center ${feature.textColor} font-medium mt-auto`}
                                    >
                                        <span>Saiba mais</span>
                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            <section className="py-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-6xl md:text-7xl font-bold text-white mb-8">
                            Pronto para <span className="text-yellow-300 animate-pulse">Revolucionar</span>?
                        </h2>
                        <p className="text-2xl text-white/90 mb-12 leading-relaxed">
                            Junte-se a milhares de cuidadores que já estão construindo carreiras 
                            extraordinárias com nossa plataforma de última geração.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-8 justify-center">
                            <button onClick={() => onNavigate('register')} className="group glass-effect text-white px-12 py-5 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110">
                                <span className="flex items-center justify-center">
                                    <svg className="w-7 h-7 mr-4 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                    Começar Gratuitamente
                                    <div className="ml-3 px-2 py-1 bg-green-500 text-xs rounded-full">GRÁTIS</div>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <FeatureModal feature={selectedFeature} onClose={() => setSelectedFeature(null)} />
        </div>
    );
};

export default HomePage;
