import React, { useState, useEffect } from 'react';
import { Award, BarChart3, TrendingUp, TrendingDown, BookOpen, CheckCircle, ChevronRight } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Grades = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.token) fetchGrades();
    }, [user]);

    const fetchGrades = async () => {
        try {
            // Reusing student dashboard data for grades for now as per plan
            const res = await API.get('/student/dashboard', {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch grades:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading grades...</div>;

    const stats = [
        { label: 'Overall Average', value: data?.avgGrade || '87%', icon: <Award color="#3b82f6" />, color: '#eff6ff', trend: '+2.3% from last term', trendIcon: <TrendingUp size={14} color="#10b981" /> },
        { label: 'Subjects', value: data?.classesCount || '5', icon: <BookOpen color="#10b981" />, color: '#ecfdf5', sub: 'Total enrolled' },
        { label: 'Highest Grade', value: '92%', icon: <CheckCircle color="#8b5cf6" />, color: '#f5f3ff', sub: 'Chemistry Midterm' },
        { label: 'Class Rank', value: '3rd', icon: <TrendingUp color="#f59e0b" />, color: '#fffbeb', sub: 'Out of 32 students' },
    ];

    const gradeTable = [
        { subject: 'Mathematics', teacher: 'Mr. John Smith', midterm: 85, quiz1: 92, quiz2: 88, assignment: 90, final: '--', average: 89, trend: 'Up' },
        { subject: 'Physics', teacher: 'Mr. Michael Brown', midterm: 78, quiz1: 85, quiz2: 82, assignment: 88, final: '--', average: 83, trend: 'Up' },
        { subject: 'Chemistry', teacher: 'Ms. Emily Davis', midterm: 92, quiz1: 88, quiz2: 90, assignment: 85, final: '--', average: 89, trend: 'Down' },
        { subject: 'English Literature', teacher: 'Ms. Sarah Williams', midterm: 88, quiz1: 90, quiz2: 85, assignment: 92, final: '--', average: 89, trend: 'Up' },
    ];

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>My Grades</h1>
                <p style={{ color: 'var(--text-muted)' }}>View your academic performance and grades</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="premium-card">
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                            {stat.icon}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>{stat.label}</p>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{stat.value}</h2>
                        {stat.trend && (
                            <p style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {stat.trendIcon} {stat.trend}
                            </p>
                        )}
                        {stat.sub && <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stat.sub}</p>}
                    </div>
                ))}
            </div>

            <div className="premium-card" style={{ marginBottom: '30px', padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Subject</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Midterm</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Quiz 1</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Quiz 2</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Assignment</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Final</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Average</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gradeTable.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: idx === gradeTable.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{row.subject}</h4>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.teacher}</p>
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>{row.midterm}</td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>{row.quiz1}</td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>{row.quiz2}</td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>{row.assignment}</td>
                                <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>{row.final}</td>
                                <td style={{ padding: '16px', fontSize: '14px', fontWeight: '700', color: 'var(--primary-color)' }}>{row.average}%</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ fontSize: '12px', color: row.trend === 'Up' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {row.trend === 'Up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {row.trend}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                <div className="premium-card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Grade Distribution</h3>
                    {gradeTable.map((row, idx) => (
                        <div key={idx} style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>{row.subject}</span>
                                <span style={{ fontSize: '14px', fontWeight: '700' }}>{row.average}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${row.average}%`, height: '100%', backgroundColor: 'var(--primary-color)', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="premium-card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Performance Summary</h3>
                    <div style={{ backgroundColor: '#ecfdf5', padding: '15px', borderRadius: 'var(--radius-md)', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Award size={14} color="white" />
                            </div>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#065f46' }}>Strengths</h4>
                        </div>
                        <p style={{ fontSize: '13px', color: '#065f46', lineHeight: '1.5' }}>Excellent performance in Chemistry and Mathematics. Keep up the great work!</p>
                    </div>
                    <div style={{ backgroundColor: '#eff6ff', padding: '15px', borderRadius: 'var(--radius-md)', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={14} color="white" />
                            </div>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af' }}>Improving</h4>
                        </div>
                        <p style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>Showing consistent improvement in Physics. Continue this positive trend.</p>
                    </div>
                    <div style={{ backgroundColor: '#fffbeb', padding: '15px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BarChart3 size={14} color="white" />
                            </div>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#92400e' }}>Areas to Focus</h4>
                        </div>
                        <p style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>Chemistry grades slightly declining. Consider extra study sessions.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Grades;
