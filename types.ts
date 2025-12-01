
export interface Review {
    id: number;
    author: string;
    authorPhoto: string;
    rating: number;
    comment: string;
    date: string;
    caregiverId?: number; // Added for moderation
    caregiverName?: string; // Added for moderation
}

export interface Service {
    id: string;
    name: string;
    icon: string;
    price: number;
    description: string;
    videoUrl?: string; // Link para vídeo ou material explicativo
}

export interface CareLog {
    id: string;
    appointmentId: string;
    date: string;
    mood: 'happy' | 'calm' | 'sad' | 'agitated' | 'confused';
    activities: string[]; // e.g., ['medication', 'bath', 'meal', 'exercise']
    notes: string;
    photos?: string[]; // URLs (optional)
    timestamp: string;
}

export interface AppointmentAction {
    timestamp: string;
    location: {
        lat: number;
        lng: number;
    };
    photo: string; // Base64 selfie
    verified: boolean;
}

export interface Appointment {
    id: string;
    caregiverId: number;
    caregiverName: string;
    caregiverPhoto: string;
    clientId: number;
    clientName: string;
    clientPhone?: string;
    clientCity?: string;
    clientCoordinates?: { // Target location for validation
        lat: number;
        lng: number;
    };
    date: string; // ISO string for date
    time: string;
    serviceType: string; // Was keyof Caregiver['services'], now string
    status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
    cost: number;
    platformFee?: number; // 15% fee
    caregiverEarnings?: number; // 85% earnings
    reviewed?: boolean;
    hasLog?: boolean; // Indicates if a care log exists
    checkIn?: AppointmentAction; // New: Check-in data
    checkOut?: AppointmentAction; // New: Check-out data
    paymentStatus: 'paid' | 'pending' | 'failed' | 'direct';
    paymentMethod?: 'credit_card' | 'pix' | 'cash';
    seriesId?: string; // To group recurring appointments
    recurrenceRule?: 'none' | 'weekly' | 'biweekly';
    recurrenceEndDate?: string;
}

export interface SupportTicket {
    id: number;
    userId: number;
    userName: string;
    userRole: 'caregiver' | 'client';
    subject: string;
    description: string;
    status: 'open' | 'resolved';
    date: string;
    priority: 'low' | 'medium' | 'high';
}

export interface WalletTransaction {
    id: string;
    userId: number;
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
    status: 'completed' | 'pending' | 'processing';
    referenceId?: string; // e.g., Appointment ID
}

export interface Wallet {
    balance: number;
    pendingBalance: number;
    transactions: WalletTransaction[];
}

export interface SystemSettings {
    appName: string;
    logo: string; // Emoji or URL
    primaryColor: string;
    secondaryColor: string;
    maintenanceMode: boolean;
}

export interface ContentPageData {
    slug: 'about' | 'privacy' | 'terms' | 'howItWorks' | 'security';
    title: string;
    content: string; // HTML or Markdown supported conceptually
    lastUpdated: string;
}

export interface AuditLog {
    id: string;
    adminName: string;
    action: string;
    target: string;
    timestamp: string;
    details?: string;
}

interface BaseUser {
    id: number;
    name: string;
    email: string;
    photo: string;
    password?: string;
    status: 'active' | 'suspended';
    wallet?: Wallet; // New Wallet Field
}

export interface Caregiver extends BaseUser {
    role: 'caregiver';
    city: string;
    experience: string;
    specializations: string[];
    certifications: string[];
    availability: 'today' | 'this_week' | 'next_week' | 'unavailable';
    rating: number;
    reviewsCount: number;
    reviews: Review[];
    bio: string;
    phone: string;
    services: Service[]; // Changed from object to array of Service
    cover?: {
        type: 'gradient' | 'color' | 'image';
        value: string;
    };
    verified: boolean;
    online: boolean;
    responseTime: string;
    completedJobs: number;
    unavailableDates?: string[]; // Array of ISO date strings
    appointments?: Appointment[];
    notificationPreferences: {
        newBookings: boolean;
        cancellations: boolean;

        newReviews: boolean;
    };
    security: {
        backgroundCheck: 'completed' | 'pending';
        idVerification: 'completed' | 'pending';
        insurance: boolean;
        insurancePolicy?: string;
    };
    socialMedia?: {
        instagram?: string;
        facebook?: string;
        linkedin?: string;
        whatsapp?: string;
    };
    highlightedUntil?: string; // For profile highlighting feature
    vacationMode?: {
        active: boolean;
        returnDate?: string;
    };
    chatSettings?: {
        autoReply: boolean;
        welcomeMessage: string;
    };
}

export interface Client extends BaseUser {
    role: 'client';
    city: string;
    phone: string;
    appointments?: Appointment[];
    notificationPreferences: {
        bookingConfirmations: boolean;
        newMessages: boolean;
        platformUpdates: boolean;
    };
}

export interface Admin extends BaseUser {
    role: 'admin';
}

export type User = Caregiver | Client | Admin;


export interface AlertMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Notification {
    id: number;
    type: 'booking' | 'review' | 'cancellation' | 'message' | 'system';
    text: string;
    timestamp: string;
    read: boolean;
}

export interface Message {
    id: number;
    senderId: number;
    text: string;
    timestamp: string;
    read?: boolean; // Indicates if the user has visually seen it in list
    status?: 'sent' | 'delivered' | 'read'; // Detailed status
}

export interface Conversation {
    id: string; // e.g., "1-999"
    participantIds: [number, number];
    participantDetails: {
        [key: number]: { name: string; photo: string; }
    };
    messages: Message[];
    lastMessageTimestamp: string;
}


export type Page = 
    'home' | 
    'marketplace' | 
    'publicProfile' | 
    'login' | 
    'register' | 
    'dashboard' | 
    'adminDashboard' | 
    'about' | 
    'privacy' | 
    'terms' |
    'findCaregiversGuide' |
    'howToChoose' |
    'security' |
    'howItWorks' |
    'training';
