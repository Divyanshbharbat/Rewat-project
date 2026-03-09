import React, { useState, useEffect } from 'react';
import { CalendarCheck, Save, Search } from 'lucide-react';
import API from '../../services/api';
import Table from '../../components/Table/Table';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Attendance = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if(user && user.token) fetchClasses();
    }, [user]);

    useEffect(() => {
        if (selectedClass && selectedDate && user && user.token) {
            fetchStudentsAndAttendance();
        }
    }, [selectedClass, selectedDate, user]);

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${user.token}` }
    });

    const fetchClasses = async () => {
        try {
            const res = await API.get('/teacher/classes', getHeaders());
            setClasses(res.data);
            if (res.data.length > 0) {
                setSelectedClass(res.data[0]._id);
            }
        } catch (error) {
            toast.error('Failed to fetch assigned classes');
        }
    };

    const fetchStudentsAndAttendance = async () => {
        try {
            setLoading(true);
            const selectedClassObj = classes.find(c => c._id === selectedClass);
            if (!selectedClassObj) return;

            const [attendanceRes] = await Promise.all([
                API.get(`/attendance/class/${selectedClass}?date=${selectedDate}`, getHeaders())
            ]);
            
            // From our new API controller logic, `students` array is deeply populated inside classes.
            setStudents(selectedClassObj.students || []);
            
            const existingRecords = {};
            attendanceRes.data.forEach(record => {
                existingRecords[record.studentId._id || record.studentId] = record.status;
            });
            setAttendanceRecords(existingRecords);
            
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = (studentId, status) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSaveAttendance = async () => {
        try {
            setSaving(true);
            const attendancePromises = Object.keys(attendanceRecords).map(studentId => {
                return API.post('/attendance', {
                    classId: selectedClass,
                    studentId,
                    date: selectedDate,
                    status: attendanceRecords[studentId]
                }, getHeaders());
            });
            
            await Promise.all(attendancePromises);
            toast.success('Attendance saved successfully');
        } catch (error) {
            toast.error('Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { 
            header: 'Student', 
            accessor: 'name',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '600', fontSize: '12px'
                    }}>
                        {row.firstName?.charAt(0)}{row.lastName?.charAt(0)}
                    </div>
                    <div>
                        <p style={{ fontWeight: '500', color: 'var(--text-main)', fontSize: '14px' }}>{row.firstName} {row.lastName}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{row.studentId}</p>
                    </div>
                </div>
            )
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => {
                const currentStatus = attendanceRecords[row._id] || '';
                return (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => handleMarkAttendance(row._id, 'Present')}
                            style={{
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: currentStatus === 'Present' ? '#10b981' : 'transparent',
                                color: currentStatus === 'Present' ? 'white' : '#10b981',
                                border: '1px solid #10b981',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Present
                        </button>
                        <button
                            onClick={() => handleMarkAttendance(row._id, 'Absent')}
                            style={{
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: currentStatus === 'Absent' ? '#ef4444' : 'transparent',
                                color: currentStatus === 'Absent' ? 'white' : '#ef4444',
                                border: '1px solid #ef4444',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Absent
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <div>
            <Toaster position="top-right" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>Attendance</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Mark daily attendance for your classes.</p>
                </div>
                
                <button
                    onClick={handleSaveAttendance}
                    disabled={saving || students.length === 0}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: (saving || students.length === 0) ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                        boxShadow: 'var(--shadow-sm)',
                        opacity: (saving || students.length === 0) ? 0.7 : 1
                    }}
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Attendance'}
                </button>
            </div>

            <div className="premium-card" style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>Select Class</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="" disabled>Select a class</option>
                        {classes.map(c => (
                            <option key={c._id} value={c._id}>Class {c.className} - {c.section}</option>
                        ))}
                    </select>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>Select Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            <div className="premium-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CalendarCheck size={20} color="var(--primary-color)" /> Student Register ({students.length})
                    </h2>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading students...</div>
                ) : (
                    <Table 
                        columns={columns} 
                        data={students} 
                    />
                )}
            </div>
        </div>
    );
};

export default Attendance;
