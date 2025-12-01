
import React, { useState, useRef, useEffect } from 'react';
import { User, Conversation, Message } from '../types';
import Avatar from './Avatar';
import { useAppStore } from '../store/useAppStore';

const ChatWidget: React.FC<{ user: User }> = ({ user }) => {
    const { 
        conversations,
        isChatOpen,
        setChatOpen,
        activeConversationId,
        setActiveConversation,
        sendMessage,
        fetchConversations,
        chatDraftMessage,
        clearChatDraftMessage,
        hasUnreadChatMessages,
        checkForNewMessages,
        notifications,
    } = useAppStore();

    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false); // Visual typing state for the other user
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastMessageCountRef = useRef(0);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user, fetchConversations]);
    
    // Polling logic updated to detect "Typing" states via simple heuristic
    useEffect(() => {
        if (!user) return;
        
        const intervalId = setInterval(async () => {
            await checkForNewMessages();
            
            // Logic to simulate typing indicator showing up right before a message arrives (purely visual for demo)
            // In a real socket app, this would be an event.
            if (activeConversationId) {
                const activeConvo = conversations.find(c => c.id === activeConversationId);
                if (activeConvo) {
                    const msgCount = activeConvo.messages.length;
                    
                    // If we have a new message from the other person, stop typing
                    if (msgCount > lastMessageCountRef.current) {
                        setIsTyping(false);
                    }
                    
                    // Heuristic: If I just sent a message (last message is mine), assume other is typing eventually
                    const lastMsg = activeConvo.messages[activeConvo.messages.length - 1];
                    if (lastMsg && lastMsg.senderId === user.id && !isTyping && Math.random() > 0.7) {
                         setIsTyping(true);
                         setTimeout(() => setIsTyping(false), 4000); // Failsafe stop typing
                    }
                    
                    lastMessageCountRef.current = msgCount;
                }
            }
        }, 2000); // Polling frequency

        return () => clearInterval(intervalId);
    }, [user, checkForNewMessages, activeConversationId, conversations, isTyping]);

    useEffect(() => {
        if (isChatOpen && chatDraftMessage) {
            setNewMessage(chatDraftMessage);
            clearChatDraftMessage();
        }
    }, [isChatOpen, chatDraftMessage, clearChatDraftMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [conversations, activeConversationId, isChatOpen, isTyping]);

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !activeConversation) return;
        
        const receiverId = activeConversation.participantIds.find(id => id !== user.id);
        if (receiverId) {
            sendMessage(receiverId, newMessage);
        }
        setNewMessage('');
        setIsTyping(true); // Simulate immediate "seen" or expectation
        setTimeout(() => setIsTyping(true), 1500); // Keep typing on for a bit
    };

    const getOtherParticipant = (convo: Conversation) => {
        const otherId = convo.participantIds.find(id => id !== user.id)!;
        return convo.participantDetails[otherId];
    };

    const formatMessageDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Hoje';
        if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
        return date.toLocaleDateString('pt-BR');
    };

    const StatusIcon = ({ status }: { status?: Message['status'] }) => {
        // Status checks: sent (1 grey tick), delivered (2 grey ticks), read (2 blue ticks)
        if (!status || status === 'sent') return <span className="text-gray-400 text-[10px]">✓</span>; 
        if (status === 'delivered') return <span className="text-gray-400 text-[10px]">✓✓</span>; 
        if (status === 'read') return <span className="text-blue-400 text-[10px]">✓✓</span>; 
        return null;
    };

    const ConversationList = () => (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            <header className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl flex justify-between items-center shadow-md z-10">
                <div>
                    <h3 className="font-bold text-xl tracking-tight">Conversas</h3>
                    <p className="text-indigo-200 text-xs mt-0.5">99 Cuidar Chat</p>
                </div>
                <button onClick={() => setChatOpen(false)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </header>
            <main className="flex-1 overflow-y-auto custom-scrollbar">
                {conversations.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {conversations.map(convo => {
                            const otherUser = getOtherParticipant(convo);
                            const lastMessage = convo.messages[convo.messages.length - 1];
                            const hasUnread = notifications.some(
                                n => !n.read && n.type === 'message' && n.text.includes(otherUser.name)
                            );
                            return (
                                 <button 
                                    key={convo.id} 
                                    onClick={() => setActiveConversation(convo.id)} 
                                    className={`w-full text-left flex items-center gap-4 p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 group ${hasUnread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                >
                                    <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900 transition-all">
                                        <Avatar photo={otherUser.photo} name={otherUser.name} className="w-full h-full" />
                                        {hasUnread && <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></div>}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className={`font-semibold text-base truncate ${hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{otherUser.name}</h4>
                                            <span className="text-xs text-gray-400 font-medium">{lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                                        </div>
                                        <p className={`text-sm truncate ${hasUnread ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {lastMessage?.senderId === user.id && <span className="text-gray-400 mr-1">Você:</span>}
                                            {lastMessage?.text || 'Iniciar conversa'}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        </div>
                        <p>Nenhuma conversa ainda.</p>
                        <p className="text-sm mt-2">Visite o perfil de um cuidador para iniciar.</p>
                    </div>
                )}
            </main>
        </div>
    );

    const MessageView = () => {
        if (!activeConversation) return null;
        const otherUser = getOtherParticipant(activeConversation);
        
        let lastDate: string | null = null;

        return (
            <div className="flex flex-col h-full bg-[#e5ddd5] dark:bg-[#0b141a]">
                 {/* Header */}
                 <header className="px-4 py-3 bg-white dark:bg-gray-800 shadow-sm flex items-center gap-3 flex-shrink-0 z-10">
                    <button onClick={() => setActiveConversation(null)} className="p-2 -ml-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </button>
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                         <Avatar photo={otherUser.photo} name={otherUser.name} className="w-full h-full" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-gray-800 dark:text-white text-base leading-tight">{otherUser.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {isTyping ? <span className="text-green-500 font-bold animate-pulse">digitando...</span> : 'Online'}
                        </p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                    </button>
                </header>

                {/* Messages Area */}
                <main className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] dark:bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-contain dark:invert-[.05]">
                    <div className="mt-auto space-y-1">
                       {activeConversation.messages.map((msg, index) => {
                           const isMe = msg.senderId === user.id;
                           const messageDate = formatMessageDate(msg.timestamp);
                           const showDate = messageDate !== lastDate;
                           lastDate = messageDate;
                           
                           // Grouping logic
                           const nextMsg = activeConversation.messages[index + 1];
                           const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;
                           const isFirstInGroup = index === 0 || activeConversation.messages[index - 1].senderId !== msg.senderId;
                           
                           return (
                               <React.Fragment key={msg.id}>
                                   {showDate && (
                                       <div className="flex justify-center my-4">
                                           <span className="bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-400 text-xs px-3 py-1 rounded-lg shadow-sm font-medium uppercase tracking-wide">
                                               {messageDate}
                                           </span>
                                       </div>
                                   )}
                                   <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-${isLastInGroup ? '2' : '0.5'}`}>
                                       <div className={`max-w-[85%] relative px-3 py-1.5 shadow-sm break-words text-sm
                                            ${isMe 
                                                ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-gray-100 rounded-lg rounded-tr-none' 
                                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg rounded-tl-none'}
                                            ${isFirstInGroup ? (isMe ? 'rounded-tr-none' : 'rounded-tl-none') : ''}
                                       `}>
                                           {/* Tail for bubbles */}
                                           {isFirstInGroup && !isMe && (
                                                <div className="absolute top-0 -left-2 w-3 h-3 bg-white dark:bg-gray-700 [clip-path:polygon(100%_0,0_0,100%_100%)]"></div>
                                           )}
                                           {isFirstInGroup && isMe && (
                                                <div className="absolute top-0 -right-2 w-3 h-3 bg-[#d9fdd3] dark:bg-[#005c4b] [clip-path:polygon(0_0,100%_0,0_100%)]"></div>
                                           )}

                                           <p className="leading-relaxed pr-6 pb-2">{msg.text}</p>
                                           <div className="absolute bottom-1 right-2 flex items-center gap-1">
                                               <span className="text-[10px] text-gray-500 dark:text-gray-400 min-w-max">
                                                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                               </span>
                                               {isMe && <StatusIcon status={msg.status} />}
                                           </div>
                                       </div>
                                   </div>
                               </React.Fragment>
                           );
                       })}
                       
                       {isTyping && (
                           <div className="flex justify-start animate-fade-in mt-2 ml-2">
                                <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                           </div>
                       )}
                       <div ref={messagesEndRef} />
                    </div>
                </main>

                {/* Input Area */}
                <footer className="px-2 py-2 bg-[#f0f2f5] dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                        <button type="button" className="p-3 text-gray-500 hover:text-indigo-600 transition-colors">
                            <span className="text-xl">😊</span>
                        </button>
                        <button type="button" className="p-3 text-gray-500 hover:text-indigo-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        </button>
                        <div className="flex-1 bg-white dark:bg-gray-700 rounded-xl border border-white dark:border-gray-600 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all flex items-center mb-1">
                            <input 
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Digite uma mensagem"
                                className="w-full px-4 py-2.5 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-400"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={!newMessage.trim()}
                            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 mb-1"
                        >
                            <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                    </form>
                </footer>
            </div>
        )
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
            {isChatOpen && (
                <div className="pointer-events-auto mb-4 w-full max-w-[380px] h-[600px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale-in origin-bottom-right">
                    {activeConversationId ? <MessageView /> : <ConversationList />}
                </div>
            )}
            <button 
              onClick={() => setChatOpen(!isChatOpen)}
              className={`pointer-events-auto relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group ${isChatOpen ? 'bg-gray-700 rotate-90' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}`}
            >
                {isChatOpen ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                    <>
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                        </svg>
                        {hasUnreadChatMessages && (
                            <span className="absolute top-0 right-0 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-gray-900"></span>
                            </span>
                        )}
                    </>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
