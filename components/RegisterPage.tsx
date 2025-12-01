


import React, { useState, useEffect, useMemo } from 'react';
import { User, Caregiver, Client, Service } from '../types';
import { useAppStore } from '../store/useAppStore';

const specializationsOptions = [
    { value: 'alzheimer', label: 'Alzheimer', icon: '🧠' },
    { value: 'parkinson', label: 'Parkinson', icon: '🤝' },
    { value: 'pos-cirurgico', label: 'Pós-cirúrgico', icon: '🏥' },
    { value: 'diabetes', label: 'Diabetes', icon: '💉' },
    { value: 'demencia', label: 'Demência', icon: '🧩' },
    { value: 'mobilidade-reduzida', label: 'Mobilidade Reduzida', icon: '♿' },
    { value: 'cuidados-pediatricos', label: 'Cuidados Pediátricos', icon: '👶' },
    { value: 'cuidados-paliativos', label: 'Cuidados Paliativos', icon: '❤️‍🩹' },
];

const RegisterPage: React.FC = () => {
    const { register, navigate, addAlert, caregivers } = useAppStore();
    
    const uniqueCities: string[] = useMemo(() => {
        const cities = caregivers.map(c => c.city);
        // FIX: Replaced Set-based unique logic with a filter-based approach to resolve type inference issues.
        return cities.filter((value, index, self) => self.indexOf(value) === index).sort();
    }, [caregivers]);

    const [role, setRole] = useState<'client' | 'caregiver' | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Caregiver specific fields
    const [experience, setExperience] = useState('');
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [bio, setBio] = useState('');

    // Validation State
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'bg-gray-200', width: '0%' });
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
    });

    useEffect(() => {
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Formato de email inválido.');
        } else {
            setEmailError('');
        }
    }, [email]);
    
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        if (rawValue.length > 0) {
            formattedValue = '(' + rawValue.substring(0, 2);
        }
        if (rawValue.length > 2) {
            formattedValue += ') ' + rawValue.substring(2, 7);
        }
        if (rawValue.length > 7) {
            formattedValue += '-' + rawValue.substring(7, 11);
        }
        setPhone(formattedValue);

        if (phone && rawValue.length !== 11) {
             setPhoneError('Telefone deve ter 11 dígitos.');
        } else {
            setPhoneError('');
        }
    };

    useEffect(() => {
        const criteria = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            specialChar: /[^A-Za-z0-9]/.test(password),
        };
        setPasswordCriteria(criteria);

        const score = Object.values(criteria).filter(Boolean).length;
        
        const strengthLevels = {
            0: { label: '', color: 'bg-gray-200', width: '0%' },
            1: { label: 'Muito Fraca', color: 'bg-red-500', width: '20%' },
            2: { label: 'Fraca', color: 'bg-orange-500', width: '40%' },
            3: { label: 'Média', color: 'bg-yellow-500', width: '60%' },
            4: { label: 'Forte', color: 'bg-blue-500', width: '80%' },
            5: { label: 'Muito Forte', color: 'bg-green-500', width: '100%' },
        };

        setPasswordStrength({
            score,
            ...strengthLevels[score as keyof typeof strengthLevels]
        });
    }, [password]);

    const handleSpecializationChange = (spec: string) => {
        setSpecializations(prev => 
            prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
        );
    };

    const isFormValid = () => {
        if (!role) return false;
        if (!name || !email || !city) return false;
        if (emailError) return false;
        const rawPhone = phone.replace(/\D/g, '');
        if (rawPhone.length !== 11) return false;
        if (passwordStrength.score < 4) return false; // Must be 'Forte' or 'Muito Forte'
        if (password !== confirmPassword) return false;
        
        if (role === 'caregiver') {
            if (!experience || specializations.length === 0 || bio.length < 100) return false;
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isFormValid()) {
            addAlert("Por favor, preencha todos os campos corretamente.", 'error');
            return;
        }
        
        let newUser: Omit<User, 'id'>;

        if (role === 'caregiver') {
            const defaultServices: Service[] = [
                { id: 's1', name: 'Diário', icon: '☀️', price: 150, description: '10 horas de cuidado personalizado.' },
                { id: 's2', name: 'Noturno', icon: '🌙', price: 170, description: 'Monitoramento e cuidados noturnos.' },
                { id: 's3', name: '24h', icon: '⏰', price: 300, description: 'Cuidado integral e dedicação exclusiva.' },
                { id: 's4', name: 'Folga', icon: '🍃', price: 130, description: 'Suporte temporário para famílias.' },
                { id: 's5', name: 'Companhia', icon: '☕', price: 110, description: 'Companhia e atividades sociais.' },
            ];

            newUser = {
                role: 'caregiver',
                name, email, phone, city, experience, specializations, bio, password,
                rating: 5.0, reviewsCount: 0, reviews: [],
                services: defaultServices,
                photo: "👩‍⚕️", verified: false, online: true, responseTime: '30 min', completedJobs: 0,
                certifications: [],
                availability: 'today',
                notificationPreferences: {
                    newBookings: true,
                    cancellations: true,
                    newReviews: true,
                },
                security: {
                    backgroundCheck: 'pending',
                    idVerification: 'pending',
                    insurance: false,
                },
            } as Omit<Caregiver, 'id'>;
        } else {
             newUser = {
                role: 'client',
                name, email, phone, city, password,
                photo: '👤',
                notificationPreferences: { bookingConfirmations: true, newMessages: true, platformUpdates: false }
            } as Omit<Client, 'id'>;
        }

        register(newUser);
    };

    const renderCaregiverFields = () => (
        <>
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Anos de Experiência</label>
                <select value={experience} onChange={e => setExperience(e.target.value)} required className="w-full px-8 py-5 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
                    <option value="">Selecione o tempo</option>
                    <option value="0-2">0-2 anos</option>
                    <option value="3-5">3-5 anos</option>
                    <option value="6-10">6-10 anos</option>
                    <option value="10+">10+ anos</option>
                </select>
            </div>
            <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Especializações (Selecione todas que se aplicam)</label>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {specializationsOptions.map(spec => (
                        <label key={spec.value} className={`group flex flex-col items-center justify-center text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${specializations.includes(spec.value) ? 'border-indigo-500' : 'border-transparent hover:border-indigo-300 dark:hover:border-indigo-600'}`}>
                            <input type="checkbox" checked={specializations.includes(spec.value)} onChange={() => handleSpecializationChange(spec.value)} className="sr-only" />
                            <div className="text-3xl mb-2">{spec.icon}</div>
                            <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">{spec.label}</span>
                        </label>
                    ))}
                 </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Apresentação Profissional</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} required minLength={100} className="w-full px-8 py-5 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" placeholder="Conte sobre sua experiência, certificações, etc."></textarea>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-right">
                   <span className={bio.length < 100 ? 'text-red-500' : 'text-green-500'}>{bio.length}</span>/100+ caracteres
                </div>
            </div>
        </>
    );
    
    const PasswordCriterion: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
        <li className={`flex items-center transition-colors ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                {met ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />}
            </svg>
            {text}
        </li>
    );

    return (
        <div className="pt-20 min-h-screen flex items-center justify-center py-24">
            <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-2xl w-full max-w-5xl mx-6 relative overflow-hidden animate-scale-in">
                 <div className="text-center mb-12">
                     <h2 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">Criar sua Conta</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto">
                        Junte-se à nossa comunidade para encontrar ou oferecer cuidados de excelência.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Qual o seu objetivo?</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button type="button" onClick={() => setRole('client')} className={`p-8 rounded-2xl border-4 transition-all duration-300 text-left ${role === 'client' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400'}`}>
                                <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Busco um Cuidador</h3>
                                <p className="text-gray-600 dark:text-gray-400">Para mim ou para minha família.</p>
                            </button>
                             <button type="button" onClick={() => setRole('caregiver')} className={`p-8 rounded-2xl border-4 transition-all duration-300 text-left ${role === 'caregiver' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400'}`}>
                                <div className="text-4xl mb-4">👩‍⚕️</div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Sou um Cuidador</h3>
                                <p className="text-gray-600 dark:text-gray-400">Quero oferecer meus serviços.</p>
                            </button>
                        </div>
                    </div>
                    
                    {role && (
                        <div className="space-y-8 animate-fade-in">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Nome Completo</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-8 py-5 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" placeholder="Seu nome completo" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Email Principal</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={`w-full px-8 py-5 text-lg border-2 rounded-2xl focus:ring-4 dark:bg-gray-700 dark:text-white transition-all duration-300 ${emailError ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-600 focus:ring-indigo-500/20 focus:border-indigo-500'}`} placeholder="seu@email.com" />
                                    {email && emailError && <p className="text-red-500 text-sm mt-2">{emailError}</p>}
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Telefone/WhatsApp</label>
                                    <input type="tel" value={phone} onChange={handlePhoneChange} required className={`w-full px-8 py-5 text-lg border-2 rounded-2xl focus:ring-4 dark:bg-gray-700 dark:text-white transition-all duration-300 ${phoneError ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-600 focus:ring-indigo-500/20 focus:border-indigo-500'}`} placeholder="(00) 00000-0000" />
                                    {phone && phoneError && <p className="text-red-500 text-sm mt-2">{phoneError}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Sua Cidade</label>
                                     <select value={city} onChange={e => setCity(e.target.value)} required className="w-full px-8 py-5 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
                                        <option value="">Selecione sua cidade</option>
                                        {uniqueCities.map(cityOption => (
                                            <option key={cityOption} value={cityOption}>📍 {cityOption}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {role === 'caregiver' && renderCaregiverFields()}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Senha</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-8 py-5 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" placeholder="Crie uma senha forte" />
                                     {password && (
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Força da senha:</span>
                                                <span className={`text-sm font-bold ${passwordStrength.label === 'Fraca' || passwordStrength.label === 'Muito Fraca' ? 'text-red-500' : passwordStrength.label === 'Média' ? 'text-yellow-500' : 'text-green-500'}`}>{passwordStrength.label}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: passwordStrength.width }}></div>
                                            </div>
                                            <ul className="text-xs mt-3 space-y-1">
                                                <PasswordCriterion met={passwordCriteria.length} text="Pelo menos 8 caracteres" />
                                                <PasswordCriterion met={passwordCriteria.uppercase} text="Uma letra maiúscula (A-Z)" />
                                                <PasswordCriterion met={passwordCriteria.lowercase} text="Uma letra minúscula (a-z)" />
                                                <PasswordCriterion met={passwordCriteria.number} text="Pelo menos um número (0-9)" />
                                                <PasswordCriterion met={passwordCriteria.specialChar} text="Um caractere especial (!@#$...)" />
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Confirmar Senha</label>
                                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-8 py-5 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" placeholder="Repita sua senha" />
                                    {confirmPassword && password !== confirmPassword && <p className="text-red-500 text-sm mt-2">As senhas não coincidem.</p>}
                                </div>
                            </div>

                            <button type="submit" disabled={!isFormValid()} className="w-full btn-gradient text-white font-bold py-5 px-8 rounded-3xl text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
                               {role === 'caregiver' ? 'Criar Conta de Cuidador Pro' : 'Criar Minha Conta'}
                            </button>
                        </div>
                    )}

                    <div className="mt-10 text-center">
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Já tem uma conta?
                            <button type="button" onClick={() => navigate('login')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold ml-1">Faça login</button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;