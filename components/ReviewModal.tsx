import React, { useState } from 'react';
import { Appointment, Caregiver } from '../types';
import { useAppStore } from '../store/useAppStore';
import Avatar from './Avatar';

interface ReviewModalProps {
    appointment: Appointment;
    caregiver: Caregiver;
    onClose: () => void;
}

const StarRating: React.FC<{ rating: number; setRating: (rating: number) => void }> = ({ rating, setRating }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((starIndex) => (
                <button
                    key={starIndex}
                    type="button"
                    onClick={() => setRating(starIndex)}
                    onMouseEnter={() => setHover(starIndex)}
                    onMouseLeave={() => setHover(rating)}
                    className="text-4xl transition-transform transform hover:scale-125 focus:outline-none"
                    aria-label={`Rate ${starIndex} stars`}
                >
                    <span className={starIndex <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
                        ★
                    </span>
                </button>
            ))}
        </div>
    );
};


const ReviewModal: React.FC<ReviewModalProps> = ({ appointment, caregiver, onClose }) => {
    const { addReview, currentUser } = useAppStore();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        if (comment.length < 10) {
            useAppStore.getState().addAlert('Por favor, escreva um comentário com pelo menos 10 caracteres.', 'error');
            return;
        }

        const reviewData = {
            rating,
            comment,
            author: currentUser.name,
            authorPhoto: currentUser.photo,
        };

        await addReview(appointment.id, caregiver.id, reviewData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg animate-scale-in">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Deixar uma Avaliação</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-6 text-center">
                        <div className="w-24 h-24 rounded-full mx-auto overflow-hidden ring-4 ring-indigo-200 dark:ring-indigo-800">
                            <Avatar photo={caregiver.photo} name={caregiver.name} className="w-full h-full" textClassName="text-5xl" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Como você avalia o serviço de <span className="font-semibold text-gray-800 dark:text-white">{caregiver.name}</span>?
                        </p>
                         <p className="text-sm text-gray-500 -mt-4">
                            Serviço: {appointment.serviceType} em {new Date(appointment.date).toLocaleDateString('pt-BR')}
                        </p>
                        
                        <StarRating rating={rating} setRating={setRating} />

                        <div>
                            <label htmlFor="comment" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 text-left">Seu Comentário</label>
                            <textarea
                                id="comment"
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Compartilhe sua experiência..."
                                required
                                minLength={10}
                            />
                        </div>
                    </div>
                    <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl">
                        <button
                            type="submit"
                            className="w-full btn-gradient text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                            Enviar Avaliação
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
