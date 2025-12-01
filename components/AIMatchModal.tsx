
import React, { useState } from 'react';

export const specializationsOptions = [
    { value: 'alzheimer', label: 'Alzheimer', icon: '🧠' },
    { value: 'parkinson', label: 'Parkinson', icon: '🤝' },
    { value: 'pos-cirurgico', label: 'Pós-cirúrgico', icon: '🏥' },
    { value: 'diabetes', label: 'Diabetes', icon: '💉' },
    { value: 'demencia', label: 'Demência', icon: '🧩' },
    { value: 'mobilidade-reduzida', label: 'Mobilidade Reduzida', icon: '♿' },
    { value: 'cuidados-pediatricos', label: 'Pediátricos', icon: '👶' },
    { value: 'cuidados-paliativos', label: 'Paliativos', icon: '❤️‍🩹' },
];

export interface AIPrefs {
    specializations: string[];
    experience: string;
    keywords: string[];
}

interface AIMatchModalProps {
    onClose: () => void;
    onFindMatches: (prefs: AIPrefs) => void;
}

const AIMatchModal: React.FC<AIMatchModalProps> = ({ onClose, onFindMatches }) => {
    const [step, setStep] = useState(1);
    const [prefs, setPrefs] = useState<AIPrefs>({
        specializations: [],
        experience: '',
        keywords: [],
    });
    
    const personalityKeywords = ['Calmo', 'Paciente', 'Energético', 'Comunicativo', 'Organizado', 'Criativo'];

    const handleSpecializationChange = (spec: string) => {
        setPrefs(prev => ({
            ...prev,
            specializations: prev.specializations.includes(spec) 
                ? prev.specializations.filter(s => s !== spec) 
                : [...prev.specializations, spec]
        }));
    };

    const handleKeywordChange = (keyword: string) => {
        setPrefs(prev => ({
            ...prev,
            keywords: prev.keywords.includes(keyword)
                ? prev.keywords.filter(k => k !== keyword)
                : [...prev.keywords, keyword]
        }));
    };

    const handleSubmit = () => {
        onFindMatches(prefs);
        onClose();
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Quais especializações são importantes?</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Selecione as necessidades principais para o cuidado.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {specializationsOptions.map(spec => (
                                <label key={spec.value} className={`group flex flex-col items-center justify-center text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${prefs.specializations.includes(spec.value) ? 'border-indigo-500' : 'border-transparent hover:border-indigo-300 dark:hover:border-indigo-600'}`}>
                                    <input type="checkbox" checked={prefs.specializations.includes(spec.value)} onChange={() => handleSpecializationChange(spec.value)} className="sr-only" />
                                    <div className="text-3xl mb-2">{spec.icon}</div>
                                    <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">{spec.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            case 2:
                return (
                     <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Qual o nível de experiência desejado?</h3>
                        <select value={prefs.experience} onChange={e => setPrefs({...prefs, experience: e.target.value})} className="w-full px-8 py-5 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
                            <option value="">Qualquer experiência</option>
                            <option value="0-2">0-2 anos</option>
                            <option value="3-5">3-5 anos</option>
                            <option value="6-10">6-10 anos</option>
                            <option value="10+">Mais de 10 anos</option>
                        </select>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Que traços de personalidade você valoriza?</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Isso ajuda a encontrar um cuidador com o perfil certo.</p>
                        <div className="flex flex-wrap gap-3">
                            {personalityKeywords.map(keyword => (
                                <button key={keyword} onClick={() => handleKeywordChange(keyword)} className={`px-4 py-2 rounded-full font-semibold transition-colors ${prefs.keywords.includes(keyword) ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                    {keyword}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl animate-scale-in flex flex-col max-h-[90vh]">
                 <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Assistente IA Match 🤖</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>

                <div className="p-8 flex-grow overflow-y-auto">
                    {renderStep()}
                </div>

                <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl flex justify-between items-center flex-shrink-0">
                    <div className="text-sm text-gray-500">Passo {step} de 3</div>
                    <div className="flex gap-4">
                        {step > 1 && (
                            <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl font-semibold transition-colors">
                                Voltar
                            </button>
                        )}
                        {step < 3 ? (
                            <button onClick={() => setStep(s => s + 1)} className="px-6 py-3 btn-gradient text-white rounded-xl font-semibold shadow-lg">
                                Próximo
                            </button>
                        ) : (
                             <button onClick={handleSubmit} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg">
                                Encontrar Matches
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIMatchModal;