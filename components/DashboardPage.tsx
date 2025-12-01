
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Service, Caregiver, Appointment } from '../types';
import CaregiverSettingsPage from './CaregiverSettingsPage';
import { GoogleGenAI } from "@google/genai";
import CareLogModal from './CareLogModal';
import CheckInModal from './CheckInModal';
import WalletPage from './WalletPage';
import HighlightModal from './HighlightModal';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700`}>
        <div className="flex items-center justify-between">
            <div>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">{value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
            </div>
            <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center`}>
                {icon}
            </div>
        </div>
    </div>
);

const ICON_PRESETS = [
    '☀️', '🌙', '⏰', '🍃', '☕', '💊', '🚿', '🍽️', '🚗', '🛒', 
    '🧹', '🐶', '📚', '🧩', '🎨', '🏥', '🩺', '🦵', '🧘', '🤝',
    '🏠', '🛁', '🥗', '👟', '💉', '🛌', '♿', '🧠', '❤️', '👵', 
    '👴', '👂', '👀', '🗣️', '🍎', '💧', '🎵', '📺', '📵', '🆘'
];

const DashboardPage: React.FC = () => {
    const { 
        currentUser, 
        navigate, 
        updateUserServices, 
        appointments,
        updateUserAvailability,
        addAlert,
        updateCaregiverDetails,
        setVacationMode,
    } = useAppStore();

    const [activeTab, setActiveTab] = useState<'overview' | 'agenda' | 'services' | 'financial' | 'wallet' | 'settings'>('overview');
    const [selectedAppointmentForLog, setSelectedAppointmentForLog] = useState<Appointment | null>(null);
    const [checkInModalData, setCheckInModalData] = useState<{ appointment: Appointment, type: 'in' | 'out' } | null>(null);
    const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
    
    if (!currentUser || currentUser.role !== 'caregiver') {
        useEffect(() => {
            navigate('login');
        }, [navigate]);
        return null; 
    }
    const user = currentUser as Caregiver;
    
    const OverviewContent: React.FC = () => {
         const userAppointments = useMemo(() => 
            appointments.filter(a => a.caregiverId === user.id), 
            [appointments, user.id]);
        
        const [securityData, setSecurityData] = useState(user.security);
        const [docUploadStatus, setDocUploadStatus] = useState<{ bg?: string, id?: string }>({});
        const fileInputRef = useRef<HTMLInputElement>(null);
        const [uploadingFor, setUploadingFor] = useState<'bg' | 'id' | null>(null);
        const [vacationReturnDate, setVacationReturnDate] = useState(user.vacationMode?.returnDate || '');

        const isHighlighted = user.highlightedUntil && new Date(user.highlightedUntil).getTime() > new Date().getTime();
        const highlightDaysRemaining = isHighlighted ? Math.ceil((new Date(user.highlightedUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

        const handleUploadClick = (type: 'bg' | 'id') => {
            setUploadingFor(type);
            fileInputRef.current?.click();
        };

        const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.files && event.target.files[0] && uploadingFor) {
                setDocUploadStatus(prev => ({ ...prev, [uploadingFor]: 'Enviado' }));
                addAlert(`Documento para ${uploadingFor === 'bg' ? 'Antecedentes' : 'ID'} enviado para análise.`);
            }
            setUploadingFor(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };

        const handleSecuritySave = () => {
            updateCaregiverDetails(user.id, { security: securityData });
        };
        
        const handleToggleVacationMode = (active: boolean) => {
            if (active && !vacationReturnDate) {
                addAlert('Por favor, defina uma data de retorno para ativar o Modo Férias.', 'error');
                return;
            }
            setVacationMode(user.id, active, vacationReturnDate);
        };
        
        const popularServices: [string, number][] = useMemo(() => {
            const completedAppointments = userAppointments.filter(a => a.status === 'completed');
            const serviceCounts = completedAppointments.reduce<Record<string, number>>((acc, app) => {
                acc[app.serviceType] = (acc[app.serviceType] || 0) + 1;
                return acc;
            }, {});

            return (Object.entries(serviceCounts) as [string, number][])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);
        }, [userAppointments]);
        
        const latestReviews = useMemo(() => user.reviews.slice(0, 2), [user.reviews]);

        const aiTips = useMemo(() => {
            const tips = [];
            if (user.bio.length < 150) {
                tips.push({
                    title: "Elabore sua Biografia",
                    description: "Uma biografia mais detalhada atrai mais famílias. Conte sua história!",
                    icon: '📝'
                });
            }
            if (user.certifications.length < 2) {
                tips.push({
                    title: "Adicione Certificações",
                    description: "Cuidadores com certificações têm mais chances de serem contratados.",
                    icon: '🎓'
                });
            }
            if (user.services.length < 5) {
                 tips.push({
                    title: "Diversifique seus Serviços",
                    description: "Oferecer uma gama maior de serviços pode aumentar seus agendamentos.",
                    icon: '💼'
                });
            }
            if (!user.unavailableDates || user.unavailableDates.length === 0) {
                tips.push({
                    title: "Atualize sua Agenda",
                    description: "Mantenha sua agenda atualizada para evitar conflitos de agendamento.",
                    icon: '🗓️'
                });
            }
            return tips.slice(0, 2);
        }, [user]);
        
        const profileUrl = `${window.location.origin}#profile-${user.id}`;
        
        const handleCopyLink = () => {
            navigator.clipboard.writeText(profileUrl).then(() => {
                addAlert('Link do perfil copiado!');
            }).catch(err => {
                console.error('Failed to copy link: ', err);
                addAlert('Falha ao copiar o link.', 'error');
            });
        };


        return (
            <div className="animate-fade-in">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Agendamentos Futuros" value={userAppointments.filter(a => a.status === 'confirmed' && new Date(a.date) >= new Date()).length} color="bg-gradient-to-r from-blue-500 to-indigo-600" icon={<svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>} />
                    <StatCard title="Avaliação Média" value={user.rating.toFixed(1)} color="bg-gradient-to-r from-yellow-500 to-orange-600" icon={<svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>} />
                     <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Segurança e Confiança</h3>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelected} className="hidden" />
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center text-sm font-medium">
                                <span className="text-gray-700 dark:text-gray-300">Verificação de Antecedentes</span>
                                {securityData.backgroundCheck === 'completed' ? (
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Aprovado</span>
                                ) : docUploadStatus.bg === 'Enviado' ? (
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Enviado</span>
                                ) : (
                                    <button onClick={() => handleUploadClick('bg')} className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 hover:bg-yellow-200">Enviar Documento</button>
                                )}
                            </li>
                            <li className="flex justify-between items-center text-sm font-medium">
                                <span className="text-gray-700 dark:text-gray-300">Verificação de Identidade</span>
                                 {securityData.idVerification === 'completed' ? (
                                     <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Aprovado</span>
                                ) : docUploadStatus.id === 'Enviado' ? (
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Enviado</span>
                                ) : (
                                    <button onClick={() => handleUploadClick('id')} className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 hover:bg-yellow-200">Enviar Documento</button>
                                )}
                            </li>
                             <li className="flex justify-between items-center text-sm font-medium">
                                <span className="text-gray-700 dark:text-gray-300">Seguro de Responsabilidade</span>
                                <button onClick={() => setSecurityData(prev => ({...prev, insurance: !prev.insurance}))} className={`w-12 h-6 rounded-full flex items-center transition-colors ${securityData.insurance ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                    <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${securityData.insurance ? 'translate-x-6' : 'translate-x-1'}`}></span>
                                </button>
                            </li>
                             {securityData.insurance && (
                                <li className="animate-fade-in pt-2">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Número da Apólice (Opcional)</label>
                                    <input 
                                        type="text" 
                                        value={securityData.insurancePolicy || ''}
                                        onChange={(e) => setSecurityData(prev => ({...prev, insurancePolicy: e.target.value}))}
                                        placeholder="Ex: AP-123456"
                                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" 
                                    />
                                </li>
                             )}
                        </ul>
                         <div className="flex justify-end mt-6">
                            <button onClick={handleSecuritySave} className="px-4 py-2 text-sm bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Salvar Segurança</button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">🌟 Destaque seu Perfil</h3>
                        {isHighlighted ? (
                            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                                <p className="font-semibold text-yellow-800 dark:text-yellow-200">Seu perfil está em destaque!</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Restam {highlightDaysRemaining} dias.</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">Apareça no topo das buscas e aumente suas chances de ser contratado.</p>
                                <button onClick={() => setIsHighlightModalOpen(true)} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-lg shadow-md hover:scale-105 transition-transform">
                                    Destacar por 7 dias
                                </button>
                            </>
                        )}
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">🏖️ Modo Férias</h3>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="font-semibold text-gray-700 dark:text-gray-300">Pausar perfil</p>
                                <p className="text-sm text-gray-500">Seu perfil não aparecerá nas buscas.</p>
                            </div>
                            <button onClick={() => handleToggleVacationMode(!user.vacationMode?.active)} className={`w-12 h-6 rounded-full flex items-center transition-colors ${user.vacationMode?.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${user.vacationMode?.active ? 'translate-x-6' : 'translate-x-1'}`}></span>
                            </button>
                        </div>
                        {user.vacationMode?.active && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Data de Retorno</label>
                                <input type="date" value={vacationReturnDate} onChange={e => setVacationReturnDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" />
                                <button onClick={() => handleToggleVacationMode(true)} className="w-full mt-3 px-4 py-2 text-sm bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Atualizar Data</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Agenda Content Logic with Care Log Button */}
                <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Ações Rápidas de Agendamento</h3>
                    <div className="space-y-4">
                        {userAppointments.filter(a => a.status === 'confirmed' || a.status === 'completed').slice(0, 3).map(app => {
                            const isToday = new Date(app.date).toDateString() === new Date().toDateString();
                            const canCheckIn = isToday && app.status === 'confirmed' && !app.checkIn;
                            const canCheckOut = isToday && app.status === 'confirmed' && app.checkIn && !app.checkOut;
                            
                            return (
                                <div key={app.id} className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl gap-3">
                                    <div className="text-center sm:text-left">
                                        <p className="font-semibold text-gray-700 dark:text-gray-300">{app.clientName}</p>
                                        <p className="text-sm text-gray-500">{new Date(app.date).toLocaleDateString()} - {app.time}</p>
                                        {app.checkIn && <p className="text-xs text-green-600 font-medium">Check-in: {new Date(app.checkIn.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
                                        {app.checkOut && <p className="text-xs text-blue-600 font-medium">Check-out: {new Date(app.checkOut.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
                                    </div>
                                    <div className="flex gap-2 flex-wrap justify-center">
                                        {canCheckIn && (
                                            <button 
                                                onClick={() => setCheckInModalData({ appointment: app, type: 'in' })}
                                                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold shadow-md flex items-center gap-2"
                                            >
                                                📍 Iniciar Plantão
                                            </button>
                                        )}
                                        {canCheckOut && (
                                            <button 
                                                onClick={() => setCheckInModalData({ appointment: app, type: 'out' })}
                                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold shadow-md flex items-center gap-2"
                                            >
                                                🏁 Finalizar Plantão
                                            </button>
                                        )}
                                        
                                        {!app.hasLog && (
                                            <button 
                                                onClick={() => setSelectedAppointmentForLog(app)}
                                                className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors font-semibold"
                                            >
                                                Registrar Diário
                                            </button>
                                        )}
                                        {app.hasLog && (
                                            <span className="px-3 py-1.5 text-sm text-green-600 bg-green-100 dark:bg-green-900/30 rounded-lg font-semibold">
                                                Diário Registrado ✅
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {userAppointments.length === 0 && <p className="text-gray-500">Nenhum agendamento recente.</p>}
                    </div>
                </div>

                {aiTips.length > 0 && (
                    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.636-6.364l-.707-.707M17.657 17.657l.707.707M6.343 6.343l-.707-.707m12.728 0l.707.707M6.343 17.657l.707.707M12 21a9 9 0 110-18 9 9 0 010 18z"></path></svg>
                            </span>
                            Dicas da IA para Otimizar seu Perfil
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {aiTips.map(tip => (
                                <div key={tip.title} className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border-l-4 border-indigo-500">
                                    <p className="font-semibold text-indigo-800 dark:text-indigo-200 flex items-center">
                                        <span className="mr-2 text-xl">{tip.icon}</span>
                                        {tip.title}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tip.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Serviços em Destaque</h3>
                        <div className="space-y-4">
                            {popularServices.length > 0 ? popularServices.map(([serviceName, count]) => (
                                <div key={serviceName}>
                                    <div className="flex justify-between mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <span>{serviceName}</span>
                                        <span>{count} {count > 1 ? 'vezes' : 'vez'}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" style={{ width: `${(count / userAppointments.filter(a => a.status === 'completed').length) * 100}%` }}></div>
                                    </div>
                                </div>
                            )) : <p className="text-gray-500 text-center py-4">Nenhum serviço concluído ainda.</p>}
                        </div>
                    </div>
                    
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Últimas Avaliações</h3>
                        <div className="space-y-4">
                            {latestReviews.length > 0 ? latestReviews.map(review => (
                                <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{review.author}</span>
                                        <div className="flex text-yellow-400">{'★'.repeat(review.rating)}</div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1 truncate">"{review.comment}"</p>
                                </div>
                            )) : <p className="text-gray-500 text-center py-4">Nenhuma avaliação recebida.</p>}
                        </div>
                    </div>
                    
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Compartilhe seu Perfil</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Divulgue seus serviços para atrair mais clientes.</p>
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-2 mb-4">
                           <input type="text" readOnly value={profileUrl} className="flex-grow bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none"/>
                           <button onClick={handleCopyLink} className="px-3 py-1 bg-indigo-500 text-white text-xs font-semibold rounded hover:bg-indigo-600">Copiar</button>
                        </div>
                         <div className="flex justify-center gap-4">
                            <a href={`https://api.whatsapp.com/send?text=Olá!%20Conheça%20meu%20perfil%20de%20cuidador%20na%2099Cuidar:%20${encodeURIComponent(profileUrl)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors" aria-label="Share on WhatsApp">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.885-.002 2.024.63 3.965 1.739 5.625l-1.134 4.135 4.27-1.12z"/></svg>
                            </a>
                             <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors" aria-label="Share on Facebook">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                            </a>
                            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(profileUrl)}&title=Conheça%20meu%20perfil%20de%20cuidador%20na%2099Cuidar`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-sky-700 text-white hover:bg-sky-800 transition-colors" aria-label="Share on LinkedIn">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.59-11.018-3.714v-2.155z"/></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    const AgendaContent: React.FC = () => {
        const [currentDate, setCurrentDate] = useState(new Date());
        const [selectedDate, setSelectedDate] = useState(new Date());

        const userAppointments = useMemo(() => 
            appointments.filter(a => a.caregiverId === user.id), 
            [appointments, user.id]);

        const appointmentsByMonth = useMemo(() => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            return userAppointments.filter(app => {
                const appDate = new Date(app.date);
                return appDate.getFullYear() === year && appDate.getMonth() === month;
            });
        }, [currentDate, userAppointments]);
        
        const parseTimeRange = (timeStr: string): [number, number] | null => {
            const parts = timeStr.replace(/\s/g, '').split('-');
            if (parts.length !== 2) return null;
        
            try {
                const [startHour, startMin] = parts[0].split(':').map(Number);
                const [endHour, endMin] = parts[1].split(':').map(Number);
                
                const startTime = startHour * 60 + startMin;
                const endTime = endHour * 60 + endMin;
                
                if (isNaN(startTime) || isNaN(endTime)) return null;

                return [startTime, endTime];
            } catch (e) {
                return null;
            }
        };

        const findConflictingAppointments = (appointments: Appointment[]): Set<string> => {
            const conflictingIds = new Set<string>();
            const appointmentsWithTimes = appointments
                .map(app => ({ app, times: parseTimeRange(app.time) }))
                .filter(item => item.times !== null && item.app.status === 'confirmed');

            for (let i = 0; i < appointmentsWithTimes.length; i++) {
                for (let j = i + 1; j < appointmentsWithTimes.length; j++) {
                    const itemA = appointmentsWithTimes[i];
                    const itemB = appointmentsWithTimes[j];
        
                    const [startA, endA] = itemA.times!;
                    const [startB, endB] = itemB.times!;
        
                    if (startA < endB && startB < endA) {
                        conflictingIds.add(itemA.app.id);
                        conflictingIds.add(itemB.app.id);
                    }
                }
            }
            return conflictingIds;
        };

        const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        const handleDayClick = (date: Date) => setSelectedDate(date);
        const toggleAvailability = (date: Date) => updateUserAvailability(user.id, date.toISOString().split('T')[0]);
        
        const renderCalendar = () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const calendarDays = [];
            for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(<div key={`empty-${i}`} className="border-r border-b border-gray-100 dark:border-gray-700/50"></div>);
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateString = date.toISOString().split('T')[0];
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const hasAppointment = appointmentsByMonth.some(app => new Date(app.date).toDateString() === date.toDateString());
                const isUnavailable = user.unavailableDates?.includes(dateString);
                calendarDays.push(
                    <div key={day} className={`p-2 border-r border-b border-gray-100 dark:border-gray-700/50 text-center cursor-pointer transition-all duration-300 group ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'} ${isUnavailable ? 'bg-red-50 dark:bg-red-900/30 opacity-60' : ''}`} onClick={() => handleDayClick(date)}>
                        <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center font-semibold text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors ${isToday ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg font-bold' : ''} ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}>{day}</div>
                        <div className="h-2 mt-1 flex justify-center">
                            {hasAppointment && !isUnavailable && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                            {isUnavailable && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
                        </div>
                    </div>
                );
            }
            return calendarDays;
        };
        const selectedDateAppointments = appointmentsByMonth.filter(app => new Date(app.date).toDateString() === selectedDate.toDateString());
        const conflictingAppointmentIds = useMemo(() => 
            findConflictingAppointments(selectedDateAppointments),
        [selectedDateAppointments]);

        const isSelectedDateUnavailable = user.unavailableDates?.includes(selectedDate.toISOString().split('T')[0]);
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">Gerencie sua Agenda</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={handlePrevMonth} aria-label="Previous month" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 w-40 text-center capitalize">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
                        <button onClick={handleNextMonth} aria-label="Next month" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></button>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-8">
                    <div className="md:col-span-2 border border-gray-100 dark:border-gray-700/50 rounded-xl overflow-hidden">
                        <div className="calendar-grid bg-gray-50 dark:bg-gray-700/50">{weekDays.map(day => (<div key={day} className="p-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase border-b border-r border-gray-100 dark:border-gray-700/50">{day}</div>))}</div>
                        <div className="calendar-grid">{renderCalendar()}</div>
                    </div>
                    <div className="md:col-span-1 mt-8 md:mt-0">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">Detalhes para <span className="text-indigo-600 dark:text-indigo-400">{selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</span></h3>
                         {conflictingAppointmentIds.size > 0 && (
                            <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-r-lg text-red-800 dark:text-red-200 text-sm font-semibold flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.01-1.742 3.01H4.42c-1.53 0-2.493-1.676-1.743-3.01l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                Alerta de conflito de horário!
                            </div>
                        )}
                        <div className="space-y-4 mb-6">{selectedDateAppointments.map((app) => {
                            const isConflicting = conflictingAppointmentIds.has(app.id);
                            return (
                                <div key={app.id} className={`relative p-4 rounded-xl border-l-4 animate-fade-in transition-all ${isConflicting ? 'border-red-500 bg-red-50 dark:bg-red-900/30' : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'}`}>
                                     {isConflicting && (
                                        <div className="absolute top-2 right-2" title="Conflito de horário detectado">
                                            <svg className="w-5 h-5 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.01-1.742 3.01H4.42c-1.53 0-2.493-1.676-1.743-3.01l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </div>
                                    )}
                                    <p className={`font-semibold flex items-center gap-2 ${isConflicting ? 'text-red-800 dark:text-red-200' : 'text-indigo-800 dark:text-indigo-200'}`}>{app.serviceType} {app.seriesId && (<span title="Agendamento Recorrente" className="text-indigo-500"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M15.312 11.224a5.5 5.5 0 01-10.624 0H2.062a1 1 0 010-2h2.626A5.5 5.5 0 0115.312 9.224h2.626a1 1 0 110 2h-2.626zM7.224 15.312a5.5 5.5 0 010-10.624V2.062a1 1 0 112 0v2.626a5.5 5.5 0 010 10.624v2.626a1 1 0 11-2 0v-2.626z" clipRule="evenodd" /></svg></span>)}</p>
                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <p><span className="font-semibold">Cliente:</span> {app.clientName}</p>
                                        <p><span className="font-semibold">Horário:</span> {app.time}</p>
                                    </div>
                                </div>
                            );
                        })}</div>
                        {selectedDateAppointments.length === 0 && !isSelectedDateUnavailable && (<div className="text-center py-6 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl mb-6"><div className="text-4xl mb-3">🗓️</div><p className="text-gray-600 dark:text-gray-400 font-medium">Nenhum compromisso.</p></div>)}
                        {isSelectedDateUnavailable && (<div className="text-center py-6 px-4 bg-red-50 dark:bg-red-900/30 rounded-xl mb-6 border border-red-200 dark:border-red-700"><div className="text-4xl mb-3">⛔</div><p className="text-red-800 dark:text-red-200 font-medium">Dia indisponível.</p></div>)}
                        <button onClick={() => toggleAvailability(selectedDate)} className={`w-full p-3 rounded-xl font-semibold transition-colors duration-300 text-white ${isSelectedDateUnavailable ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>{isSelectedDateUnavailable ? 'Marcar como Disponível' : 'Marcar como Indisponível'}</button>
                    </div>
                </div>
            </div>
        )
    };
    
    const ServicesContent: React.FC = () => {
        const [isEditingServices, setIsEditingServices] = useState(false);
        const [editedServices, setEditedServices] = useState<Service[]>(JSON.parse(JSON.stringify(user.services)));
        const [generatingIconIndex, setGeneratingIconIndex] = useState<number | null>(null);
        const [generatingDescIndex, setGeneratingDescIndex] = useState<number | null>(null);
        const [showIconPicker, setShowIconPicker] = useState<number | null>(null);
        const pickerRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                    setShowIconPicker(null);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);
        
        const handleServiceChange = (index: number, field: keyof Service, value: string | number) => {
            const newServices = [...editedServices];
            (newServices[index] as any)[field] = field === 'price' ? (isNaN(Number(value)) ? 0 : Number(value)) : value;
            setEditedServices(newServices);
        };

        const handleAddService = () => setEditedServices([...editedServices, { id: `new-${Date.now()}`, icon: '🆕', name: 'Novo Serviço', price: 100, description: 'Descrição detalhada do serviço.', videoUrl: '' }]);
        const handleRemoveService = (id: string) => setEditedServices(editedServices.filter(s => s.id !== id));
        const handleSaveServices = async () => { await updateUserServices(user.id, editedServices); setIsEditingServices(false); };
        const handleCancelEditServices = () => { setIsEditingServices(false); setEditedServices(JSON.parse(JSON.stringify(user.services))); };
        
        const handleGenerateIcon = async (index: number) => {
            const service = editedServices[index];
            if (!service.name) return;
            
            setGeneratingIconIndex(index);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-3-pro-image-preview',
                    contents: {
                        parts: [{ text: `Generate a simple, flat, minimalist vector icon representing the service: "${service.name}". Description: "${service.description}". White background.` }]
                    },
                    config: {
                        imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
                    }
                });
                
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64 = part.inlineData.data;
                        handleServiceChange(index, 'icon', `data:image/png;base64,${base64}`);
                    }
                }
            } catch (error) {
                console.error(error);
                addAlert('Erro ao gerar ícone.', 'error');
            } finally {
                setGeneratingIconIndex(null);
            }
        };

        const handleGenerateDescription = async (index: number) => {
            const service = editedServices[index];
            if (!service.name) {
                addAlert('Digite o nome do serviço primeiro.', 'info');
                return;
            }
            
            setGeneratingDescIndex(index);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Crie uma descrição curta (máximo 150 caracteres), atraente e profissional para um serviço de cuidador chamado "${service.name}". Foco no benefício para o cliente. Em português.`
                });
                
                const desc = response.text?.trim();
                if (desc) {
                    handleServiceChange(index, 'description', desc);
                }
            } catch (error) {
                console.error(error);
                addAlert('Erro ao gerar descrição.', 'error');
            } finally {
                setGeneratingDescIndex(null);
            }
        };

        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gerencie Seus Serviços e Preços</h2>
                    {!isEditingServices && (<button onClick={() => setIsEditingServices(true)} className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"><svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>Editar</button>)}
                </div>
                <div className="space-y-6">
                    {isEditingServices ? (editedServices.map((service, index) => (
                        <div key={service.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                            {/* Column 1: Icon Control (Takes 2 cols on Desktop) */}
                            <div className="lg:col-span-2 flex flex-col items-center justify-center gap-2 relative">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 self-start lg:self-center">Ícone</label>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={service.icon} 
                                            onChange={(e) => handleServiceChange(index, 'icon', e.target.value)} 
                                            className="w-14 h-14 text-2xl text-center border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500" 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => setShowIconPicker(showIconPicker === index ? null : index)}
                                            className="p-1.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                            title="Escolher ícone"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                        </button>
                                        <button 
                                            onClick={() => handleGenerateIcon(index)} 
                                            disabled={generatingIconIndex === index}
                                            className="p-1.5 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 disabled:opacity-50 transition-colors"
                                            title="Gerar com IA"
                                        >
                                            {generatingIconIndex === index ? <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"/> : '✨'}
                                        </button>
                                    </div>
                                </div>
                                {showIconPicker === index && (
                                    <div ref={pickerRef} className="absolute top-full left-0 mt-2 z-50 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 animate-scale-in">
                                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Selecione um ícone</h4>
                                        <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                                            {ICON_PRESETS.map((icon) => (
                                                <button
                                                    key={icon}
                                                    onClick={() => { handleServiceChange(index, 'icon', icon); setShowIconPicker(null); }}
                                                    className="text-2xl p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Column 2: Basic Info (Name & Price) (Takes 3 cols on Desktop) */}
                            <div className="lg:col-span-3 flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Nome do Serviço</label>
                                    <input type="text" value={service.name} onChange={(e) => handleServiceChange(index, 'name', e.target.value)} className="w-full px-3 py-2 font-semibold border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Preço (R$)</label>
                                    <input type="number" value={service.price} onChange={(e) => handleServiceChange(index, 'price', e.target.value)} className="w-full px-3 py-2 font-bold text-right border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white" />
                                </div>
                            </div>

                            {/* Column 3: Description (Takes 4 cols on Desktop) */}
                            <div className="lg:col-span-4 relative h-full flex flex-col">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Descrição Detalhada</label>
                                <div className="relative flex-grow">
                                    <textarea 
                                        value={service.description} 
                                        onChange={(e) => handleServiceChange(index, 'description', e.target.value)} 
                                        className="w-full h-full min-h-[100px] px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white resize-none" 
                                        placeholder="Descreva o que está incluso neste serviço..."
                                    />
                                    <button 
                                        onClick={() => handleGenerateDescription(index)}
                                        disabled={generatingDescIndex === index}
                                        className="absolute bottom-2 right-2 p-1.5 text-xs bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 disabled:opacity-50 transition-colors"
                                        title="Gerar descrição com IA"
                                    >
                                        {generatingDescIndex === index ? <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"/> : '✨ IA'}
                                    </button>
                                </div>
                            </div>

                            {/* Column 4: Extras (Video) (Takes 2 cols on Desktop) */}
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Vídeo / Link (Opcional)</label>
                                <input 
                                    type="url" 
                                    value={service.videoUrl || ''} 
                                    onChange={(e) => handleServiceChange(index, 'videoUrl', e.target.value)} 
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white" 
                                    placeholder="https://..." 
                                />
                            </div>

                            {/* Column 5: Actions (Delete) (Takes 1 col on Desktop) */}
                            <div className="lg:col-span-1 flex justify-center items-center h-full pt-6 lg:pt-0">
                                <button onClick={() => handleRemoveService(service.id)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 transition-colors" title="Remover serviço">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        </div>
                    ))) : (user.services.map(service => (
                        <div key={service.id} className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 mr-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center overflow-hidden">
                                        {(service.icon.startsWith('data:') || service.icon.startsWith('http')) ? (
                                            <img src={service.icon} alt={service.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-3xl">{service.icon}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-800 dark:text-white">{service.name}</h4>
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">R$ {service.price}</div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">{service.description}</p>
                            {service.videoUrl && (
                                <a href={service.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                                    Ver vídeo/material explicativo
                                </a>
                            )}
                        </div>
                    )))}
                </div>
                {isEditingServices && (<div className="mt-6 space-y-4 animate-fade-in"><button onClick={handleAddService} className="w-full flex items-center justify-center p-3 rounded-lg font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"><svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>Adicionar Novo Serviço</button><div className="flex justify-end gap-4"><button onClick={handleCancelEditServices} className="px-6 py-2 rounded-lg font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancelar</button><button onClick={handleSaveServices} className="px-6 py-2 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">Salvar Alterações</button></div></div>)}
            </div>
        );
    }

    const FinancialContent: React.FC = () => {
        const userAppointments = useMemo(() => 
            appointments.filter(a => a.caregiverId === user.id && a.status === 'completed'), 
            [appointments, user.id]);

        const totalEarned = userAppointments.reduce((sum, app) => sum + (app.caregiverEarnings || 0), 0);
        const totalPending = appointments
            .filter(a => a.caregiverId === user.id && a.status === 'confirmed')
            .reduce((sum, app) => sum + (app.caregiverEarnings || (app.cost * 0.85)), 0);

        return (
            <div className="animate-fade-in space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard 
                        title="Ganhos Totais (Líquido)" 
                        value={`R$ ${totalEarned.toFixed(2)}`} 
                        color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                        icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
                    />
                    <StatCard 
                        title="A Receber (Agendados)" 
                        value={`R$ ${totalPending.toFixed(2)}`} 
                        color="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                        icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Extrato de Pagamentos</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Data</th>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3">Serviço</th>
                                    <th className="px-6 py-3 text-right">Valor Total</th>
                                    <th className="px-6 py-3 text-right">Taxa (15%)</th>
                                    <th className="px-6 py-3 text-right">Seu Ganho</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userAppointments.length > 0 ? userAppointments.map(app => (
                                    <tr key={app.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4">{new Date(app.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{app.clientName}</td>
                                        <td className="px-6 py-4">{app.serviceType}</td>
                                        <td className="px-6 py-4 text-right">R$ {app.cost.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-red-500">- R$ {(app.platformFee || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600">+ R$ {(app.caregiverEarnings || 0).toFixed(2)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center">Nenhum pagamento concluído ainda.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };
    
    const renderContent = () => {
        switch(activeTab) {
            case 'overview':
                return <OverviewContent />;
            case 'agenda':
                return <AgendaContent />;
            case 'services':
                return <ServicesContent />;
            case 'financial':
                return <FinancialContent />;
            case 'wallet':
                return <WalletPage />;
            case 'settings':
                return <CaregiverSettingsPage user={user} />;
            default:
                return <OverviewContent />;
        }
    };
    
    return (
        <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6 py-8">
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-10 rounded-3xl mb-8 shadow-2xl animate-scale-in">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full animate-pulse-soft"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row items-start justify-between">
                            <div className="flex items-center mb-4 sm:mb-0">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0"><svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg></div>
                                <div><h1 className="text-4xl font-bold mb-2">Bem-vindo, {user.name.split(' ')[0]}! 🎉</h1><p className="text-lg text-white/90">Seu painel de controle profissional</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                        <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 font-semibold text-lg transition-colors duration-300 whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
                            Visão Geral
                        </button>
                        <button onClick={() => setActiveTab('agenda')} className={`px-6 py-3 font-semibold text-lg transition-colors duration-300 whitespace-nowrap ${activeTab === 'agenda' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
                            Agenda Inteligente
                        </button>
                        <button onClick={() => setActiveTab('services')} className={`px-6 py-3 font-semibold text-lg transition-colors duration-300 whitespace-nowrap ${activeTab === 'services' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
                            Meus Serviços
                        </button>
                        <button onClick={() => setActiveTab('financial')} className={`px-6 py-3 font-semibold text-lg transition-colors duration-300 whitespace-nowrap ${activeTab === 'financial' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
                            Financeiro
                        </button>
                        <button onClick={() => setActiveTab('wallet')} className={`px-6 py-3 font-semibold text-lg transition-colors duration-300 whitespace-nowrap ${activeTab === 'wallet' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
                            Carteira Digital 💰
                        </button>
                        <button onClick={() => setActiveTab('settings')} className={`px-6 py-3 font-semibold text-lg transition-colors duration-300 whitespace-nowrap ${activeTab === 'settings' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
                            Configurações
                        </button>
                    </div>
                </div>

                {renderContent()}

            </div>
            {selectedAppointmentForLog && (
                <CareLogModal 
                    appointment={selectedAppointmentForLog}
                    onClose={() => setSelectedAppointmentForLog(null)}
                />
            )}
            {checkInModalData && (
                <CheckInModal 
                    appointment={checkInModalData.appointment}
                    type={checkInModalData.type}
                    onClose={() => setCheckInModalData(null)}
                />
            )}
            {isHighlightModalOpen && (
                <HighlightModal
                    userId={user.id}
                    onClose={() => setIsHighlightModalOpen(false)}
                />
            )}
        </div>
    );
};

export default DashboardPage;