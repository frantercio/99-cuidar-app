
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Page } from '../types';
import FeatureModal from './FeatureModal';
import { useAppStore } from '../store/useAppStore';

interface CounterProps {
    target: number;
    suffix?: string;
    label: string;
}

const Counter: React.FC<CounterProps> = ({ target, suffix = '', label }) => {
    const ref = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    let current = 0;
                    const duration = 2000;
                    const increment = Math.max(1, Math.floor(target / (duration / 16)));
                    
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        if (ref.current) {
                            ref.current.textContent = current.toLocaleString('pt-BR') + suffix;
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
    }, [target, suffix]);

    return (
        <div className="flex flex-col items-center">
            <div ref={ref} className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-1">0</div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        </div>
    );
};

const features = [
    {
        title: "IA Match Maker",
        description: "Algoritmos avançados que conectam a necessidade exata da família com a competência do cuidador.",
        longDescription: "Nossa Inteligência Artificial analisa mais de 50 pontos de dados, incluindo especializações do cuidador, necessidades do paciente, localização, personalidade e avaliações anteriores. O resultado é um match preciso e confiável.",
        icon: <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />,
        gradient: "from-blue-500 to-indigo-600",
    },
    {
        title: "Verificação Pro",
        description: "Antecedentes criminais, biometria e certificações validadas manualmente.",
        longDescription: "A segurança é nossa prioridade máxima. Todos os cuidadores passam por um rigoroso processo de verificação que inclui checagem de antecedentes criminais, validação de certificados e verificação de identidade biométrica.",
        icon: <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />,
        gradient: "from-green-500 to-emerald-600",
    },
    {
        title: "Smart Wallet",
        description: "Pagamentos via Pix ou Cartão com retenção segura até o fim do serviço.",
        longDescription: "Diga adeus à burocracia. Nosso sistema de pagamentos integrado processa transações de forma segura e automática. O valor fica retido até a conclusão do serviço, garantindo segurança para ambos os lados.",
        icon: <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />,
        gradient: "from-purple-500 to-pink-600",
    }
];

const testimonials = [
    {
        name: "Cláudia M.",
        role: "Contratou para o pai",
        text: "A verificação de antecedentes me deu a paz que eu precisava. O profissional foi incrível.",
        photo: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
        name: "Roberto S.",
        role: "Cuidador Parceiro",
        text: "Profissionalizou meu trabalho. A agenda inteligente evita conflitos e recebo sempre em dia.",
        photo: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
        name: "Fernanda L.",
        role: "Contratou plantão",
        text: "Precisei de última hora e o 'Match' encontrou alguém em 10 minutos. Salvou meu dia.",
        photo: "https://randomuser.me/api/portraits/women/68.jpg"
    }
];

const HomePage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
    const [selectedFeature, setSelectedFeature] = useState<(typeof features)[0] | null>(null);
    const { caregivers } = useAppStore();

    const stats = useMemo(() => {
        const totalCaregivers = caregivers.length;
        const totalServed = caregivers.reduce((acc, c) => acc + (c.completedJobs || 0), 0);
        return { caregivers: totalCaregivers, served: totalServed };
    }, [caregivers]);

    return (
        <div className="bg-slate-50 dark:bg-gray-900 overflow-x-hidden font-sans">
            
            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-soft"></div>
                    <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px] animate-float"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        
                        {/* Text Content */}
                        <div className="lg:w-1/2 text-center lg:text-left animate-slide-in-right">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 mb-8 shadow-sm hover:shadow-md transition-shadow">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Plataforma #1 em Segurança
                            </div>
                            
                            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
                                O cuidado que sua família <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">merece.</span>
                            </h1>
                            
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                Conectamos profissionais de saúde verificados a famílias, utilizando inteligência artificial para garantir a compatibilidade perfeita e segurança total.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button onClick={() => onNavigate('marketplace')} className="btn-gradient text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    Encontrar Cuidador
                                </button>
                                <button onClick={() => onNavigate('register')} className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
                                    Sou Profissional
                                </button>
                            </div>

                            <div className="mt-10 flex items-center justify-center lg:justify-start gap-4">
                                <div className="flex -space-x-4">
                                    {[11, 32, 65, 44].map((id) => (
                                        <img key={id} className="w-10 h-10 rounded-full border-4 border-slate-50 dark:border-gray-900" src={`https://randomuser.me/api/portraits/${id % 2 === 0 ? 'women' : 'men'}/${id}.jpg`} alt="User" />
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-4 border-slate-50 dark:border-gray-900 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">+10k</div>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex text-yellow-400 text-xs">★★★★★</div>
                                    Famílias satisfeitas
                                </div>
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="lg:w-1/2 relative animate-scale-in perspective-1000">
                            {/* Decorative Card Behind */}
                            <div className="absolute top-10 right-10 w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 rounded-[2.5rem] opacity-20 blur-2xl transform rotate-6"></div>
                            
                            {/* Main Image Card */}
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 transform transition-transform hover:scale-[1.01] duration-500 group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                                <img 
                                    src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1976&auto=format&fit=crop" 
                                    alt="Cuidado Humanizado" 
                                    className="w-full h-[550px] object-cover"
                                />
                                
                                {/* Floating UI Element - Status */}
                                <div className="absolute top-8 right-8 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 animate-float">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-3 h-3 bg-green-500 rounded-full absolute -right-0.5 -bottom-0.5 border-2 border-white dark:border-gray-900"></div>
                                            <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-10 h-10 rounded-full" alt="Cuidadora" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</p>
                                            <p className="font-bold text-gray-800 dark:text-white">Chegando ao local</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating UI Element - Match */}
                                <div className="absolute bottom-8 left-8 right-8 z-20">
                                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-gray-800 dark:text-white">Match Encontrado!</h3>
                                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg text-xs font-bold">98% Compatível</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{width: '98%'}}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Especialista em Alzheimer • 5 anos de exp.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- STATS STRIP (Glassmorphism) --- */}
            <div className="container mx-auto px-6 -mt-10 relative z-20">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-200 dark:divide-gray-700/50">
                        <Counter target={stats.caregivers} label="Cuidadores Ativos" />
                        <Counter target={stats.served} suffix="+" label="Vidas Impactadas" />
                        <div className="flex flex-col items-center">
                            <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-1">4.9</div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avaliação Média</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500 mb-1">24/7</div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Suporte Humano</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BENTO GRID FEATURES --- */}
            <section className="py-24 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Por que a 99Cuidar é diferente?</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Não somos apenas um app. Somos uma plataforma completa de gestão de cuidados.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {/* Feature 1 - Large */}
                        <div className="md:col-span-2 row-span-1 rounded-3xl bg-gray-50 dark:bg-gray-800 p-8 relative overflow-hidden group hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/30 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-600/30">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3.004 3.004 0 011.25-2.406z" /></svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Inteligência Artificial de Verdade</h3>
                                    <p className="text-gray-600 dark:text-gray-300 max-w-md">Nosso algoritmo não olha apenas localização. Analisamos compatibilidade de personalidade, experiência com patologias específicas e histórico de avaliações para o match perfeito.</p>
                                </div>
                                <button onClick={() => setSelectedFeature(features[0])} className="w-fit text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">Saiba mais <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></button>
                            </div>
                        </div>

                        {/* Feature 2 - Tall */}
                        <div className="md:col-span-1 row-span-2 rounded-3xl bg-gray-900 text-white p-8 relative overflow-hidden group hover:shadow-xl transition-all">
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900"></div>
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-green-900/50 to-transparent"></div>
                            <div className="relative z-10 h-full flex flex-col items-center text-center justify-center">
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/40 animate-pulse-soft">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Selo Verificado Pro</h3>
                                <p className="text-gray-300 mb-6">Cada cuidador passa por um processo rigoroso: antecedentes criminais, validação de identidade e checagem de referências.</p>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 w-full">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-xs text-gray-300">Antecedentes Criminais</span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-xs text-gray-300">Reconhecimento Facial</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-xs text-gray-300">Prova de Capacitação</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3 - Medium */}
                        <div className="md:col-span-1 row-span-1 rounded-3xl bg-white dark:bg-gray-800 p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pagamento Seguro</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">O valor fica protegido conosco e só é liberado após a confirmação do serviço.</p>
                        </div>

                        {/* Feature 4 - Medium */}
                        <div className="md:col-span-1 row-span-1 rounded-3xl bg-white dark:bg-gray-800 p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Suporte 24h</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Equipe humana pronta para resolver qualquer imprevisto a qualquer hora do dia.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SELECT YOUR PATH (Personas) --- */}
            <section className="py-24 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Family Card */}
                        <div 
                            onClick={() => onNavigate('marketplace')}
                            className="group relative h-96 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl transition-transform hover:-translate-y-2"
                        >
                            <img src="https://images.unsplash.com/photo-1516307365426-bea591f05011?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Família" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-10">
                                <div className="bg-white/20 backdrop-blur-md border border-white/20 p-2 rounded-lg inline-block mb-4">
                                    <span className="text-xs font-bold text-white uppercase tracking-wider px-2">Para Famílias</span>
                                </div>
                                <h3 className="text-4xl font-bold text-white mb-4">Encontre Cuidado</h3>
                                <p className="text-gray-200 mb-6 max-w-sm">Busque cuidadores qualificados na sua região com total segurança e praticidade.</p>
                                <span className="flex items-center gap-2 text-white font-bold group-hover:gap-4 transition-all">
                                    Explorar Perfis <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </span>
                            </div>
                        </div>

                        {/* Caregiver Card */}
                        <div 
                            onClick={() => onNavigate('register')}
                            className="group relative h-96 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl transition-transform hover:-translate-y-2"
                        >
                            <img src="https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Cuidador" />
                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-indigo-900/30 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-10">
                                <div className="bg-indigo-500/30 backdrop-blur-md border border-indigo-400/30 p-2 rounded-lg inline-block mb-4">
                                    <span className="text-xs font-bold text-white uppercase tracking-wider px-2">Para Profissionais</span>
                                </div>
                                <h3 className="text-4xl font-bold text-white mb-4">Encontre Trabalho</h3>
                                <p className="text-indigo-100 mb-6 max-w-sm">Defina seus horários, seus preços e receba pagamentos garantidos. Valorizamos você.</p>
                                <span className="flex items-center gap-2 text-white font-bold group-hover:gap-4 transition-all">
                                    Criar Perfil Grátis <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- TESTIMONIALS --- */}
            <section className="py-24 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-16">O que dizem sobre nós</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div key={i} className="bg-gray-50 dark:bg-gray-900 p-8 rounded-3xl relative">
                                <div className="absolute -top-6 left-8 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-serif">"</div>
                                <p className="text-gray-600 dark:text-gray-300 italic mb-6 pt-4">{t.text}</p>
                                <div className="flex items-center gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <img src={t.photo} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{t.name}</h4>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                
                <div className="container mx-auto px-6 relative z-10 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-black mb-8">Comece agora a transformar o cuidado.</h2>
                    <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">Junte-se à comunidade que mais cresce no Brasil. Segurança, carinho e tecnologia em um só lugar.</p>
                    <button onClick={() => onNavigate('register')} className="bg-white text-indigo-600 px-12 py-5 rounded-full font-bold text-xl hover:bg-indigo-50 transition-all shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transform">
                        Criar Conta Gratuita
                    </button>
                    <p className="mt-6 text-sm text-indigo-200 opacity-80">Sem fidelidade. Cancele quando quiser.</p>
                </div>
            </section>

            <FeatureModal feature={selectedFeature} onClose={() => setSelectedFeature(null)} />
        </div>
    );
};

export default HomePage;
