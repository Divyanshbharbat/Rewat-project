import React, { useState, useEffect } from 'react';
import { Mail, Send } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';

const Messages = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [receiverId, setReceiverId] = useState('');
    const [students, setStudents] = useState([]); // Or colleagues

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${user?.token}` }
    });

    useEffect(() => {
        if(user && user.token) {
            fetchMessages();
            // Optional: fetch users to msg
        }
    }, [user]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await API.get('/messages', getHeaders());
            setMessages(res.data);
        } catch (error) {
            toast.error('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!receiverId || !newMessage.trim()) return;

        try {
            await API.post('/messages', { receiverId, message: newMessage }, getHeaders());
            toast.success('Message sent!');
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    return (
        <div>
            <Toaster position="top-right" />
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>Messages</h1>
                <p style={{ color: 'var(--text-muted)' }}>Communicate seamlessly with students and administration.</p>
            </div>

            <div style={{ display: 'flex', gap: '30px', height: 'calc(100vh - 200px)' }}>
                {/* Inbox Left Side */}
                <div className="premium-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail size={20} color="var(--primary-color)" /> Inbox Feed
                        </h2>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                        ) : messages.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '40px' }}>No messages found.</div>
                        ) : (
                            messages.map(msg => {
                                const isMe = msg.senderId?._id === user?.id;
                                return (
                                    <div key={msg._id} style={{
                                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                                        maxWidth: '75%',
                                        backgroundColor: isMe ? 'var(--primary-color)' : 'var(--bg-color)',
                                        color: isMe ? 'white' : 'var(--text-main)',
                                        padding: '12px 16px',
                                        borderRadius: 'var(--radius-md)',
                                        border: isMe ? 'none' : '1px solid var(--border-color)',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}>
                                        <p style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', fontWeight: '600' }}>
                                            {isMe ? 'You' : msg.senderId?.name || 'Unknown'}
                                        </p>
                                        <p style={{ fontSize: '14px', lineHeight: '1.4' }}>{msg.message}</p>
                                        <span style={{ fontSize: '10px', opacity: 0.7, alignSelf: 'flex-end', display: 'block', marginTop: '6px', textAlign: 'right' }}>
                                            {new Date(msg.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Send Message Right Side */}
                <div className="premium-card" style={{ width: '350px', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Compose Message</h3>
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>To User ID (Required Setup logic!)</label>
                            <input
                                type="text"
                                value={receiverId}
                                onChange={(e) => setReceiverId(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none'
                                }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>Message</label>
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                rows={5}
                                placeholder="Type your message..."
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none', resize: 'vertical'
                                }}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                padding: '12px',
                                backgroundColor: 'var(--primary-color)',
                                color: 'white',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                        >
                            <Send size={16} /> Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Messages;
