
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { WalletTransaction } from '../types';
import PaymentForm, { PaymentDetails } from './PaymentForm';

const WalletPage: React.FC = () => {
    const { currentUser, fetchWallet, requestWithdrawal, addCredits, addAlert } = useAppStore();
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Withdrawal State
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [pixKey, setPixKey] = useState('');

    // Add Credit State
    const [creditAmount, setCreditAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
    const [isPaymentValid, setIsPaymentValid] = useState(false);

    useEffect(() => {
        fetchWallet();
    }, [fetchWallet]);

    if (!currentUser || !currentUser.wallet) return null;

    const { wallet } = currentUser;
    const isCaregiver = currentUser.role === 'caregiver';

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            addAlert('Valor inválido.', 'error');
            return;
        }
        if (amount > wallet.balance) {
            addAlert('Saldo insuficiente.', 'error');
            return;
        }
        if (!pixKey) {
            addAlert('Chave Pix obrigatória.', 'error');
            return;
        }

        setIsLoading(true);
        const success = await requestWithdrawal(amount, pixKey);
        setIsLoading(false);
        if (success) {
            setIsWithdrawModalOpen(false);
            setWithdrawAmount('');
            setPixKey('');
        }
    };

    const handleAddCredit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(creditAmount);
        if (isNaN(amount) || amount <= 0) {
            addAlert('Valor inválido.', 'error');
            return;
        }
        if (!isPaymentValid && paymentMethod === 'credit_card') {
            addAlert('Dados de pagamento inválidos.', 'error');
            return;
        }

        setIsLoading(true);
        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const success = await addCredits(amount, paymentMethod);
        setIsLoading(false);
        if (success) {
            setIsAddCreditModalOpen(false);
            setCreditAmount('');
        }
    };

    const handlePaymentFormChange = (method: 'credit_card' | 'pix', details: PaymentDetails | null, isValid: boolean) => {
        setPaymentMethod(method);
        setIsPaymentValid(isValid);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Balance Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Saldo Disponível</h2>
                        <div className="text-5xl font-bold font-mono tracking-tight">
                            R$ {wallet.balance.toFixed(2)}
                        </div>
                        {isCaregiver && wallet.pendingBalance > 0 && (
                            <p className="text-sm text-yellow-400 mt-2 font-medium bg-yellow-400/10 inline-block px-3 py-1 rounded-full">
                                + R$ {wallet.pendingBalance.toFixed(2)} a liberar
                            </p>
                        )}
                    </div>
                    <div>
                        {isCaregiver ? (
                            <button 
                                onClick={() => setIsWithdrawModalOpen(true)}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                Solicitar Saque
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsAddCreditModalOpen(true)}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                Adicionar Saldo
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Histórico de Transações</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wallet.transactions.length > 0 ? (
                                wallet.transactions.map((tx) => (
                                    <tr key={tx.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                        <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{tx.description}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                                                ${tx.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : ''}
                                                ${tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : ''}
                                                ${tx.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : ''}
                                            `}>
                                                {tx.status === 'completed' ? 'Concluído' : tx.status === 'pending' ? 'Pendente' : 'Processando'}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'credit' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        Nenhuma transação encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Withdrawal Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md animate-scale-in p-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Solicitar Saque</h2>
                        <form onSubmit={handleWithdraw} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Valor (R$)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    max={wallet.balance}
                                    value={withdrawAmount} 
                                    onChange={(e) => setWithdrawAmount(e.target.value)} 
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white text-lg font-bold"
                                    placeholder="0.00"
                                />
                                <p className="text-xs text-gray-500 mt-1">Disponível: R$ {wallet.balance.toFixed(2)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Chave Pix</label>
                                <input 
                                    type="text" 
                                    value={pixKey} 
                                    onChange={(e) => setPixKey(e.target.value)} 
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                                    placeholder="CPF, Email ou Celular"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsWithdrawModalOpen(false)} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-xl">Cancelar</button>
                                <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center">
                                    {isLoading ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Confirmar Saque'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Credits Modal */}
            {isAddCreditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg animate-scale-in p-8 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Adicionar Saldo</h2>
                        <form onSubmit={handleAddCredit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Valor da Recarga (R$)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={creditAmount} 
                                    onChange={(e) => setCreditAmount(e.target.value)} 
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white text-lg font-bold"
                                    placeholder="0.00"
                                />
                            </div>
                            
                            <PaymentForm onChange={handlePaymentFormChange} />

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsAddCreditModalOpen(false)} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-xl">Cancelar</button>
                                <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center">
                                    {isLoading ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Confirmar Pagamento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletPage;
