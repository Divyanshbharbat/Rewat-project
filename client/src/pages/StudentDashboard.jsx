import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    TrendingUp,
    Award,
    Clock,
    AlertCircle,
    Calendar
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!user || !user.token) return;
            try {
                const res = await API.get('/student/dashboard');
                setData(res.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [user]);

    const stats = [
        { label: 'My Classes', value: data?.classesCount || '...', icon: <BookOpen color="#3b82f6" />, color: '#eff6ff' },
        { label: 'Attendance', value: data?.attendance || '...', icon: <Calendar color="#10b981" />, color: '#ecfdf5' },
        { label: 'Avg Grade', value: data?.avgGrade || '...', icon: <Award color="#8b5cf6" />, color: '#f5f3ff' },
        { label: 'Assignments Due', value: data?.assignmentsCount || '...', icon: <Clock color="#f59e0b" />, color: '#fffbeb' },
    ];

    const schedule = data?.schedule || [];

    return (
        <div>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Here's your academic overview and today's schedule.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="premium-card">
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: stat.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '15px'
                        }}>
                            {stat.icon}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{stat.label}</p>
                        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{stat.value}</h2>
                    </div>
                ))}
            </div>

            {data?.assignmentsCount > 0 && (
                <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fee2e2',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    display: 'flex',
                    gap: '15px',
                    marginBottom: '30px'
                }}>
                    <AlertCircle color="#ef4444" />
                    <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#991b1b' }}>Upcoming Deadlines</h4>
                        <p style={{ fontSize: '14px', color: '#b91c1c' }}>You have {data.assignmentsCount} assignments due this week. Don't forget to submit them on time!</p>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                <div className="premium-card">
                    <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Today's Schedule</h3>
                    {schedule.map((item, idx) => (
                        <div key={idx} style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h4 style={{ fontWeight: '600' }}>{item.subject}</h4>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.date}</span>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '5px' }}>{item.time}</p>
                        </div>
                    ))}
                    {schedule.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No classes scheduled for today.</p>}
                </div>

                <div className="premium-card">
                    <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Upcoming Assignments</h3>
                    {data?.assignments?.map((a, idx) => (
                        <div key={idx} style={{ padding: '15px', backgroundColor: a.priority === 'high' ? '#fef2f2' : '#f8fafc', borderRadius: 'var(--radius-md)', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h4 style={{ fontWeight: '600', fontSize: '14px' }}>{a.title}</h4>
                                <span style={{
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    backgroundColor: a.priority === 'high' ? '#fee2e2' : '#e2e8f0',
                                    color: a.priority === 'high' ? '#ef4444' : '#64748b',
                                    borderRadius: '4px'
                                }}>{a.priority}</span>
                            </div>
                            <p style={{ fontSize: '12px', color: a.priority === 'high' ? '#b91c1c' : 'var(--text-muted)', marginTop: '5px' }}>
                                Due: {new Date(a.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                    ))}
                    {data?.assignments?.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No pending assignments.</p>}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
