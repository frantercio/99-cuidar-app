
import React, { useState, useEffect, useMemo } from 'react';
import { User, Caregiver, Client, Service } from '../types';
import { useAppStore } from '../store/useAppStore';

const specializationsOptions = [
    { value: 'alzheimer', label: 'Alzheimer', icon: '🧠' },
    { value: 'parkinson', label: 'Parkinson', icon: '🤝' },
    { value: 'pos-cirurgico', label: 'Pós-cirúrgico', icon: '🏥' },
    { value: 'diabetes', label: 'Diabetes', icon: '💉' },
    { value: 'demencia', label: 'Demência', icon: '🧩' },
    { value: 'mobilidade-reduzida', label: 'Mobilidade', icon: '♿' },
    { value: 'cuidados-pediatricos', label: 'Pediátricos', icon: '👶' },
    { value: 'cuidados-paliativos', label: 'Paliativos', icon: '❤️‍🩹' },
];

// Componentes auxiliares movidos para fora do componente principal para evitar re-renderização
const InputField = ({ label, icon, error, ...props }: any) => (
    <div className="relative group">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                {icon}
            </div>
            <input 
                {...props} 
                className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-2 rounded-xl focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 outline-none text-gray-900 dark:text-white placeholder-gray-400 font-medium ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-indigo-500'}`}
            />
        </div>
        {error && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{error}</p>}
    </div>
);

const SelectField = ({ label, icon, children, ...props }: any) => (
    <div className="relative group">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                {icon}
            </div>
            <select 
                {...props} 
                className="w-full pl-11 pr-10 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 outline-none text-gray-900 dark:text-white font-medium appearance-none cursor-pointer"
            >
                {children}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
        </div>
    </div>
);

const RegisterPage: React.FC = () => {
    const { register, navigate, addAlert, caregivers } = useAppStore();
    
    const uniqueCities: string[] = useMemo(() => {
        const cities = caregivers.map(c => c.city);
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
            setEmailError('Email inválido');
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
             setPhoneError('Inválido');
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
            1: { label: 'Fraca', color: 'bg-red-500', width: '20%' },
            2: { label: 'Fraca', color: 'bg-orange-500', width: '40%' },
            3: { label: 'Média', color: 'bg-yellow-500', width: '60%' },
            4: { label: 'Forte', color: 'bg-blue-500', width: '80%' },
            5: { label: 'Excelente', color: 'bg-green-500', width: '100%' },
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
        if (passwordStrength.score < 3) return false; // Relaxed slightly for UX
        if (password !== confirmPassword) return false;
        
        if (role === 'caregiver') {
            if (!experience || specializations.length === 0 || bio.length < 50) return false;
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isFormValid()) {
            addAlert("Preencha todos os campos obrigatórios corretamente.", 'error');
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
                notificationPreferences: { newBookings: true, cancellations: true, newReviews: true },
                security: { backgroundCheck: 'pending', idVerification: 'pending', insurance: false },
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

    return (
        <div className="pt-24 min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4 lg:p-8">
            <div className="bg-white dark:bg-gray-800 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row">
                
                {/* Left Side: Decorative / Info (Optional for large screens) */}
                <div className="hidden lg:flex lg:w-1/3 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
                    
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <h2 className="text-4xl font-bold mb-4">Junte-se à Elite do Cuidado</h2>
                        <p className="text-indigo-100 text-lg leading-relaxed">
                            Faça parte da plataforma que está redefinindo o padrão de cuidados domiciliares no Brasil. Segurança, tecnologia e humanidade.
                        </p>
                    </div>
                    <div className="relative z-10 text-sm opacity-80">
                        © 2024 99 Cuidar Inc.
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="lg:w-2/3 p-8 lg:p-12 overflow-y-auto max-h-[90vh] custom-scrollbar">
                    <div className="text-center lg:text-left mb-10">
                        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2">Crie sua Conta</h1>
                        <p className="text-gray-500 dark:text-gray-400">Comece sua jornada em poucos minutos.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Role Selection */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('client')}
                                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 text-left group hover:shadow-lg ${role === 'client' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-gray-800' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-800'}`}
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-colors ${role === 'client' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                    👨‍👩‍👧‍👦
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg ${role === 'client' ? 'text-indigo-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>Sou Cliente</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Busco cuidados para mim ou familiares.</p>
                                </div>
                                {role === 'client' && <div className="absolute top-4 right-4 text-indigo-600"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>}
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole('caregiver')}
                                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 text-left group hover:shadow-lg ${role === 'caregiver' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-gray-800' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-800'}`}
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-colors ${role === 'caregiver' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                    👩‍⚕️
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg ${role === 'caregiver' ? 'text-indigo-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>Sou Cuidador</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Quero oferecer meus serviços profissionais.</p>
                                </div>
                                {role === 'caregiver' && <div className="absolute top-4 right-4 text-indigo-600"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>}
                            </button>
                        </div>

                        {role && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField 
                                        label="Nome Completo" 
                                        placeholder="Seu nome" 
                                        value={name} 
                                        onChange={(e: any) => setName(e.target.value)} 
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                    />
                                    <InputField 
                                        label="Email Principal" 
                                        placeholder="seu@email.com" 
                                        type="email"
                                        value={email} 
                                        onChange={(e: any) => setEmail(e.target.value)} 
                                        error={emailError}
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField 
                                        label="WhatsApp" 
                                        placeholder="(00) 00000-0000" 
                                        type="tel"
                                        value={phone} 
                                        onChange={handlePhoneChange} 
                                        error={phoneError}
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                                    />
                                    <SelectField 
                                        label="Cidade" 
                                        value={city} 
                                        onChange={(e: any) => setCity(e.target.value)}
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                    >
                                        <option value="">Selecione sua cidade</option>
                                        {uniqueCities.map(cityOption => (
                                            <option key={cityOption} value={cityOption}>{cityOption}</option>
                                        ))}
                                    </SelectField>
                                </div>

                                {role === 'caregiver' && (
                                    <div className="space-y-6 pt-2 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
                                        <SelectField 
                                            label="Tempo de Experiência" 
                                            value={experience} 
                                            onChange={(e: any) => setExperience(e.target.value)}
                                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                        >
                                            <option value="">Selecione o tempo</option>
                                            <option value="0-2">0-2 anos (Iniciante)</option>
                                            <option value="3-5">3-5 anos (Intermediário)</option>
                                            <option value="6-10">6-10 anos (Experiente)</option>
                                            <option value="10+">10+ anos (Especialista)</option>
                                        </SelectField>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 ml-1">Suas Especialidades</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {specializationsOptions.map(spec => (
                                                    <label 
                                                        key={spec.value} 
                                                        className={`
                                                            cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200
                                                            ${specializations.includes(spec.value) 
                                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}
                                                        `}
                                                    >
                                                        <input type="checkbox" checked={specializations.includes(spec.value)} onChange={() => handleSpecializationChange(spec.value)} className="hidden" />
                                                        <span className="text-2xl mb-1">{spec.icon}</span>
                                                        <span className="text-xs font-bold text-center leading-tight">{spec.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Biografia Profissional</label>
                                            <textarea 
                                                value={bio} 
                                                onChange={e => setBio(e.target.value)} 
                                                rows={4} 
                                                className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white"
                                                placeholder="Conte brevemente sobre sua experiência, paixão pelo cuidado e o que te torna único..."
                                            ></textarea>
                                            <div className="flex justify-end mt-1">
                                                <span className={`text-xs font-bold ${bio.length < 50 ? 'text-red-500' : 'text-green-500'}`}>{bio.length}</span>
                                                <span className="text-xs text-gray-400">/50 min caracteres</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <div>
                                        <InputField 
                                            label="Senha" 
                                            placeholder="••••••••" 
                                            type="password"
                                            value={password} 
                                            onChange={(e: any) => setPassword(e.target.value)} 
                                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                                        />
                                        {password && (
                                            <div className="mt-2 ml-1">
                                                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className={`h-full transition-all duration-500 ${passwordStrength.color}`} style={{ width: passwordStrength.width }}></div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Força: <span className="font-bold">{passwordStrength.label}</span></p>
                                            </div>
                                        )}
                                    </div>
                                    <InputField 
                                        label="Confirmar Senha" 
                                        placeholder="••••••••" 
                                        type="password"
                                        value={confirmPassword} 
                                        onChange={(e: any) => setConfirmPassword(e.target.value)} 
                                        error={confirmPassword && password !== confirmPassword ? 'As senhas não coincidem' : ''}
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={!isFormValid()} 
                                    className="w-full btn-gradient text-white font-bold py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4"
                                >
                                    {role === 'caregiver' ? 'Finalizar Cadastro Profissional' : 'Criar Conta Gratuita'}
                                </button>
                            </div>
                        )}

                        <div className="text-center mt-6">
                            <p className="text-gray-600 dark:text-gray-400">
                                Já tem uma conta? 
                                <button type="button" onClick={() => navigate('login')} className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold ml-1">Fazer Login</button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
