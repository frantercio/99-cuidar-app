
import React, { useState } from 'react';
import { Appointment } from '../types';
import Avatar from './Avatar';
import { useAppStore } from '../store/useAppStore';

interface AppointmentDetailsModalProps {
    appointment: Appointment;
    onClose: () => void;
    onCheckIn: () => void;
    onCheckOut: () => void;
}

const TimelineItem: React.FC<{ 
    active: boolean; 
    completed: boolean; 
    icon: React.ReactNode; 
    title: string; 
    time?: string;
    last?: boolean;
}> = ({ active, completed, icon, title, time, last }) => (
    <div className="flex gap-4 relative">
        {/* Linha conectora */}
        {!last && (
            <div className={`absolute left-[15px] top-8 bottom-[-8px] w-0.5 ${completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
        )}
        {/* Bolinha/Icone */}
        <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-colors duration-300 ${
            completed 
                ? 'bg-green-500 border-green-500 text-white' 
                : active 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
        }`}>
            {completed ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
            ) : icon}
        </div>
        <div className="pb-6">
            <p className={`font-bold text-sm ${active ? 'text-indigo-600 dark:text-indigo-400' : (completed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500')}`}>
                {title}
            </p>
            {time ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded inline-block">
                    {time}
                </p>
            ) : (
                <p className="text-xs text-gray-400 italic mt-0.5">Pendente</p>
            )}
        </div>
    </div>
);

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({ appointment, onClose, onCheckIn, onCheckOut }) => {
    const { openChatWithUser, addAlert } = useAppStore();
    const [copied, setCopied] = useState(false);

    const fullAddress = `${appointment.clientStreet || ''}, ${appointment.clientAddressNumber || ''} - ${appointment.clientNeighborhood || ''}, ${appointment.clientCity || ''} - ${appointment.clientState || ''}`;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    const whatsappUrl = appointment.clientPhone 
        ? `https://wa.me/55${appointment.clientPhone.replace(/\D/g, '')}` 
        : '#';

    // Lógica de Status para Timeline
    const isToday = new Date(appointment.date).toDateString() === new Date().toDateString();
    const hasCheckIn = !!appointment.checkIn;
    const hasCheckOut = !!appointment.checkOut;
    const isCompleted = appointment.status === 'completed';

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(fullAddress);
        setCopied(true);
        addAlert('Endereço copiado para a área de transferência!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleChat = () => {
        openChatWithUser(appointment.clientId);
        onClose();
    };

    // Static Map Image (Placeholder using specialized service or generic image if no API key)
    // Using a generic map style pattern for visual appeal without consuming API quotas
    const mapPlaceholder = "https://img.freepik.com/free-vector/gps-navigation-concept_23-2147986922.jpg?w=1380&t=st=1708800000~exp=1708800600~hmac=fake_token"; 

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col md:flex-row overflow-hidden border border-gray-200 dark:border-gray-700 animate-scale-in">
                
                {/* Left Panel: Context & Actions */}
                <div className="md:w-5/12 bg-white dark:bg-gray-800 flex flex-col border-r border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div className="p-6 pb-4 bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 rounded-full transition-colors z-10">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full border-4 border-white/30 shadow-xl mb-3 overflow-hidden bg-white">
                                <Avatar photo="👨‍🦰" name={appointment.clientName} className="w-full h-full" textClassName="text-3xl" />
                            </div>
                            <h2 className="text-xl font-bold leading-tight">{appointment.clientName}</h2>
                            <p className="text-indigo-100 text-sm mt-1 mb-3">{appointment.serviceType}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${appointment.status === 'confirmed' ? 'bg-green-400/20 text-green-100 border border-green-400/30' : 'bg-gray-400/20 text-gray-200'}`}>
                                {appointment.status === 'confirmed' ? 'Confirmado' : appointment.status}
                            </span>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-4 gap-2 p-4 border-b border-gray-100 dark:border-gray-700">
                        <a href={`tel:${appointment.clientPhone}`} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                            </div>
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Ligar</span>
                        </a>
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.885-.002 2.024.63 3.965 1.739 5.625l-1.134 4.135 4.27-1.12z"/></svg>
                            </div>
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Whats</span>
                        </a>
                        <button onClick={handleChat} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                            </div>
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Chat</span>
                        </button>
                        <button onClick={handleCopyAddress} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                {copied ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>}
                            </div>
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{copied ? 'Copiado' : 'Endereço'}</span>
                        </button>
                    </div>

                    {/* Timeline */}
                    <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Cronograma do Serviço</h3>
                        <div className="pl-2">
                            <TimelineItem 
                                active={false} 
                                completed={true} 
                                icon={<span className="text-xs font-bold">📅</span>} 
                                title="Agendado" 
                                time={new Date(appointment.date).toLocaleDateString()} 
                            />
                            <TimelineItem 
                                active={!hasCheckIn && isToday} 
                                completed={hasCheckIn} 
                                icon={<span className="text-xs font-bold">🏠</span>} 
                                title="Check-in (Chegada)" 
                                time={appointment.checkIn ? new Date(appointment.checkIn.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : undefined}
                            />
                            <TimelineItem 
                                active={hasCheckIn && !hasCheckOut} 
                                completed={hasCheckOut} 
                                icon={<span className="text-xs font-bold">🏁</span>} 
                                title="Check-out (Saída)" 
                                time={appointment.checkOut ? new Date(appointment.checkOut.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : undefined}
                            />
                            <TimelineItem 
                                active={hasCheckOut && !isCompleted} 
                                completed={isCompleted} 
                                icon={<span className="text-xs font-bold">✅</span>} 
                                title="Serviço Concluído" 
                                last={true}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Map & Financials */}
                <div className="md:w-7/12 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
                    
                    {/* Visual Map Card */}
                    <div className="relative h-48 md:h-64 bg-gray-200 dark:bg-gray-800 overflow-hidden group">
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-60 transition-opacity duration-300"
                            style={{ backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(fullAddress)}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${encodeURIComponent(fullAddress)}&key=YOUR_API_KEY_HERE')`, backgroundSize: 'cover' }} // Fallback style if image fails
                        >
                             {/* Fallback visual if no API key */}
                             <div className="absolute inset-0 bg-indigo-100 dark:bg-slate-800 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/city-map.png')]">
                                <div className="text-center p-4">
                                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg animate-bounce">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                    </div>
                                </div>
                             </div>
                        </div>
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                            <a 
                                href={googleMapsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-full shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                Abrir no GPS
                            </a>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                            <p className="font-semibold text-sm truncate">{fullAddress}</p>
                        </div>
                    </div>

                    {/* Details & Earnings */}
                    <div className="p-6 flex-grow overflow-y-auto space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Data</p>
                                <p className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    📅 {new Date(appointment.date).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Horário</p>
                                <p className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    ⏰ {appointment.time}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                            <div className="relative z-10">
                                <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider mb-1">Seus Ganhos Líquidos</p>
                                <h3 className="text-4xl font-bold">R$ {(appointment.caregiverEarnings || 0).toFixed(2)}</h3>
                                <p className="text-xs text-emerald-100 mt-2 opacity-80">Valor já descontada a taxa da plataforma (15%).</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        {!isCompleted && isToday && !hasCheckIn && (
                            <button onClick={() => { onCheckIn(); onClose(); }} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                                📍 Fazer Check-in
                            </button>
                        )}
                        {!isCompleted && isToday && hasCheckIn && !hasCheckOut && (
                            <button onClick={() => { onCheckOut(); onClose(); }} className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                                🏁 Fazer Check-out
                            </button>
                        )}
                        {(!isToday && !isCompleted) || isCompleted ? (
                             <button onClick={onClose} className="w-full py-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                Fechar
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailsModal;
