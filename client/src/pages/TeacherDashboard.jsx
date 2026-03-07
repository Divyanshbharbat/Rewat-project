import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Users,
    Clock,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!user || !user.token) return; // Ensure user and token exist before fetching
            try {
                const res = await fetch('http://localhost:5000/api/teacher/dashboard', {
                    headers: { 'Authorization': `Bearer ${user.token} ` }
                });
                const result = await res.json();
                if (res.ok) {
                    setData(result);
                } else {
                    console.error("Failed to fetch dashboard data:", result.message);
                    // Optionally handle error state
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                // Optionally handle error state
            }
        };
        fetchDashboard();
    }, [user]); // Depend on user object to re-fetch if user (and thus token) changes

    const stats = [
        { label: 'My Classes', value: data?.classesCount || '...', icon: <BookOpen color="#3b82f6" />, color: '#eff6ff' },
        { label: 'Total Students', value: data?.totalStudents || '0', icon: <Users color="#10b981" />, color: '#ecfdf5' },
        { label: 'Pending Assignments', value: data?.pendingAssignments || '0', icon: <AlertCircle color="#f59e0b" />, color: '#fffbeb' },
        { label: 'Classes Today', value: data?.classesToday || '0', icon: <Clock color="#8b5cf6" />, color: '#f5f3ff' },
    ];

    const schedule = data?.schedule || [];

    return (
        <div>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Here's your schedule and pending tasks for today.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: stat.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{stat.label}</p>
                            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            <div className="premium-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px' }}>Today's Schedule</h3>
                    <Calendar size={18} color="var(--text-muted)" />
                </div>
                {schedule.map((item, idx) => (
                    <div key={idx} style={{
                        padding: '20px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: '15px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '600' }}>{item.subject}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--primary-color)', fontWeight: '500' }}>{item.students}</span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{item.class}</p>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '5px' }}>
                            <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                            {item.time}
                        </p>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                            <button style={{ color: 'var(--primary-color)', fontSize: '14px', fontWeight: '500' }}>Mark Attendance</button>
                            <button style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>View Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeacherDashboard;
