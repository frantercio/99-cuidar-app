
import React, { useEffect } from 'react';
import { Page } from './types';
import { useAppStore } from './store/useAppStore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import MarketplacePage from './components/MarketplacePage';
import PublicProfilePage from './components/PublicProfilePage';
import DashboardPage from './components/DashboardPage';
import ClientDashboardPage from './components/ClientDashboardPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Alert from './components/Alert';
import ChatWidget from './components/ChatWidget';
import AboutPage from './components/AboutPage';
import PrivacyPage from './components/PrivacyPage';
import TermsPage from './components/TermsPage';
import FindCaregiversGuidePage from './components/FindCaregiversGuidePage';
import HowToChoosePage from './components/HowToChoosePage';
import SecurityPage from './components/SecurityPage';
import HowItWorksPage from './components/HowItWorksPage';
import TrainingPage from './components/TrainingPage';
import InstallPrompt from './components/InstallPrompt';


const App: React.FC = () => {
    const { 
        page, 
        currentUser, 
        viewingCaregiver, 
        alerts, 
        navigate, 
        logout, 
        removeAlert,
        loadInitialData,
        isLoading,
    } = useAppStore();

    useEffect(() => {
        loadInitialData();
        // Dark mode preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (e.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [loadInitialData]);
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-spin-slow">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Carregando 99Cuidar...</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Preparando a melhor experiência para você.</p>
                </div>
            </div>
        );
    }

    const renderPage = () => {
        switch (page) {
            case 'home':
                return <HomePage onNavigate={navigate} />;
            case 'marketplace':
                return <MarketplacePage />;
            case 'publicProfile':
                if (!viewingCaregiver) {
                    navigate('marketplace');
                    return null;
                }
                return <PublicProfilePage caregiver={viewingCaregiver} />;
            case 'dashboard':
                if (!currentUser) return <LoginPage />;
                if (currentUser.role === 'caregiver') return <DashboardPage />;
                if (currentUser.role === 'client') return <ClientDashboardPage />;
                if (currentUser.role === 'admin') return <AdminDashboardPage />;
                return <HomePage onNavigate={navigate} />; // Fallback
            case 'login':
                return <LoginPage />;
            case 'register':
                return <RegisterPage />;
            case 'about':
                return <AboutPage />;
            case 'privacy':
                return <PrivacyPage />;
            case 'terms':
                return <TermsPage />;
            case 'findCaregiversGuide':
                return <FindCaregiversGuidePage />;
            case 'howToChoose':
                return <HowToChoosePage />;
            case 'security':
                return <SecurityPage />;
            case 'howItWorks':
                return <HowItWorksPage />;
            case 'training':
                return <TrainingPage />;
            default:
                return <HomePage onNavigate={navigate} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar user={currentUser} onNavigate={navigate} onLogout={logout} />
            <main className="flex-grow">
                {renderPage()}
            </main>
            <Footer onNavigate={navigate} />
            <InstallPrompt />
            <div className="fixed top-24 right-6 z-[100] flex flex-col gap-4 w-full max-w-sm">
                {alerts.map(alert => (
                    <Alert key={alert.id} alert={alert} onDismiss={removeAlert} />
                ))}
            </div>
            {currentUser && <ChatWidget user={currentUser} />}
        </div>
    );
};

export default App;
