import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Users, Activity, ChevronRight, Save } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';

const Attendance = () => {
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher';
    
    // Student State
    const [studentData, setStudentData] = useState(null);
    
    // Teacher State
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [students, setStudents] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user && user.token) {
            if (isTeacher) {
                fetchTeacherClasses();
            } else {
                fetchStudentAttendance();
            }
        }
    }, [user, isTeacher]);

    useEffect(() => {
        if (isTeacher && selectedClass && (selectedSubject || classes.find(c => c._id === selectedClass)?.subjects?.length === 0)) {
            fetchClassStudents();
        } else {
            setStudents([]);
        }
    }, [selectedClass, selectedSubject, date]);

    const fetchTeacherClasses = async () => {
        try {
            setLoading(true);
            const res = await API.get('/teacher/classes');
            setClasses(res.data);
            if (res.data.length > 0) {
                setSelectedClass(res.data[0]._id);
                setSelectedSubject(res.data[0].subjects[0] || '');
            }
        } catch (error) {
            toast.error('Failed to fetch classes');
        } finally {
            setLoading(false);
        }
    };

    const fetchClassStudents = async () => {
        try {
            const res = await API.get(`/attendance/class/${selectedClass}?date=${date}&subject=${selectedSubject}`);
            setStudents(res.data);
        } catch (error) {
            toast.error('Failed to fetch students');
        }
    };

    const fetchStudentAttendance = async () => {
        try {
            setLoading(true);
            const res = await API.get('/student/attendance');
            setStudentData(res.data);
        } catch (error) {
            console.error('Failed to fetch student attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = (studentId) => {
        setStudents(prev => prev.map(s => {
            if (s._id === studentId) {
                return { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' };
            }
            return s;
        }));
    };

    const handleSaveAttendance = async () => {
        if (!selectedSubject) {
            toast.error('Please select a subject');
            return;
        }
        try {
            setSaving(true);
            const attendanceData = students.map(s => ({
                studentId: s._id,
                status: s.status
            }));
            await API.post('/attendance', {
                classId: selectedClass,
                subject: selectedSubject,
                date,
                attendanceData
            });
            toast.success('Attendance saved successfully');
        } catch (error) {
            toast.error('Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    if (isTeacher) {
        return (
            <div>
                <Toaster position="top-right" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>Mark Attendance</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Select a class, subject and mark attendance</p>
                    </div>
                </div>

                <div className="premium-card" style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Select Class</label>
                            <select 
                                value={selectedClass} 
                                onChange={(e) => {
                                    setSelectedClass(e.target.value);
                                    const cls = classes.find(c => c._id === e.target.value);
                                    if (cls) setSelectedSubject(cls.subjects[0] || '');
                                }}
                                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
                            >
                                <option value="">Choose a class...</option>
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>{c.className} - {c.section}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Select Subject</label>
                            <select 
                                value={selectedSubject} 
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
                            >
                                <option value="">Choose a subject...</option>
                                {classes.find(c => c._id === selectedClass)?.subjects?.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Date</label>
                            <input 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
                            />
                        </div>
                        <button 
                            onClick={handleSaveAttendance}
                            disabled={saving || !selectedClass || !selectedSubject}
                            style={{
                                padding: '11px 24px',
                                backgroundColor: 'var(--primary-color)',
                                color: 'white',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                opacity: (saving || !selectedClass || !selectedSubject) ? 0.7 : 1
                            }}
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save Attendance'}
                        </button>
                    </div>
                </div>

                <div className="premium-card" style={{ padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>Student Name</th>
                                <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Email</th>
                                <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, idx) => (
                                <tr key={student._id} style={{ borderBottom: idx === students.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '500' }}>{student.name}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>{student.email}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleStatusToggle(student._id)}
                                            style={{
                                                padding: '6px 16px',
                                                borderRadius: '20px',
                                                border: 'none',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                backgroundColor: student.status === 'Present' ? '#ecfdf5' : '#fef2f2',
                                                color: student.status === 'Present' ? '#10b981' : '#ef4444',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {student.status}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && selectedClass && (
                                <tr>
                                    <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No students found in this class.</td>
                                </tr>
                            )}
                            {!selectedClass && (
                                <tr>
                                    <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Please select a class to view students.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Student View (Existing)
    const stats = [
        { label: 'Overall Attendance', value: `${studentData?.overall || 0}%`, icon: <Calendar color="#3b82f6" />, color: '#eff6ff', trend: 'Above average', trendColor: '#10b981' },
        { label: 'Present', value: studentData?.present || 0, icon: <CheckCircle color="#10b981" />, color: '#ecfdf5' },
        { label: 'Absent', value: studentData?.absent || 0, icon: <XCircle color="#ef4444" />, color: '#fef2f2' },
        { label: 'Total Classes', value: studentData?.totalClasses || 0, icon: <Users color="#8b5cf6" />, color: '#f5f3ff' },
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
                <div className="premium-card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Subject-wise Attendance</h3>
                    {studentData?.subjectWise?.map((item, idx) => (
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

                <div className="premium-card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Recent Activity</h3>
                    {studentData?.recentActivity?.map((activity, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid #f1f5f9', borderRadius: 'var(--radius-md)', marginBottom: '12px', backgroundColor: '#fcfdfd' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{activity.day}</h4>
                                    {activity.status === 'Present' ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{activity.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Attendance;

