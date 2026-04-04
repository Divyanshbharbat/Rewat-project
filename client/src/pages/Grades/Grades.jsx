import React, { useState, useEffect } from 'react';
import { Award, BarChart3, TrendingUp, TrendingDown, BookOpen, CheckCircle, ChevronRight, Save } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';

const Grades = () => {
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher';
    
    // Student State
    const [studentData, setStudentData] = useState(null);
    
    // Teacher State
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [students, setStudents] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user && user.token) {
            if (isTeacher) {
                fetchTeacherClasses();
            } else {
                fetchStudentGrades();
            }
        }
    }, [user, isTeacher]);

    useEffect(() => {
        if (isTeacher && selectedClass && selectedSubject) {
            fetchClassGrades();
        } else {
            setStudents([]);
        }
    }, [selectedClass, selectedSubject]);

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

    const fetchClassGrades = async () => {
        try {
            const res = await API.get(`/grades/class/${selectedClass}?subject=${selectedSubject}`);
            setStudents(res.data);
        } catch (error) {
            toast.error('Failed to fetch grades');
        }
    };

    const fetchStudentGrades = async () => {
        try {
            setLoading(true);
            const res = await API.get('/student/grades');
            setStudentData(res.data);
        } catch (error) {
            console.error('Failed to fetch student grades:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId, value) => {
        setStudents(prev => prev.map(s => {
            if (s._id === studentId) return { ...s, marks: value };
            return s;
        }));
    };

    const handleSaveMarks = async (student) => {
        try {
            setSaving(true);
            await API.post('/grades', {
                studentId: student._id,
                subject: selectedSubject,
                marks: student.marks,
                classId: selectedClass
            });
            toast.success(`Marks saved for ${student.name}`);
        } catch (error) {
            toast.error('Failed to save marks');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    if (isTeacher) {
        return (
            <div>
                <Toaster position="top-right" />
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>Manage Grades</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Enter and update student marks by class and subject</p>
                </div>

                <div className="premium-card" style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
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
                                {classes.find(c => c._id === selectedClass)?.subjects.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="premium-card" style={{ padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>Student Name</th>
                                <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Marks (%)</th>
                                <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, idx) => (
                                <tr key={student._id} style={{ borderBottom: idx === students.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '500' }}>{student.name}</td>
                                    <td style={{ padding: '16px' }}>
                                        <input 
                                            type="number" 
                                            max="100"
                                            min="0"
                                            value={student.marks}
                                            onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                            placeholder="Enter marks"
                                            style={{ padding: '8px 12px', width: '100px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                                        />
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleSaveMarks(student)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: 'var(--radius-md)',
                                                border: 'none',
                                                backgroundColor: 'var(--primary-color)',
                                                color: 'white',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <Save size={14} /> Update
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Student View
    const calculateAvg = () => {
        if (!studentData || studentData.length === 0) return 0;
        const total = studentData.reduce((acc, curr) => acc + parseFloat(curr.marks || 0), 0);
        return Math.round(total / studentData.length);
    };

    const stats = [
        { label: 'Overall Average', value: `${calculateAvg()}%`, icon: <Award color="#3b82f6" />, color: '#eff6ff' },
        { label: 'Subjects Graded', value: studentData?.length || '0', icon: <BookOpen color="#10b981" />, color: '#ecfdf5' },
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
                        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{stat.value}</h2>
                    </div>
                ))}
            </div>

            <div className="premium-card" style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>Subject</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Teacher</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Marks (%)</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentData?.map((grade, idx) => (
                            <tr key={idx} style={{ borderBottom: idx === studentData.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px 24px', fontWeight: '600' }}>{grade.subject}</td>
                                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>{grade.teacherId?.name || 'Instructor'}</td>
                                <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: 'var(--primary-color)' }}>{grade.marks}%</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <span style={{ 
                                        padding: '4px 10px', 
                                        borderRadius: '12px', 
                                        fontSize: '11px', 
                                        fontWeight: '600',
                                        backgroundColor: parseFloat(grade.marks) >= 40 ? '#ecfdf5' : '#fef2f2',
                                        color: parseFloat(grade.marks) >= 40 ? '#10b981' : '#ef4444'
                                    }}>
                                        {parseFloat(grade.marks) >= 40 ? 'Passed' : 'Needs Improve'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {(!studentData || studentData.length === 0) && (
                            <tr>
                                <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No grades found yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Grades;

