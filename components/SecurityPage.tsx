import React from 'react';

const SecurityPage: React.FC = () => {
    return (
        <div className="pt-20 bg-white dark:bg-gray-800">
            <header className="py-24 bg-gray-50 dark:bg-gray-700/50 text-center">
                <div className="container mx-auto px-6">
                    <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">🛡️ Segurança Total: Nossa Prioridade</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">Entenda como garantimos a sua tranquilidade.</p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-20 max-w-4xl">
                 <div className="prose dark:prose-invert prose-lg max-w-none text-gray-600 dark:text-gray-300 space-y-12">
                    <section>
                        <h2 className="text-3xl font-bold text-gradient">Nosso Compromisso com a Segurança</h2>
                        <p>
                           Na 99Cuidar, entendemos que a confiança é a base de qualquer relação de cuidado. Por isso,
                           implementamos um processo de verificação rigoroso para garantir que apenas os profissionais
                           mais qualificados e confiáveis façam parte da nossa plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-gradient">O que é o Selo "Verificado Pro"?</h2>
                        <p>
                            O selo <strong>Verificado Pro</strong> é a garantia de que o cuidador passou com sucesso por todas as etapas
                            essenciais de nossa verificação de segurança. Ele é um atalho visual para você identificar
                            rapidamente os profissionais que atendem aos nossos mais altos padrões.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-gradient">Etapas da Nossa Verificação</h2>
                        <div className="space-y-8 mt-6">
                            <div className="flex items-start gap-6">
                                <div className="text-4xl">1.</div>
                                <div>
                                    <h3 className="text-2xl font-semibold">Verificação de Antecedentes</h3>
                                    <p>Realizamos uma checagem completa de antecedentes criminais para garantir que o profissional não tenha nenhum histórico que o desqualifique para a função de cuidador.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6">
                                <div className="text-4xl">2.</div>
                                <div>
                                    <h3 className="text-2xl font-semibold">Verificação de Identidade e Documentos</h3>
                                    <p>Validamos os documentos de identidade do cuidador (como RG e CPF) para confirmar que a pessoa é quem diz ser. Também verificamos a autenticidade das certificações e diplomas apresentados.</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-6">
                                <div className="text-4xl">3.</div>
                                <div>
                                    <h3 className="text-2xl font-semibold">Avaliações da Comunidade</h3>
                                    <p>Monitoramos constantemente as avaliações e feedbacks das famílias. Um desempenho consistentemente baixo ou violações de nossos termos de uso podem levar à suspensão da conta do cuidador.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default SecurityPage;