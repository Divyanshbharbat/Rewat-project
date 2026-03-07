import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    BookOpen,
    Calendar,
    ArrowUpRight,
    TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalStudents: '...',
        totalTeachers: '...',
        activeClasses: '...',
        avgAttendance: '...',
        recentActivities: [],
        upcomingEvents: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            const res = await fetch('http://localhost:5000/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${user.token} ` }
            });
            const data = await res.json();
            if (res.ok) setStats(data);
        };
        fetchStats();
    }, [user.token]);

    const statCards = [
        { label: 'Total Students', value: stats.totalStudents, trend: '+12%', icon: <Users color="#3b82f6" />, color: '#eff6ff' },
        { label: 'Total Teachers', value: stats.totalTeachers, trend: '+5%', icon: <UserPlus color="#10b981" />, color: '#ecfdf5' },
        { label: 'Active Classes', value: stats.activeClasses, trend: '+3%', icon: <BookOpen color="#8b5cf6" />, color: '#f5f3ff' },
        { label: 'Avg Attendance', value: stats.avgAttendance, trend: '+2.1%', icon: <TrendingUp color="#f59e0b" />, color: '#fffbeb' },
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'student': return <UserPlus size={16} />;
            case 'teacher': return <Users size={16} />;
            default: return <BookOpen size={16} />;
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Welcome back! Here's what's happening at your school today.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {statCards.map((stat, idx) => (
                    <div key={idx} className="premium-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                backgroundColor: stat.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyCenter: 'center',
                                padding: '8px'
                            }}>
                                {stat.icon}
                            </div>
                            <span style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                {stat.trend} <ArrowUpRight size={14} />
                            </span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{stat.label}</p>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '5px' }}>{stat.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '18px' }}>Recent Activities</h3>
                        <span style={{ color: 'var(--primary-color)', fontSize: '14px', cursor: 'pointer' }}>View All</span>
                    </div>
                    {stats.recentActivities.map((act, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--bg-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary-color)'
                            }}>
                                {getIcon(act.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '500' }}>{act.title}</p>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{act.detail}</p>
                            </div>
                        </div>
                    ))}
                    {stats.recentActivities.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No recent activities.</p>}
                </div>

                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '18px' }}>Upcoming Events</h3>
                        <Calendar size={18} color="var(--text-muted)" />
                    </div>
                    {stats.upcomingEvents.map((event, idx) => (
                        <div key={idx} style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '15px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{event.title}</h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
                                {new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{event.location}</p>
                        </div>
                    ))}
                    {stats.upcomingEvents.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No upcoming events.</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
