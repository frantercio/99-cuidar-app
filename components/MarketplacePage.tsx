
import React, { useState, useEffect, useRef, useMemo } from 'react';
import CaregiverCard from './CaregiverCard';
import { useAppStore } from '../store/useAppStore';
import { Caregiver, Client } from '../types';
import GeolocationPermissionModal from './GeolocationPermissionModal';
import AIMatchModal, { AIPrefs } from './AIMatchModal';

const certificationOptions = ["Primeiros Socorros", "Cuidados Paliativos", "Gerontologia", "Reabilitação", "Técnico de Enfermagem", "Auxiliar de Enfermagem"];

const quickCategories = [
    { label: 'Alzheimer', icon: '🧠', value: 'alzheimer' },
    { label: 'Parkinson', icon: '🤝', value: 'parkinson' },
    { label: 'Pós-cirúrgico', icon: '🏥', value: 'pos-cirurgico' },
    { label: 'Diabetes', icon: '💉', value: 'diabetes' },
    { label: 'Demência', icon: '🧩', value: 'demencia' },
    { label: 'Mobilidade', icon: '♿', value: 'mobilidade' },
    { label: 'Pediátricos', icon: '👶', value: 'pediatrico' },
    { label: 'Paliativos', icon: '❤️‍🩹', value: 'paliativo' },
];

const MarketplacePage: React.FC = () => {
    const { caregivers, viewProfile, addAlert, isLoading, currentUser } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [location, setLocation] = useState('');
    const [availability, setAvailability] = useState('');
    const [experienceLevel, setExperienceLevel] = useState(''); 
    const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('relevance');
    const [certsOpen, setCertsOpen] = useState(false);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [filteredCaregivers, setFilteredCaregivers] = useState<(Caregiver & { matchScore?: number })[]>([]);
    const [isMatching, setIsMatching] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'loading'>('loading');
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiMatchPrefs, setAiMatchPrefs] = useState<AIPrefs | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    
    // Novo estado para controlar a expansão dos filtros
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
    
    const BATCH_SIZE = 6;
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
    
    const uniqueCities: string[] = useMemo(() => {
        const cities = caregivers.map(c => c.city);
        return cities.filter((value, index, self) => self.indexOf(value) === index).sort();
    }, [caregivers]);

    const certsDropdownRef = useRef<HTMLDivElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms debounce
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const requestGeolocation = () => {
        if (!navigator.geolocation) {
            addAlert('Geolocalização não é suportada pelo seu navegador.', 'info');
            setPermissionStatus('denied');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // Using a free reverse geocoding service. Replace with a paid one for production.
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
                    if (!response.ok) throw new Error('Reverse geocoding failed');
                    
                    const stateMap: { [key: string]: string } = { 'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO' };
                    const data = await response.json();
                    const city = data.address.city || data.address.town || data.address.village;
                    const stateName = data.address.state;
                    const stateAbbr = stateMap[stateName];
                    
                    if (city && stateAbbr) {
                        const locationString = `${city}, ${stateAbbr}`;
                        if (uniqueCities.includes(locationString)) {
                             setLocation(locationString);
                             addAlert(`Exibindo cuidadores em ${city}, ${stateAbbr}.`, 'info');
                        } else {
                            addAlert(`Nenhum cuidador encontrado para sua cidade (${city}). Mostrando todos.`, 'info');
                        }
                    }
                } catch (error) {
                    console.error("Error fetching city from coordinates:", error);
                    addAlert('Não foi possível identificar sua cidade.', 'error');
                } finally {
                    setPermissionStatus('granted');
                    setIsLocating(false);
                }
            },
            () => {
                setPermissionStatus('denied');
                addAlert('Não foi possível obter sua localização. A busca manual por cidade está disponível.', 'info');
                setIsLocating(false);
            }
        );
    };
    
    useEffect(() => {
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                setPermissionStatus(result.state);
                if (result.state === 'prompt') {
                    setShowPermissionModal(true);
                } else if (result.state === 'granted') {
                    requestGeolocation();
                }
                result.onchange = () => {
                    setPermissionStatus(result.state);
                     if (result.state === 'granted') {
                        requestGeolocation();
                    }
                }
            });
        } else {
            setPermissionStatus('prompt'); // Fallback for older browsers
            setShowPermissionModal(true);
        }
    }, []);

    const handleAllowGeolocation = () => {
        setShowPermissionModal(false);
        requestGeolocation();
    };

    const handleDenyGeolocation = () => {
        setShowPermissionModal(false);
        setPermissionStatus('denied');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (certsDropdownRef.current && !certsDropdownRef.current.contains(event.target as Node)) {
                setCertsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    useEffect(() => {
        if (aiMatchPrefs) return; // Skip if AI filter is active

        let results = caregivers.filter(caregiver => {
            if (caregiver.vacationMode?.active) return false;

            const matchesSearch = caregiver.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                                caregiver.specializations.some(spec => spec.includes(debouncedSearchTerm.toLowerCase())) ||
                                caregiver.bio.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const matchesLocation = !location || caregiver.city === location;
            const matchesAvailability = !availability || caregiver.availability === availability || (availability === 'this_week' && caregiver.availability === 'today');
            const matchesExperience = !experienceLevel || caregiver.experience === experienceLevel;
            const matchesCerts = selectedCerts.length === 0 || selectedCerts.every(cert => caregiver.certifications.includes(cert));
            
            // Favorites Filter
            let matchesFavorites = true;
            if (showFavoritesOnly) {
                if (currentUser?.role !== 'client') {
                    matchesFavorites = false; // Only clients have favorites
                } else {
                    const client = currentUser as Client;
                    matchesFavorites = (client.favorites || []).includes(caregiver.id);
                }
            }
            
            return matchesSearch && matchesLocation && matchesAvailability && matchesExperience && matchesCerts && matchesFavorites;
        });

        // Sorting logic with highlighting
        results.sort((a, b) => {
            const aIsHighlighted = a.highlightedUntil && new Date(a.highlightedUntil) > new Date();
            const bIsHighlighted = b.highlightedUntil && new Date(b.highlightedUntil) > new Date();
            if (aIsHighlighted && !bIsHighlighted) return -1;
            if (!aIsHighlighted && bIsHighlighted) return 1;

            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'reviews') return b.reviewsCount - a.reviewsCount;
            
            return 0; // Default relevance (or keep original order)
        });
        
        setFilteredCaregivers(results.map(c => ({...c, matchScore: 0})));
        setVisibleCount(BATCH_SIZE);
    }, [debouncedSearchTerm, location, availability, experienceLevel, selectedCerts, sortBy, caregivers, aiMatchPrefs, showFavoritesOnly, currentUser]);
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < filteredCaregivers.length) {
                    setTimeout(() => setVisibleCount(prevCount => prevCount + BATCH_SIZE), 500);
                }
            }, { rootMargin: '0px 0px 300px 0px' }
        );
        const currentRef = loadMoreRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, [visibleCount, filteredCaregivers.length]);

    const handleCertChange = (cert: string) => setSelectedCerts(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]);

    const handleFindMatches = (prefs: AIPrefs) => {
        setIsMatching(true);
        setAiMatchPrefs(prefs);
        
        // Capture a localização selecionada no momento do clique
        const locationFilter = location;

        // Limpa outros filtros para focar no resultado da IA, mas MANTÉM a localização selecionada
        setSearchTerm(''); 
        // setLocation(''); // REMOVIDO: Não limpar a localização para respeitar a escolha do usuário
        setAvailability(''); 
        setExperienceLevel(''); 
        setSelectedCerts([]); 
        setSortBy('relevance'); 
        setShowFavoritesOnly(false);

        setTimeout(() => { // Simulate processing
            const calculateMatchScore = (caregiver: Caregiver, prefs: AIPrefs): number => {
                let score = 0;
                let maxScore = 0;

                maxScore += 50;
                if (prefs.specializations.length > 0) {
                    const matchCount = caregiver.specializations.filter(s => prefs.specializations.includes(s)).length;
                    score += (matchCount / prefs.specializations.length) * 50;
                } else {
                    score += 25;
                }

                maxScore += 20;
                const expLevels: { [key: string]: number } = { "0-2": 1, "3-5": 2, "6-10": 3, "10+": 4 };
                if (prefs.experience && expLevels[caregiver.experience] >= expLevels[prefs.experience]) {
                    score += 20;
                } else if (!prefs.experience) {
                    score += 10;
                }

                maxScore += 15;
                if (prefs.keywords.length > 0) {
                    const bioLower = caregiver.bio.toLowerCase();
                    const keywordMatchCount = prefs.keywords.filter(k => bioLower.includes(k.toLowerCase())).length;
                    score += (keywordMatchCount / prefs.keywords.length) * 15;
                } else {
                    score += 5;
                }
                
                maxScore += 15;
                score += (caregiver.rating / 5) * 15;

                return score / maxScore;
            };

            const scoredCaregivers = caregivers
                .filter(c => !c.vacationMode?.active)
                // Adiciona filtro de localização na IA
                .filter(c => {
                    // Se houver uma localização selecionada, filtra por ela. Se for vazio, traz todos.
                    if (locationFilter && c.city !== locationFilter) {
                        return false;
                    }
                    return true;
                })
                .map(caregiver => ({
                    ...caregiver,
                    matchScore: calculateMatchScore(caregiver, prefs),
                })).sort((a, b) => {
                    const aIsHighlighted = a.highlightedUntil && new Date(a.highlightedUntil) > new Date();
                    const bIsHighlighted = b.highlightedUntil && new Date(b.highlightedUntil) > new Date();
                    if (aIsHighlighted && !bIsHighlighted) return -1;
                    if (!aIsHighlighted && bIsHighlighted) return 1;
                    return b.matchScore - a.matchScore;
                });
            
            setFilteredCaregivers(scoredCaregivers);
            const locationMsg = locationFilter ? ` em ${locationFilter}` : '';
            addAlert(`IA encontrou os melhores matches${locationMsg} para você! 🤖✨`, 'info');
            setIsMatching(false);
            setVisibleCount(BATCH_SIZE);
        }, 1500);
    };
    
    const clearAiFilter = () => {
        setAiMatchPrefs(null);
    };
    
    const commonSelectClasses = "w-full px-6 py-4 text-base border-0 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all duration-300 disabled:opacity-70 disabled:cursor-wait appearance-none";

    const getLocationOptionText = () => {
        if (isLocating) return '📍 Localizando...';
        if (permissionStatus === 'loading') return '📍 Verificando...';
        if (permissionStatus === 'denied') return '🚫 Sem acesso';
        return '🌍 Todas';
    };

    const handleCategoryClick = (categoryValue: string) => {
        if (searchTerm === categoryValue) {
            setSearchTerm('');
        } else {
            setSearchTerm(categoryValue);
        }
    };

    return (
        <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
            {isAiModalOpen && <AIMatchModal onClose={() => setIsAiModalOpen(false)} onFindMatches={handleFindMatches} />}
            {showPermissionModal && <GeolocationPermissionModal onAllow={handleAllowGeolocation} onDeny={handleDenyGeolocation} />}
            <div className="container mx-auto px-6 py-12">
                <div className="text-center mb-12 animate-fade-in">
                    <div className="max-w-7xl mx-auto">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-75"></div>
                            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl transition-all duration-500">
                                
                                {/* Linha Principal: Busca e Localização */}
                                <div className="flex flex-col md:flex-row gap-4 items-center">
                                    <div className="relative flex-grow w-full">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        </div>
                                        <input type="text" placeholder="Buscar por nome, especialidade ou palavra-chave..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 text-base border-0 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all duration-300 placeholder-gray-400 shadow-inner" />
                                    </div>
                                    
                                    <div className="relative w-full md:w-64 flex-shrink-0">
                                        <select value={location} onChange={e => setLocation(e.target.value)} className={commonSelectClasses} disabled={isLocating}>
                                            <option value="">{getLocationOptionText()}</option>
                                            {uniqueCities.map(cityOption => <option key={cityOption} value={cityOption}>📍 {cityOption}</option>)}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                                        className="p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors flex items-center gap-2 font-semibold"
                                    >
                                        <span className="hidden sm:inline">Filtros</span>
                                        <svg className={`w-5 h-5 transform transition-transform duration-300 ${isFiltersExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Categorias Rápidas (Nova Adição) */}
                                <div className="mt-6 flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x no-scrollbar">
                                    {quickCategories.map(cat => (
                                        <button
                                            key={cat.value}
                                            onClick={() => handleCategoryClick(cat.value)}
                                            className={`
                                                flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all duration-300 snap-center border
                                                ${searchTerm.toLowerCase().includes(cat.value.toLowerCase())
                                                    ? 'bg-indigo-600 text-white shadow-lg scale-105 border-indigo-600'
                                                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                                                }
                                            `}
                                        >
                                            <span className="text-xl">{cat.icon}</span>
                                            <span className="text-sm">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Área Expansível de Filtros */}
                                {isFiltersExpanded && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in origin-top">
                                        
                                        <div className="relative">
                                            <select value={availability} onChange={e => setAvailability(e.target.value)} className={commonSelectClasses + " w-full"}>
                                                <option value="">🗓️ Disponibilidade</option>
                                                <option value="today">⚡ Disponível Hoje</option>
                                                <option value="this_week">📅 Esta Semana</option>
                                            </select>
                                        </div>

                                        <div className="relative">
                                            <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className={commonSelectClasses + " w-full"}>
                                                <option value="">⏳ Experiência</option>
                                                <option value="0-2">0-2 anos</option>
                                                <option value="3-5">3-5 anos</option>
                                                <option value="6-10">6-10 anos</option>
                                                <option value="10+">10+ anos</option>
                                            </select>
                                        </div>

                                        <div ref={certsDropdownRef} className="relative">
                                            <button onClick={() => setCertsOpen(!certsOpen)} className={`${commonSelectClasses} w-full text-left flex justify-between items-center`}>
                                                <span className="truncate">{selectedCerts.length > 0 ? `${selectedCerts.length} Sel.` : '🎓 Certificações'}</span>
                                                <svg className={`w-5 h-5 text-gray-400 transition-transform ${certsOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            </button>
                                            {certsOpen && (
                                                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 z-20 border dark:border-gray-700 animate-scale-in">
                                                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                                        {certificationOptions.map(cert => <label key={cert} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><input type="checkbox" checked={selectedCerts.includes(cert)} onChange={() => handleCertChange(cert)} className="h-5 w-5 rounded text-indigo-600 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 focus:ring-indigo-500" /><span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{cert}</span></label>)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={commonSelectClasses + " w-full"}>
                                                <option value="relevance">⭐ Relevância</option><option value="rating">🌟 Maior Avaliação</option><option value="reviews">💬 Mais Avaliado</option>
                                            </select>
                                        </div>
                                        
                                        {currentUser?.role === 'client' && (
                                            <button 
                                                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} 
                                                className={`w-full px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${showFavoritesOnly ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500'}`}
                                            >
                                                {showFavoritesOnly ? '❤️ Exibindo Favoritos' : '🤍 Meus Favoritos'}
                                            </button>
                                        )}

                                        <button onClick={() => setIsAiModalOpen(true)} disabled={isMatching} className="w-full btn-gradient text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed sm:col-span-2 lg:col-span-1">
                                            <span className="flex items-center justify-center">{isMatching ? <><svg className="w-5 h-5 mr-2 animate-spin" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>Analisando...</> : <><svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>IA Match</>}</span>
                                        </button>
                                    </div>
                                )}

                                {permissionStatus === 'denied' && (
                                    <p className="text-sm text-center text-yellow-600 dark:text-yellow-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        Você negou o acesso à localização. Para usar a busca automática, habilite a permissão nas configurações do seu navegador.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {aiMatchPrefs && (
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="inline-block bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md">
                            <span className="text-gray-700 dark:text-gray-300 font-semibold mr-4">Resultados da IA Match{location ? ` em ${location}` : ''}.</span>
                            <button onClick={clearAiFilter} className="font-semibold text-indigo-600 hover:underline">Limpar e ver todos</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, index) => <CaregiverCard key={index} isLoading={true} />)
                    ) : filteredCaregivers.length > 0 ? (
                        filteredCaregivers.slice(0, visibleCount).map(caregiver => (
                            <CaregiverCard
                                key={caregiver.id}
                                caregiver={caregiver}
                                onViewProfile={viewProfile}
                                matchScore={caregiver.matchScore}
                                isLoading={false}
                            />
                        ))
                    ) : (
                         <div className="col-span-full text-center py-20">
                            <div className="text-8xl mb-6">🔍</div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                                {showFavoritesOnly ? 'Você ainda não tem favoritos.' : 'Nenhum cuidador encontrado'}
                            </h3>
                            <p className="text-gray-500 text-lg">
                                {showFavoritesOnly ? 'Explore a lista e clique no coração para salvar.' : 'Tente ajustar os filtros para encontrar mais opções.'}
                            </p>
                        </div>
                    )}
                </div>

                {visibleCount < filteredCaregivers.length && (
                     <div ref={loadMoreRef} className="col-span-full text-center py-16">
                        <div className="flex justify-center items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-600 dark:text-gray-400 text-xl font-semibold">Carregando mais cuidadores...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketplacePage;
