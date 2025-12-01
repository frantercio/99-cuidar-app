
import React, { useState } from 'react';
import { Caregiver } from '../types';
import Avatar from './Avatar';
import { useAppStore } from '../store/useAppStore';

interface CaregiverCardProps {
    caregiver?: Caregiver;
    onViewProfile?: (caregiver: Caregiver) => void;
    matchScore?: number;
    isLoading: boolean;
}

const specDetails: { [key: string]: { name: string; icon: string; colors: string } } = {
    'alzheimer': { name: 'Alzheimer', icon: '🧠', colors: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700' },
    'parkinson': { name: 'Parkinson', icon: '🤝', colors: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700' },
    'pos-cirurgico': { name: 'Pós-cirúrgico', icon: '🏥', colors: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700' },
    'diabetes': { name: 'Diabetes', icon: '💉', colors: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700' },
    'demencia': { name: 'Demência', icon: '🧩', colors: 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-700' },
    'mobilidade-reduzida': { name: 'Mobilidade Reduzida', icon: '♿', colors: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 border-cyan-200 dark:border-cyan-700' },
    'cuidados-pediatricos': { name: 'Pediátricos', icon: '👶', colors: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700' },
    'cuidados-paliativos': { name: 'Paliativos', icon: '❤️‍🩹', colors: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700' }
};

const CaregiverCard: React.FC<CaregiverCardProps> = ({ caregiver, onViewProfile, matchScore, isLoading }) => {
    
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700/50 animate-pulse">
                <div className="relative">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 p-1.5 bg-gray-200 dark:bg-gray-700 rounded-3xl">
                        <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded-2xl"></div>
                    </div>
                </div>

                <div className="pt-20 p-6 text-center">
                    <div className="h-7 bg-gray-300 dark:bg-gray-600 rounded-md w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 mx-auto mb-4"></div>

                    <div className="flex justify-center items-center mb-6">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-24"></div>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-28"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-32"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center mb-6">
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    </div>

                    <div className="pt-2">
                        <div className="h-14 bg-gray-300 dark:bg-gray-600 rounded-2xl w-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!caregiver || !onViewProfile) {
        return null;
    }

    const [certsExpanded, setCertsExpanded] = useState(false);
    const { addAlert } = useAppStore();
    
    const isHighlighted = caregiver.highlightedUntil && new Date(caregiver.highlightedUntil) > new Date();
    
    const premiumService = caregiver.services.length > 0
        ? caregiver.services.reduce((max, service) => service.price > max.price ? service : max)
        : null;

    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const profileUrl = `${window.location.href.split('?')[0].split('#')[0]}#profile-${caregiver.id}`;
        navigator.clipboard.writeText(profileUrl).then(() => {
            addAlert('Link do perfil copiado!');
        }).catch(err => {
            console.error('Failed to copy link: ', err);
            addAlert('Falha ao copiar o link.', 'error');
        });
    };

    const handleCertsToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCertsExpanded(!certsExpanded);
    };

    return (
        <div className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg card-hover overflow-hidden border border-gray-100 dark:border-gray-700/50 group animate-slide-up`}>
             {isHighlighted && (
                <div className="absolute inset-0 rounded-3xl border-4 border-yellow-400 animate-pulse z-10 pointer-events-none"></div>
            )}
            <div>
                <div className="relative">
                    <div className={`h-48 ${caregiver.cover && caregiver.cover.type === 'gradient' ? caregiver.cover.value : 'bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-blue-900/50 dark:to-indigo-900/50'}`}></div>
                    
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 animate-scale-in">
                        <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 p-1.5 rounded-3xl shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                            <div className="w-full h-full bg-white dark:bg-gray-700 rounded-2xl overflow-hidden">
                                <Avatar 
                                    photo={caregiver.photo} 
                                    name={caregiver.name} 
                                    className="w-full h-full"
                                    textClassName="text-7xl"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {caregiver.verified && (
                        <div className="absolute top-4 right-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold text-green-600 dark:text-green-400 flex items-center shadow-md">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Verificado Pro
                        </div>
                    )}
                    <div className="absolute top-4 left-4 flex flex-col items-start gap-2 z-20">
                         {isHighlighted && (
                            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-bold rounded-full flex items-center shadow-lg">
                                🌟 Em Destaque
                            </div>
                         )}
                         {matchScore && matchScore > 0 && (
                            <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 text-white px-4 py-1.5 text-base font-extrabold rounded-full flex items-center shadow-[0_0_15px_rgba(20,184,166,0.6)] border-2 border-white/30 backdrop-blur-sm animate-pulse transform hover:scale-105 transition-transform" title="Compatibilidade baseada nas suas preferências">
                                <span className="text-xl mr-1.5">✨</span>
                                {Math.round(matchScore * 100)}% Match
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-20 p-6 text-center">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Olá, sou {caregiver.name.split(' ')[0]}! 👋</h3>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{caregiver.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">{caregiver.city}</p>

                    <div className="flex justify-center items-center gap-4 mb-4 text-sm">
                        {caregiver.online ? (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                                <span className="relative flex h-3 w-3 mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="font-semibold">Online</span>
                            </div>
                        ) : (
                             <div className="flex items-center text-gray-500">
                                <span className="relative flex h-3 w-3 mr-2">
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-400"></span>
                                </span>
                                <span className="font-semibold">Offline</span>
                            </div>
                        )}
                        <div className="border-l h-4 border-gray-300 dark:border-gray-600"></div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                             <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold">Resp. em {caregiver.responseTime}</span>
                        </div>
                    </div>

                    <div className="flex justify-center items-center mb-6">
                        <div className="flex text-yellow-400 mr-2">
                            {'★'.repeat(Math.round(caregiver.rating))}{'☆'.repeat(5 - Math.round(caregiver.rating))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">{caregiver.rating.toFixed(1)} ({caregiver.reviewsCount} avaliações)</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {caregiver.specializations.slice(0, 3).map(spec => (
                            specDetails[spec] && (
                                <div key={spec} className={`px-3 py-1 text-sm font-semibold rounded-full border-2 ${specDetails[spec].colors}`}>
                                    {specDetails[spec].icon} {specDetails[spec].name}
                                </div>
                            )
                        ))}
                    </div>

                    {caregiver.certifications.length > 0 && (
                        <div className="mb-6 text-left">
                            <button 
                                onClick={handleCertsToggle}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700/50 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex justify-between items-center"
                            >
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{caregiver.certifications.length} Certificações Verificadas</span>
                                <svg className={`w-5 h-5 text-gray-500 transition-transform ${certsExpanded ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            {certsExpanded && (
                                <div className="mt-2 space-y-2 animate-fade-in">
                                    {caregiver.certifications.map(cert => (
                                        <div key={cert} className="flex items-center text-sm p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                            <svg className="w-5 h-5 mr-3 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                            <span className="text-gray-600 dark:text-gray-300 font-medium">{cert}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 text-center mb-2 text-sm">
                        {caregiver.services.slice(0, 3).map((service) => {
                            const isPremium = service.id === premiumService?.id;
                            return (
                                <div key={service.id} className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${isPremium ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700' : 'bg-gray-50 dark:bg-gray-700/50 border-transparent'}`}>
                                    {isPremium && (
                                         <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                                            <span className="flex items-center">
                                                <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.5 2.5a1 1 0 011.756-.653l3.352 4.09 3.352-4.09A1 1 0 0115.5 2.5v1.854l-5.5 6.646-5.5-6.646V2.5zM5.5 6.646v4.854l5.5 4.5 5.5-4.5V6.646l-5.5 4.5-5.5-4.5z" clipRule="evenodd" />
                                                </svg>
                                                Premium
                                            </span>
                                        </div>
                                    )}
                                    <div className="font-bold text-lg text-gray-800 dark:text-white">R${service.price}</div>
                                    <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400">
                                        {(service.icon.startsWith('data:') || service.icon.startsWith('http')) ? (
                                            <img src={service.icon} alt="" className="w-4 h-4 object-contain" />
                                        ) : (
                                            <span>{service.icon}</span>
                                        )}
                                        <span className="truncate">{service.name}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                         <button onClick={() => onViewProfile(caregiver)} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                            <span className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                Ver Perfil
                            </span>
                        </button>
                        <button 
                            onClick={handleShareClick}
                            className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center shadow-sm"
                            aria-label="Compartilhar"
                            title="Compartilhar Perfil"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaregiverCard;
