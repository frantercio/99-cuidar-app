
import React, { useState } from 'react';
import { Client } from '../types';
import { useAppStore } from '../store/useAppStore';
import Avatar from './Avatar';

interface ClientSettingsPageProps {
    user: Client;
}

const ClientSettingsPage: React.FC<ClientSettingsPageProps> = ({ user }) => {
    const { updateUserPhoto, updateClientDetails, changePassword, addAlert } = useAppStore();

    // Profile State
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone);
    const [city, setCity] = useState(user.city);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // Notifications State
    const [prefs, setPrefs] = useState(user.notificationPreferences);

    const handleProfileSave = () => {
        updateClientDetails(user.id, { name, email, phone, city });
    };

    const handleNotificationsSave = () => {
        updateClientDetails(user.id, { notificationPreferences: prefs });
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
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    };

    const handleNotificationToggle = (key: keyof Client['notificationPreferences']) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const newPhotoUrl = URL.createObjectURL(file);
            updateUserPhoto(user.id, newPhotoUrl);
        } else if (file) {
            addAlert('Por favor, selecione um arquivo de imagem válido.', 'error');
        }
    };

    return (
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
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Cidade</label>
                        <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" />
                    </div>
                </div>
                <div className="flex justify-end mt-8">
                    <button onClick={handleProfileSave} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Salvar Alterações do Perfil</button>
                </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Segurança</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nova Senha</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" placeholder="Mínimo 8 caracteres" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Confirmar Nova Senha</label>
                        <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" placeholder="Repita a nova senha" />
                    </div>
                </div>
                 <div className="flex justify-end mt-8">
                    <button onClick={handlePasswordSave} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Alterar Senha</button>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Notificações por Email</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">Confirmações de Agendamento</p>
                            <p className="text-sm text-gray-500">Receba emails sobre seus agendamentos.</p>
                        </div>
                        <button onClick={() => handleNotificationToggle('bookingConfirmations')} className={`w-12 h-6 rounded-full flex items-center transition-colors ${prefs.bookingConfirmations ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${prefs.bookingConfirmations ? 'translate-x-6' : 'translate-x-1'}`}></span>
                        </button>
                    </div>
                     <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">Novas Mensagens</p>
                            <p className="text-sm text-gray-500">Seja notificado sobre novas mensagens no chat.</p>
                        </div>
                        <button onClick={() => handleNotificationToggle('newMessages')} className={`w-12 h-6 rounded-full flex items-center transition-colors ${prefs.newMessages ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${prefs.newMessages ? 'translate-x-6' : 'translate-x-1'}`}></span>
                        </button>
                    </div>
                     <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">Atualizações da Plataforma</p>
                            <p className="text-sm text-gray-500">Receba novidades e dicas da 99 Cuidar.</p>
                        </div>
                        <button onClick={() => handleNotificationToggle('platformUpdates')} className={`w-12 h-6 rounded-full flex items-center transition-colors ${prefs.platformUpdates ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${prefs.platformUpdates ? 'translate-x-6' : 'translate-x-1'}`}></span>
                        </button>
                    </div>
                </div>
                 <div className="flex justify-end mt-8">
                    <button onClick={handleNotificationsSave} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Salvar Preferências</button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl shadow-lg border border-red-200 dark:border-red-700/50">
                 <h3 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-4">Zona de Perigo</h3>
                 <p className="text-red-700 dark:text-red-400 mb-6">Ações nesta seção são permanentes e não podem ser desfeitas. Tenha certeza absoluta antes de prosseguir.</p>
                 <button onClick={() => addAlert('Função de exclusão ainda não implementada.', 'info')} className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                     Excluir Minha Conta
                 </button>
            </div>
        </div>
    );
};

export default ClientSettingsPage;
