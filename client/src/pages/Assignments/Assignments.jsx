import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, FileText, AlertCircle, ChevronRight, Download } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Assignments = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.token) fetchAssignments();
    }, [user]);

    const fetchAssignments = async () => {
        try {
            // Fetching dashboard which has assignments
            const res = await API.get('/student/dashboard', {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading assignments...</div>;

    const pendingAssignments = data?.assignments || [];

    // Mock data for demo purposes as shown in screenshots
    const awaitingGrades = [
        { id: 1, title: 'Chemistry Lab Work', subject: 'Chemistry', teacher: 'Ms. Emily Davis', status: 'Submitted', date: 'Jan 25, 2026' }
    ];

    const gradedAssignments = [
        { id: 1, title: 'History Project', subject: 'History', teacher: 'Mr. Robert Jones', score: 88, date: 'Submitted Jan 23, 2026' }
    ];

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>My Assignments</h1>
                <p style={{ color: 'var(--text-muted)' }}>View and manage your assignments</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div className="premium-card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Total Assignments</p>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>5</h2>
                </div>
                <div className="premium-card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Pending</p>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>3</h2>
                </div>
                <div className="premium-card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Submitted</p>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>1</h2>
                </div>
                <div className="premium-card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Graded</p>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>1</h2>
                </div>
            </div>

            {/* Pending Assignments */}
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Pending Assignments</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {pendingAssignments.map((a, idx) => {
                    const colors =
                        a.priority === 'high' ? { bg: '#fef2f2', border: '#fee2e2', text: '#ef4444', darkText: '#991b1b', label: 'high' } :
                            a.priority === 'medium' ? { bg: '#fffbeb', border: '#fef3c7', text: '#f59e0b', darkText: '#92400e', label: 'medium' } :
                                { bg: '#f0fdf4', border: '#dcfce7', text: '#10b981', darkText: '#166534', label: 'low' };

                    return (
                        <div key={idx} className="premium-card" style={{ border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={20} color={colors.text} />
                                </div>
                                <span style={{ fontSize: '10px', fontWeight: '700', color: colors.text, backgroundColor: colors.bg, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                                    {colors.label}
                                </span>
                            </div>
                            <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{a.title}</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{a.subject}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>{a.teacher || 'Mr. assigned'}</p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '15px' }}>
                                <Clock size={14} color="var(--text-muted)" />
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Due: {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>

                            <button className="btn-primary" style={{ width: '100%', padding: '10px', fontSize: '14px' }}>
                                Submit Assignment
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Awaiting Grades */}
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Awaiting Grades</h3>
            <div className="premium-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '40px' }}>
                {awaitingGrades.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '20px', borderLeft: '4px solid #3b82f6', backgroundColor: '#fcfdfd' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                            <CheckCircle size={16} color="#3b82f6" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{item.title}</h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.subject} • {item.teacher}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6' }}>{item.status}</span>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.date}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Graded Assignments */}
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Graded Assignments</h3>
            <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                {gradedAssignments.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '20px', borderLeft: '4px solid #10b981', backgroundColor: '#fcfdfd' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                            <CheckCircle size={16} color="#10b981" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{item.title}</h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.subject} • {item.teacher}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h4 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' }}>{item.score}</h4>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Assignments;
