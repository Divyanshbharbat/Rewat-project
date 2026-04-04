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
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Welcome back, {user?.name?.split(' ')[0]}!
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Here's what you need to focus on today.</p>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="premium-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '2px' }}>{stat.label}</p>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '25px' }}>
                
                {/* Left Column: Schedule & Tasks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    
                    {/* Today's Schedule Section */}
                    <div className="premium-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Calendar size={20} color="var(--primary-color)" /> Today's Classes
                            </h3>
                            <button style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>View Full Schedule</button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {schedule.map((item, idx) => (
                                <div key={idx} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '8px', height: '32px', borderRadius: '4px', backgroundColor: 'var(--primary-color)' }}></div>
                                        <div>
                                            <p style={{ fontWeight: '700', fontSize: '15px' }}>{item.subject}</p>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.time}</p>
                                        </div>
                                    </div>
                                    <div style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: '#eff6ff', color: '#3b82f6', fontSize: '12px', fontWeight: '600' }}>
                                        Today
                                    </div>
                                </div>
                            ))}
                            {schedule.length === 0 && (
                                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed #e2e8f0', borderRadius: '12px' }}>
                                    No classes scheduled for today.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Deadline Reminder Banner */}
                    {data?.assignmentsCount > 0 && (
                        <div style={{ 
                            padding: '20px', 
                            borderRadius: '16px', 
                            backgroundColor: '#fef2f2', 
                            border: '1px solid #fecaca', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '15px' 
                        }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertCircle color="#ef4444" size={20} />
                            </div>
                            <div>
                                <p style={{ fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>Upcoming Deadlines</p>
                                <p style={{ color: '#b91c1c', fontSize: '13px' }}>You have {data?.assignmentsCount || 0} assignments due this week. Don't forget to submit them!</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Assignments & Progress */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div className="premium-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <BookOpen size={20} color="#10b981" /> Pending Tasks
                            </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {data?.assignments?.slice(0, 3).map((item, idx) => (
                                <div key={idx} style={{ position: 'relative', paddingLeft: '15px' }}>
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', backgroundColor: item.priority === 'high' ? '#ef4444' : '#e2e8f0', borderRadius: '2px' }}></div>
                                    <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>{item.title}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                                        <span style={{ 
                                            fontSize: '10px', 
                                            padding: '2px 8px', 
                                            borderRadius: '10px', 
                                            backgroundColor: item.priority === 'high' ? '#fef2f2' : '#f3f4f6', 
                                            color: item.priority === 'high' ? '#ef4444' : '#6b7280', 
                                            fontWeight: '600' 
                                        }}>
                                            {item.priority || 'Normal'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {(!data?.assignments || data.assignments.length === 0) && (
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No pending assignments.</p>
                            )}
                            <button 
                                onClick={() => window.location.href='/student/assignments'}
                                style={{ 
                                    marginTop: '10px',
                                    padding: '12px', 
                                    borderRadius: '10px', 
                                    border: '1px solid #e2e8f0', 
                                    backgroundColor: 'white', 
                                    color: 'var(--text-main)', 
                                    fontSize: '13px', 
                                    fontWeight: '600', 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                View All Assignments
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentDashboard;
