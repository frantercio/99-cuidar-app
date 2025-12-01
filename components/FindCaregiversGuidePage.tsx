import React from 'react';

const FindCaregiversGuidePage: React.FC = () => {
    return (
        <div className="pt-20 bg-white dark:bg-gray-800">
            <header className="py-24 bg-gray-50 dark:bg-gray-700/50 text-center">
                <div className="container mx-auto px-6">
                    <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">🔍 Como Encontrar o Cuidador Ideal</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">Um guia passo a passo para usar nossa plataforma.</p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-20 max-w-4xl">
                <div className="prose dark:prose-invert prose-lg max-w-none text-gray-600 dark:text-gray-300 space-y-12">
                    <section>
                        <h2 className="text-3xl font-bold text-gradient">Passo 1: A Busca Inteligente</h2>
                        <p>
                            Comece sua busca na página "Cuidadores". Utilize a barra de pesquisa para buscar por nome,
                            especializações (como "Alzheimer") ou qualquer palavra-chave relevante.
                        </p>
                        <p>
                            <strong>Dica Pro:</strong> Seja específico! Se você precisa de alguém com experiência em
                            cuidados pós-cirúrgicos, digite "pós-cirúrgico" na busca para refinar os resultados.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-gradient">Passo 2: Use os Filtros a seu Favor</h2>
                        <p>
                            Nossos filtros são poderosos. Você pode refinar sua busca por:
                        </p>
                        <ul>
                            <li><strong>Localização:</strong> Permita o acesso à sua geolocalização para que nosso sistema encontre automaticamente cuidadores na sua cidade.</li>
                            <li><strong>Disponibilidade:</strong> Precisa de alguém para hoje? Use o filtro "Disponível Hoje" para ver quem está pronto para começar.</li>
                            <li><strong>Certificações:</strong> Filtre por cuidadores que possuem certificações específicas, como "Primeiros Socorros".</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-gradient">Passo 3: Conheça o "IA Match" 🤖</h2>
                        <p>
                            Para uma experiência ainda mais personalizada, use nosso assistente <strong>IA Match</strong>. Ao clicar no botão, você
                            informará ao nosso sistema exatamente o que precisa:
                        </p>
                        <ul>
                            <li>As especializações mais importantes.</li>
                            <li>O nível de experiência que você deseja.</li>
                            <li>Traços de personalidade que valoriza, como "paciente" ou "comunicativo".</li>
                        </ul>
                        <p>
                            Nossa IA analisará todos os perfis e apresentará os cuidadores mais compatíveis com uma pontuação de
                            "Match", economizando seu tempo e garantindo a escolha certa.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default FindCaregiversGuidePage;