
// services/api.ts
import { Caregiver, User, Appointment, Review, Notification, Client, Service, Conversation, CareLog, SupportTicket } from '../types';
import { handleMockRequest } from './mockBackend';

// Configuração da URL da API Real (Backend)
// Em produção, isso viria de process.env.REACT_APP_API_URL
const API_BASE_URL = 'http://localhost:3001'; 

const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);

    // Se não for uma chamada de API interna, usa o fetch normal (ex: imagens externas)
    if (!url.startsWith('/api/')) {
        return window.fetch(input, init);
    }

    try {
        // 1. TENTA CONECTAR AO BANCO DE DADOS REAL (VIA API)
        // Adiciona headers padrão se não existirem
        const headers = new Headers(init?.headers);
        if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }

        // ADICIONADO: Timeout controller para falhar rápido se o backend estiver offline
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 segundo de timeout

        try {
            const realResponse = await window.fetch(`${API_BASE_URL}${url}`, {
                ...init,
                headers,
                signal: controller.signal // Vincula o sinal de abortar
            });
            
            clearTimeout(timeoutId); // Limpa o timeout se tiver sucesso

            // Se o backend retornar 404 (rota não existe no real ainda), lançamos erro para cair no mock
            if (realResponse.status === 404 && realResponse.headers.get('content-type')?.includes('text/html')) {
                 throw new Error('Backend route not found');
            }

            return realResponse;
        } catch (fetchError) {
            // Se foi abortado pelo timeout ou erro de conexão, cai aqui
            throw fetchError;
        }

    } catch (error) {
        // 2. FALLBACK PARA O MOCK (SIMULAÇÃO)
        // Se a conexão com o backend falhar (servidor offline, timeout) ou rota não existir,
        // usamos o mockBackend para manter o app funcional para demonstração.
        // console.warn(`Conexão com Backend Real falhou (${API_BASE_URL}). Usando dados simulados (Mock).`);
        return handleMockRequest(input, init);
    }
};


// --- API FUNCTIONS (Frontend Facing) ---
// These functions are what the rest of the app calls. They now use a fetch-like interface.
export const api = {
    fetchInitialData: async () => {
        const response = await customFetch('/api/initial-data');
        if (!response.ok) throw new Error('Failed to fetch initial data');
        return response.json();
    },
    login: async (email: string, password: string): Promise<User | null> => {
        const response = await customFetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        if (!response.ok) return null;
        return response.json();
    },
    register: async (newUser: Omit<User, 'id'>): Promise<User | { error: string }> => {
        const response = await customFetch('/api/register', { method: 'POST', body: JSON.stringify(newUser) });
        return response.json();
    },
    updateUser: async (userId: number, updates: Partial<User>): Promise<User | null> => {
        const response = await customFetch(`/api/users/${userId}`, { method: 'PATCH', body: JSON.stringify(updates) });
        if (!response.ok) return null;
        return response.json();
    },
    addAppointment: async (appointmentData: Omit<Appointment, 'id'>): Promise<Appointment[]> => {
        const response = await customFetch('/api/appointments', { method: 'POST', body: JSON.stringify(appointmentData) });
        if (!response.ok) return [];
        return response.json();
    },
    updateAppointment: async (appointmentId: string, updates: Partial<Appointment>): Promise<Appointment | null> => {
        const response = await customFetch(`/api/appointments/${appointmentId}`, { method: 'PATCH', body: JSON.stringify(updates) });
        if (!response.ok) return null;
        return response.json();
    },
    cancelAppointment: async (appointmentId: string): Promise<Appointment | null> => {
        const response = await customFetch(`/api/appointments/${appointmentId}/cancel`, { method: 'POST' });
        if (!response.ok) return null;
        return response.json();
    },
    addReview: async (appointmentId: string, caregiverId: number, reviewData: Omit<Review, 'id' | 'date' | 'caregiverId' | 'caregiverName'>): Promise<{updatedCaregiver: Caregiver, updatedAppointment: Appointment} | null> => {
        const response = await customFetch('/api/reviews', { method: 'POST', body: JSON.stringify({ appointmentId, caregiverId, reviewData }) });
        if (!response.ok) return null;
        return response.json();
    },
    fetchNotifications: async (): Promise<Notification[]> => {
        const response = await customFetch('/api/notifications');
        if (!response.ok) return [];
        return response.json();
    },
    markNotificationAsRead: async (notificationId: number): Promise<Notification[]> => {
        const response = await customFetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to mark notification as read');
        return response.json();
    },
    fetchConversations: async (): Promise<Conversation[]> => {
        const response = await customFetch('/api/conversations');
        if (!response.ok) return [];
        return response.json();
    },
    sendMessage: async (conversationId: string, senderId: number, receiverId: number, text: string): Promise<{updatedConversation: Conversation, newNotification?: Notification}> => {
        const response = await customFetch('/api/messages', { method: 'POST', body: JSON.stringify({ conversationId, senderId, receiverId, text }) });
        if (!response.ok) throw new Error('Failed to send message');
        return response.json();
    },
    deleteUser: async (userId: number): Promise<boolean> => {
        const response = await customFetch(`/api/users/${userId}`, { method: 'DELETE' });
        return response.ok;
    },
    updateUserStatus: async (userId: number, status: 'active' | 'suspended'): Promise<User | null> => {
        const response = await customFetch(`/api/users/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
        if (!response.ok) return null;
        return response.json();
    },
    deleteReview: async (reviewId: number): Promise<boolean> => {
        const response = await customFetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
        return response.ok;
    },
    // CareLog APIs
    addCareLog: async (logData: Omit<CareLog, 'id' | 'timestamp'>): Promise<CareLog | null> => {
        const response = await customFetch('/api/care-logs', { method: 'POST', body: JSON.stringify(logData) });
        if (!response.ok) return null;
        return response.json();
    },
    getCareLog: async (appointmentId: string): Promise<CareLog | null> => {
        const response = await customFetch(`/api/care-logs/${appointmentId}`);
        if (!response.ok) return null;
        return response.json();
    },
    // Ticket APIs
    resolveTicket: async (ticketId: number): Promise<SupportTicket | null> => {
        const response = await customFetch(`/api/tickets/${ticketId}/resolve`, { method: 'PATCH' });
        if (!response.ok) return null;
        return response.json();
    }
};
