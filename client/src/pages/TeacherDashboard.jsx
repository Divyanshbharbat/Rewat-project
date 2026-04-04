import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Users,
    Clock,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    useEffect(() => {
        fetchClasses();
    }, [user]);

    useEffect(() => {
        fetchDashboard();
    }, [user, selectedClass, selectedSubject]);

    const fetchClasses = async () => {
        try {
            const res = await API.get('/teacher/classes');
            setClasses(res.data);
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    const fetchDashboard = async () => {
        if (!user || !user.token) return;
        try {
            let url = '/teacher/dashboard';
            const params = [];
            if (selectedClass) params.push(`classId=${selectedClass}`);
            if (selectedSubject) params.push(`subject=${selectedSubject}`);
            if (params.length > 0) url += `?${params.join('&')}`;
            
            const res = await API.get(url);
            setData(res.data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    const stats = [
        { label: 'My Classes', value: data?.classesCount || '...', icon: <BookOpen color="#3b82f6" />, color: '#eff6ff' },
        { label: 'Total Students', value: data?.totalStudents || '0', icon: <Users color="#10b981" />, color: '#ecfdf5' },
        { label: 'Avg Attendance', value: data?.avgAttendance || '0%', icon: <Calendar color="#f59e0b" />, color: '#fffbeb' },
        { label: 'Pending Assignments', value: data?.pendingAssignments || '0', icon: <AlertCircle color="#8b5cf6" />, color: '#f5f3ff' },
    ];

    const schedule = data?.schedule || [];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Here's your schedule and performance overview.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ width: '180px' }}>
                        <select 
                            value={selectedClass} 
                            onChange={(e) => {
                                setSelectedClass(e.target.value);
                                setSelectedSubject('');
                            }}
                            style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13px', outline: 'none' }}
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.className} - {c.section}</option>)}
                        </select>
                    </div>
                    <div style={{ width: '150px' }}>
                        <select 
                            value={selectedSubject} 
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13px', outline: 'none' }}
                        >
                            <option value="">All Subjects</option>
                            {classes.find(c => c._id === selectedClass)?.subjects?.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

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
