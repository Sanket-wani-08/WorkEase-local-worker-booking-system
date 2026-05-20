import React, { useState, useEffect, useRef } from "react";
import { Send, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../socket/socket";
import API from "../api/axios";

interface Message {
    _id: string;
    bookingId: string;
    sender: string;
    senderModel: string;
    content: string;
    createdAt: string;
}

interface ChatModalProps {
    bookingId: string;
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
    role: "User" | "Worker";
}

const ChatModal: React.FC<ChatModalProps> = ({ bookingId, isOpen, onClose, currentUserId, role }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && bookingId) {
            fetchMessages();
            socket.emit("join-booking", bookingId);

            const handleReceiveMessage = (msg: Message) => {
                setMessages((prev) => [...prev, msg]);
            };

            socket.on("receive-message", handleReceiveMessage);

            return () => {
                socket.off("receive-message", handleReceiveMessage);
            };
        }
    }, [isOpen, bookingId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/messages/${bookingId}`);
            setMessages(res.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            bookingId,
            sender: currentUserId,
            senderModel: role,
            content: newMessage.trim()
        };

        socket.emit("send-message", messageData);
        setNewMessage("");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-secondary/90 border border-glass-border w-full max-w-lg h-[600px] rounded-3xl flex flex-col shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-5 border-b border-glass-border flex justify-between items-center bg-primary/40">
                        <div>
                            <h3 className="text-xl font-bold text-white">Live Support</h3>
                            <p className="text-xs text-accent font-medium uppercase tracking-widest">Booking #{bookingId.slice(-6)}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-primary/20">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                                <MessageSquare className="w-12 h-12 opacity-20" />
                                <p>No messages yet. Say hi!</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg._id} className={`flex ${msg.sender === currentUserId ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm shadow-lg ${
                                        msg.sender === currentUserId 
                                        ? "bg-accent text-white rounded-br-none" 
                                        : "bg-slate-800 text-slate-100 rounded-bl-none"
                                    }`}>
                                        <p className="leading-relaxed">{msg.content}</p>
                                        <p className={`text-[10px] mt-1.5 opacity-60 ${msg.sender === currentUserId ? "text-right" : "text-left"}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-5 border-t border-glass-border bg-primary/40">
                        <div className="flex gap-3">
                            <input 
                                type="text" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-secondary/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-all text-sm"
                            />
                            <button 
                                type="submit" 
                                disabled={!newMessage.trim()}
                                className="bg-accent hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-accent text-white p-3 rounded-xl transition-all shadow-lg shadow-orange-500/20"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// simple icon for placeholder
const MessageSquare = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

export default ChatModal;
