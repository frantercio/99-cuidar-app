
import React, { useState, useEffect, useRef } from 'react';
import { User, Page } from '../types';
import Avatar from './Avatar';
import { useAppStore } from '../store/useAppStore';

interface NavbarProps {
    user: User | null;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}

const NotificationIcon = ({type}: {type: string}) => {
    const icons: {[key: string]: React.ReactElement} = {
        booking: <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
        review: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
        message: <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>,
        cancellation: <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>,
    };
    return icons[type] || icons['message'];
}

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
    dashboardText: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, user, onNavigate, onLogout, dashboardText }) => {
    const handleMobileNav = (page: Page) => {
        onNavigate(page);
        onClose();
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 flex justify-between items-center border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gradient">Menu</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                         <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <div className="p-6 flex flex-col space-y-4">
                    <button onClick={() => handleMobileNav('home')} className="text-lg text-left text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Início</button>
                    <button onClick={() => handleMobileNav('systemInfo')} className="text-lg text-left text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Como Funciona</button>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                    {user ? (
                        <>
                            <button onClick={() => handleMobileNav('dashboard')} className="w-full text-left text-lg text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">{dashboardText}</button>
                            <button onClick={() => { onLogout(); onClose(); }} className="w-full text-left text-lg text-red-600 dark:text-red-400 font-medium transition-colors">Sair</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleMobileNav('login')} className="w-full text-left text-lg text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Entrar</button>
                            <button onClick={() => handleMobileNav('register')} className="w-full btn-gradient text-white px-6 py-3 rounded-xl font-semibold shadow-lg text-center">Cadastrar-se</button>
                        </>
                    )}
                    </div>
                </div>
            </div>
        </>
    );
};

const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onLogout }) => {
    const { notifications, markNotificationAsRead, systemSettings } = useAppStore();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        // Initial Check from localStorage or System Preference
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isMobileMenuOpen]);

    const handleNotificationClick = (id: number) => {
        markNotificationAsRead(id);
    };
    
    const userRoleText = user?.role === 'admin' ? 'Administrador' : (user?.role === 'caregiver' ? 'Cuidador Pro' : 'Cliente');
    const dashboardText = user?.role === 'admin' ? 'Painel Admin' : (user?.role === 'caregiver' ? 'Dashboard' : 'Minha Conta');

    return (
        <>
            <nav className="navbar-blur shadow-lg fixed w-full top-0 z-50 transition-colors duration-300">
                <div className="container mx-auto px-6 py-3">
                    <div className="flex justify-between items-center">
                        <button onClick={() => onNavigate('home')} className="flex items-center gap-3 group">
                            <div className="relative overflow-hidden w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-lg flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                                <svg className="w-7 h-7 text-white drop-shadow-md z-10" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                {/* Medical Cross Overlay Effect */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-20 text-white">
                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                                </div>
                                {/* Shine Effect */}
                                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-12 transition-all duration-700 group-hover:left-[100%]"></div>
                            </div>
                            <div className="text-left flex flex-col justify-center">
                                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight leading-none">
                                    {systemSettings.appName}
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">Cuidado & Tecnologia</p>
                            </div>
                        </button>
                        
                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center space-x-8">
                            <button onClick={() => onNavigate('home')} className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors relative group">
                                Início
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                            </button>
                            <button onClick={() => onNavigate('systemInfo')} className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors relative group">
                                Como Funciona
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                            </button>
                            
                            {/* Theme Toggle */}
                            <button 
                                onClick={toggleTheme} 
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                                aria-label="Toggle Dark Mode"
                            >
                                {isDarkMode ? (
                                    <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                                )}
                            </button>
                            
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    {user.role === 'caregiver' && (
                                        <div ref={notificationsRef} className="relative">
                                            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                                                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                                                {unreadCount > 0 && <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">{unreadCount}</div>}
                                            </button>
                                             {notificationsOpen && (
                                                <div className="absolute right-0 top-14 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 animate-scale-in">
                                                    <div className="p-4 border-b dark:border-gray-700">
                                                        <h4 className="font-bold text-gray-800 dark:text-white">Notificações</h4>
                                                    </div>
                                                    <div className="max-h-96 overflow-y-auto">
                                                        {notifications.length > 0 ? notifications.map(n => (
                                                            <button key={n.id} onClick={() => handleNotificationClick(n.id)} className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${n.read ? '' : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40'}`}>
                                                                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${n.read ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900'}`}>
                                                                    <NotificationIcon type={n.type} />
                                                                </div>
                                                                <div>
                                                                    <p className={`text-sm ${n.read ? 'text-gray-600 dark:text-gray-400' : 'font-semibold text-gray-800 dark:text-gray-200'}`}>{n.text}</p>
                                                                    <p className="text-xs text-gray-400">{new Date(n.timestamp).toLocaleString()}</p>
                                                                </div>
                                                            </button>
                                                        )) : <p className="p-4 text-center text-gray-500">Nenhuma notificação.</p>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div ref={dropdownRef} className="relative">
                                        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full text-white font-bold overflow-hidden">
                                                <Avatar 
                                                    photo={user.photo} 
                                                    name={user.name} 
                                                    className="w-full h-full"
                                                    textClassName="text-lg font-bold text-white"
                                                />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-semibold text-gray-800 dark:text-white">{user.name.split(' ')[0]}</div>
                                                <div className="text-xs text-gray-500">{userRoleText}</div>
                                            </div>
                                        </button>
                                        {dropdownOpen && (
                                            <div className="absolute right-0 top-14 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 border border-gray-200 dark:border-gray-700 animate-scale-in">
                                                <button onClick={() => { onNavigate('dashboard'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">{dashboardText}</button>
                                                <button onClick={onLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400">Sair</button>
                                            </div>
                                        )}
                                    </div>
                                 </div>
                            ) : (
                                <>
                                    <button onClick={() => onNavigate('login')} className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Entrar</button>
                                    <button onClick={() => onNavigate('register')} className="btn-gradient text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg">Cadastrar-se</button>
                                </>
                            )}
                        </div>
                        
                        {/* Mobile Menu Button */}
                        <div className="lg:hidden flex items-center gap-2">
                             <button 
                                onClick={toggleTheme} 
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                            >
                                {isDarkMode ? (
                                    <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                                )}
                            </button>
                            <button onClick={() => setIsMobileMenuOpen(true)} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                 <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                user={user}
                onNavigate={onNavigate}
                onLogout={onLogout}
                dashboardText={dashboardText}
            />
        </>
    );
};

export default Navbar;
