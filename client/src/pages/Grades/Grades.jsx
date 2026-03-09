import React, { useState, useEffect } from 'react';
import { Award, Search, CheckCircle } from 'lucide-react';
import API from '../../services/api';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import Form from '../../components/Form/Form';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Grades = () => {
    const { user } = useAuth();
    const [grades, setGrades] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGrade, setCurrentGrade] = useState(null);

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${user?.token}` }
    });

    useEffect(() => {
        if (user && user.token) {
            fetchClasses();
        }
    }, [user]);

    useEffect(() => {
        if (selectedClass) {
            fetchGrades();
            const classObj = classes.find(c => c._id === selectedClass);
            if (classObj) setStudents(classObj.students || []);
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const res = await API.get('/teacher/classes', getHeaders());
            setClasses(res.data);
            if (res.data.length > 0) setSelectedClass(res.data[0]._id);
        } catch (error) {
            toast.error('Failed to fetch classes');
        }
    };

    const fetchGrades = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/grades/class/${selectedClass}`, getHeaders());
            setGrades(res.data);
        } catch (error) {
            toast.error('Failed to fetch grades');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setCurrentGrade(null);
        setIsModalOpen(true);
    };

    const handleEdit = (grade) => {
        setCurrentGrade({
            ...grade,
            studentId: grade.studentId?._id || grade.studentId
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            const payload = { ...values, classId: selectedClass };
            if (currentGrade && currentGrade._id) {
                await API.put(`/grades/${currentGrade._id}`, payload, getHeaders());
                toast.success('Grade updated successfully');
            } else {
                await API.post('/grades', payload, getHeaders());
                toast.success('Grade assigned successfully');
            }
            setIsModalOpen(false);
            fetchGrades();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
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
                        backgroundColor: '#f5f3ff', color: '#8b5cf6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '600', fontSize: '12px'
                    }}>
                        {row.studentId?.firstName?.charAt(0)}{row.studentId?.lastName?.charAt(0)}
                    </div>
                    <div>
                        <p style={{ fontWeight: '500', color: 'var(--text-main)', fontSize: '14px' }}>{row.studentId?.firstName} {row.studentId?.lastName}</p>
                    </div>
                </div>
            )
        },
        { header: 'Subject', accessor: 'subject' },
        { 
            header: 'Marks', 
            accessor: 'marks',
            render: (row) => (
                <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: 'var(--radius-sm)', 
                    backgroundColor: 'var(--primary-light)', 
                    color: 'var(--primary-color)',
                    fontWeight: '600',
                    fontSize: '13px'
                }}>
                    {row.marks}
                </span>
            )
        }
    ];

    return (
        <div>
            <Toaster position="top-right" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>Grades Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Evaluate students and assign grades for their respective subjects.</p>
                </div>
                <button
                    onClick={handleAdd}
                    disabled={students.length === 0}
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
                        cursor: students.length === 0 ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                        boxShadow: 'var(--shadow-sm)',
                        opacity: students.length === 0 ? 0.7 : 1
                    }}
                >
                    <CheckCircle size={18} />
                    Assign Grade
                </button>
            </div>

            <div className="premium-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginRight: '20px' }}>
                            <Award size={20} color="var(--primary-color)" /> Student Grades Map
                        </h2>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            style={{
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="" disabled>Select a class</option>
                            {classes.map(c => (
                                <option key={c._id} value={c._id}>Class {c.className}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading grades...</div>
                ) : (
                    <Table 
                        columns={columns} 
                        data={grades} 
                        onEdit={handleEdit}
                    />
                )}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={currentGrade ? 'Edit Grade' : 'Assign New Grade'}
            >
                <Form 
                    fields={[
                        { 
                            name: 'studentId', 
                            label: 'Select Student *', 
                            required: true, 
                            type: 'select', 
                            options: students.map(s => ({ value: s._id, label: `${s.firstName} ${s.lastName}` }))
                        },
                        { name: 'subject', label: 'Subject', required: true },
                        { name: 'marks', label: 'Marks', required: true }
                    ]}
                    initialValues={currentGrade || {}}
                    onSubmit={handleSubmit}
                    submitLabel={currentGrade ? 'Update Grade' : 'Save Grade'}
                />
            </Modal>
        </div>
    );
};

export default Grades;
