
import React, { useState, useMemo } from 'react';
import { Caregiver, Client, Service } from '../types';
import { useAppStore } from '../store/useAppStore';
import PaymentForm, { PaymentDetails } from './PaymentForm';

interface BookingModalProps {
    caregiver: Caregiver;
    onClose: () => void;
}

const PLATFORM_FEE_PERCENTAGE = 0.15; // 15% taxa da plataforma

const BookingModal: React.FC<BookingModalProps> = ({ caregiver, onClose }) => {
    const { currentUser, addAlert, addAppointment } = useAppStore();
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [priceKey, setPriceKey] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recurrenceRule, setRecurrenceRule] = useState<'none' | 'weekly' | 'biweekly'>('none');
    const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
    
    // Payment State
    const [isPaymentValid, setIsPaymentValid] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);


    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    
    const unavailableDatesSet = useMemo(() => new Set(caregiver.unavailableDates || []), [caregiver.unavailableDates]);

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null); // Reset time when a new date is selected
        const today = new Date().toISOString().split('T')[0];
        if (recurrenceEndDate && date.toISOString().split('T')[0] > recurrenceEndDate) {
            setRecurrenceEndDate('');
        }
    };

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service);
        setPriceKey(key => key + 1); // Trigger animation on price
    };
    
    const handlePaymentChange = (method: 'credit_card' | 'pix', details: PaymentDetails | null, isValid: boolean) => {
        setPaymentMethod(method);
        setPaymentDetails(details);
        setIsPaymentValid(isValid);
    };

    // Gera horários de hora em hora das 07:00 às 22:00
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let i = 7; i <= 22; i++) {
            slots.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return slots;
    }, []);

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const calendarDays = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`empty-${i}`}></div>);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const isPast = date < today;
            const isUnavailable = unavailableDatesSet.has(dateString);
            const isSelected = selectedDate?.toDateString() === date.toDateString();

            calendarDays.push(
                <button 
                    key={day} 
                    disabled={isPast || isUnavailable}
                    onClick={() => handleDateClick(date)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors duration-200
                        ${isPast || isUnavailable ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed line-through' : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900'}
                        ${isSelected ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-800' : ''}
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
        
        setIsProcessing(true);
        
        // Simulating Payment Gateway Delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const totalCost = selectedService.price;
        const fee = totalCost * PLATFORM_FEE_PERCENTAGE;
        const earnings = totalCost - fee;

        const appointmentData = {
            caregiverId: caregiver.id,
            caregiverName: caregiver.name,
            caregiverPhoto: caregiver.photo,
            clientId: currentUser.id,
            clientName: currentUser.name,
            clientPhone: (currentUser as Client).phone,
            clientCity: (currentUser as Client).city,
            date: selectedDate.toISOString().split('T')[0],
            time: selectedTime,
            serviceType: selectedService.name,
            status: 'confirmed' as const,
            cost: totalCost,
            platformFee: fee, // Calculate Split
            caregiverEarnings: earnings, // Calculate Split
            paymentStatus: 'paid' as const, 
            paymentMethod: paymentMethod,
            recurrenceRule,
            recurrenceEndDate: recurrenceRule !== 'none' ? recurrenceEndDate : undefined,
        };
        
        const success = await addAppointment(appointmentData);
        setIsProcessing(false);
        if (success) {
            onClose();
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-scale-in">
                    <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Agendar com {caregiver.name}</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left side: Configuration (7 cols) */}
                        <div className="lg:col-span-7 space-y-8">
                            <section>
                                <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">1. Selecione o serviço</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {caregiver.services.map((service) => (
                                        <button 
                                            key={service.id}
                                            onClick={() => handleServiceSelect(service)}
                                            className={`p-4 rounded-xl text-left border-2 transition-all duration-200 ${selectedService?.id === service.id ? 'bg-indigo-600 border-transparent text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500'}`}
                                        >
                                            <div className="text-2xl mb-1 flex justify-center">
                                                {(service.icon.startsWith('data:') || service.icon.startsWith('http')) ? (
                                                    <img src={service.icon} alt="" className="w-8 h-8 object-contain" />
                                                ) : (
                                                    <span>{service.icon}</span>
                                                )}
                                            </div>
                                            <div className="font-semibold">{service.name}</div>
                                            <div className={`text-sm ${selectedService?.id === service.id ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>R$ {service.price}</div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                            
                            <section>
                                 <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">2. Frequência</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <select value={recurrenceRule} onChange={(e) => setRecurrenceRule(e.target.value as any)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700">
                                        <option value="none">Apenas uma vez</option>
                                        <option value="weekly">Semanalmente</option>
                                        <option value="biweekly">Quinzenalmente</option>
                                    </select>
                                    {recurrenceRule !== 'none' && (
                                        <input type="date" value={recurrenceEndDate} onChange={e => setRecurrenceEndDate(e.target.value)} min={selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700" placeholder="Data Final" />
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">3. {recurrenceRule !== 'none' ? 'Data de Início' : 'Escolha a data'}</h3>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <div className="flex justify-between items-center mb-4">
                                        <button onClick={handlePrevMonth} aria-label="Previous month" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                                        <h4 className="font-semibold capitalize">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h4>
                                        <button onClick={handleNextMonth} aria-label="Next month" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2">
                                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => <div key={i}>{day}</div>)}
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {renderCalendar()}
                                    </div>
                                </div>
                            </section>

                            {selectedDate && (
                                <section className="animate-fade-in">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">4. Escolha o horário de início</h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {timeSlots.map(time => (
                                            <button
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                className={`py-3 px-2 rounded-xl text-center border-2 transition-all duration-200 font-semibold text-sm ${selectedTime === time ? 'bg-indigo-600 border-transparent text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500'}`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right side: Summary and Payment (5 cols) */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-2xl p-6">
                                <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Resumo</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                                        <span className="text-gray-600 dark:text-gray-400">Serviço:</span>
                                        <span className="font-semibold">{selectedService ? selectedService.name : '-'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                                        <span className="text-gray-600 dark:text-gray-400">Data:</span>
                                        <span className="font-semibold">{selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '-'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                                        <span className="text-gray-600 dark:text-gray-400">Horário:</span>
                                        <span className="font-semibold">{selectedTime || '-'}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 text-lg">
                                        <span className="text-gray-800 dark:text-white font-bold">Total:</span>
                                        <span key={priceKey} className="text-indigo-600 dark:text-indigo-400 font-bold transition-transform duration-300 transform scale-100 animate-scale-in">
                                            R$ {selectedService ? selectedService.price.toFixed(2) : '0.00'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Section - Only shows if previous steps are valid */}
                            {selectedService && selectedDate && selectedTime && (
                                <div className="bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-6 shadow-lg animate-fade-in">
                                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                                        <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
                                        5. Pagamento Seguro
                                    </h3>
                                    <PaymentForm onChange={handlePaymentChange} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl">
                        <button 
                            onClick={handleConfirmBooking}
                            disabled={!selectedService || !selectedDate || !selectedTime || !isPaymentValid || isProcessing || (recurrenceRule !== 'none' && !recurrenceEndDate)}
                            className="w-full btn-gradient text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                             {isProcessing ? (
                                 <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processando Pagamento...
                                 </>
                             ) : (
                                 <>
                                    Confirmar e Pagar R$ {selectedService ? selectedService.price.toFixed(2) : '0.00'}
                                 </>
                             )}
                        </button>
                        <p className="text-center text-xs text-gray-500 mt-3">Ao confirmar, você concorda com nossos termos de serviço.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookingModal;
