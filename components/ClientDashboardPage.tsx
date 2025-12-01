
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Client, Appointment } from '../types';
import Avatar from './Avatar';
import ClientSettingsPage from './ClientSettingsPage';
import ReviewModal from './ReviewModal';
import AppointmentTrackingModal from './AppointmentTrackingModal';
import CancelConfirmationModal from './CancelConfirmationModal';
import EditAppointmentModal from './EditAppointmentModal';
import CareLogViewerModal from './CareLogViewerModal';
import WalletPage from './WalletPage';

const ClientDashboardPage: React.FC = () => {
    const { currentUser, appointments, navigate, viewProfile, caregivers, cancelAppointment } = useAppStore();
    const [activeTab, setActiveTab] = useState<'appointments' | 'wallet' | 'settings'>('appointments');
    const [reviewingAppointment, setReviewingAppointment] = useState<Appointment | null>(null);
    const [trackingAppointment, setTrackingAppointment] = useState<Appointment | null>(null);
    const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [viewingLogAppointment, setViewingLogAppointment] = useState<Appointment | null>(null);

    const user = currentUser as Client;

    const userAppointments = useMemo(() => 
        appointments.filter(a => a.clientId === user.id)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), 
        [appointments, user.id]
    );

    const upcomingAppointments = userAppointments.filter(a => new Date(a.date) >= new Date() && a.status === 'confirmed');
    const pastAppointments = userAppointments.filter(a => new Date(a.date) < new Date() || a.status !== 'confirmed');

    const handleViewCaregiverProfile = (caregiverId: number) => {
        const caregiver = caregivers.find(c => c.id === caregiverId);
        if (caregiver) {
            viewProfile(caregiver);
        }
    };

    const handleOpenReviewModal = (appointment: Appointment) => {
        setReviewingAppointment(appointment);
    };

    const handleCloseReviewModal = () => {
        setReviewingAppointment(null);
    };
    
    interface AppointmentCardProps {
        app: Appointment;
    }
    const AppointmentCard: React.FC<AppointmentCardProps> = ({ app }) => {
        const isToday = new Date(app.date).toDateString() === new Date().toDateString();
        const isUpcoming = new Date(app.date) >= new Date() && app.status === 'confirmed';
        const isCancelled = app.status === 'cancelled';

        const statusBadge = () => {
            switch (app.status) {
                case 'confirmed':
                    return <span className="px-2 py-1 text-xs font-semibold rounded-full capitalize bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Confirmado</span>;
                case 'completed':
                    return <span className="px-2 py-1 text-xs font-semibold rounded-full capitalize bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Concluído</span>;
                case 'cancelled':
                    return <span className="px-2 py-1 text-xs font-semibold rounded-full capitalize bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Cancelado</span>;
                default:
                    return <span className="px-2 py-1 text-xs font-semibold rounded-full capitalize bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{app.status}</span>;
            }
        };

        return (
            <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isCancelled ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Avatar photo={app.caregiverPhoto} name={app.caregiverName} className="w-full h-full" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg text-gray-800 dark:text-white">{app.caregiverName}</h4>
                            {app.seriesId && (
                                <div title="Agendamento Recorrente" className="text-indigo-500">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M15.312 11.224a5.5 5.5 0 01-10.624 0H2.062a1 1 0 010-2h2.626A5.5 5.5 0 0115.312 9.224h2.626a1 1 0 110 2h-2.626zM7.224 15.312a5.5 5.5 0 010-10.624V2.062a1 1 0 112 0v2.626a5.5 5.5 0 010 10.624v2.626a1 1 0 11-2 0v-2.626z" clipRule="evenodd" /></svg>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(app.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between flex-wrap">
                    <div className="text-right sm:text-left">
                        <p className="font-semibold text-green-600 dark:text-green-400">R$ {app.cost.toFixed(2)}</p>
                        {statusBadge()}
                    </div>
                    <div className="flex gap-2 flex-wrap w-full sm:w-auto justify-end">
                        {app.hasLog && (
                            <button
                                onClick={() => setViewingLogAppointment(app)}
                                className="px-4 py-2 bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 font-semibold rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900 transition-colors text-sm"
                            >
                                Ver Diário
                            </button>
                        )}
                        {app.status === 'completed' && !app.reviewed && (
                             <button 
                                onClick={() => handleOpenReviewModal(app)} 
                                className="px-4 py-2 bg-yellow-400 text-yellow-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors text-sm"
                            >
                                Avaliar
                            </button>
                        )}
                        {app.status === 'confirmed' && isToday && !isUpcoming && (
                            <button 
                                onClick={() => setTrackingAppointment(app)}
                                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-sm animate-pulse"
                            >
                                Acompanhar
                            </button>
                        )}
                        {isUpcoming && (
                             <>
                                <button onClick={() => setEditingAppointment(app)} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm">Editar</button>
                                <button onClick={() => setCancellingAppointment(app)} className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-900 transition-colors text-sm">Cancelar</button>
                            </>
                        )}
                        <button onClick={() => handleViewCaregiverProfile(app.caregiverId)} className="px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-semibold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors text-sm">
                            Ver Perfil
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    const renderContent = () => {
        if (activeTab === 'settings') {
            return <ClientSettingsPage user={user} />;
        }
        
        if (activeTab === 'wallet') {
            return <WalletPage />;
        }

        return (
            <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Histórico de Agendamentos</h2>
                
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 mt-8">Próximos Agendamentos</h3>
                <div className="space-y-4">
                    {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map(app => <AppointmentCard key={app.id} app={app} />)
                    ) : (
                        <div className="text-center py-10 px-6 bg-white dark:bg-gray-800 rounded-2xl">
                            <p className="text-gray-500">Você não tem agendamentos futuros.</p>
                            <button onClick={() => navigate('marketplace')} className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Encontrar Cuidadores</button>
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 mt-12">Agendamentos Anteriores</h3>
                <div className="space-y-4">
                     {pastAppointments.length > 0 ? (
                        pastAppointments.map(app => <AppointmentCard key={app.id} app={app} />)
                    ) : (
                        <div className="text-center py-10 px-6 bg-white dark:bg-gray-800 rounded-2xl">
                            <p className="text-gray-500">Nenhum agendamento anterior encontrado.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const caregiverForReview = useMemo(() => {
        if (!reviewingAppointment) return null;
        return caregivers.find(c => c.id === reviewingAppointment.caregiverId);
    }, [reviewingAppointment, caregivers]);

    const caregiverForEdit = useMemo(() => {
        if (!editingAppointment) return null;
        return caregivers.find(c => c.id === editingAppointment.caregiverId);
    }, [editingAppointment, caregivers]);

    return (
        <>
            <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-6 py-8">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl mb-8 shadow-lg flex items-center gap-6 animate-scale-in">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-indigo-200 dark:ring-indigo-800 flex-shrink-0">
                           <Avatar photo={user.photo} name={user.name} className="w-full h-full" textClassName="text-5xl" />
                        </div>
                        <div className="flex-grow">
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{user.name}</h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">Painel do Cliente</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                            <button onClick={() => setActiveTab('appointments')} className={`px-6 py-3 font-semibold text-lg transition-colors duration-300 ${activeTab === 'appointments' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
                                Meus Agendamentos
                            </button>
                            <button onClick={() => setActiveTab('wallet')} className={`px-6 py-3 font-semibold text-lg transition-colors duration-300 ${activeTab === 'wallet' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
                                Carteira Digital 💰
                            </button>
                            <button onClick={() => setActiveTab('settings')} className={`px-6 py-3 font-semibold text-lg transition-colors duration-300 ${activeTab === 'settings' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
                                Configurações
                            </button>
                        </div>
                    </div>

                    {renderContent()}

                </div>
            </div>
            {reviewingAppointment && caregiverForReview && (
                <ReviewModal 
                    appointment={reviewingAppointment}
                    caregiver={caregiverForReview}
                    onClose={handleCloseReviewModal}
                />
            )}
            {trackingAppointment && (
                <AppointmentTrackingModal
                    appointment={trackingAppointment}
                    onClose={() => setTrackingAppointment(null)}
                />
            )}
            {cancellingAppointment && (
                <CancelConfirmationModal
                    appointment={cancellingAppointment}
                    onClose={() => setCancellingAppointment(null)}
                    onConfirm={() => {
                        cancelAppointment(cancellingAppointment.id);
                        setCancellingAppointment(null);
                    }}
                />
            )}
            {editingAppointment && caregiverForEdit && (
                <EditAppointmentModal
                    appointment={editingAppointment}
                    caregiver={caregiverForEdit}
                    onClose={() => setEditingAppointment(null)}
                />
            )}
            {viewingLogAppointment && (
                <CareLogViewerModal 
                    appointment={viewingLogAppointment}
                    onClose={() => setViewingLogAppointment(null)}
                />
            )}
        </>
    );
};

export default ClientDashboardPage;
