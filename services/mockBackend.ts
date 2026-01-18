
// services/mockBackend.ts
import { Caregiver, User, Appointment, Review, Notification, Client, Message, Conversation, CareLog, SupportTicket, Wallet, WalletTransaction } from '../types';
import { initialCaregivers, initialUsers, sampleAppointments, sampleNotifications, initialConversations } from '../constants';

const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToStorage = <T>(key: string, value: T) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error: any) {
        // Handle QuotaExceededError specifically
        if (error.name === 'QuotaExceededError' || error.code === 22 || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.warn(`LocalStorage quota exceeded for key "${key}". Data will not be persisted across reloads.`);
            // Optional: You could try to clear less critical data here, e.g., logs or old notifications
            // window.localStorage.removeItem('auditLogs'); 
        } else {
            console.error(`Error writing to localStorage key “${key}”:`, error);
        }
    }
};

const sampleTickets: SupportTicket[] = [
    { id: 1, userId: 1, userName: "Netha Pereira", userRole: 'caregiver', subject: "Dúvida sobre pagamento", description: "O pagamento do cliente Carlos ainda não caiu na minha conta.", status: 'open', date: new Date().toISOString(), priority: 'high' },
    { id: 2, userId: 999, userName: "Carlos Andrade", userRole: 'client', subject: "Reportar atraso", description: "O cuidador chegou 1 hora atrasado no último agendamento.", status: 'open', date: new Date(Date.now() - 86400000).toISOString(), priority: 'medium' },
    { id: 3, userId: 2, userName: "João Silva", userRole: 'caregiver', subject: "Atualização de documentos", description: "Enviei meu certificado atualizado, podem verificar?", status: 'resolved', date: new Date(Date.now() - 172800000).toISOString(), priority: 'low' },
];

const initializeData = () => {
    if (!localStorage.getItem('caregivers')) saveToStorage('caregivers', initialCaregivers);
    if (!localStorage.getItem('users')) saveToStorage('users', initialUsers);
    if (!localStorage.getItem('appointments')) saveToStorage('appointments', sampleAppointments);
    if (!localStorage.getItem('notifications')) saveToStorage('notifications', sampleNotifications);
    if (!localStorage.getItem('conversations')) saveToStorage('conversations', initialConversations);
    if (!localStorage.getItem('careLogs')) saveToStorage('careLogs', []);
    if (!localStorage.getItem('tickets')) saveToStorage('tickets', sampleTickets);
};

// Initialize data once when the module is loaded.
initializeData();

export const handleMockRequest = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
    const method = init?.method || 'GET';
    const body = init?.body ? JSON.parse(init.body as string) : {};

    console.log(`[Mock API] ${method} ${url}`, body);
    await new Promise(res => setTimeout(res, 200 + Math.random() * 300));

    const jsonResponse = (data: any, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

    // --- API ROUTES ---
    if (url === '/api/initial-data' && method === 'GET') {
        const data = {
            caregivers: getFromStorage('caregivers', initialCaregivers),
            users: getFromStorage('users', initialUsers),
            appointments: getFromStorage('appointments', sampleAppointments),
            notifications: getFromStorage('notifications', sampleNotifications),
            conversations: getFromStorage('conversations', initialConversations),
            tickets: getFromStorage('tickets', sampleTickets),
        };
        return jsonResponse(data);
    }

    if (url === '/api/login' && method === 'POST') {
        const users = getFromStorage<User[]>('users', []);
        const user = users.find(u => u.email === body.email && u.password === body.password);
        if (user && user.status === 'suspended') return jsonResponse({ error: 'Account suspended' }, 403);
        if (user) return jsonResponse(user);
        return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    if (url === '/api/register' && method === 'POST') {
        const users = getFromStorage<User[]>('users', []);
        if (users.some(u => u.email === body.email)) {
            return jsonResponse({ error: 'Este email já está cadastrado! Tente fazer login.' }, 409);
        }
        
        const registeredUser: User = { ...body, id: Date.now(), status: 'active' } as User;
        
        // Initialize empty wallet for new user
        registeredUser.wallet = {
            balance: 0,
            pendingBalance: 0,
            transactions: []
        };
        
        if (registeredUser.role === 'caregiver') {
            const caregivers = getFromStorage<Caregiver[]>('caregivers', []);
            saveToStorage('caregivers', [...caregivers, registeredUser]);
        }
        saveToStorage('users', [...users, registeredUser]);
        return jsonResponse(registeredUser, 201);
    }

    // --- WALLET ROUTES ---
    
    // Get Wallet Data
    const walletMatch = url.match(/^\/api\/users\/(\d+)\/wallet$/);
    if (walletMatch && method === 'GET') {
        const userId = parseInt(walletMatch[1]);
        const users = getFromStorage<User[]>('users', []);
        const user = users.find(u => u.id === userId);
        
        if (!user) return jsonResponse({ error: "User not found" }, 404);
        
        // Ensure wallet exists (migration for old data)
        const wallet = user.wallet || { balance: 0, pendingBalance: 0, transactions: [] };
        
        return jsonResponse(wallet);
    }

    // Request Withdrawal (Caregiver)
    const withdrawalMatch = url.match(/^\/api\/users\/(\d+)\/wallet\/withdraw$/);
    if (withdrawalMatch && method === 'POST') {
        const userId = parseInt(withdrawalMatch[1]);
        const { amount, pixKey } = body;
        
        let users = getFromStorage<User[]>('users', []);
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) return jsonResponse({ error: "User not found" }, 404);
        
        const user = users[userIndex];
        const wallet = user.wallet || { balance: 0, pendingBalance: 0, transactions: [] };

        if (wallet.balance < amount) {
            return jsonResponse({ error: "Insufficient funds" }, 400);
        }

        const newTransaction: WalletTransaction = {
            id: `tx-wd-${Date.now()}`,
            userId,
            date: new Date().toISOString(),
            description: `Saque Pix (${pixKey})`,
            amount: amount,
            type: 'debit',
            status: 'processing' // Simulate processing
        };

        const updatedWallet = {
            ...wallet,
            balance: wallet.balance - amount,
            transactions: [newTransaction, ...wallet.transactions]
        };

        users[userIndex] = { ...user, wallet: updatedWallet };
        saveToStorage('users', users);
        
        // Sync caregiver storage if user is caregiver
        if (user.role === 'caregiver') {
            let caregivers = getFromStorage<Caregiver[]>('caregivers', []);
            const cgIndex = caregivers.findIndex(c => c.id === userId);
            if (cgIndex !== -1) {
                caregivers[cgIndex] = { ...caregivers[cgIndex], wallet: updatedWallet };
                saveToStorage('caregivers', caregivers);
            }
        }

        return jsonResponse(updatedWallet);
    }

    // Add Credits (Client)
    const addCreditsMatch = url.match(/^\/api\/users\/(\d+)\/wallet\/add-credits$/);
    if (addCreditsMatch && method === 'POST') {
        const userId = parseInt(addCreditsMatch[1]);
        const { amount, paymentMethod } = body;
        
        let users = getFromStorage<User[]>('users', []);
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) return jsonResponse({ error: "User not found" }, 404);
        
        const user = users[userIndex];
        const wallet = user.wallet || { balance: 0, pendingBalance: 0, transactions: [] };

        const newTransaction: WalletTransaction = {
            id: `tx-add-${Date.now()}`,
            userId,
            date: new Date().toISOString(),
            description: `Recarga via ${paymentMethod === 'pix' ? 'Pix' : 'Cartão'}`,
            amount: amount,
            type: 'credit',
            status: 'completed'
        };

        const updatedWallet = {
            ...wallet,
            balance: wallet.balance + amount,
            transactions: [newTransaction, ...wallet.transactions]
        };

        users[userIndex] = { ...user, wallet: updatedWallet };
        saveToStorage('users', users);

        return jsonResponse(updatedWallet);
    }

    // --- END WALLET ROUTES ---

    const userMatch = url.match(/^\/api\/users\/(\d+)$/);
    if (userMatch && method === 'PATCH') {
        const userId = parseInt(userMatch[1]);
        let users = getFromStorage<User[]>('users', []);
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) return jsonResponse({ error: "User not found" }, 404);

        const updatedUser = { ...users[userIndex], ...body } as User;
        users[userIndex] = updatedUser;
        saveToStorage('users', users);
        
        if (updatedUser.role === 'caregiver') {
             let caregivers = getFromStorage<Caregiver[]>('caregivers', []);
             const caregiverIndex = caregivers.findIndex(c => c.id === userId);
             if(caregiverIndex !== -1) {
                caregivers[caregiverIndex] = updatedUser;
                saveToStorage('caregivers', caregivers);
             }
        }
        return jsonResponse(updatedUser);
    }
    
    const userStatusMatch = url.match(/^\/api\/users\/(\d+)\/status$/);
    if (userStatusMatch && method === 'PATCH') {
        const userId = parseInt(userStatusMatch[1]);
        const { status } = body;
        let users = getFromStorage<User[]>('users', []);
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) return jsonResponse({ error: "User not found" }, 404);

        const updatedUser = { ...users[userIndex], status } as User;
        users[userIndex] = updatedUser;
        saveToStorage('users', users);
        
        if (updatedUser.role === 'caregiver') {
             let caregivers = getFromStorage<Caregiver[]>('caregivers', []);
             const caregiverIndex = caregivers.findIndex(c => c.id === userId);
             if(caregiverIndex !== -1) {
                caregivers[caregiverIndex] = updatedUser;
                saveToStorage('caregivers', caregivers);
             }
        }
        return jsonResponse(updatedUser);
    }

    if (url === '/api/appointments' && method === 'POST') {
        const appointmentData = body;
        const appointments = getFromStorage<Appointment[]>('appointments', []);
        const notifications = getFromStorage<Notification[]>('notifications', []);
        const caregivers = getFromStorage<Caregiver[]>('caregivers', []);
        const caregiver = caregivers.find(c => c.id === appointmentData.caregiverId);
        const unavailableDatesSet = new Set(caregiver?.unavailableDates || []);
        
        const newAppointments: Appointment[] = [];
        
        if (appointmentData.recurrenceRule && appointmentData.recurrenceRule !== 'none' && appointmentData.recurrenceEndDate) {
            const seriesId = `series-${Date.now()}`;
            let currentDate = new Date(appointmentData.date);
            currentDate.setMinutes(currentDate.getMinutes() + currentDate.getTimezoneOffset());
            const endDate = new Date(appointmentData.recurrenceEndDate);
            const increment = appointmentData.recurrenceRule === 'weekly' ? 7 : 14;

            while (currentDate <= endDate) {
                const dateString = currentDate.toISOString().split('T')[0];
                if (!unavailableDatesSet.has(dateString)) {
                    newAppointments.push({ ...appointmentData, id: `appt-${Date.now()}-${newAppointments.length}`, date: dateString, seriesId });
                }
                currentDate.setDate(currentDate.getDate() + increment);
            }
            if (newAppointments.length > 0) {
                 saveToStorage('notifications', [{ id: Date.now(), type: 'booking', text: `Novo agendamento recorrente de ${appointmentData.clientName}.`, timestamp: new Date().toISOString(), read: false }, ...notifications]);
            }
        } else {
            newAppointments.push({ ...appointmentData, id: `appt-${Date.now()}` });
            saveToStorage('notifications', [{ id: Date.now(), type: 'booking', text: `Novo agendamento de ${appointmentData.clientName}.`, timestamp: new Date().toISOString(), read: false }, ...notifications]);
        }

        if (newAppointments.length > 0) saveToStorage('appointments', [...appointments, ...newAppointments]);
        return jsonResponse(newAppointments, 201);
    }

    const apptCheckInMatch = url.match(/^\/api\/appointments\/(\S+)\/check-in$/);
    if (apptCheckInMatch && method === 'POST') {
        const appointmentId = apptCheckInMatch[1];
        let appointments = getFromStorage<Appointment[]>('appointments', []);
        const apptIndex = appointments.findIndex(a => a.id === appointmentId);
        
        if (apptIndex === -1) return jsonResponse({ error: 'Appointment not found' }, 404);
        
        const updatedAppt = { 
            ...appointments[apptIndex], 
            checkIn: body 
        };
        appointments[apptIndex] = updatedAppt;
        saveToStorage('appointments', appointments);
        
        // Notify Client
        const notifications = getFromStorage<Notification[]>('notifications', []);
        saveToStorage('notifications', [{ id: Date.now(), type: 'booking', text: `${updatedAppt.caregiverName} iniciou o plantão.`, timestamp: new Date().toISOString(), read: false }, ...notifications]);

        return jsonResponse(updatedAppt);
    }

    const apptCheckOutMatch = url.match(/^\/api\/appointments\/(\S+)\/check-out$/);
    if (apptCheckOutMatch && method === 'POST') {
        const appointmentId = apptCheckOutMatch[1];
        let appointments = getFromStorage<Appointment[]>('appointments', []);
        const apptIndex = appointments.findIndex(a => a.id === appointmentId);
        
        if (apptIndex === -1) return jsonResponse({ error: 'Appointment not found' }, 404);
        
        const updatedAppt = { 
            ...appointments[apptIndex], 
            checkOut: body,
            status: 'completed' as const
        };
        appointments[apptIndex] = updatedAppt;
        saveToStorage('appointments', appointments);

        // Notify Client
        const notifications = getFromStorage<Notification[]>('notifications', []);
        saveToStorage('notifications', [{ id: Date.now(), type: 'booking', text: `${updatedAppt.caregiverName} finalizou o plantão.`, timestamp: new Date().toISOString(), read: false }, ...notifications]);

        // Simulating Automatic Wallet Update on Completion
        // In a real backend, this would be transactional. Here we simulate for display.
        const caregiverId = updatedAppt.caregiverId;
        const users = getFromStorage<User[]>('users', []);
        const caregiverIndex = users.findIndex(u => u.id === caregiverId);
        
        if (caregiverIndex !== -1) {
            const user = users[caregiverIndex];
            const earnings = updatedAppt.caregiverEarnings || 0;
            const currentWallet = user.wallet || { balance: 0, pendingBalance: 0, transactions: [] };
            
            const newTx: WalletTransaction = {
                id: `tx-job-${Date.now()}`,
                userId: caregiverId,
                date: new Date().toISOString(),
                description: `Serviço Concluído: ${updatedAppt.clientName}`,
                amount: earnings,
                type: 'credit',
                status: 'completed',
                referenceId: updatedAppt.id
            };
            
            const updatedWallet = {
                ...currentWallet,
                balance: currentWallet.balance + earnings,
                transactions: [newTx, ...currentWallet.transactions]
            };
            
            users[caregiverIndex] = { ...user, wallet: updatedWallet };
            saveToStorage('users', users);
            
            // Sync caregivers list
            const caregivers = getFromStorage<Caregiver[]>('caregivers', []);
            const cgIdx = caregivers.findIndex(c => c.id === caregiverId);
            if (cgIdx !== -1) {
                caregivers[cgIdx] = { ...caregivers[cgIdx], wallet: updatedWallet };
                saveToStorage('caregivers', caregivers);
            }
        }

        return jsonResponse(updatedAppt);
    }

    const apptMatch = url.match(/^\/api\/appointments\/(\S+)$/);
    if (apptMatch && method === 'PATCH') {
        const appointmentId = apptMatch[1];
        let appointments = getFromStorage<Appointment[]>('appointments', []);
        const apptIndex = appointments.findIndex(a => a.id === appointmentId);
        if (apptIndex === -1) return jsonResponse({ error: 'Appointment not found'}, 404);
        
        const updatedAppt = { ...appointments[apptIndex], ...body };
        appointments[apptIndex] = updatedAppt;
        saveToStorage('appointments', appointments);
        
        const notifications = getFromStorage<Notification[]>('notifications', []);
        saveToStorage('notifications', [{ id: Date.now(), type: 'booking', text: `${updatedAppt.clientName} alterou um agendamento.`, timestamp: new Date().toISOString(), read: false }, ...notifications]);
        
        return jsonResponse(updatedAppt);
    }

    const apptCancelMatch = url.match(/^\/api\/appointments\/(\S+)\/cancel$/);
    if (apptCancelMatch && method === 'POST') {
        const appointmentId = apptCancelMatch[1];
        let appointments = getFromStorage<Appointment[]>('appointments', []);
        const apptIndex = appointments.findIndex(a => a.id === appointmentId);
        if (apptIndex === -1) return jsonResponse({ error: 'Appointment not found'}, 404);

        const updatedAppt = { ...appointments[apptIndex], status: 'cancelled' as const };
        appointments[apptIndex] = updatedAppt;
        saveToStorage('appointments', appointments);

        const notifications = getFromStorage<Notification[]>('notifications', []);
        saveToStorage('notifications', [{ id: Date.now(), type: 'cancellation', text: `${updatedAppt.clientName} cancelou um agendamento.`, timestamp: new Date().toISOString(), read: false }, ...notifications]);

        return jsonResponse(updatedAppt);
    }

    if (url === '/api/reviews' && method === 'POST') {
        const { appointmentId, caregiverId, reviewData } = body;
        let caregivers = getFromStorage<Caregiver[]>('caregivers', []);
        let appointments = getFromStorage<Appointment[]>('appointments', []);
        const caregiverIndex = caregivers.findIndex(c => c.id === caregiverId);
        const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);

        if (caregiverIndex === -1 || appointmentIndex === -1) return jsonResponse({ error: 'Not found' }, 404);

        const caregiver = caregivers[caregiverIndex];
        const newReview: Review = { ...reviewData, id: Date.now(), date: new Date().toISOString(), caregiverId, caregiverName: caregiver.name };
        const updatedReviews = [newReview, ...caregiver.reviews];
        const totalRating = (caregiver.rating * caregiver.reviewsCount) + reviewData.rating;
        const updatedCaregiver: Caregiver = { ...caregiver, reviews: updatedReviews, reviewsCount: caregiver.reviewsCount + 1, rating: parseFloat((totalRating / (caregiver.reviewsCount + 1)).toFixed(2)) };
        caregivers[caregiverIndex] = updatedCaregiver;

        const updatedAppointment: Appointment = { ...appointments[appointmentIndex], reviewed: true };
        appointments[appointmentIndex] = updatedAppointment;

        let users = getFromStorage<User[]>('users', []);
        const userIndex = users.findIndex(u => u.id === caregiverId);
        if (userIndex !== -1) users[userIndex] = updatedCaregiver;
        
        const notifications = getFromStorage<Notification[]>('notifications', []);
        
        saveToStorage('caregivers', caregivers);
        saveToStorage('appointments', appointments);
        saveToStorage('users', users);
        saveToStorage('notifications', [{ id: Date.now(), type: 'review', text: `${reviewData.author} deixou uma nova avaliação.`, timestamp: new Date().toISOString(), read: false }, ...notifications]);

        return jsonResponse({ updatedCaregiver, updatedAppointment }, 201);
    }

    const reviewMatch = url.match(/^\/api\/reviews\/(\d+)$/);
    if (reviewMatch && method === 'DELETE') {
        const reviewId = parseInt(reviewMatch[1]);
        let caregivers = getFromStorage<Caregiver[]>('caregivers', []);
        let found = false;
        const updatedCaregivers = caregivers.map(c => {
            const initialCount = c.reviews.length;
            const review = c.reviews.find(r => r.id === reviewId);
            const filtered = c.reviews.filter(r => r.id !== reviewId);
            if (filtered.length < initialCount) {
                found = true;
                if(filtered.length > 0 && review){
                     const newTotalRating = (c.rating * initialCount) - review.rating;
                     c.rating = parseFloat((newTotalRating / filtered.length).toFixed(2));
                } else {
                    c.rating = 0;
                }
                c.reviews = filtered;
                c.reviewsCount = filtered.length
            }
            return c;
        });

        if (found) {
            saveToStorage('caregivers', updatedCaregivers);
            let users = getFromStorage<User[]>('users', []);
            const updatedUsers = users.map(u => {
                const updatedCg = updatedCaregivers.find(cg => cg.id === u.id);
                return updatedCg || u;
            });
            saveToStorage('users', updatedUsers);
            return new Response(null, { status: 204 });
        }
        return jsonResponse({ error: 'Review not found'}, 404);
    }

    if (url === '/api/notifications' && method === 'GET') {
         return jsonResponse(getFromStorage('notifications', []));
    }

    const notifReadMatch = url.match(/^\/api\/notifications\/(\d+)\/read$/);
    if (notifReadMatch && method === 'POST') {
        const notificationId = parseInt(notifReadMatch[1]);
        let notifications = getFromStorage<Notification[]>('notifications', []);
        notifications = notifications.map(n => n.id === notificationId ? { ...n, read: true } : n);
        saveToStorage('notifications', notifications);
        return jsonResponse(notifications);
    }
    
    if (url === '/api/conversations' && method === 'GET') {
        // Automatically mark messages as 'read' when fetching conversations (simulating opening app)
        // In a real app, this would be more granular (per conversation open)
        let conversations = getFromStorage<Conversation[]>('conversations', []);
        return jsonResponse(conversations);
    }

    if (url === '/api/messages' && method === 'POST') {
         const { conversationId, senderId, receiverId, text } = body;
         let conversations = getFromStorage<Conversation[]>('conversations', []);
         let notifications = getFromStorage<Notification[]>('notifications', []);
         const newMessage: Message = { id: Date.now(), senderId, text, timestamp: new Date().toISOString(), status: 'sent' };
         let updatedConversation: Conversation | undefined;
         const convIdx = conversations.findIndex(c => c.id === conversationId);
         
         if (convIdx > -1) {
             const convo = conversations[convIdx];
             convo.messages.push(newMessage);
             convo.lastMessageTimestamp = newMessage.timestamp;
             updatedConversation = convo;
         } else {
              const users = getFromStorage<User[]>('users', []);
              const sender = users.find(u => u.id === senderId);
              const receiver = users.find(u => u.id === receiverId);
              if (!sender || !receiver) return jsonResponse({ error: 'User not found' }, 404);
              updatedConversation = { id: conversationId, participantIds: [senderId, receiverId], participantDetails: { [senderId]: { name: sender.name, photo: sender.photo }, [receiverId]: { name: receiver.name, photo: receiver.photo } }, messages: [newMessage], lastMessageTimestamp: newMessage.timestamp };
              conversations.push(updatedConversation);
         }
         
         conversations.sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
         const senderName = updatedConversation.participantDetails[senderId].name;
         const newNotification = { id: Date.now() + 1, type: 'message' as const, text: `Nova mensagem de ${senderName}.`, timestamp: new Date().toISOString(), read: false };
         saveToStorage('conversations', conversations);
         saveToStorage('notifications', [newNotification, ...notifications]);

         // SIMULATE AUTO-REPLY (Demo feature)
         setTimeout(() => {
             // 1. Simula leitura da mensagem pelo outro usuário
             let currentConversations = getFromStorage<Conversation[]>('conversations', []);
             let conv = currentConversations.find(c => c.id === conversationId);
             if (conv) {
                 // Mark the user's message as read
                 conv.messages = conv.messages.map(m => m.id === newMessage.id ? {...m, status: 'read'} : m);
                 saveToStorage('conversations', currentConversations);
             }

             // 2. Simula resposta após mais um tempo
             setTimeout(() => {
                 currentConversations = getFromStorage<Conversation[]>('conversations', []);
                 conv = currentConversations.find(c => c.id === conversationId);
                 
                 // Fetch the receiver user to check auto-reply settings
                 const currentUsers = getFromStorage<User[]>('users', []);
                 const receiverUser = currentUsers.find(u => u.id === receiverId);
                 
                 if (conv && receiverUser && (receiverUser as Caregiver).role === 'caregiver') {
                     const caregiver = receiverUser as Caregiver;
                     const autoReplyEnabled = caregiver.chatSettings?.autoReply ?? true; // Default true if not set
                     
                     if (autoReplyEnabled) {
                         const replyText = caregiver.chatSettings?.welcomeMessage || "Olá! Obrigado pela mensagem. Estou disponível para conversar agora. Como posso ajudar com os cuidados?";
                         
                         const replyMessage: Message = { 
                             id: Date.now() + 10, 
                             senderId: receiverId, 
                             text: replyText, 
                             timestamp: new Date().toISOString(), 
                             status: 'sent' 
                         };
                         
                         conv.messages.push(replyMessage);
                         conv.lastMessageTimestamp = replyMessage.timestamp;
                         
                         // Add notification for reply
                         const replierName = conv.participantDetails[receiverId].name;
                         const replyNotif = { 
                             id: Date.now() + 11, 
                             type: 'message' as const, 
                             text: `Nova mensagem de ${replierName}.`, 
                             timestamp: new Date().toISOString(), 
                             read: false 
                         };
                         
                         saveToStorage('conversations', currentConversations);
                         const currentNotifications = getFromStorage<Notification[]>('notifications', []);
                         saveToStorage('notifications', [replyNotif, ...currentNotifications]);
                     }
                 }
             }, 3500); // 3.5 segundos para responder
         }, 1000); // 1 segundo para ler
         
         return jsonResponse({ updatedConversation, newNotification });
    }
    
    const userDeleteMatch = url.match(/^\/api\/users\/(\d+)$/);
    if (userDeleteMatch && method === 'DELETE') {
        const userId = parseInt(userDeleteMatch[1]);
        let users = getFromStorage<User[]>('users', []);
        const userToDelete = users.find(u => u.id === userId);
        if (!userToDelete) return jsonResponse({ error: 'User not found' }, 404);
        saveToStorage('users', users.filter(u => u.id !== userId));
        if (userToDelete.role === 'caregiver') {
            saveToStorage('caregivers', getFromStorage<Caregiver[]>('caregivers', []).filter(c => c.id !== userId));
        }
        return new Response(null, { status: 204 });
    }

    if (url === '/api/care-logs' && method === 'POST') {
        const logData = body;
        const careLogs = getFromStorage<CareLog[]>('careLogs', []);
        const newLog: CareLog = { ...logData, id: `log-${Date.now()}`, timestamp: new Date().toISOString() };
        saveToStorage('careLogs', [...careLogs, newLog]);
        
        // Update appointment to hasLog: true
        let appointments = getFromStorage<Appointment[]>('appointments', []);
        const apptIndex = appointments.findIndex(a => a.id === logData.appointmentId);
        if (apptIndex !== -1) {
            appointments[apptIndex].hasLog = true;
            saveToStorage('appointments', appointments);
        }

        return jsonResponse(newLog, 201);
    }

    const careLogMatch = url.match(/^\/api\/care-logs\/(\S+)$/);
    if (careLogMatch && method === 'GET') {
        const appointmentId = careLogMatch[1];
        const careLogs = getFromStorage<CareLog[]>('careLogs', []);
        const log = careLogs.find(l => l.appointmentId === appointmentId);
        if (!log) return jsonResponse({ error: 'Log not found' }, 404);
        return jsonResponse(log);
    }

    // --- SUPPORT TICKETS ---
    if (url === '/api/tickets' && method === 'POST') {
        const ticketData = body;
        const tickets = getFromStorage<SupportTicket[]>('tickets', []);
        const newTicket: SupportTicket = { 
            ...ticketData, 
            id: Date.now(), 
            date: new Date().toISOString(), 
            status: 'open' 
        };
        saveToStorage('tickets', [newTicket, ...tickets]);
        return jsonResponse(newTicket, 201);
    }

    const resolveTicketMatch = url.match(/^\/api\/tickets\/(\d+)\/resolve$/);
    if (resolveTicketMatch && method === 'PATCH') {
        const ticketId = parseInt(resolveTicketMatch[1]);
        let tickets = getFromStorage<SupportTicket[]>('tickets', []);
        const ticketIndex = tickets.findIndex(t => t.id === ticketId);
        if (ticketIndex === -1) return jsonResponse({ error: 'Ticket not found' }, 404);
        
        const updatedTicket = { ...tickets[ticketIndex], status: 'resolved' as const };
        tickets[ticketIndex] = updatedTicket;
        saveToStorage('tickets', tickets);
        return jsonResponse(updatedTicket);
    }

    console.error(`[Mock API] Unhandled route: ${method} ${url}`);
    return jsonResponse({ error: 'Not Found' }, 404);
};
