import React, { useState, useMemo } from 'react';
import { Caregiver, Appointment, Service } from '../types';
import { useAppStore } from '../store/useAppStore';

interface EditAppointmentModalProps {
    appointment: Appointment;
    caregiver: Caregiver;
    onClose: () => void;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({ appointment, caregiver, onClose }) => {
    const { editAppointment, addAlert } = useAppStore();

    const initialService = caregiver.services.find(s => s.name === appointment.serviceType) || null;
    const initialDate = new Date(appointment.date);
    // Add timezone offset to date to avoid off-by-one day errors
    initialDate.setMinutes(initialDate.getMinutes() + initialDate.getTimezoneOffset());

    const [selectedService, setSelectedService] = useState<Service | null>(initialService);
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
    const [selectedTime, setSelectedTime] = useState<string | null>(appointment.time);
    const [priceKey, setPriceKey] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    
    const unavailableDatesSet = useMemo(() => new Set(caregiver.unavailableDates || []), [caregiver.unavailableDates]);

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null);
    };

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service);
        setPriceKey(key => key + 1);
    };

    const timeSlots = ['Manhã (08:00)', 'Tarde (13:00)', 'Noite (19:00)'];

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

    const handleConfirmUpdate = async () => {
        if (!selectedService || !selectedDate || !selectedTime) {
            addAlert('Por favor, selecione um serviço, data e horário.', 'error');
            return;
        }
        
        setIsProcessing(true);
        const updates: Partial<Appointment> = {
            date: selectedDate.toISOString().split('T')[0],
            time: selectedTime,
            serviceType: selectedService.name,
            cost: selectedService.price,
        };
        
        await editAppointment(appointment.id, updates);
        setIsProcessing(false);
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-in">
                    <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Editar Agendamento com {caregiver.name}</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left side: Service and Calendar */}
                        <div>
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">1. Selecione o serviço</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {caregiver.services.map((service) => (
                                        <button 
                                            key={service.id}
                                            onClick={() => handleServiceSelect(service)}
                                            className={`p-4 rounded-xl text-left border-2 transition-all duration-200 ${selectedService?.id === service.id ? 'bg-indigo-600 border-transparent text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500'}`}
                                        >
                                            <div className="text-2xl mb-1">{service.icon}</div>
                                            <div className="font-semibold">{service.name}</div>
                                            <div className={`text-sm ${selectedService?.id === service.id ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>R$ {service.price}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">2. Escolha a data</h3>
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
                            </div>

                            {selectedDate && (
                                <div className="animate-fade-in">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">3. Escolha o horário</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {timeSlots.map(time => (
                                            <button
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                className={`p-4 rounded-xl text-center border-2 transition-all duration-200 ${selectedTime === time ? 'bg-indigo-600 border-transparent text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500'}`}
                                            >
                                                <span className="font-semibold text-sm block">{time.split(' ')[0]}</span>
                                                <span className={`text-xs ${selectedTime === time ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>{time.split(' ')[1]}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right side: Summary */}
                        <div className="bg-gray-100 dark:bg-gray-900/50 rounded-2xl p-8 flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Resumo do Agendamento</h3>
                                <div className="space-y-4 text-lg">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Serviço:</span>
                                        <span className="font-semibold">{selectedService ? selectedService.name : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Data:</span>
                                        <span className="font-semibold">{selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Horário:</span>
                                        <span className="font-semibold">{selectedTime || 'N/A'}</span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                        <span className="font-semibold">R$ {selectedService ? selectedService.price.toFixed(2) : '0.00'}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
                                <div className="flex justify-between items-center text-2xl font-bold">
                                    <span className="text-gray-800 dark:text-white">Total:</span>
                                    <span key={priceKey} className="text-indigo-600 dark:text-indigo-400 transition-transform duration-300 transform scale-100 animate-scale-in text-3xl">
                                        R$ {selectedService ? selectedService.price.toFixed(2) : '0.00'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl">
                        <button 
                            onClick={handleConfirmUpdate}
                            disabled={!selectedService || !selectedDate || !selectedTime || isProcessing}
                            className="w-full btn-gradient text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                             {isProcessing ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditAppointmentModal;
