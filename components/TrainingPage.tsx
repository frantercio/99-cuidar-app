import React from 'react';

const TrainingPage: React.FC = () => {
    return (
        <div className="pt-20 bg-white dark:bg-gray-800">
            <header className="py-24 bg-gray-50 dark:bg-gray-700/50 text-center">
                <div className="container mx-auto px-6">
                    <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">🎓 Treinamentos e Desenvolvimento</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">Invista em sua carreira e torne-se um profissional ainda mais completo.</p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-20 max-w-4xl">
                <div className="prose dark:prose-invert prose-lg max-w-none text-gray-600 dark:text-gray-300 space-y-12">
                    <section>
                        <h2 className="text-3xl font-bold text-gradient">A Importância da Educação Contínua</h2>
                        <p>
                            O campo do cuidado está em constante evolução. Novas técnicas, tecnologias e abordagens surgem
                            a todo momento. Manter-se atualizado não é apenas uma forma de se destacar no mercado, mas
                            também um compromisso com a qualidade de vida e a segurança de quem você cuida.
                        </p>
                        <p>
                            Cuidadores que investem em treinamentos e novas certificações demonstram profissionalismo e
                            dedicação, o que é altamente valorizado pelas famílias.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-gradient">Em Breve: Parcerias e Recursos</h2>
                        <p>
                            A 99Cuidar está trabalhando para trazer os melhores recursos de desenvolvimento profissional
                            diretamente para você. Em breve, nossa plataforma contará com:
                        </p>
                        <ul>
                            <li><strong>Parcerias com Instituições de Ensino:</strong> Descontos exclusivos em cursos de capacitação, especialização e certificação.</li>
                            <li><strong>Webinars e Workshops:</strong> Eventos online com especialistas renomados da área da saúde e do cuidado.</li>
                            <li><strong>Biblioteca de Conteúdo:</strong> Artigos, vídeos e guias práticos sobre os mais diversos temas, desde cuidados com Alzheimer até técnicas de primeiros socorros.</li>
                        </ul>
                        <p>
                            Fique de olho no seu painel e em nossas comunicações para não perder nenhuma novidade!
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default TrainingPage;