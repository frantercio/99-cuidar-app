
import React, { useState, useMemo, useEffect } from 'react';
import { Caregiver, Client, Service } from '../types';
import { useAppStore } from '../store/useAppStore';
import PaymentForm, { PaymentDetails } from './PaymentForm';

interface BookingModalProps {
    caregiver: Caregiver;
    onClose: () => void;
    initialDate?: Date | null;
}

const PLATFORM_FEE_PERCENTAGE = 0.15;

const BookingModal: React.FC<BookingModalProps> = ({ caregiver, onClose, initialDate }) => {
    const { currentUser, addAlert, addAppointment } = useAppStore();
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    
    // Inicializa o calendário no mês da data inicial, se houver
    const [currentDate, setCurrentDate] = useState(initialDate || new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);
    
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [priceKey, setPriceKey] = useState(0);
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    const [recurrenceRule, setRecurrenceRule] = useState<'none' | 'weekly' | 'biweekly'>('none');
    const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
    
    // Payment State
    const [isPaymentValid, setIsPaymentValid] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

    useEffect(() => {
        const modalContent = document.getElementById('booking-modal-content');
        if (modalContent) modalContent.scrollTop = 0;
    }, []);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    
    const unavailableDatesSet = useMemo(() => new Set(caregiver.unavailableDates || []), [caregiver.unavailableDates]);

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null);
        if (recurrenceEndDate && date.toISOString().split('T')[0] > recurrenceEndDate) {
            setRecurrenceEndDate('');
        }
    };

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service);
        setPriceKey(key => key + 1);
    };
    
    const handlePaymentChange = (method: 'credit_card' | 'pix', details: PaymentDetails | null, isValid: boolean) => {
        setPaymentMethod(method);
        setPaymentDetails(details);
        setIsPaymentValid(isValid);
    };

    const timeSlots = useMemo(() => {
        const slots = [];
        const now = new Date();
        const isToday = selectedDate?.toDateString() === now.toDateString();
        const currentHour = now.getHours();

        for (let i = 7; i <= 22; i++) {
            if (isToday && i <= currentHour) continue;
            slots.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return slots;
    }, [selectedDate]);

    const calculateEstimatedSessions = () => {
        if (!selectedDate || recurrenceRule === 'none' || !recurrenceEndDate) return 1;
        
        let count = 0;
        let iterDate = new Date(selectedDate);
        iterDate.setMinutes(iterDate.getMinutes() + iterDate.getTimezoneOffset());
        
        const end = new Date(recurrenceEndDate);
        end.setMinutes(end.getMinutes() + end.getTimezoneOffset());
        end.setHours(23, 59, 59, 999);

        const increment = recurrenceRule === 'weekly' ? 7 : 14;

        while (iterDate <= end) {
            const dateString = iterDate.toISOString().split('T')[0];
            if (!unavailableDatesSet.has(dateString)) {
                count++;
            }
            iterDate.setDate(iterDate.getDate() + increment);
        }
        return count;
    };

    const estimatedSessions = calculateEstimatedSessions();

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const calendarDays = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`empty-${i}`} className="h-10 w-10"></div>);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const isPast = date < today;
            const isUnavailable = unavailableDatesSet.has(dateString);
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const isToday = date.toDateString() === today.toDateString();

            calendarDays.push(
                <button 
                    key={day} 
                    disabled={isPast || isUnavailable}
                    onClick={() => handleDateClick(date)}
                    className={`
                        relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                        ${isPast ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : ''}
                        ${isUnavailable ? 'text-red-300 dark:text-red-900 bg-red-50 dark:bg-red-900/10 cursor-not-allowed decoration-red-400 line-through' : ''}
                        ${!isPast && !isUnavailable && !isSelected ? 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600' : ''}
                        ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 transform scale-110 font-bold z-10' : ''}
                        ${isToday && !isSelected ? 'ring-2 ring-indigo-600 ring-inset text-indigo-700 dark:text-indigo-400 font-bold' : ''}
                    `}
                >
                    {day}
                </button>
            );
        }
        return calendarDays;
    };

    const handleConfirmBooking = async () => {
        if (!currentUser || currentUser.role !== 'client') {
            addAlert('Apenas clientes podem fazer agendamentos.', 'error');
            return;
        }
        if (!selectedService || !selectedDate || !selectedTime) {
            addAlert('Por favor, selecione um serviço, data e horário.', 'error');
            return;
        }
        if (recurrenceRule !== 'none' && !recurrenceEndDate) {
            addAlert('Por favor, selecione uma data final para a recorrência.', 'error');
            return;
        }
        if (!isPaymentValid) {
            addAlert('Por favor, complete os dados de pagamento.', 'error');
            return;
        }
        
        setBookingStatus('processing');
        
        // Simulate Processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        const totalCost = selectedService.price;
        const fee = totalCost * PLATFORM_FEE_PERCENTAGE;
        const earnings = totalCost - fee;

        const client = currentUser as Client;

        const appointmentData = {
            caregiverId: caregiver.id,
            caregiverName: caregiver.name,
            caregiverPhoto: caregiver.photo,
            clientId: currentUser.id,
            clientName: currentUser.name,
            clientPhone: client.phone,
            clientCity: client.city,
            clientStreet: client.street,
            clientAddressNumber: client.addressNumber,
            clientNeighborhood: client.neighborhood,
            clientState: client.state,
            date: selectedDate.toISOString().split('T')[0],
            time: selectedTime,
            serviceType: selectedService.name,
            status: 'confirmed' as const,
            cost: totalCost,
            platformFee: fee,
            caregiverEarnings: earnings,
            paymentStatus: 'paid' as const, 
            paymentMethod: paymentMethod,
            recurrenceRule,
            recurrenceEndDate: recurrenceRule !== 'none' ? recurrenceEndDate : undefined,
        };
        
        const success = await addAppointment(appointmentData);
        
        if (success) {
            setBookingStatus('success');
        } else {
            setBookingStatus('idle');
        }
    };

    if (bookingStatus === 'success') {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 max-w-md w-full text-center animate-scale-in border border-gray-100 dark:border-gray-700">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-green-600 dark:text-green-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Agendamento Confirmado!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">
                        Seu agendamento com <strong>{caregiver.name}</strong> foi realizado com sucesso. Você receberá os detalhes por email.
                    </p>
                    <button onClick={onClose} className="w-full btn-gradient text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                        Voltar para o Início
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col animate-scale-in overflow-hidden border border-gray-100 dark:border-gray-700">
                {/* Header */}
                <div className="px-8 py-5 border-b dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-20">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            Agendar Serviço
                            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                            <span className="text-base sm:text-lg font-normal text-gray-500">{caregiver.name}</span>
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                
                <div id="booking-modal-content" className="flex-grow overflow-y-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 custom-scrollbar bg-gray-50 dark:bg-gray-900/50">
                    {/* Left side: Configuration */}
                    <div className="lg:col-span-7 space-y-8 pb-8">
                        {/* Step 1: Services */}
                        <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">1</span>
                                Selecione o Serviço
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {caregiver.services.map((service) => (
                                    <button 
                                        key={service.id}
                                        onClick={() => handleServiceSelect(service)}
                                        className={`group relative p-4 rounded-2xl text-left border-2 transition-all duration-300 ${selectedService?.id === service.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600'}`}
                                    >
                                        {selectedService?.id === service.id && (
                                            <div className="absolute top-2 right-2 text-indigo-600 animate-scale-in">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            </div>
                                        )}
                                        <div className="text-3xl mb-3 flex justify-center group-hover:scale-110 transition-transform duration-300">
                                            {(service.icon.startsWith('data:') || service.icon.startsWith('http')) ? (
                                                <img src={service.icon} alt="" className="w-10 h-10 object-contain" />
                                            ) : (
                                                <span>{service.icon}</span>
                                            )}
                                        </div>
                                        <div className="font-bold text-center text-gray-800 dark:text-gray-200 text-sm mb-1">{service.name}</div>
                                        <div className="text-center text-xs font-semibold text-green-600 dark:text-green-400">R$ {service.price}</div>
                                    </button>
                                ))}
                            </div>
                        </section>
                        
                        {/* Step 2 & 3: Date and Time */}
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 ${selectedService ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>
                            <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">2</span>
                                        Data
                                    </h3>
                                    <div className="flex gap-1">
                                        <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 py-1.5 capitalize">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                                        <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 font-bold mb-3 uppercase tracking-wide">
                                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => <div key={i}>{day}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-y-2 gap-x-1 place-items-center">
                                    {renderCalendar()}
                                </div>
                            </section>

                            <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">3</span>
                                    Horário
                                </h3>
                                <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 -mr-1 max-h-[280px]">
                                    {!selectedDate ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center py-8">
                                            <svg className="w-12 h-12 mb-3 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                                            <p className="text-sm font-medium">Selecione uma data para ver os horários</p>
                                        </div>
                                    ) : timeSlots.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {timeSlots.map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`py-3 px-4 rounded-xl text-center border-2 transition-all duration-200 font-bold text-sm ${selectedTime === time ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700 text-gray-700 dark:text-gray-300'}`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center py-8">
                                            <p className="text-sm">Sem horários disponíveis para hoje.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                        
                        {/* Step 4: Recurrence */}
                        <section className={`bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-500 ${selectedDate && selectedTime ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>
                             <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">4</span>
                                Recorrência (Opcional)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Repetir?</label>
                                    <div className="relative">
                                        <select value={recurrenceRule} onChange={(e) => setRecurrenceRule(e.target.value as any)} className="w-full px-4 py-3 appearance-none border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer font-medium text-gray-700">
                                            <option value="none">Não, apenas uma vez</option>
                                            <option value="weekly">Sim, Semanalmente</option>
                                            <option value="biweekly">Sim, Quinzenalmente</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                                {recurrenceRule !== 'none' && (
                                    <div className="animate-fade-in">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Até quando?</label>
                                        <input 
                                            type="date" 
                                            value={recurrenceEndDate} 
                                            onChange={e => setRecurrenceEndDate(e.target.value)} 
                                            min={selectedDate ? new Date(new Date(selectedDate).setDate(selectedDate.getDate() + 7)).toISOString().split('T')[0] : ''} 
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-700" 
                                        />
                                        {recurrenceEndDate && (
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-bold bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg inline-block">
                                                ~ {estimatedSessions} sessões estimadas
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right side: Summary and Payment */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 sticky top-0">
                            <h3 className="text-xl font-black mb-6 text-gray-800 dark:text-white flex items-center justify-between">
                                Resumo do Pedido
                                <span className="text-xs font-normal bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-500">ID: {Date.now().toString().slice(-6)}</span>
                            </h3>
                            
                            <div className="space-y-6 mb-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg text-white">
                                        {selectedService?.icon || '📦'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white text-lg">{selectedService?.name || 'Selecione um serviço'}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Profissional: {caregiver.name}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 space-y-3 border border-gray-100 dark:border-gray-700/50">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Data</span>
                                        <span className="font-bold text-gray-800 dark:text-white">{selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Horário</span>
                                        <span className="font-bold text-gray-800 dark:text-white">{selectedTime || '-'}</span>
                                    </div>
                                    {recurrenceRule !== 'none' && (
                                        <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200 dark:border-gray-600">
                                            <span className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">Recorrência</span>
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{recurrenceRule === 'weekly' ? 'Semanal' : 'Quinzenal'} ({estimatedSessions}x)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <span>Valor do Serviço</span>
                                    <span>R$ {selectedService ? selectedService.price.toFixed(2) : '0.00'}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <span>Taxa de Serviço</span>
                                    <span>R$ 0.00</span>
                                </div>
                                <div className="flex justify-between items-end pt-6 border-t-2 border-gray-100 dark:border-gray-700">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total a Pagar</span>
                                        <span className="text-sm text-gray-500">(1ª Sessão)</span>
                                    </div>
                                    <span key={priceKey} className="text-4xl font-black text-gray-900 dark:text-white tracking-tight animate-scale-in">
                                        R$ {selectedService ? selectedService.price.toFixed(2) : '0.00'}
                                    </span>
                                </div>
                                {recurrenceRule !== 'none' && (
                                    <div className="text-xs text-right text-indigo-600 dark:text-indigo-400 font-medium">
                                        Valor total do contrato: R$ {(selectedService ? selectedService.price * estimatedSessions : 0).toFixed(2)}
                                    </div>
                                )}
                            </div>

                            {/* Payment Section - Always visible but disabled if not ready */}
                            <div className={`transition-all duration-500 ${selectedService && selectedDate && selectedTime ? 'opacity-100' : 'opacity-50 grayscale pointer-events-none'}`}>
                                <h3 className="text-sm font-bold mb-4 text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    Pagamento Seguro
                                </h3>
                                <PaymentForm onChange={handlePaymentChange} />
                            </div>
                            
                            <button 
                                onClick={handleConfirmBooking}
                                disabled={!selectedService || !selectedDate || !selectedTime || !isPaymentValid || bookingStatus === 'processing' || (recurrenceRule !== 'none' && !recurrenceEndDate)}
                                className="w-full mt-8 btn-gradient text-white font-bold py-4 px-6 rounded-2xl text-lg shadow-xl hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                            >
                                 {bookingStatus === 'processing' ? (
                                     <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processando...
                                     </>
                                 ) : (
                                     <>
                                        Confirmar Agendamento
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                     </>
                                 )}
                            </button>
                            <p className="text-[10px] text-gray-400 text-center mt-4 leading-tight">
                                Ao confirmar, você concorda com nossos Termos de Uso. O valor será retido com segurança até a conclusão do serviço.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
