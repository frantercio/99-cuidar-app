
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import PaymentForm, { PaymentDetails } from './PaymentForm';

interface HighlightModalProps {
    userId: number;
    onClose: () => void;
}

const HIGHLIGHT_PRICE = 29.90;
const DURATION_DAYS = 7;

const HighlightModal: React.FC<HighlightModalProps> = ({ userId, onClose }) => {
    const { highlightProfile, addAlert } = useAppStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPaymentValid, setIsPaymentValid] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');

    const handlePaymentChange = (method: 'credit_card' | 'pix', details: PaymentDetails | null, isValid: boolean) => {
        setPaymentMethod(method);
        setIsPaymentValid(isValid);
    };

    const handleConfirm = async () => {
        if (!isPaymentValid) {
            addAlert('Por favor, complete os dados de pagamento.', 'error');
            return;
        }

        setIsProcessing(true);
        
        // Simula processamento do pagamento
        await new Promise(resolve => setTimeout(resolve, 2000));

        await highlightProfile(userId);
        setIsProcessing(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg animate-scale-in overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b dark:border-gray-700 bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                            Destacar Perfil
                        </h2>
                        <p className="text-white/90 text-sm">Apareça no topo das buscas!</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-grow space-y-6">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800 text-center">
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">Valor do investimento</p>
                        <div className="text-3xl font-bold text-gray-800 dark:text-white">
                            R$ {HIGHLIGHT_PRICE.toFixed(2).replace('.', ',')}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Duração: <span className="font-bold">{DURATION_DAYS} dias</span> de visibilidade máxima</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Forma de Pagamento</h3>
                        <PaymentForm onChange={handlePaymentChange} />
                    </div>
                </div>

                <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl flex gap-3">
                    <button 
                        onClick={onClose}
                        disabled={isProcessing}
                        className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-xl transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!isPaymentValid || isProcessing}
                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                    >
                        {isProcessing ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processando...
                            </>
                        ) : (
                            'Confirmar Pagamento'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HighlightModal;
