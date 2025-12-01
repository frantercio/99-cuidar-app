
// store/useAppStore.ts
import { create } from 'zustand';
import { Caregiver, User, Page, AlertMessage, Appointment, Notification, Client, Service, Review, Conversation, CareLog, SupportTicket, AppointmentAction, Wallet, SystemSettings, ContentPageData, AuditLog } from '../types';
import { api } from '../services/api';
import { initialSystemSettings, initialContentPages } from '../constants';

interface AppState {
    page: Page;
    currentUser: User | null;
    users: User[];
    caregivers: Caregiver[];
    viewingCaregiver: Caregiver | null;
    appointments: Appointment[];
    alerts: AlertMessage[];
    notifications: Notification[];
    conversations: Conversation[];
    tickets: SupportTicket[]; // Admin support tickets
    systemSettings: SystemSettings;
    contentPages: ContentPageData[];
    auditLogs: AuditLog[]; // Admin logs
    isChatOpen: boolean;
    activeConversationId: string | null;
    isLoading: boolean;
    chatDraftMessage: string;
    hasUnreadChatMessages: boolean;
    
    loadInitialData: () => Promise<void>;
    navigate: (page: Page, caregiver?: Caregiver) => void;
    addAlert: (message: string, type?: AlertMessage['type']) => void;
    removeAlert: (id: number) => void;
    
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
    register: (newUser: Omit<User, 'id'>) => Promise<void>;
    
    viewProfile: (caregiver: Caregiver) => void;
    updateUserPhoto: (userId: number, photoUrl: string) => Promise<void>;
    updateUserServices: (userId: number, services: Service[]) => Promise<void>;
    updateCaregiverDetails: (userId: number, details: Partial<Caregiver>) => Promise<void>;
    updateUserAvailability: (userId: number, dateString: string) => Promise<void>;
    updateClientDetails: (userId: number, details: Partial<Client>) => Promise<void>;
    changePassword: (userId: number, newPass: string) => Promise<void>;
    highlightProfile: (caregiverId: number) => Promise<void>;
    setVacationMode: (caregiverId: number, active: boolean, returnDate?: string) => Promise<void>;

    addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<boolean>;
    editAppointment: (appointmentId: string, updates: Partial<Appointment>) => Promise<void>;
    cancelAppointment: (appointmentId: string) => Promise<void>;
    addReview: (appointmentId: string, caregiverId: number, reviewData: Omit<Review, 'id' | 'date' | 'caregiverId' | 'caregiverName'>) => Promise<void>;
    markNotificationAsRead: (notificationId: number) => Promise<void>;

    fetchConversations: () => Promise<void>;
    sendMessage: (receiverId: number, text: string) => Promise<void>;
    openChatWithUser: (targetUserId: number) => void;
    setChatOpen: (isOpen: boolean) => void;
    setActiveConversation: (conversationId: string | null) => void;
    clearChatDraftMessage: () => void;
    checkForNewMessages: () => Promise<void>;

    // Admin actions
    verifyCaregiver: (caregiverId: number) => Promise<void>;
    deleteUser: (userId: number) => Promise<void>;
    approveSecurityCheck: (caregiverId: number, checkType: 'backgroundCheck' | 'idVerification') => Promise<void>;
    updateUserStatus: (userId: number, status: 'active' | 'suspended') => Promise<void>;
    deleteReview: (reviewId: number) => Promise<void>;
    resolveTicket: (ticketId: number) => Promise<void>;
    sendBroadcast: (message: string, audience: 'all' | 'caregivers' | 'clients') => void;
    addAuditLog: (action: string, target: string, details?: string) => void;
    
    // System Management Actions
    updateSystemSettings: (settings: Partial<SystemSettings>) => void;
    updateContentPage: (slug: string, content: string) => void;

    // CareLog Actions
    addCareLog: (logData: Omit<CareLog, 'id' | 'timestamp'>) => Promise<void>;
    getCareLog: (appointmentId: string) => Promise<CareLog | null>;

    // Check-in/out
    performCheckIn: (appointmentId: string, data: AppointmentAction) => Promise<boolean>;
    performCheckOut: (appointmentId: string, data: AppointmentAction) => Promise<boolean>;

    // Wallet Actions
    fetchWallet: () => Promise<void>;
    requestWithdrawal: (amount: number, pixKey: string) => Promise<boolean>;
    addCredits: (amount: number, paymentMethod: 'credit_card' | 'pix') => Promise<boolean>;
}

export const useAppStore = create<AppState>((set, get) => ({
    page: 'home',
    currentUser: null,
    users: [],
    caregivers: [],
    viewingCaregiver: null,
    appointments: [],
    alerts: [],
    notifications: [],
    conversations: [],
    tickets: [],
    systemSettings: initialSystemSettings,
    contentPages: initialContentPages,
    auditLogs: [],
    isChatOpen: false,
    activeConversationId: null,
    isLoading: true,
    chatDraftMessage: '',
    hasUnreadChatMessages: false,

    loadInitialData: async () => {
        set({ isLoading: true });
        try {
            // Race condition: se a API não responder em 3 segundos, assumimos erro e liberamos o app
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout de inicialização')), 3000)
            );
            
            const dataPromise = api.fetchInitialData();
            
            const data = await Promise.race([dataPromise, timeoutPromise]) as any;
            
            // Generate some mock audit logs if empty
            const initialLogs: AuditLog[] = [
                { id: 'log-1', adminName: 'Admin System', action: 'System Init', target: 'System', timestamp: new Date(Date.now() - 1000000).toISOString() },
                { id: 'log-2', adminName: 'Admin User', action: 'Update Settings', target: 'General', timestamp: new Date(Date.now() - 500000).toISOString(), details: 'Changed primary color' },
            ];

            set({ 
                caregivers: data.caregivers || [], 
                users: data.users || [], 
                appointments: data.appointments || [], 
                notifications: data.notifications || [], 
                conversations: data.conversations || [], 
                tickets: data.tickets || [],
                auditLogs: initialLogs,
                viewingCaregiver: data.caregivers?.[0] || null 
            });
        } catch (error) {
            console.error("Falha ou demora ao carregar dados iniciais:", error);
            // Mesmo com erro, tentamos inicializar com o que temos ou arrays vazios para não travar a tela
            set({ isLoading: false }); 
            if (get().users.length === 0) {
                 get().addAlert("O sistema iniciou em modo offline/demonstração.", "info");
            }
        } finally {
            set({ isLoading: false });
        }
    },

    navigate: (page, caregiver) => {
        window.scrollTo(0, 0);
        set({ page });
        if (caregiver) {
            set({ viewingCaregiver: caregiver });
        }
    },
    
    addAlert: (message, type = 'success') => {
        const id = Date.now();
        set(state => ({ alerts: [...state.alerts, { id, message, type }] }));
    },

    removeAlert: (id) => {
        set(state => ({ alerts: state.alerts.filter(alert => alert.id !== id) }));
    },
    
    login: async (email, pass) => {
        set({ isLoading: true });
        try {
            const user = await api.login(email, pass);
            if (user) {
                if (user.status === 'suspended') {
                    get().addAlert('Sua conta está suspensa. Entre em contato com o suporte.', 'error');
                    set({ isLoading: false });
                    return;
                }
                set({ currentUser: user });
                if (user.role === 'caregiver') {
                    set({ viewingCaregiver: user });
                }
                get().navigate('dashboard');
                get().addAlert(`Bem-vindo de volta, ${user.name}! 🎉`);
            } else {
                get().addAlert('Email ou senha incorretos! Verifique suas credenciais.', 'error');
            }
        } catch (error) {
            console.error("Erro no login:", error);
            get().addAlert('Erro ao realizar login. Tente novamente.', 'error');
        } finally {
            set({ isLoading: false });
        }
    },
    
    logout: () => {
        set({ currentUser: null, page: 'home' });
        get().addAlert('Logout realizado com sucesso! Até logo! 👋', 'info');
    },

    register: async (newUser) => {
        set({ isLoading: true });
        try {
            const result = await api.register(newUser);
            if ('error' in result) {
                get().addAlert(result.error, 'error');
            } else {
                set(state => ({
                    users: [...state.users, result],
                    caregivers: result.role === 'caregiver' ? [...state.caregivers, result] : state.caregivers,
                    currentUser: result,
                }));
                if (result.role === 'caregiver') {
                    set({ viewingCaregiver: result });
                }
                get().navigate('dashboard');
                get().addAlert('🎉 Perfil criado com sucesso! Bem-vindo!');
            }
        } catch (error) {
            console.error("Erro no registro:", error);
            get().addAlert('Erro ao criar conta. Tente novamente.', 'error');
        } finally {
            set({ isLoading: false });
        }
    },

    viewProfile: (caregiver) => {
        get().navigate('publicProfile', caregiver);
    },

    updateUserPhoto: async (userId, photoUrl) => {
        const updatedUser = await api.updateUser(userId, { photo: photoUrl });
        if (!updatedUser) return;
        
        set(state => ({
            users: state.users.map(u => u.id === userId ? updatedUser : u),
            currentUser: state.currentUser?.id === userId ? updatedUser : state.currentUser,
            caregivers: updatedUser.role === 'caregiver' ? state.caregivers.map(c => c.id === userId ? updatedUser as Caregiver : c) : state.caregivers,
            viewingCaregiver: updatedUser.role === 'caregiver' && state.viewingCaregiver?.id === userId ? updatedUser as Caregiver : state.viewingCaregiver
        }));
        get().addAlert('Foto de perfil atualizada!');
    },

    updateUserServices: async (userId, services) => {
        const userToUpdate = await api.updateUser(userId, { services });

        if (userToUpdate && userToUpdate.role === 'caregiver') {
            set(state => ({
                caregivers: state.caregivers.map(c => c.id === userId ? userToUpdate : c),
                users: state.users.map(u => u.id === userId ? userToUpdate : u),
                currentUser: state.currentUser?.id === userId ? userToUpdate : state.currentUser,
            }));
            get().addAlert('Serviços e preços atualizados!');
        }
    },
    
    updateCaregiverDetails: async (userId, details) => {
        const updatedUser = await api.updateUser(userId, details);
        if (!updatedUser || updatedUser.role !== 'caregiver') return;

        set(state => ({
            users: state.users.map(u => u.id === userId ? updatedUser : u),
            caregivers: state.caregivers.map(c => c.id === userId ? updatedUser : c),
            currentUser: state.currentUser?.id === userId ? updatedUser : state.currentUser,
            viewingCaregiver: state.viewingCaregiver?.id === userId ? updatedUser : state.viewingCaregiver,
        }));
        get().addAlert('Perfil atualizado com sucesso!');
    },
    
    updateUserAvailability: async (userId, dateString) => {
        const userToUpdate = get().caregivers.find(c => c.id === userId);
        if (!userToUpdate) return;

        const unavailableDates = userToUpdate.unavailableDates || [];
        const newUnavailableDates = unavailableDates.includes(dateString)
            ? unavailableDates.filter(d => d !== dateString)
            : [...unavailableDates, dateString];
        
        await get().updateCaregiverDetails(userId, { unavailableDates: newUnavailableDates });
        get().addAlert('Disponibilidade atualizada!');
    },

    updateClientDetails: async (userId, details) => {
        const updatedUser = await api.updateUser(userId, details);
        if (!updatedUser) return;

        set(state => ({
            users: state.users.map(u => u.id === userId ? updatedUser : u),
            currentUser: state.currentUser?.id === userId ? updatedUser : state.currentUser,
        }));
        get().addAlert('Perfil atualizado com sucesso!');
    },

    changePassword: async (userId, newPass) => {
        const updatedUser = await api.updateUser(userId, { password: newPass });
        if (!updatedUser) return;
         get().addAlert('Senha alterada com sucesso!');
    },
    
    addAppointment: async (appointmentData) => {
        const newAppointments = await api.addAppointment(appointmentData);
        if (newAppointments.length > 0) {
            const notifications = await api.fetchNotifications();
            set(state => ({ 
                appointments: [...state.appointments, ...newAppointments],
                notifications
            }));
            const message = newAppointments.length > 1 
                ? `${newAppointments.length} agendamentos recorrentes foram confirmados! O cuidador entrará em contato para alinhar os detalhes.`
                : 'Agendamento confirmado! O cuidador entrará em contato o mais breve possível.';
            get().addAlert(message);
            return true;
        }
        get().addAlert('Falha ao confirmar o agendamento. O cuidador pode não estar disponível nas datas selecionadas.', 'error');
        return false;
    },

    editAppointment: async (appointmentId, updates) => {
        const updatedAppointment = await api.updateAppointment(appointmentId, updates);
        if (updatedAppointment) {
            const notifications = await api.fetchNotifications();
            set(state => ({
                appointments: state.appointments.map(a => a.id === appointmentId ? updatedAppointment : a),
                notifications,
            }));
            get().addAlert('Agendamento atualizado com sucesso!');
        } else {
            get().addAlert('Falha ao atualizar o agendamento.', 'error');
        }
    },

    cancelAppointment: async (appointmentId) => {
        const updatedAppointment = await api.cancelAppointment(appointmentId);
        if (updatedAppointment) {
            const notifications = await api.fetchNotifications();
            set(state => ({
                appointments: state.appointments.map(a => a.id === appointmentId ? updatedAppointment : a),
                notifications,
            }));
            get().addAlert('Agendamento cancelado.');
        } else {
            get().addAlert('Falha ao cancelar o agendamento.', 'error');
        }
    },
    
    addReview: async (appointmentId, caregiverId, reviewData) => {
        const result = await api.addReview(appointmentId, caregiverId, reviewData);
        if (result) {
            const { updatedCaregiver, updatedAppointment } = result;
            set(state => ({
                caregivers: state.caregivers.map(c => c.id === caregiverId ? updatedCaregiver : c),
                appointments: state.appointments.map(a => a.id === appointmentId ? updatedAppointment : a),
                users: state.users.map(u => u.id === caregiverId ? updatedCaregiver : u),
                currentUser: state.currentUser?.id === caregiverId ? updatedCaregiver : state.currentUser,
                viewingCaregiver: state.viewingCaregiver?.id === caregiverId ? updatedCaregiver : state.viewingCaregiver,
            }));
            const notifications = await api.fetchNotifications();
            set({ notifications });
            get().addAlert('Obrigado! Sua avaliação foi enviada com sucesso.');
        } else {
            get().addAlert('Ocorreu um erro ao enviar sua avaliação.', 'error');
        }
    },

    markNotificationAsRead: async (notificationId) => {
        const updatedNotifications = await api.markNotificationAsRead(notificationId);
        set({ notifications: updatedNotifications });
    },

    fetchConversations: async () => {
        const conversations = await api.fetchConversations();
        const userId = get().currentUser?.id;
        if (userId) {
            const userConversations = conversations.filter(c => c.participantIds.includes(userId));
            set({ conversations: userConversations });
        }
    },

    sendMessage: async (receiverId, text) => {
        const sender = get().currentUser;
        if (!sender) return;

        const conversationId = [sender.id, receiverId].sort((a, b) => a - b).join('-');
        const { updatedConversation, newNotification } = await api.sendMessage(conversationId, sender.id, receiverId, text);
        
        if (newNotification) {
            set(state => ({
                notifications: [newNotification, ...state.notifications]
            }));
        }

        set(state => {
            const convoExists = state.conversations.some(c => c.id === updatedConversation.id);
            const updatedConversations = convoExists
                ? state.conversations.map(c => c.id === updatedConversation.id ? updatedConversation : c)
                : [updatedConversation, ...state.conversations];
            
            updatedConversations.sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());

            return { conversations: updatedConversations };
        });
    },

    openChatWithUser: (targetUserId) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        const conversationId = [currentUser.id, targetUserId].sort((a, b) => a - b).join('-');
        
        const conversations = get().conversations;
        const existingConversation = conversations.find(c => c.id === conversationId);
        let suggestedMessage = '';

        if (!existingConversation || existingConversation.messages.length === 0) {
            const targetUser = get().users.find(u => u.id === targetUserId);
            if (targetUser) {
                suggestedMessage = `Olá ${targetUser.name.split(' ')[0]}, gostaria de agendar um serviço com você.`;
            }
        }
        
        set({ 
            isChatOpen: true,
            activeConversationId: conversationId,
            chatDraftMessage: suggestedMessage
        });
    },

    setChatOpen: (isOpen) => {
        set({ isChatOpen: isOpen });
        if (isOpen) {
            set({ hasUnreadChatMessages: false });
        }
    },
    setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId });
         if (conversationId) {
            const state = get();
            const convo = state.conversations.find(c => c.id === conversationId);
            if (!convo || !state.currentUser) return;
            
            const otherParticipantId = convo.participantIds.find(id => id !== state.currentUser!.id);
            const otherParticipant = convo.participantDetails[otherParticipantId!];

            const notificationTextSubString = `de ${otherParticipant.name}`;
            
            state.notifications
                .filter(n => n.type === 'message' && !n.read && n.text.includes(notificationTextSubString))
                .forEach(n => {
                    state.markNotificationAsRead(n.id);
                });
        }
    },
    clearChatDraftMessage: () => set({ chatDraftMessage: '' }),

    checkForNewMessages: async () => {
        const state = get();
        if (!state.currentUser) return;

        const latestNotifications = await api.fetchNotifications();
        const currentUnreadMessageIds = new Set(
            state.notifications
                .filter(n => !n.read && n.type === 'message')
                .map(n => n.id)
        );
        
        const newUnreadMessages = latestNotifications.filter(
            n => n.type === 'message' && !n.read && !currentUnreadMessageIds.has(n.id)
        );

        if (newUnreadMessages.length > 0) {
            if (!get().isChatOpen) {
                 set({ hasUnreadChatMessages: true });
            }
            const newestMessage = newUnreadMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
            get().addAlert(newestMessage.text, 'info');
            await get().fetchConversations(); // Re-fetch to get latest order
        }
        
        set({ notifications: latestNotifications });
    },
    
    // --- ADMIN ACTIONS (Updated with Audit Logs) ---
    addAuditLog: (action, target, details) => {
        const state = get();
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            adminName: state.currentUser?.name || 'System',
            action,
            target,
            timestamp: new Date().toISOString(),
            details
        };
        set(state => ({ auditLogs: [newLog, ...state.auditLogs] }));
    },

    verifyCaregiver: async (caregiverId) => {
        await get().updateCaregiverDetails(caregiverId, { verified: true });
        const caregiver = get().caregivers.find(c => c.id === caregiverId);
        get().addAuditLog('Verificação de Cuidador', caregiver?.name || `ID ${caregiverId}`);
        get().addAlert('Cuidador verificado com sucesso!', 'success');
    },

    deleteUser: async (userId) => {
        const userToDelete = get().users.find(u => u.id === userId);
        const success = await api.deleteUser(userId);
        if (success) {
            set(state => ({
                users: state.users.filter(u => u.id !== userId),
                caregivers: state.caregivers.filter(c => c.id !== userId),
            }));
            get().addAuditLog('Exclusão de Usuário', userToDelete?.name || `ID ${userId}`, `Role: ${userToDelete?.role}`);
            get().addAlert('Usuário excluído com sucesso.', 'info');
        } else {
            get().addAlert('Falha ao excluir usuário.', 'error');
        }
    },

    approveSecurityCheck: async (caregiverId, checkType) => {
        const caregiver = get().caregivers.find(c => c.id === caregiverId);
        if (!caregiver) return;

        const updatedSecurity = { ...caregiver.security, [checkType]: 'completed' };
        await get().updateCaregiverDetails(caregiverId, { security: updatedSecurity });
        
        const checkName = checkType === 'backgroundCheck' ? 'Antecedentes' : 'ID';
        get().addAuditLog(`Aprovação: ${checkName}`, caregiver.name);
        get().addAlert(`Verificação de '${checkName}' aprovada!`);
    },

    updateUserStatus: async (userId, status) => {
        const updatedUser = await api.updateUserStatus(userId, status);
        if (updatedUser) {
            set(state => ({
                users: state.users.map(u => (u.id === userId ? updatedUser : u)),
                caregivers: state.caregivers.map(c => (c.id === userId ? { ...c, status } : c)),
                ...(state.currentUser?.id === userId && { currentUser: updatedUser }),
            }));
            get().addAuditLog(`Alteração de Status: ${status}`, updatedUser.name);
            get().addAlert(`Status do usuário ${updatedUser.name} atualizado para '${status === 'active' ? 'Ativo' : 'Suspenso'}'.`);
        } else {
            get().addAlert('Falha ao atualizar o status do usuário.', 'error');
        }
    },

    deleteReview: async (reviewId) => {
        const success = await api.deleteReview(reviewId);
        if (success) {
            try {
                const data = await api.fetchInitialData();
                set({ caregivers: data.caregivers, users: data.users });
                get().addAuditLog('Exclusão de Avaliação', `ID ${reviewId}`);
                get().addAlert('Avaliação removida com sucesso.', 'info');
            } catch (e) {
                console.error("Failed to refresh data after deleting review", e);
            }
        } else {
            get().addAlert('Falha ao remover a avaliação.', 'error');
        }
    },

    resolveTicket: async (ticketId) => {
        const updatedTicket = await api.resolveTicket(ticketId);
        if (updatedTicket) {
            set(state => ({
                tickets: state.tickets.map(t => t.id === ticketId ? updatedTicket : t)
            }));
            get().addAuditLog('Resolução de Ticket', `Ticket #${ticketId}`, updatedTicket.subject);
            get().addAlert('Ticket resolvido com sucesso!', 'success');
        } else {
            get().addAlert('Erro ao resolver ticket.', 'error');
        }
    },

    sendBroadcast: (message, audience) => {
        // In a real app, this would call an API endpoint. 
        // Here we simulate it by alerting and theoretically adding notifications to all users.
        
        // Example: Mock adding a notification to the current list so the admin sees it works
        const newNotification = {
            id: Date.now(),
            type: 'system' as const,
            text: `[BROADCAST]: ${message}`,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        set(state => ({
            notifications: [newNotification, ...state.notifications]
        }));

        let audienceLabel = 'Todos os Usuários';
        if (audience === 'caregivers') audienceLabel = 'Cuidadores';
        if (audience === 'clients') audienceLabel = 'Clientes';

        get().addAuditLog('Broadcast Enviado', audienceLabel, message);
        get().addAlert(`Mensagem enviada para ${audienceLabel}!`, 'success');
    },

    highlightProfile: async (caregiverId: number) => {
        const newExpiryDate = new Date();
        newExpiryDate.setDate(newExpiryDate.getDate() + 7);
        await get().updateCaregiverDetails(caregiverId, { highlightedUntil: newExpiryDate.toISOString() });
        get().addAlert('Seu perfil foi destacado por 7 dias!', 'success');
    },

    setVacationMode: async (caregiverId: number, active: boolean, returnDate?: string) => {
        const vacationMode = { active, returnDate };
        await get().updateCaregiverDetails(caregiverId, { vacationMode });
        get().addAlert(`Modo Férias ${active ? 'ativado' : 'desativado'}.`, 'info');
    },

    addCareLog: async (logData) => {
        const newLog = await api.addCareLog(logData);
        if (newLog) {
            set(state => ({
                appointments: state.appointments.map(a => a.id === logData.appointmentId ? { ...a, hasLog: true } : a)
            }));
            get().addAlert('Diário registrado com sucesso!', 'success');
        } else {
            get().addAlert('Erro ao registrar diário.', 'error');
        }
    },

    getCareLog: async (appointmentId) => {
        return await api.getCareLog(appointmentId);
    },

    // --- NEW ACTIONS for Check-In/Check-Out ---
    performCheckIn: async (appointmentId, data) => {
        try {
            const response = await fetch(`/api/appointments/${appointmentId}/check-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const updatedAppt = await response.json();
                set(state => ({
                    appointments: state.appointments.map(a => a.id === appointmentId ? updatedAppt : a)
                }));
                get().addAlert('Check-in realizado com sucesso! Bom plantão. 🏠✅');
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            get().addAlert('Erro ao realizar check-in.', 'error');
            return false;
        }
    },

    performCheckOut: async (appointmentId, data) => {
        try {
            const response = await fetch(`/api/appointments/${appointmentId}/check-out`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const updatedAppt = await response.json();
                set(state => ({
                    appointments: state.appointments.map(a => a.id === appointmentId ? updatedAppt : a)
                }));
                get().addAlert('Check-out realizado com sucesso! Descanso merecido. 😴✅');
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            get().addAlert('Erro ao realizar check-out.', 'error');
            return false;
        }
    },

    // --- WALLET ACTIONS ---
    fetchWallet: async () => {
        const userId = get().currentUser?.id;
        if (!userId) return;
        
        try {
            const response = await fetch(`/api/users/${userId}/wallet`);
            if (response.ok) {
                const wallet = await response.json();
                set(state => {
                    if (!state.currentUser) return {};
                    return {
                        currentUser: { ...state.currentUser, wallet }
                    };
                });
            }
        } catch (e) {
            console.error(e);
        }
    },

    requestWithdrawal: async (amount: number, pixKey: string) => {
        const userId = get().currentUser?.id;
        if (!userId) return false;

        try {
            const response = await fetch(`/api/users/${userId}/wallet/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, pixKey })
            });

            if (response.ok) {
                const updatedWallet = await response.json();
                set(state => ({
                    currentUser: state.currentUser ? { ...state.currentUser, wallet: updatedWallet } : null
                }));
                get().addAlert(`Saque de R$ ${amount.toFixed(2)} solicitado com sucesso!`);
                return true;
            } else {
                get().addAlert('Saldo insuficiente ou erro na solicitação.', 'error');
                return false;
            }
        } catch (e) {
            console.error(e);
            get().addAlert('Erro ao solicitar saque.', 'error');
            return false;
        }
    },

    addCredits: async (amount: number, paymentMethod: 'credit_card' | 'pix') => {
        const userId = get().currentUser?.id;
        if (!userId) return false;

        try {
            const response = await fetch(`/api/users/${userId}/wallet/add-credits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, paymentMethod })
            });

            if (response.ok) {
                const updatedWallet = await response.json();
                set(state => ({
                    currentUser: state.currentUser ? { ...state.currentUser, wallet: updatedWallet } : null
                }));
                get().addAlert(`R$ ${amount.toFixed(2)} adicionados à sua carteira!`);
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            get().addAlert('Erro ao adicionar créditos.', 'error');
            return false;
        }
    },

    // --- SYSTEM MANAGEMENT ACTIONS ---
    updateSystemSettings: (settings) => {
        set(state => ({ systemSettings: { ...state.systemSettings, ...settings } }));
        get().addAuditLog('Atualização do Sistema', 'Configurações Gerais');
        get().addAlert('Configurações do sistema atualizadas com sucesso!');
    },

    updateContentPage: (slug, content) => {
        set(state => ({
            contentPages: state.contentPages.map(page => 
                page.slug === slug ? { ...page, content, lastUpdated: new Date().toISOString() } : page
            )
        }));
        get().addAuditLog('Atualização de Conteúdo', `Página: ${slug}`);
        get().addAlert('Conteúdo da página atualizado!');
    }
}));
