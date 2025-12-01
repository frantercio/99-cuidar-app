import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
// Note: In a real environment, you would import from "@google/genai"
// import { GoogleGenAI } from "@google/genai";

interface AIBioGeneratorModalProps {
    onClose: () => void;
    onBioGenerated: (newBio: string) => void;
    currentKeywords: string[];
}

const AIBioGeneratorModal: React.FC<AIBioGeneratorModalProps> = ({ onClose, onBioGenerated, currentKeywords }) => {
    const { addAlert } = useAppStore();
    const [keywords, setKeywords] = useState('');
    const [generatedBio, setGeneratedBio] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateBio = async () => {
        if (!keywords.trim()) {
            addAlert('Por favor, insira algumas palavras-chave.', 'error');
            return;
        }
        setIsLoading(true);
        setGeneratedBio('');

        const prompt = `
            Você é um especialista em marketing pessoal para cuidadores de idosos.
            Sua tarefa é criar uma biografia profissional, calorosa e atraente para um cuidador.
            A biografia deve ter cerca de 2-3 parágrafos e destacar as qualidades e experiências do cuidador.
            Use as seguintes palavras-chave e informações como base: ${currentKeywords.join(', ')}, ${keywords}.
            Estruture o texto de forma coesa, começando com uma introdução, detalhando a experiência e finalizando com uma declaração de paixão pelo cuidado.
            Responda apenas com o texto da biografia.
        `;

        // SIMULATED Gemini API Call
        try {
            // In a real app:
            // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            // const text = response.text;
            
            // Mocked response for demonstration:
            await new Promise(resolve => setTimeout(resolve, 1500));
            const text = `Com uma trajetória de ${currentKeywords.find(k => k.includes('anos')) || 'vários anos'} dedicada ao cuidado, sou um profissional que une técnica e um profundo senso de humanidade. Minha especialização em ${currentKeywords.filter(k => !k.includes('anos')).join(' e ')} me proporcionou a competência necessária para lidar com os desafios mais complexos, sempre com foco no bem-estar e na dignidade do paciente.
            
Para mim, cuidar vai além dos procedimentos técnicos; é sobre criar um vínculo de confiança e oferecer companhia. Sou conhecido por ser ${keywords}, qualidades que considero essenciais para criar um ambiente seguro e acolhedor. Minha maior satisfação é ver a melhora na qualidade de vida daqueles que estão sob meus cuidados, oferecendo tranquilidade não apenas ao paciente, mas a toda a sua família.
            
Estou comprometido em oferecer um serviço de excelência, pautado pelo respeito, carinho e profissionalismo. Busco constantemente me aprimorar para garantir o melhor cuidado possível.`;

            setGeneratedBio(text);

        } catch (error) {
            console.error("Error generating bio:", error);
            addAlert('Ocorreu um erro ao gerar a biografia. Tente novamente.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl animate-scale-in flex flex-col max-h-[90vh]">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Assistente de Biografia com IA ✨</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>

                <div className="p-8 flex-grow overflow-y-auto space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Adicione palavras-chave</label>
                        <input
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                            placeholder="Ex: paciente, comunicativo, proativo"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Suas especializações e anos de experiência já foram adicionados.
                        </p>
                    </div>

                    <div className="text-center">
                        <button onClick={handleGenerateBio} disabled={isLoading} className="px-6 py-3 btn-gradient text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-wait">
                            {isLoading ? 'Gerando...' : 'Gerar Biografia'}
                        </button>
                    </div>
                    
                    {isLoading && (
                        <div className="text-center p-8">
                             <svg className="animate-spin mx-auto h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-gray-500">Nossa IA está criando uma biografia incrível para você...</p>
                        </div>
                    )}

                    {generatedBio && !isLoading && (
                        <div className="space-y-4 animate-fade-in">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Biografia Gerada:</label>
                            <textarea
                                readOnly
                                value={generatedBio}
                                rows={8}
                                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                            />
                        </div>
                    )}
                </div>

                <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl flex justify-end gap-4 flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl font-semibold transition-colors">
                        Cancelar
                    </button>
                    <button onClick={() => onBioGenerated(generatedBio)} disabled={!generatedBio || isLoading} className="px-6 py-3 btn-gradient text-white rounded-xl font-semibold shadow-lg disabled:opacity-50">
                        Usar esta Biografia
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIBioGeneratorModal;
