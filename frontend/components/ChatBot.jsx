import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MessageSquare, Send, X, Minimize2, Maximize2, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

const SOCKET_URL = 'http://localhost:3001';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Neural link established. How can I assist your market operations today?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('chat_start', () => {
            setIsTyping(false);
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        });

        newSocket.on('chat_chunk', (chunk) => {
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = { ...newMessages[newMessages.length - 1] };
                lastMessage.content += chunk;
                newMessages[newMessages.length - 1] = lastMessage;
                return newMessages;
            });
        });

        newSocket.on('chat_error', (data) => {
            setIsTyping(false);
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.message}` }]);
        });

        return () => newSocket.close();
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsTyping(true);

        socket.emit('chat_message', userMessage);
    };

    if (!isOpen) {
        return (
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-50 flex items-center justify-center border border-blue-400/30 backdrop-blur-md"
            >
                <MessageSquare size={24} />
            </motion.button>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.8 }}
                className={`fixed right-6 z-50 bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
                    isMinimized ? 'bottom-6 w-72 h-14' : 'bottom-6 w-96 h-[550px]'
                }`}
            >
                {/* Header */}
                <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between cursor-pointer" onClick={() => isMinimized && setIsMinimized(false)}>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/20 rounded-lg">
                            <Bot size={18} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-100">ANTIGRAVITY AI</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Neural Link Active</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                            className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 transition-colors"
                        >
                            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                            className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`mt-1 p-1 rounded-md shrink-0 h-fit ${msg.role === 'user' ? 'bg-slate-700' : 'bg-blue-500/20'}`}>
                                            {msg.role === 'user' ? <User size={14} className="text-slate-300" /> : <Bot size={14} className="text-blue-400" />}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-900/20' 
                                            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                        }`}>
                                            <div className="markdown-content">
                                                <ReactMarkdown>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-tl-none flex gap-2 items-center">
                                        <Loader2 size={16} className="text-blue-400 animate-spin" />
                                        <span className="text-xs text-slate-400">Processing market flows...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-slate-800/30 border-t border-slate-700">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about entries or market flows..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-4 pr-12 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg transition-colors shadow-lg"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default ChatBot;
