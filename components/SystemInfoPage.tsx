
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

type Tab = 'family' | 'caregiver';

interface Step {
    title: string;
    description: string;
    icon: React.ReactNode;
}

interface FaqItem {
    question: string;
    answer: string;
}

const SystemInfoPage: React.FC = () => {
    const { navigate } = useAppStore();
    const [activeTab, setActiveTab] = useState<Tab>('family');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const familySteps: Step[] = [
        {
            title: "1. Busca Inteligente",
            description: "Utilize nossa IA ou filtros avançados para encontrar cuidadores ideais baseados em localização, especialidade (ex: Alzheimer, Pós-cirúrgico) e experiência.",
            icon: <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        },
        {
            title: "2. Verificação de Perfil",
            description: "Analise perfis completos com fotos, certificações validadas, antecedentes criminais checados e avaliações reais de outras famílias.",
            icon: <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        {
            title: "3. Agendamento & Pagamento",
            description: "Agende visitas únicas ou recorrentes. O pagamento é feito via cartão ou Pix e fica retido em segurança até a conclusão do serviço.",
            icon: <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        },
        {
            title: "4. Acompanhamento em Tempo Real",
            description: "Receba notificações quando o cuidador fizer check-in e check-out via GPS. Acompanhe o diário de cuidados com fotos e anotações.",
            icon: <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        }
    ];

    const caregiverSteps: Step[] = [
        {
            title: "1. Cadastro Profissional",
            description: "Crie seu perfil gratuitamente. Adicione suas experiências, especializações, fotos e documentos para validação.",
            icon: <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        },
        {
            title: "2. Verificação de Segurança",
            description: "Nossa equipe analisa seus antecedentes e documentos. Aprovado, você ganha o selo 'Verificado Pro' e destaque nas buscas.",
            icon: <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        },
        {
            title: "3. Receba Propostas",
            description: "Defina seus preços e disponibilidade. Receba solicitações de famílias próximas e aceite as que se encaixam na sua agenda.",
            icon: <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        },
        {
            title: "4. Recebimento Garantido",
            description: "Realize o serviço, faça o check-in/out pelo app e receba o pagamento diretamente na sua carteira digital, sem calotes.",
            icon: <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        }
    ];

    const faqs: FaqItem[] = [
        {
            question: "Como funciona o pagamento?",
            answer: "O pagamento é feito pela família no momento do agendamento (Cartão ou Pix) e fica retido na plataforma. O valor é liberado para a carteira do cuidador automaticamente após a conclusão do serviço confirmada pelo check-out."
        },
        {
            question: "É seguro contratar pela plataforma?",
            answer: "Sim! Todos os cuidadores com o selo 'Verificado Pro' passaram por checagem de antecedentes criminais, validação de identidade e análise de documentos. Além disso, os serviços contam com seguro de responsabilidade."
        },
        {
            question: "O que acontece se o cuidador cancelar?",
            answer: "Se um cuidador cancelar, o valor é estornado integralmente para a família ou convertido em créditos. Nossa equipe de suporte ajuda a encontrar um substituto rapidamente."
        },
        {
            question: "Quanto custa usar a plataforma?",
            answer: "O cadastro é gratuito para todos. Cobramos uma pequena taxa de serviço inclusa no valor final para famílias e uma taxa administrativa sobre os ganhos dos cuidadores para manter a segurança e a tecnologia do sistema."
        }
    ];

    const currentSteps = activeTab === 'family' ? familySteps : caregiverSteps;
    const accentColor = activeTab === 'family' ? 'from-green-500 to-teal-500' : 'from-indigo-500 to-purple-600';
    const textColor = activeTab === 'family' ? 'text-teal-600' : 'text-indigo-600';

    return (
        <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="relative bg-white dark:bg-gray-800 pb-20 pt-10 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                        Entenda como a <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">99Cuidar</span> Funciona
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
                        Tecnologia, segurança e humanidade conectadas para oferecer a melhor experiência de cuidado do Brasil.
                    </p>
                    
                    {/* Toggle Switch */}
                    <div className="inline-flex bg-gray-100 dark:bg-gray-700 p-1.5 rounded-2xl shadow-inner">
                        <button 
                            onClick={() => setActiveTab('family')}
                            className={`px-8 py-3 rounded-xl text-lg font-bold transition-all duration-300 ${activeTab === 'family' ? 'bg-white dark:bg-gray-600 text-teal-600 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            Para Famílias
                        </button>
                        <button 
                            onClick={() => setActiveTab('caregiver')}
                            className={`px-8 py-3 rounded-xl text-lg font-bold transition-all duration-300 ${activeTab === 'caregiver' ? 'bg-white dark:bg-gray-600 text-indigo-600 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            Para Cuidadores
                        </button>
                    </div>
                </div>
            </header>

            {/* Timeline Section */}
            <section className="py-20 container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent dark:before:via-gray-700">
                        {currentSteps.map((step, index) => (
                            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                                {/* Icon Bubble */}
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-gray-900 bg-gradient-to-r ${accentColor} shadow-xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                                    {step.icon}
                                </div>
                                
                                {/* Content Card */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
                                    <h3 className={`font-bold text-xl mb-2 ${textColor} dark:text-white`}>{step.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust & Safety Section */}
            <section className="py-20 bg-white dark:bg-gray-800">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20"></div>
                        
                        <div className="relative z-10 text-center">
                            <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/30">
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <h2 className="text-4xl font-bold mb-6">Segurança em Primeiro Lugar</h2>
                            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                                Na 99Cuidar, não abrimos mão da confiança. Implementamos um processo rigoroso de validação de todos os profissionais.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                    <h4 className="font-bold text-lg mb-2 text-green-400">1. Antecedentes Criminais</h4>
                                    <p className="text-sm text-gray-300">Verificação automática em bases de dados nacionais e estaduais.</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                    <h4 className="font-bold text-lg mb-2 text-green-400">2. Identidade & Biometria</h4>
                                    <p className="text-sm text-gray-300">Validação de documentos oficiais e reconhecimento facial.</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                    <h4 className="font-bold text-lg mb-2 text-green-400">3. Certificações</h4>
                                    <p className="text-sm text-gray-300">Checagem de diplomas e certificados técnicos apresentados.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 container mx-auto px-6">
                <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">Perguntas Frequentes</h2>
                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                            <button 
                                onClick={() => toggleFaq(index)}
                                className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                            >
                                <span className="font-bold text-lg text-gray-800 dark:text-white">{faq.question}</span>
                                <svg className={`w-6 h-6 transform transition-transform duration-300 text-gray-500 ${openFaq === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <div className={`px-6 text-gray-600 dark:text-gray-300 transition-all duration-300 ease-in-out overflow-hidden ${openFaq === index ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
                        Pronto para começar?
                    </h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <button onClick={() => navigate('register')} className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-lg">
                            Criar Conta Grátis
                        </button>
                        <button onClick={() => navigate('marketplace')} className="px-10 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-bold rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 text-lg">
                            Explorar Cuidadores
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SystemInfoPage;
