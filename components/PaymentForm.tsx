
import React, { useState, useEffect } from 'react';

export interface PaymentDetails {
    cardNumber: string;
    cardName: string;
    expiry: string;
    cvc: string;
}

interface PaymentFormProps {
    onChange: (method: 'credit_card' | 'pix', details: PaymentDetails | null, isValid: boolean) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onChange }) => {
    const [method, setMethod] = useState<'credit_card' | 'pix'>('credit_card');
    const [details, setDetails] = useState<PaymentDetails>({
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvc: ''
    });
    const [pixCode] = useState("00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR591399Cuidar Ltda6008Sao Paulo62070503***6304");
    const [copied, setCopied] = useState(false);

    // Validate immediately when method changes
    useEffect(() => {
        validateAndNotify(method, details);
    }, [method]);

    const validateAndNotify = (currentMethod: 'credit_card' | 'pix', currentDetails: PaymentDetails) => {
        let isValid = false;

        if (currentMethod === 'pix') {
            isValid = true; // Pix is valid as long as it's selected for this flow
        } else {
            isValid = 
                currentDetails.cardNumber.replace(/\s/g, '').length === 16 &&
                currentDetails.cardName.length > 3 &&
                currentDetails.expiry.length === 5 &&
                currentDetails.cvc.length >= 3;
        }

        onChange(currentMethod, currentMethod === 'credit_card' ? currentDetails : null, isValid);
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiry = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleChange = (field: keyof PaymentDetails, value: string) => {
        let formattedValue = value;
        if (field === 'cardNumber') formattedValue = formatCardNumber(value);
        if (field === 'expiry') formattedValue = formatExpiry(value);
        if (field === 'cvc') formattedValue = value.replace(/\D/g, '').slice(0, 4);
        if (field === 'cardName') formattedValue = value.toUpperCase();

        const newDetails = { ...details, [field]: formattedValue };
        setDetails(newDetails);
        validateAndNotify(method, newDetails);
    };

    const handleCopyPix = () => {
        navigator.clipboard.writeText(pixCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Payment Method Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                <button
                    onClick={() => setMethod('credit_card')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                        method === 'credit_card' 
                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                    Cartão de Crédito
                </button>
                <button
                    onClick={() => setMethod('pix')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                        method === 'pix' 
                        ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    PIX
                </button>
            </div>

            {method === 'credit_card' ? (
                <div className="space-y-6 animate-fade-in">
                    {/* Visual Card Representation */}
                    <div className="relative w-full h-56 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-800 rounded-2xl shadow-2xl text-white p-6 overflow-hidden transform transition-transform hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
                        
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="w-12 h-8 bg-yellow-400/80 rounded-md flex items-center justify-center">
                                <div className="w-8 h-5 border border-yellow-600/50 rounded-sm grid grid-cols-4 gap-0.5 p-0.5">
                                    <div className="col-span-1 bg-yellow-600/50 rounded-sm"></div>
                                    <div className="col-span-2 bg-yellow-600/30 rounded-sm"></div>
                                    <div className="col-span-1 bg-yellow-600/50 rounded-sm"></div>
                                </div>
                            </div>
                            <div className="text-xl font-bold italic tracking-widest opacity-80">VISA</div>
                        </div>

                        <div className="mb-6 relative z-10">
                            <div className="text-2xl font-mono tracking-widest shadow-black drop-shadow-md">
                                {details.cardNumber || '•••• •••• •••• ••••'}
                            </div>
                        </div>

                        <div className="flex justify-between items-end relative z-10">
                            <div>
                                <div className="text-xs opacity-75 uppercase mb-1">Nome do Titular</div>
                                <div className="font-medium tracking-wide uppercase truncate max-w-[200px]">
                                    {details.cardName || 'NOME IMPRESSO'}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs opacity-75 uppercase mb-1">Validade</div>
                                <div className="font-medium font-mono">{details.expiry || 'MM/AA'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Número do Cartão</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={details.cardNumber}
                                    onChange={(e) => handleChange('cardNumber', e.target.value)}
                                    maxLength={19}
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono"
                                />
                                <svg className="w-6 h-6 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                            </div>
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nome do Titular</label>
                            <input 
                                type="text" 
                                value={details.cardName}
                                onChange={(e) => handleChange('cardName', e.target.value)}
                                placeholder="COMO NO CARTÃO"
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors uppercase"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Validade</label>
                            <input 
                                type="text" 
                                value={details.expiry}
                                onChange={(e) => handleChange('expiry', e.target.value)}
                                maxLength={5}
                                placeholder="MM/AA"
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-center"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">CVV</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={details.cvc}
                                    onChange={(e) => handleChange('cvc', e.target.value)}
                                    maxLength={4}
                                    placeholder="123"
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-center"
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        Pagamento seguro criptografado de ponta a ponta.
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in text-center">
                    <div className="bg-white p-4 rounded-xl border-2 border-emerald-100 dark:border-emerald-900 inline-block shadow-lg">
                        {/* QR Code Placeholder - In a real app this would be generated */}
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}&color=059669`} 
                            alt="QR Code PIX" 
                            className="w-48 h-48 mx-auto rounded-lg"
                        />
                    </div>
                    
                    <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 font-medium">Escaneie o QR Code ou use o Copia e Cola:</p>
                        <div className="flex items-center gap-2">
                            <input 
                                type="text" 
                                readOnly 
                                value={pixCode}
                                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-500 text-xs p-3 rounded-lg truncate font-mono"
                            />
                            <button 
                                onClick={handleCopyPix}
                                className={`p-3 rounded-lg font-bold text-white transition-all ${copied ? 'bg-green-500' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            >
                                {copied ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-left flex gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Aprovação Imediata</h4>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Seu agendamento será confirmado automaticamente assim que o pagamento for processado pelo banco.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentForm;
