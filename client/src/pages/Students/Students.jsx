import React, { useState, useEffect } from 'react';
import { Plus, Search, Upload } from 'lucide-react';
import api from '../../services/api';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import Form from '../../components/Form/Form';
import { Toaster, toast } from 'react-hot-toast';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
        fetchClasses();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/students');
            setStudents(response.data);
        } catch (error) {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await api.get('/classes');
            setClasses(response.data);
        } catch (error) {
            toast.error('Failed to fetch classes');
        }
    };

    const handleAdd = () => {
        setCurrentStudent(null);
        setIsModalOpen(true);
    };

    const handleEdit = (student) => {
        setCurrentStudent(student);
        setIsModalOpen(true);
    };

    const handleDelete = async (student) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await api.delete(`/students/${student._id}`);
                toast.success('Student deleted successfully');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete student');
            }
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (currentStudent) {
                await api.put(`/students/${currentStudent._id}`, values);
                toast.success('Student updated successfully');
            } else {
                await api.post('/students', values);
                toast.success('Student added successfully');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const columns = [
        { header: 'ID', accessor: 'studentId' },
        { 
            header: 'Name', 
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
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{row.email}</p>
                    </div>
                </div>
            )
        },
        { header: 'Class', render: (row) => row.class?.className || 'N/A' },
        { header: 'Gender', accessor: 'gender' },
        { header: 'Phone', accessor: 'phone' }
    ];

    const formFields = [
        { name: 'studentId', label: 'Student ID', required: true },
        { name: 'firstName', label: 'First Name', required: true },
        { name: 'lastName', label: 'Last Name', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number' },
        { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
        { name: 'gender', label: 'Gender', type: 'select', options: [
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other' }
        ]},
        { name: 'class', label: 'Class', type: 'select', options: classes.map(c => ({ value: c._id, label: c.className })) },
        { name: 'address', label: 'Address' }
    ];

    const filteredStudents = students.filter(s => 
        (s.firstName && s.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.lastName && s.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.studentId && s.studentId.includes(searchQuery)) ||
        (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div>
            <Toaster position="top-right" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Students</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage student records, view details, and handle enrollments.</p>
                </div>
                <button
                    onClick={handleAdd}
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
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}
                >
                    <Plus size={18} />
                    Add Student
                </button>
            </div>

            <div className="premium-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px 10px 40px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                fontSize: '14px',
                                outline: 'none',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                ) : (
                    <Table 
                        columns={columns} 
                        data={filteredStudents} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={currentStudent ? 'Edit Student' : 'Add New Student'}
            >
                <Form 
                    fields={formFields}
                    initialValues={currentStudent || {}}
                    onSubmit={handleSubmit}
                    submitLabel={currentStudent ? 'Update Details' : 'Add Student'}
                />
            </Modal>
        </div>
    );
};

export default Students;
