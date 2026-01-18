
import React, { useState } from 'react';
import { Caregiver } from '../types';
import { useAppStore } from '../store/useAppStore';
import Avatar from './Avatar';
import ImageCropModal from './ImageCropModal';
import AIBioGeneratorModal from './AIBioGeneratorModal';

interface CaregiverSettingsPageProps {
    user: Caregiver;
}

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

const gradientPresets = [
    { name: 'Indigo', class: 'bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200' },
    { name: 'Green', class: 'bg-gradient-to-br from-green-200 via-cyan-200 to-blue-200' },
    { name: 'Red', class: 'bg-gradient-to-br from-red-200 via-pink-200 to-purple-200' },
    { name: 'Teal', class: 'bg-gradient-to-br from-teal-200 via-blue-200 to-indigo-200' },
    { name: 'Yellow', class: 'bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200' },
];


const CaregiverSettingsPage: React.FC<CaregiverSettingsPageProps> = ({ user }) => {
    const { updateUserPhoto, updateCaregiverDetails, changePassword, addAlert } = useAppStore();

    // Profile State
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone);
    const [city, setCity] = useState(user.city);
    const [experience, setExperience] = useState(user.experience);
    const [specializations, setSpecializations] = useState(user.specializations);
    const [bio, setBio] = useState(user.bio);
    const [cover, setCover] = useState(user.cover || { type: 'gradient', value: 'bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200' });
    const [chatSettings, setChatSettings] = useState(user.chatSettings || { autoReply: true, welcomeMessage: "Olá! Obrigado pelo contato. Estou disponível para conversar e entender suas necessidades." });

    // Address State
    const [street, setStreet] = useState(user.street || '');
    const [addressNumber, setAddressNumber] = useState(user.addressNumber || '');
    const [neighborhood, setNeighborhood] = useState(user.neighborhood || '');
    const [state, setState] = useState(user.state || '');
    const [zipCode, setZipCode] = useState(user.zipCode || '');

    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [isAIBioModalOpen, setIsAIBioModalOpen] = useState(false);


    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // Notifications State
    const [prefs, setPrefs] = useState(user.notificationPreferences);

    const handleProfileSave = () => {
        updateCaregiverDetails(user.id, {
            name, email, phone, city, experience, specializations, bio,
            notificationPreferences: prefs,
            cover,
            chatSettings,
            street,
            addressNumber,
            neighborhood,
            state,
            zipCode
        });
    };

    const handlePasswordSave = () => {
        if (newPassword.length < 8) {
            addAlert('A nova senha deve ter pelo menos 8 caracteres.', 'error');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            addAlert('As novas senhas não coincidem.', 'error');
            return;
        }
        changePassword(user.id, newPassword);
        setNewPassword('');
        setConfirmNewPassword('');
    };

    const handleNotificationToggle = (key: keyof Caregiver['notificationPreferences']) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 300;
                    const scale = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scale;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    updateUserPhoto(user.id, resizedDataUrl);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        } else if (file) {
            addAlert('Por favor, selecione um arquivo de imagem válido.', 'error');
        }
    };
    
    const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                   setImageToCrop(result);
                   setIsCropModalOpen(true);
                }
            };
            reader.readAsDataURL(file);
        } else if (file) {
            addAlert('Por favor, selecione um arquivo de imagem válido.', 'error');
        }
    };
    
    const handleCropComplete = (croppedImageUrl: string) => {
        setCover({ type: 'image', value: croppedImageUrl });
        setIsCropModalOpen(false);
        setImageToCrop(null);
    };

    const handleSpecializationChange = (spec: string) => {
        setSpecializations(prev =>
            prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
        );
    };

    const handleBioGenerated = (newBio: string) => {
        setBio(newBio);
        setIsAIBioModalOpen(false);
    };
    
    const CoverPreview = () => {
        if (!cover) return null;
        switch(cover.type) {
            case 'gradient': return <div className={`w-full h-full ${cover.value}`} />;
            case 'color': return <div className="w-full h-full" style={{ backgroundColor: cover.value }} />;
            case 'image': return <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${cover.value})` }} />;
            default: return null;
        }
    }


    return (
        <>
            <div className="space-y-12 animate-fade-in">
                {/* Profile Settings */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Perfil</h3>
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-indigo-200 dark:ring-indigo-800">
                                <Avatar photo={user.photo} name={name} className="w-full h-full" textClassName="text-5xl" />
                            </div>
                            <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-indigo-700 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
                            </label>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nome Completo</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Telefone</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Anos de Experiência</label>
                            <select value={experience} onChange={e => setExperience(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700">
                                <option value="0-2">0-2 anos</option>
                                <option value="3-5">3-5 anos</option>
                                <option value="6-10">6-10 anos</option>
                                <option value="10+">10+ anos</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Endereço Completo</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">CEP</label>
                                <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="00000-000" className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Rua / Avenida</label>
                                <input type="text" value={street} onChange={e => setStreet(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Número</label>
                                <input type="text" value={addressNumber} onChange={e => setAddressNumber(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bairro</label>
                                <input type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Cidade</label>
                                <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                                <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" placeholder="UF" maxLength={2} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Settings */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Configurações de Chat e Auto-resposta</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-700 dark:text-gray-300">Ativar Auto-resposta</p>
                                <p className="text-sm text-gray-500">Enviar uma mensagem automática quando um cliente entrar em contato.</p>
                            </div>
                            <button onClick={() => setChatSettings(prev => ({ ...prev, autoReply: !prev.autoReply }))} className={`w-12 h-6 rounded-full flex items-center transition-colors ${chatSettings.autoReply ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${chatSettings.autoReply ? 'translate-x-6' : 'translate-x-1'}`}></span>
                            </button>
                        </div>
                        {chatSettings.autoReply && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mensagem de Boas-vindas</label>
                                <textarea
                                    value={chatSettings.welcomeMessage}
                                    onChange={(e) => setChatSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                                    rows={3}
                                    maxLength={200}
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                                    placeholder="Escreva sua mensagem automática..."
                                />
                                <p className="text-xs text-right text-gray-500 mt-1">{chatSettings.welcomeMessage.length}/200</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cover Personalization */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Personalizar Capa do Perfil</h3>
                    <div className="h-40 w-full rounded-xl overflow-hidden mb-6 relative bg-gray-200 dark:bg-gray-700 shadow-inner">
                        <CoverPreview />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <label className="cursor-pointer relative p-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-center font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                             <svg className="w-6 h-6 mb-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                             Enviar Imagem
                            <input type="file" accept="image/*" onChange={handleCoverImageChange} className="sr-only" />
                        </label>
                         <label className="cursor-pointer relative p-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-center font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                             <svg className="w-6 h-6 mb-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 2a.5.5 0 01.5.5v1.28a1 1 0 01-1 0V2.5A.5.5 0 017 2zM13 2a.5.5 0 01.5.5v1.28a1 1 0 01-1 0V2.5A.5.5 0 0113 2zM5 4.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zM.5 7a.5.5 0 01.5.5v1.28a1 1 0 01-1 0V7.5a.5.5 0 01.5-.5zM19.5 7a.5.5 0 01.5.5v1.28a1 1 0 01-1 0V7.5a.5.5 0 01.5-.5zM17 9.5a.5.5 0 01.5-.5h1.28a1 1 0 010 1H17.5a.5.5 0 01-.5-.5zM3 9.5a.5.5 0 01.5-.5H4.78a1 1 0 010 1H3.5a.5.5 0 01-.5-.5zM17 13.5a.5.5 0 01.5-.5h1.28a1 1 0 010 1H17.5a.5.5 0 01-.5-.5zM3 13.5a.5.5 0 01.5-.5H4.78a1 1 0 010 1H3.5a.5.5 0 01-.5-.5zM19.5 16a.5.5 0 01.5.5v1.28a1 1 0 01-1 0V16.5a.5.5 0 01.5-.5zM.5 16a.5.5 0 01.5.5v1.28a1 1 0 01-1 0V16.5a.5.5 0 01.5-.5zM15 17.5a.5.5 0 01.5-.5h-9a.5.5 0 010 1h9a.5.5 0 01-.5-.5zM7 19a.5.5 0 01.5.5v1.28a1 1 0 01-1 0V19.5a.5.5 0 01.5-.5zM13 19a.5.5 0 01.5.5v1.28a1 1 0 01-1 0V19.5a.5.5 0 01.5-.5zM10 5a1 1 0 00-1 1v8a1 1 0 102 0V6a1 1 0 00-1-1zm-3 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                             Cor Sólida
                            <input type="color" value={cover.type === 'color' ? cover.value : '#ffffff'} onChange={(e) => setCover({type: 'color', value: e.target.value})} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                        </label>
                        {gradientPresets.map(g => (
                            <button key={g.name} onClick={() => setCover({type: 'gradient', value: g.class})} className={`p-4 rounded-lg flex items-center justify-center text-center font-semibold text-xs transition-transform hover:scale-105 ${g.class}`}>
                                {g.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Apresentação Profissional</h3>
                    <div className="relative">
                        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={6} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" placeholder="Conte sua história..."></textarea>
                        <button onClick={() => setIsAIBioModalOpen(true)} className="absolute bottom-3 right-3 px-3 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900">Gerar com IA ✨</button>
                    </div>
                </div>

                {/* Other sections like password, notifications, etc. */}
                <div className="flex justify-end mt-8">
                    <button onClick={handleProfileSave} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Salvar Todas as Alterações</button>
                </div>
            </div>
            {isCropModalOpen && imageToCrop && (
                <ImageCropModal 
                    src={imageToCrop}
                    onClose={() => { setIsCropModalOpen(false); setImageToCrop(null); }}
                    onCropComplete={handleCropComplete}
                />
            )}
            {isAIBioModalOpen && (
                <AIBioGeneratorModal 
                    onClose={() => setIsAIBioModalOpen(false)}
                    onBioGenerated={handleBioGenerated}
                    currentKeywords={[user.experience + ' anos', ...user.specializations]}
                />
            )}
        </>
    );
};

export default CaregiverSettingsPage;
