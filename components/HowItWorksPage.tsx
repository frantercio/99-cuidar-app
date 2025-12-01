import React from 'react';

const HowItWorksPage: React.FC = () => {
    return (
        <div className="pt-20 bg-white dark:bg-gray-800">
            <header className="py-24 bg-gray-50 dark:bg-gray-700/50 text-center">
                <div className="container mx-auto px-6">
                    <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">🚀 Como Funciona para Cuidadores</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">Construa sua carreira na plataforma de cuidados mais avançada do Brasil.</p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-20 max-w-4xl">
                <div className="prose dark:prose-invert prose-lg max-w-none text-gray-600 dark:text-gray-300 space-y-12">
                    <section>
                        <h2 className="text-3xl font-bold text-gradient">1. Crie um Perfil de Destaque</h2>
                        <p>
                            Seu perfil é a sua vitrine. O primeiro passo para o sucesso é criar um perfil completo e atraente.
                        </p>
                        <ul>
                            <li><strong>Biografia Detalhada:</strong> Conte sua história, sua paixão pelo cuidado e suas experiências.</li>
                            <li><strong>Especializações e Certificados:</strong> Adicione todas as suas qualificações. Isso aumenta sua credibilidade.</li>
                            <li><strong>Foto Profissional:</strong> Use uma foto de rosto clara e amigável.</li>
                            <li><strong>Serviços e Preços:</strong> Defina seus serviços e preços de forma competitiva.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-gradient">2. Gerencie sua Agenda Inteligente</h2>
                        <p>
                            No seu painel (Dashboard), você tem total controle sobre sua agenda.
                        </p>
                        <ul>
                            <li><strong>Marque seus dias indisponíveis:</strong> Isso evita que você receba propostas para datas em que não pode trabalhar.</li>
                            <li><strong>Visualize seus agendamentos:</strong> Veja todos os seus compromissos, com detalhes do cliente e do serviço.</li>
                            <li><strong>Sincronização:</strong> Sua disponibilidade é atualizada em tempo real para as famílias.</li>
                        </ul>
                    </section>
                    
                    <section>
                        <h2 className="text-3xl font-bold text-gradient">3. Comunique-se com Eficiência</h2>
                        <p>
                            Use nosso chat integrado para conversar com as famílias antes de fechar um serviço. Uma comunicação
                            clara é a chave para um bom relacionamento profissional. Responda rapidamente para mostrar que você
                            está disponível e interessado.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-gradient">4. Construa sua Reputação</h2>
                        <p>
                           Após cada serviço concluído, a família poderá deixar uma avaliação. Prestar um serviço de
                           excelência é a melhor forma de conseguir avaliações de 5 estrelas. Cuidadores com boas
                           avaliações aparecem no topo das buscas e são contratados com mais frequência.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default HowItWorksPage;