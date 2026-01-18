
import React, { useRef, useState, useMemo } from 'react';
import { Caregiver } from '../types';
import Avatar from './Avatar';
import { useAppStore } from '../store/useAppStore';
import BookingModal from './BookingModal';

interface PublicProfilePageProps {
    caregiver: Caregiver;
}

const SocialIcon: React.FC<{ platform: string, url: string }> = ({ platform, url }) => {
    const icons: { [key: string]: React.ReactNode } = {
        instagram: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm5.75-9.25a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clipRule="evenodd" /></svg>,
        facebook: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>,
        linkedin: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>,
        whatsapp: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.885-.002 2.024.63 3.965 1.739 5.625l-1.134 4.135 4.27-1.12z"/></svg>,
    };
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300">
            {icons[platform]}
        </a>
    );
};


const PublicProfilePage: React.FC<PublicProfilePageProps> = ({ caregiver }) => {
    const { currentUser, updateUserPhoto, addAlert, navigate, openChatWithUser } = useAppStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isOwner = currentUser?.id === caregiver.id;
    const isClient = currentUser?.role === 'client';
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingDate, setBookingDate] = useState<Date | null>(null);
    const [isServicesExpanded, setIsServicesExpanded] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    const availabilityMap: { [key: string]: string } = {
        today: 'Hoje',
        this_week: 'Esta semana',
        next_week: 'Próxima semana',
        unavailable: 'Indisponível'
    };

    const handlePhotoClick = () => {
        if (isOwner) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const newPhotoUrl = URL.createObjectURL(file);
            updateUserPhoto(caregiver.id, newPhotoUrl);
        } else if (file) {
            addAlert('Por favor, selecione um arquivo de imagem válido.', 'error');
        }
    };

    const handleOpenBookingModal = (date?: Date) => {
        if (!currentUser) {
            addAlert("Você precisa fazer login para agendar um serviço.", "info");
            navigate('login');
            return;
        }
        if (currentUser.role === 'caregiver') {
            addAlert("Cuidadores não podem agendar serviços. Por favor, acesse com uma conta de cliente.", "error");
            return;
        }
        if (date) {
            setBookingDate(date);
        } else {
            setBookingDate(null);
        }
        setIsBookingModalOpen(true);
    };
    
    const handleEditProfile = () => {
        navigate('dashboard');
    }

    const handleShareProfile = () => {
        const profileUrl = `${window.location.origin}#profile-${caregiver.id}`;
        navigator.clipboard.writeText(profileUrl).then(() => {
            addAlert('Link do perfil copiado para a área de transferência!');
        }).catch(err => {
            console.error('Failed to copy profile link: ', err);
            addAlert('Não foi possível copiar o link.', 'error');
        });
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const unavailableDatesSet = useMemo(() => new Set(caregiver.unavailableDates || []), [caregiver.unavailableDates]);

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const calendarDays = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const isPast = date < today;
            const isToday = date.toDateString() === today.toDateString();
            const isUnavailable = unavailableDatesSet.has(dateString);

            let dayClasses = 'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 text-sm ';
            let isDisabled = false;

            if (isPast) {
                dayClasses += 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50';
                isDisabled = true;
            } else if (isUnavailable) {
                dayClasses += 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 cursor-not-allowed opacity-75';
                isDisabled = true;
            } else if (isToday) {
                dayClasses += 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900 shadow-lg transform scale-110 hover:bg-indigo-700 cursor-pointer';
            } else {
                dayClasses += 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 hover:scale-110 cursor-pointer';
            }

            if (isDisabled) {
                calendarDays.push(
                    <div key={day} className={dayClasses}>
                        {day}
                    </div>
                );
            } else {
                calendarDays.push(
                    <button 
                        key={day} 
                        className={dayClasses}
                        onClick={() => handleOpenBookingModal(date)}
                        title="Clique para agendar"
                    >
                        {day}
                    </button>
                );
            }
        }
        return calendarDays;
    };

    const SecurityStatus: React.FC<{
        label: string;
        status: 'completed' | 'pending' | boolean;
    }> = ({ label, status }) => {
        const isCompleted = status === 'completed' || status === true;
        const isPending = status === 'pending';
        const isNotAvailable = status === false;
        
        return (
            <li className="flex items-center justify-between text-lg">
                <span className="flex items-center text-gray-700 dark:text-gray-300">
                    {isCompleted && <svg className="w-6 h-6 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                    {isPending && <svg className="w-6 h-6 mr-3 text-yellow-500 animate-spin-slow" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>}
                     {isNotAvailable && <svg className="w-6 h-6 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>}
                    {label}
                </span>
                 <span className={`font-bold ${isCompleted ? 'text-green-600 dark:text-green-400' : isPending ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500'}`}>
                    {isCompleted ? 'Verificado' : isPending ? 'Pendente' : 'Não disponível'}
                </span>
            </li>
        );
    }

    const hasSocialMedia = caregiver.socialMedia && Object.values(caregiver.socialMedia).some(v => v);

    const CoverContent = () => {
        const cover = caregiver.cover;
        if (!cover) {
            return <div className="w-full h-full bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200" />;
        }
        switch (cover.type) {
            case 'gradient':
                return <div className={`w-full h-full ${cover.value}`} />;
            case 'color':
                return <div className="w-full h-full" style={{ backgroundColor: cover.value }} />;
            case 'image':
                return <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${cover.value})` }} />;
            default:
                return <div className="w-full h-full bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200" />;
        }
    };
    
    const inVacationMode = caregiver.vacationMode?.active;

    return (
        <>
            <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-6xl mx-auto">
                        {inVacationMode && (
                            <div className="mb-8 p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-2xl text-center font-semibold text-lg border border-yellow-200 dark:border-yellow-700">
                                🏖️ Este cuidador está ausente e retornará em {new Date(caregiver.vacationMode!.returnDate!).toLocaleDateString('pt-BR')}.
                            </div>
                        )}
                        <div className="relative animate-scale-in mb-[-80px]">
                            <div className="h-64 rounded-3xl overflow-hidden relative group shadow-lg">
                                <CoverContent />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 pt-28">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Left Side: Main Info */}
                                <div className="lg:w-2/3">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 mb-6">
                                        <div 
                                            className={`relative w-40 h-40 flex-shrink-0 rounded-3xl shadow-lg group ${isOwner ? 'cursor-pointer' : ''}`}
                                            onClick={handlePhotoClick}
                                        >
                                            <Avatar 
                                                photo={caregiver.photo} 
                                                name={caregiver.name} 
                                                className="w-full h-full rounded-3xl" 
                                                textClassName="text-8xl"
                                            />
                                            {isOwner && (
                                                <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                                </div>
                                            )}
                                             <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{caregiver.name}</h1>
                                            <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">{caregiver.city}</p>
                                             <div className="flex justify-center sm:justify-start items-center mb-4">
                                                <div className="flex text-yellow-400 mr-2">
                                                    {'★'.repeat(Math.round(caregiver.rating))}{'☆'.repeat(5 - Math.round(caregiver.rating))}
                                                </div>
                                                <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">{caregiver.rating.toFixed(1)} ({caregiver.reviewsCount} avaliações)</span>
                                            </div>
                                            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                                                 <button onClick={handleShareProfile} className="px-5 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                                    Compartilhar
                                                </button>
                                                {isOwner && (
                                                     <button onClick={handleEditProfile} className="px-5 py-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors flex items-center gap-2">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                                        Editar Perfil
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8">
                                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Sobre mim</h3>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{caregiver.bio}</p>
                                    </div>

                                </div>
                                
                                {/* Right Side: Details */}
                                <div className="lg:w-1/3">
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
                                        <ul className="space-y-4">
                                            <li className="flex justify-between items-center text-lg"><span className="text-gray-600 dark:text-gray-400">Experiência</span><span className="font-bold text-gray-800 dark:text-white">{caregiver.experience} anos</span></li>
                                            <li className="flex justify-between items-center text-lg"><span className="text-gray-600 dark:text-gray-400">Verificado</span><span className={`font-bold ${caregiver.verified ? 'text-green-600' : 'text-gray-500'}`}>{caregiver.verified ? 'Sim' : 'Não'}</span></li>
                                            <li className="flex justify-between items-center text-lg"><span className="text-gray-600 dark:text-gray-400">Disponível</span><span className="font-bold text-gray-800 dark:text-white capitalize">{availabilityMap[caregiver.availability] || caregiver.availability}</span></li>
                                            <li className="flex justify-between items-center text-lg"><span className="text-gray-600 dark:text-gray-400">Resposta em</span><span className="font-bold text-gray-800 dark:text-white">{caregiver.responseTime}</span></li>
                                            <li className="flex justify-between items-center text-lg"><span className="text-gray-600 dark:text-gray-400">Trabalhos</span><span className="font-bold text-gray-800 dark:text-white">{caregiver.completedJobs}</span></li>
                                        </ul>
                                        {hasSocialMedia && (
                                            <>
                                                <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
                                                <div className="flex justify-center gap-4">
                                                    {caregiver.socialMedia?.instagram && <SocialIcon platform="instagram" url={caregiver.socialMedia.instagram} />}
                                                    {caregiver.socialMedia?.facebook && <SocialIcon platform="facebook" url={caregiver.socialMedia.facebook} />}
                                                    {caregiver.socialMedia?.linkedin && <SocialIcon platform="linkedin" url={caregiver.socialMedia.linkedin} />}
                                                    {caregiver.socialMedia?.whatsapp && <SocialIcon platform="whatsapp" url={caregiver.socialMedia.whatsapp} />}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {!isOwner && (
                                        <>
                                            <button onClick={() => handleOpenBookingModal()} disabled={inVacationMode} className="mt-6 w-full btn-gradient text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                                                Agendar Serviço
                                            </button>
                                            {isClient && (
                                                <button 
                                                    onClick={() => openChatWithUser(caregiver.id)}
                                                    disabled={inVacationMode}
                                                    className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>
                                                    Chat
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                            {/* Services */}
                             <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Serviços e Preços</h3>
                                <div className="space-y-4">
                                    {caregiver.services.slice(0, isServicesExpanded ? caregiver.services.length : 3).map(service => (
                                        <div key={service.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex justify-between items-center transition-all duration-300 animate-fade-in">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 mr-4 flex items-center justify-center">
                                                    {(service.icon.startsWith('data:') || service.icon.startsWith('http')) ? (
                                                        <img src={service.icon} alt="" className="w-full h-full object-contain rounded-lg" />
                                                    ) : (
                                                        <span className="text-3xl">{service.icon}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300 text-lg">{service.name}</p>
                                                    <p className="text-sm text-gray-500">{service.description}</p>
                                                    {service.videoUrl && (
                                                        <a href={service.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                                                            Ver vídeo/material
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">R$ {service.price}</div>
                                        </div>
                                    ))}
                                </div>
                                {caregiver.services.length > 3 && (
                                    <div className="text-center mt-6">
                                        <button onClick={() => setIsServicesExpanded(!isServicesExpanded)} className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                            {isServicesExpanded ? 'Mostrar menos' : 'Mostrar todos os serviços'}
                                        </button>
                                    </div>
                                )}
                            </div>
                             {/* Calendar */}
                             <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Disponibilidade em Tempo Real</h3>
                                
                                {/* Time Slots Legend Block */}
                                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm">Horários de Atendimento Típicos:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-lg text-xs font-bold flex items-center">
                                            ☀️ Manhã (07h - 12h)
                                        </span>
                                        <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 rounded-lg text-xs font-bold flex items-center">
                                            🌤️ Tarde (13h - 18h)
                                        </span>
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg text-xs font-bold flex items-center">
                                            🌙 Noite (19h - 22h)
                                        </span>
                                    </div>
                                </div>

                                 <div className="flex justify-between items-center mb-4">
                                     <button onClick={handlePrevMonth} aria-label="Previous month" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 capitalize">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h4>
                                    <button onClick={handleNextMonth} aria-label="Next month" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></button>
                                </div>
                                <div className="grid grid-cols-7 gap-y-2 text-center text-sm text-gray-500 mb-2 font-bold">
                                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => <div key={i}>{day}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-y-2 place-items-center">
                                    {renderCalendar()}
                                </div>
                                <div className="flex items-center justify-center gap-4 mt-6 text-xs sm:text-sm flex-wrap">
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-200 border border-green-300"></div> Disponível</div>
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-200 border border-red-300"></div> Indisponível</div>
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-indigo-600 border border-indigo-700"></div> Hoje</div>
                                </div>
                                <p className="text-center text-xs text-gray-500 mt-4 italic">Selecione um dia disponível (verde) para iniciar o agendamento.</p>
                            </div>
                        </div>

                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                            {/* Security and Certs */}
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Segurança e Certificações</h3>
                                <ul className="space-y-4 mb-8">
                                    <SecurityStatus label="Verificação de Antecedentes" status={caregiver.security.backgroundCheck} />
                                    <SecurityStatus label="Verificação de Identidade" status={caregiver.security.idVerification} />
                                    <SecurityStatus label="Seguro de Responsabilidade" status={caregiver.security.insurance} />
                                </ul>
                                <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Certificações</h4>
                                <div className="space-y-3">
                                    {caregiver.certifications.length > 0 ? caregiver.certifications.map(cert => (
                                         <div key={cert} className="flex items-center text-lg p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                            <svg className="w-6 h-6 mr-3 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            <span className="text-gray-600 dark:text-gray-300 font-medium">{cert}</span>
                                        </div>
                                    )) : <p className="text-gray-500">Nenhuma certificação informada.</p>}
                                </div>
                            </div>

                             {/* Reviews */}
                             <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Avaliações de Clientes</h3>
                                 <div className="space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                    {caregiver.reviews.length > 0 ? caregiver.reviews.map(review => (
                                        <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                                    <Avatar photo={review.authorPhoto} name={review.author} className="w-full h-full" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <h5 className="font-bold text-gray-800 dark:text-white">{review.author}</h5>
                                                    </div>
                                                    <div className="flex text-yellow-400 my-1">{'★'.repeat(review.rating)}<span className="text-gray-300 dark:text-gray-600">{'★'.repeat(5 - review.rating)}</span></div>
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm italic">"{review.comment}"</p>
                                                     <p className="text-xs text-gray-400 mt-2">{new Date(review.date).toLocaleDateString('pt-BR')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-gray-500 py-8">Ainda não há avaliações.</p>}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            {isBookingModalOpen && <BookingModal caregiver={caregiver} onClose={() => setIsBookingModalOpen(false)} initialDate={bookingDate} />}
        </>
    );
};
export default PublicProfilePage;
