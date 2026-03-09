import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Download, User, ChevronRight } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Schedule = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.token) fetchSchedule();
    }, [user]);

    const fetchSchedule = async () => {
        try {
            const res = await API.get('/student/schedule', {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading schedule...</div>;

    // Grouping by day (Mock grouping for demo purposes as shown in screenshot)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>My Schedule</h1>
                    <p style={{ color: 'var(--text-muted)' }}>View your weekly class schedule</p>
                </div>
            </div>

            <div className="premium-card" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={24} color="#3b82f6" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Grade 10-A</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Academic Year 2025-2026</p>
                    </div>
                </div>
                <button style={{ padding: '10px 20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                    Download PDF
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {days.map((day, dIdx) => (
                    <div key={dIdx}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>{day}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            {data.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="premium-card" style={{ padding: '20px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                                            {idx + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>{idx === 0 ? 'Mathematics' : idx === 1 ? 'Physics' : item.subject}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <Clock size={14} color="var(--text-muted)" />
                                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.time}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <User size={14} color="var(--text-muted)" />
                                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.teacher}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <MapPin size={14} color="var(--text-muted)" />
                                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.room}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Schedule;
