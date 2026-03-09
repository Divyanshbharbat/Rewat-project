import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Users, Activity, ChevronRight, BarChart } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Attendance = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.token) fetchAttendance();
    }, [user]);

    const fetchAttendance = async () => {
        try {
            const res = await API.get('/student/attendance', {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading attendance...</div>;

    const stats = [
        { label: 'Overall Attendance', value: `${data?.overall || 0}%`, icon: <Calendar color="#3b82f6" />, color: '#eff6ff', trend: 'Above average', trendColor: '#10b981' },
        { label: 'Present', value: data?.present || 0, icon: <CheckCircle color="#10b981" />, color: '#ecfdf5' },
        { label: 'Absent', value: data?.absent || 0, icon: <XCircle color="#ef4444" />, color: '#fef2f2' },
        { label: 'Total Classes', value: data?.totalClasses || 0, icon: <Users color="#8b5cf6" />, color: '#f5f3ff' },
    ];

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>My Attendance</h1>
                <p style={{ color: 'var(--text-muted)' }}>Track your attendance record</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="premium-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {stat.icon}
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>{stat.label}</p>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{stat.value}</h2>
                        {stat.trend && (
                            <p style={{ fontSize: '12px', color: stat.trendColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Activity size={12} /> {stat.trend}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                {/* Subject-wise Attendance */}
                <div className="premium-card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Subject-wise Attendance</h3>
                    {data?.subjectWise?.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{item.subject}</h4>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.attended} out of {item.total} classes</p>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-color)' }}>{item.percentage}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${item.percentage}%`, height: '100%', backgroundColor: 'var(--primary-color)', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="premium-card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Recent Activity</h3>
                    {data?.recentActivity?.map((activity, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid #f1f5f9', borderRadius: 'var(--radius-md)', marginBottom: '12px', backgroundColor: '#fcfdfd' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{activity.day}</h4>
                                    {activity.status === 'Present' ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{activity.date}</p>
                                <p style={{ fontSize: '13px', color: '#10b981', fontWeight: '500' }}>{activity.status} - {activity.count} classes</p>
                            </div>
                        </div>
                    ))}
                    <button style={{ width: '100%', padding: '10px', border: 'none', background: 'none', color: 'var(--primary-color)', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '10px' }}>
                        View Full History <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
