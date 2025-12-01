import React from 'react';

const HowToChoosePage: React.FC = () => {
    return (
        <div className="pt-20 bg-white dark:bg-gray-800">
            <header className="py-24 bg-gray-50 dark:bg-gray-700/50 text-center">
                <div className="container mx-auto px-6">
                    <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">✅ Como Escolher o Melhor Cuidador</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">Dicas para tomar a decisão certa com segurança.</p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-20 max-w-4xl">
                <div className="prose dark:prose-invert prose-lg max-w-none text-gray-600 dark:text-gray-300 space-y-12">
                    <section>
                        <h2 className="text-3xl font-bold text-gradient">1. Analise o Perfil com Atenção</h2>
                        <p>
                            O perfil do cuidador é seu cartão de visitas. Fique de olho em:
                        </p>
                        <ul>
                            <li><strong>Biografia (Sobre mim):</strong> Leia a história do profissional. Uma boa biografia revela paixão e dedicação.</li>
                            <li><strong>Especializações e Certificações:</strong> Verifique se as habilidades do cuidador correspondem às suas necessidades.</li>
                            <li><strong>Experiência:</strong> O tempo de experiência pode ser um bom indicador de maturidade profissional.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-gradient">2. Leia as Avaliações de Outras Famílias</h2>
                        <p>
                            As avaliações são uma das ferramentas mais poderosas à sua disposição. Leia os comentários de outras
                            famílias para entender como foi a experiência delas. A pontuação de estrelas é importante, mas os
                            detalhes nos comentários podem revelar muito sobre a personalidade e a ética de trabalho do cuidador.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-gradient">3. Use o Chat para Iniciar uma Conversa</h2>
                        <p>
                            Não hesite em usar o botão "Chat" no perfil. Fazer algumas perguntas antes de agendar pode fazer toda a diferença. Sugestões de perguntas:
                        </p>
                        <ul>
                            <li>"Qual foi sua experiência com pacientes que têm [necessidade específica]?"</li>
                            <li>"Como você lida com situações de emergência?"</li>
                            <li>"O que você mais gosta em ser um cuidador?"</li>
                        </ul>
                        <p>A forma como o cuidador responde pode dizer muito sobre seu profissionalismo e empatia.</p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-gradient">4. Entenda o Selo de Segurança</h2>
                        <p>
                           Procure pelo selo <strong>Verificado Pro</strong> e pela seção "Segurança e Confiança" no perfil. Isso indica que o
                           cuidador passou por nosso rigoroso processo de verificação de antecedentes e identidade,
                           oferecendo uma camada extra de tranquilidade para sua família.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default HowToChoosePage;