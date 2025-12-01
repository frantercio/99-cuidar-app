
import React, { useState, useRef, useEffect } from 'react';
import { Appointment, AppointmentAction } from '../types';
import { useAppStore } from '../store/useAppStore';

interface CheckInModalProps {
    appointment: Appointment;
    type: 'in' | 'out';
    onClose: () => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ appointment, type, onClose }) => {
    const { performCheckIn, performCheckOut, addAlert } = useAppStore();
    const [step, setStep] = useState(1); // 1: GPS, 2: Camera, 3: Success
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Distance in meters allowed
    const MAX_DISTANCE = 300; // Giving some buffer for GPS drift/mock data

    // Haversine formula to calculate distance
    const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d * 1000; // Distance in meters
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    const handleGetLocation = () => {
        setIsLoading(true);
        if (!navigator.geolocation) {
            addAlert('Geolocalização não suportada.', 'error');
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                setLocation({ lat: userLat, lng: userLng });
                
                const clientLat = appointment.clientCoordinates?.lat || -2.53073; // Default Mock Lat
                const clientLng = appointment.clientCoordinates?.lng || -44.3068; // Default Mock Lng
                
                // For demo purposes, if appointment has no coordinates, we set target to current location so it passes
                const targetLat = appointment.clientCoordinates ? clientLat : userLat; 
                const targetLng = appointment.clientCoordinates ? clientLng : userLng;

                const distance = getDistanceFromLatLonInKm(userLat, userLng, targetLat, targetLng);
                
                setIsLoading(false);

                // FOR DEMO: If distance check fails, we allow proceed with a warning/simulation button
                if (distance > MAX_DISTANCE) {
                    // Logic handled in UI
                } else {
                    setTimeout(() => setStep(2), 1000);
                }
            },
            (error) => {
                console.error(error);
                addAlert('Erro ao obter localização. Verifique as permissões.', 'error');
                setIsLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    // Camera handling
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            addAlert("Não foi possível acessar a câmera.", "error");
        }
    };

    useEffect(() => {
        if (step === 2) {
            startCamera();
        }
        return () => {
            // Stop stream on unmount or step change
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [step]);

    const takePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/png');
                setPhoto(dataUrl);
            }
        }
    };

    const handleConfirm = async () => {
        if (!location || !photo) return;
        
        setIsLoading(true);
        const data: AppointmentAction = {
            timestamp: new Date().toISOString(),
            location,
            photo,
            verified: true
        };

        let success = false;
        if (type === 'in') {
            success = await performCheckIn(appointment.id, data);
        } else {
            success = await performCheckOut(appointment.id, data);
        }

        setIsLoading(false);
        if (success) {
            onClose();
        }
    };

    // For demo: Calculate distance for UI display
    const clientLat = appointment.clientCoordinates?.lat || (location?.lat || 0);
    const clientLng = appointment.clientCoordinates?.lng || (location?.lng || 0);
    const distance = location ? getDistanceFromLatLonInKm(location.lat, location.lng, clientLat, clientLng) : null;
    const isLocationValid = distance !== null && distance <= MAX_DISTANCE;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md animate-scale-in overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className={`p-6 text-white text-center ${type === 'in' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-red-600'}`}>
                    <h2 className="text-2xl font-bold">{type === 'in' ? 'Iniciar Plantão' : 'Finalizar Plantão'}</h2>
                    <p className="opacity-90 text-sm mt-1">{appointment.clientName}</p>
                </div>

                <div className="p-8 flex-grow flex flex-col justify-center items-center text-center">
                    {step === 1 && (
                        <div className="w-full">
                            <div className="mb-6 relative">
                                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 ${isLoading ? 'border-gray-200 animate-pulse' : (isLocationValid ? 'border-green-500 bg-green-50' : (location ? 'border-red-500 bg-red-50' : 'border-indigo-100'))}`}>
                                    {isLoading ? (
                                        <svg className="w-10 h-10 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <svg className={`w-10 h-10 ${isLocationValid ? 'text-green-500' : 'text-indigo-500'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                    )}
                                </div>
                                {location && (
                                    <div className="mt-4 animate-fade-in">
                                        <p className="text-gray-600 dark:text-gray-300 font-medium">
                                            Distância do local: <span className={isLocationValid ? 'text-green-600' : 'text-red-500'}>{distance?.toFixed(0)}m</span>
                                        </p>
                                        {!isLocationValid && <p className="text-xs text-red-500 mt-1">Você precisa estar a menos de {MAX_DISTANCE}m.</p>}
                                    </div>
                                )}
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Validação de Localização</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Precisamos confirmar que você está no endereço do cliente.</p>
                            
                            {!location ? (
                                <button onClick={handleGetLocation} className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
                                    📍 Verificar Localização
                                </button>
                            ) : (
                                !isLocationValid ? (
                                    <div className="space-y-3">
                                        <button onClick={handleGetLocation} className="w-full py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold transition-all">Tentar Novamente</button>
                                        {/* Demo Bypass */}
                                        <button onClick={() => setStep(2)} className="text-xs text-gray-400 underline">Simular Localização (Demo)</button>
                                    </div>
                                ) : (
                                    <p className="text-green-500 font-bold animate-pulse">Localização Confirmada!</p>
                                )
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="w-full h-full flex flex-col">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                                {photo ? 'Confirme sua Foto' : 'Selfie de Segurança'}
                            </h3>
                            
                            <div className="relative flex-grow bg-black rounded-2xl overflow-hidden mb-6 shadow-inner aspect-[3/4]">
                                {!photo ? (
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                                ) : (
                                    <img src={photo} alt="Selfie" className="w-full h-full object-cover transform scale-x-[-1]" />
                                )}
                                <canvas ref={canvasRef} className="hidden" />
                            </div>

                            <div className="flex gap-4">
                                {!photo ? (
                                    <button onClick={takePhoto} className="flex-1 py-4 bg-white border-4 border-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-50 transition-colors">
                                        <div className="w-4 h-4 bg-indigo-600 rounded-full"></div>
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => setPhoto(null)} className="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl">Repetir</button>
                                        <button onClick={handleConfirm} disabled={isLoading} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center">
                                            {isLoading ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Confirmar'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                {step === 1 && (
                    <button onClick={onClose} className="mb-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm">Cancelar</button>
                )}
            </div>
        </div>
    );
};

export default CheckInModal;
