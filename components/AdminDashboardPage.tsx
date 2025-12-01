
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { User, Caregiver, Client, Appointment, Review, SupportTicket, AuditLog } from '../types';
import Avatar from './Avatar';

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
    icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children, icon }) => (
    <button onClick={onClick} className={`flex items-center gap-3 px-6 py-4 font-semibold text-lg transition-colors duration-300 rounded-t-lg ${isActive ? 'bg-white dark:bg-gray-800 text-indigo-600' : 'text-gray-500 hover:text-indigo-600 bg-gray-100 dark:bg-gray-800/50'}`}>
        {icon}
        {children}
    </button>
);

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
    <div className={`group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300`}>
        <div className="flex items-center justify-between">
            <div>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">{value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
                {trend && <div className="text-xs text-green-500 font-semibold mt-1">{trend}</div>}
            </div>
            <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
        </div>
    </div>
);

interface UserTableProps<T> {
    items: T[];
    columns: React.ReactNode;
    renderRow: (item: T) => React.ReactNode;
    searchPlaceholder: string;
    filterFn: (item: T, term: string) => boolean;
}

function DataTable<T>({ items, columns, renderRow, searchPlaceholder, filterFn }: UserTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredItems = useMemo(() =>
        items.filter(item => filterFn(item, searchTerm.toLowerCase())),
    [items, searchTerm, filterFn]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4">
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm px-4 py-2 text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        {columns}
                    </thead>
                    <tbody>
                        {filteredItems.map(renderRow)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Simple Line Chart Component (SVG based)
const SimpleLineChart: React.FC<{ data: number[], color: string }> = ({ data, color }) => {
    if (!data || data.length === 0) {
        return <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sem dados</div>;
    }
    const max = Math.max(...data) || 100; // Prevent division by zero
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (val / max) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
            />
            {data.map((val, i) => (
                <circle
                    key={i}
                    cx={(i / (data.length - 1)) * 100}
                    cy={100 - (val / max) * 100}
                    r="1.5"
                    fill={color}
                />
            ))}
        </svg>
    );
};

const AdminDashboardPage: React.FC = () => {
    const { 
        users, caregivers, appointments, tickets, systemSettings, contentPages, auditLogs,
        deleteUser, verifyCaregiver, approveSecurityCheck, updateUserStatus, deleteReview, resolveTicket,
        updateSystemSettings, updateContentPage, sendBroadcast
    } = useAppStore();
    const [activeTab, setActiveTab] = useState<'overview' | 'caregivers' | 'clients' | 'reviews' | 'financial' | 'support' | 'system' | 'communication' | 'audit'>('overview');

    // System Settings States
    const [editingPageSlug, setEditingPageSlug] = useState<string | null>(null);
    const [tempPageContent, setTempPageContent] = useState('');
    const [tempAppName, setTempAppName] = useState(systemSettings.appName);
    const [tempAppLogo, setTempAppLogo] = useState(systemSettings.logo);
    
    // Broadcast State
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastAudience, setBroadcastAudience] = useState<'all' | 'caregivers' | 'clients'>('all');

    const clients = useMemo(() => users.filter(u => u.role === 'client') as Client[], [users]);
    const allReviews = useMemo(() => caregivers.flatMap(c => c.reviews), [caregivers]);

    // Financial Metrics Calculation
    const financialStats = useMemo(() => {
        const completedApps = appointments.filter(a => a.status === 'completed');
        const gmv = completedApps.reduce((sum, app) => sum + app.cost, 0);
        // Use stored values if available, otherwise fallback to default calculation for legacy data
        const revenue = completedApps.reduce((sum, app) => sum + (app.platformFee || app.cost * 0.15), 0);
        const pendingPayouts = completedApps.reduce((sum, app) => sum + (app.caregiverEarnings || app.cost * 0.85), 0);
        
        // Mock historical data
        const historyData = [1200, 1900, 1500, 2200, 2800, 3100, gmv || 0]; 
        
        return { gmv, revenue, pendingPayouts, historyData };
    }, [appointments]);

    const stats = useMemo(() => ({
        totalCaregivers: caregivers.length,
        totalClients: clients.length,
        totalAppointments: appointments.length,
        pendingVerifications: caregivers.filter(c => !c.verified || c.security.backgroundCheck === 'pending' || c.security.idVerification === 'pending').length,
        openTickets: tickets.filter(t => t.status === 'open').length
    }), [caregivers, clients, appointments, tickets]);

    const handleSaveSettings = () => {
        updateSystemSettings({ appName: tempAppName, logo: tempAppLogo });
    };

    const handleEditPage = (slug: string, content: string) => {
        setEditingPageSlug(slug);
        setTempPageContent(content);
    };

    const handleSavePage = () => {
        if (editingPageSlug) {
            updateContentPage(editingPageSlug, tempPageContent);
            setEditingPageSlug(null);
        }
    };
    
    const handleSendBroadcast = (e: React.FormEvent) => {
        e.preventDefault();
        if(!broadcastMessage.trim()) return;
        sendBroadcast(broadcastMessage, broadcastAudience);
        setBroadcastMessage('');
    };

    const OverviewContent = () => (
        <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total de Cuidadores" value={stats.totalCaregivers} color="bg-gradient-to-r from-blue-500 to-indigo-600" icon={<svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>} />
                <StatCard title="Total de Clientes" value={stats.totalClients} color="bg-gradient-to-r from-yellow-500 to-orange-600" icon={<svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3.004 3.004 0 011.25-2.406z" /></svg>} />
                <StatCard title="Pendências de Verificação" value={stats.pendingVerifications} color="bg-gradient-to-r from-red-500 to-pink-600" icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>} trend={stats.pendingVerifications > 0 ? "Ação Necessária" : "Tudo Certo"} />
                <StatCard title="Receita (Real)" value={`R$ ${financialStats.revenue.toFixed(2)}`} color="bg-gradient-to-r from-green-500 to-emerald-600" icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} trend="+15% este mês" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                     <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Atividade Recente</h3>
                     <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {appointments.slice(0, 5).map(app => (
                            <div key={app.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{app.serviceType} - {app.clientName}</p>
                                    <p className="text-xs text-gray-500">{new Date(app.date).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${app.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>{app.status}</span>
                            </div>
                        ))}
                     </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Crescimento de Receita (Semanal)</h3>
                    <div className="flex-grow flex items-end h-48">
                        <SimpleLineChart data={financialStats.historyData} color="#10b981" />
                    </div>
                </div>
            </div>
        </div>
    );

    const CommunicationContent = () => (
        <div className="animate-fade-in space-y-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                <h3 className="text-2xl font-bold mb-4">📢 Central de Comunicação</h3>
                <p className="text-purple-100 mb-6">Envie notificações importantes, alertas de manutenção ou novidades para todos os usuários da plataforma instantaneamente.</p>
                
                <form onSubmit={handleSendBroadcast} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                        <div className="md:col-span-3">
                            <label className="block text-sm font-bold text-purple-100 mb-2">Mensagem</label>
                            <textarea 
                                value={broadcastMessage}
                                onChange={e => setBroadcastMessage(e.target.value)}
                                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-purple-200 focus:ring-2 focus:ring-white outline-none"
                                placeholder="Digite sua mensagem aqui..."
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-purple-100 mb-2">Público Alvo</label>
                            <select 
                                value={broadcastAudience}
                                onChange={e => setBroadcastAudience(e.target.value as any)}
                                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-white outline-none [&>option]:text-black"
                            >
                                <option value="all">Todos os Usuários</option>
                                <option value="caregivers">Apenas Cuidadores</option>
                                <option value="clients">Apenas Clientes</option>
                            </select>
                            <button type="submit" className="w-full mt-4 bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-purple-50 transition-colors shadow-lg">
                                Enviar Broadcast 🚀
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Histórico Recente</h3>
                <div className="space-y-4">
                    {/* Mock history derived from audit logs for demo */}
                    {auditLogs.filter(log => log.action === 'Broadcast Enviado').length > 0 ? (
                        auditLogs.filter(log => log.action === 'Broadcast Enviado').map(log => (
                            <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 text-purple-600 rounded-full">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-white">{log.target}</p>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{log.details}</p>
                                    <p className="text-xs text-gray-400 mt-2">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-8">Nenhum broadcast enviado recentemente.</p>
                    )}
                </div>
            </div>
        </div>
    );

    const AuditLogsContent = () => (
        <div className="animate-fade-in bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">🛡️ Logs de Auditoria</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Registro de todas as ações administrativas para segurança e conformidade.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Data/Hora</th>
                            <th className="px-6 py-4">Admin</th>
                            <th className="px-6 py-4">Ação</th>
                            <th className="px-6 py-4">Alvo</th>
                            <th className="px-6 py-4">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {auditLogs.map(log => (
                            <tr key={log.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">{log.adminName}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-bold border border-gray-200 dark:border-gray-600">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400">{log.target}</td>
                                <td className="px-6 py-4 text-gray-500 italic truncate max-w-xs" title={log.details}>{log.details || '-'}</td>
                            </tr>
                        ))}
                        {auditLogs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8">Nenhum registro de auditoria encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const SystemContent = () => (
        <div className="animate-fade-in space-y-8">
            {/* General Settings */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Identidade da Plataforma</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nome do App</label>
                        <input 
                            type="text" 
                            value={tempAppName} 
                            onChange={(e) => setTempAppName(e.target.value)} 
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Logo (Emoji ou URL)</label>
                        <input 
                            type="text" 
                            value={tempAppLogo} 
                            onChange={(e) => setTempAppLogo(e.target.value)} 
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <button onClick={handleSaveSettings} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Management */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Gerenciamento de Conteúdo</h3>
                <div className="space-y-4">
                    {contentPages.map(page => (
                        <div key={page.slug} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white">{page.title}</h4>
                                <span className="text-xs text-gray-500">Última atualização: {new Date(page.lastUpdated).toLocaleDateString()}</span>
                            </div>
                            
                            {editingPageSlug === page.slug ? (
                                <div className="space-y-3">
                                    <textarea 
                                        value={tempPageContent} 
                                        onChange={(e) => setTempPageContent(e.target.value)} 
                                        rows={6}
                                        className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 font-mono text-sm"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => setEditingPageSlug(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg">Cancelar</button>
                                        <button onClick={handleSavePage} className="px-4 py-2 bg-green-600 text-white rounded-lg">Salvar Conteúdo</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm truncate max-w-2xl">{page.content.substring(0, 100)}...</p>
                                    <button onClick={() => handleEditPage(page.slug, page.content)} className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">Editar</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const FinancialContent = () => (
        <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Volume Total (GMV)" 
                    value={`R$ ${financialStats.gmv.toFixed(2)}`} 
                    icon={<span className="text-2xl">💰</span>} 
                    color="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                />
                <StatCard 
                    title="Receita da Plataforma" 
                    value={`R$ ${financialStats.revenue.toFixed(2)}`} 
                    icon={<span className="text-2xl">📈</span>} 
                    color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                />
                <StatCard 
                    title="Repasses a Cuidadores" 
                    value={`R$ ${financialStats.pendingPayouts.toFixed(2)}`} 
                    icon={<span className="text-2xl">🤝</span>} 
                    color="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Histórico de Transações</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Serviço</th>
                                <th className="px-6 py-3 text-right">Valor Total</th>
                                <th className="px-6 py-3 text-right">Receita (Plataforma)</th>
                                <th className="px-6 py-3 text-right">Repasse (Cuidador)</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.filter(a => a.status === 'completed').map(app => (
                                <tr key={app.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                    <td className="px-6 py-4">{app.id}</td>
                                    <td className="px-6 py-4">{new Date(app.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{app.serviceType}</td>
                                    <td className="px-6 py-4 text-right font-bold">R$ {app.cost.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-green-600">R$ {(app.platformFee || app.cost * 0.15).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-blue-600">R$ {(app.caregiverEarnings || app.cost * 0.85).toFixed(2)}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Processado</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const SupportContent = () => (
        <div className="animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Tickets de Suporte</h3>
            <div className="space-y-4">
                {tickets.length > 0 ? tickets.map(ticket => (
                    <div key={ticket.id} className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border-l-4 ${ticket.status === 'open' ? (ticket.priority === 'high' ? 'border-red-500' : 'border-yellow-500') : 'border-green-500'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    {ticket.subject}
                                    {ticket.priority === 'high' && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Alta Prioridade</span>}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    Aberto por <strong>{ticket.userName}</strong> ({ticket.userRole === 'caregiver' ? 'Cuidador' : 'Cliente'}) em {new Date(ticket.date).toLocaleDateString()}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">{ticket.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                    {ticket.status === 'open' ? 'Aberto' : 'Resolvido'}
                                </span>
                                {ticket.status === 'open' && (
                                    <button 
                                        onClick={() => resolveTicket(ticket.id)}
                                        className="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Marcar como Resolvido
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-12 text-gray-500">
                        <p>Nenhum ticket de suporte encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const CaregiversContent = () => (
        <div className="animate-fade-in">
             <DataTable<Caregiver>
                items={caregivers}
                searchPlaceholder="Buscar cuidadores por nome ou email..."
                filterFn={(user, term) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)}
                columns={
                    <tr>
                        <th scope="col" className="px-6 py-3">Nome</th>
                        <th scope="col" className="px-6 py-3">Status Verif.</th>
                        <th scope="col" className="px-6 py-3">Segurança</th>
                        <th scope="col" className="px-6 py-3">Conta</th>
                        <th scope="col" className="px-6 py-3">Ações</th>
                    </tr>
                }
                renderRow={(user) => (
                    <tr key={user.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.name}</td>
                        <td className="px-6 py-4">
                            {user.verified ? <span className="text-green-600 font-bold">Verificado</span> : <span className="text-gray-400">Pendente</span>}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 text-xs">
                                <span className={user.security.backgroundCheck === 'completed' ? 'text-green-600' : 'text-red-500'}>BG: {user.security.backgroundCheck === 'completed' ? 'OK' : 'Pendente'}</span>
                                <span className={user.security.idVerification === 'completed' ? 'text-green-600' : 'text-red-500'}>ID: {user.security.idVerification === 'completed' ? 'OK' : 'Pendente'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status === 'active' ? 'Ativo' : 'Suspenso'}</span></td>
                        <td className="px-6 py-4 flex flex-wrap gap-x-4 gap-y-2 items-center">
                            {!user.verified && <button onClick={() => verifyCaregiver(user.id)} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 font-bold">Verificar</button>}
                            {user.security.backgroundCheck === 'pending' && <button onClick={() => approveSecurityCheck(user.id, 'backgroundCheck')} className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs hover:bg-yellow-200">Aprovar BG</button>}
                            {user.security.idVerification === 'pending' && <button onClick={() => approveSecurityCheck(user.id, 'idVerification')} className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs hover:bg-yellow-200">Aprovar ID</button>}
                            <button onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')} className={`font-medium ${user.status === 'active' ? 'text-orange-600' : 'text-teal-600'} hover:underline text-xs`}>{user.status === 'active' ? 'Suspender' : 'Reativar'}</button>
                            <button onClick={() => deleteUser(user.id)} className="font-medium text-red-600 hover:underline text-xs">Excluir</button>
                        </td>
                    </tr>
                )}
            />
        </div>
    );

    const ClientsContent = () => (
        <div className="animate-fade-in">
            <DataTable<Client>
                items={clients}
                searchPlaceholder="Buscar clientes por nome ou email..."
                filterFn={(user, term) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)}
                columns={
                    <tr><th scope="col" className="px-6 py-3">Nome</th><th scope="col" className="px-6 py-3">Email</th><th scope="col" className="px-6 py-3">Status</th><th scope="col" className="px-6 py-3">Ações</th></tr>
                }
                renderRow={(user) => (
                    <tr key={user.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.name}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status === 'active' ? 'Ativo' : 'Suspenso'}</span></td>
                        <td className="px-6 py-4 flex gap-4 items-center">
                           <button onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')} className={`font-medium ${user.status === 'active' ? 'text-orange-600' : 'text-teal-600'} hover:underline text-xs`}>{user.status === 'active' ? 'Suspender' : 'Reativar'}</button>
                           <button onClick={() => deleteUser(user.id)} className="font-medium text-red-600 hover:underline text-xs">Excluir</button>
                        </td>
                    </tr>
                )}
            />
        </div>
    );
    
    const ReviewsContent = () => (
        <div className="animate-fade-in">
             <DataTable<Review>
                items={allReviews}
                searchPlaceholder="Buscar por autor ou cuidador..."
                filterFn={(review, term) => review.author.toLowerCase().includes(term) || (review.caregiverName || '').toLowerCase().includes(term)}
                columns={
                    <tr><th scope="col" className="px-6 py-3">Autor</th><th scope="col" className="px-6 py-3">Avaliação</th><th scope="col" className="px-6 py-3">Comentário</th><th scope="col" className="px-6 py-3">Cuidador</th><th scope="col" className="px-6 py-3">Ações</th></tr>
                }
                renderRow={(review) => (
                    <tr key={review.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{review.author}</td>
                        <td className="px-6 py-4 text-yellow-400">{'★'.repeat(review.rating)}<span className="text-gray-300">{'★'.repeat(5-review.rating)}</span></td>
                        <td className="px-6 py-4 max-w-sm truncate">{review.comment}</td>
                        <td className="px-6 py-4">{review.caregiverName}</td>
                        <td className="px-6 py-4"><button onClick={() => deleteReview(review.id)} className="font-medium text-red-600 hover:underline text-xs">Excluir</button></td>
                    </tr>
                )}
            />
        </div>
    );
    
    const renderContent = () => {
        switch(activeTab) {
            case 'overview': return <OverviewContent />;
            case 'caregivers': return <CaregiversContent />;
            case 'clients': return <ClientsContent />;
            case 'reviews': return <ReviewsContent />;
            case 'financial': return <FinancialContent />;
            case 'support': return <SupportContent />;
            case 'system': return <SystemContent />;
            case 'communication': return <CommunicationContent />;
            case 'audit': return <AuditLogsContent />;
            default: return <OverviewContent />;
        }
    };
    
    return (
        <div className="pt-20 min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Painel de Controle</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Administração Geral da {systemSettings.appName}</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
                    <TabButton isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>}>
                        Visão Geral
                    </TabButton>
                    <TabButton isActive={activeTab === 'communication'} onClick={() => setActiveTab('communication')} icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" /></svg>}>
                        Comunicação
                    </TabButton>
                    <TabButton isActive={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>}>
                        Auditoria
                    </TabButton>
                    <TabButton isActive={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>}>
                        Sistema & Conteúdo
                    </TabButton>
                    <TabButton isActive={activeTab === 'financial'} onClick={() => setActiveTab('financial')} icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>}>
                        Financeiro
                    </TabButton>
                    <TabButton isActive={activeTab === 'caregivers'} onClick={() => setActiveTab('caregivers')} icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>}>
                        Cuidadores
                    </TabButton>
                    <TabButton isActive={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3.004 3.004 0 011.25-2.406z" /></svg>}>
                        Clientes
                    </TabButton>
                    <TabButton isActive={activeTab === 'support'} onClick={() => setActiveTab('support')} icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>}>
                        Suporte {stats.openTickets > 0 && <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">{stats.openTickets}</span>}
                    </TabButton>
                    <TabButton isActive={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}>
                        Avaliações
                    </TabButton>
                </div>

                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboardPage;
