import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import api from '../../services/api';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import Form from '../../components/Form/Form';
import { Toaster, toast } from 'react-hot-toast';

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/teachers');
            setTeachers(response.data);
        } catch (error) {
            toast.error('Failed to fetch teachers');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setCurrentTeacher(null);
        setIsModalOpen(true);
    };

    const handleEdit = (teacher) => {
        setCurrentTeacher(teacher);
        setIsModalOpen(true);
    };

    const handleDelete = async (teacher) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                await api.delete(`/teachers/${teacher._id}`);
                toast.success('Teacher deleted successfully');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete teacher');
            }
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (currentTeacher) {
                await api.put(`/teachers/${currentTeacher._id}`, values);
                toast.success('Teacher updated successfully');
            } else {
                await api.post('/teachers', values);
                toast.success('Teacher added successfully');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const columns = [
        { header: 'ID', accessor: 'teacherId' },
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
                        {row.name?.charAt(0)}
                    </div>
                    <div>
                        <p style={{ fontWeight: '500', color: 'var(--text-main)', fontSize: '14px' }}>{row.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{row.email}</p>
                    </div>
                </div>
            )
        },
        { header: 'Subject', accessor: 'subject' },
        { header: 'Department', accessor: 'department' },
        { header: 'Phone', accessor: 'phone' }
    ];

    const formFields = [
        { name: 'teacherId', label: 'Teacher ID', required: true },
        { name: 'name', label: 'Full Name', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number' },
        { name: 'subject', label: 'Subject', required: true },
        { name: 'department', label: 'Department' },
        { name: 'joiningDate', label: 'Joining Date', type: 'date' },
        { name: 'address', label: 'Address' }
    ];

    const filteredTeachers = teachers.filter(t => 
        (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.teacherId && t.teacherId.includes(searchQuery)) ||
        (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.email && t.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div>
            <Toaster position="top-right" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Teachers</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage teaching staff, view details, and assign subjects.</p>
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
                    Add Teacher
                </button>
            </div>

            <div className="premium-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search teachers..."
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
                        data={filteredTeachers} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={currentTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            >
                <Form 
                    fields={formFields}
                    initialValues={currentTeacher ? {
                        ...currentTeacher,
                        joiningDate: currentTeacher.joiningDate ? new Date(currentTeacher.joiningDate).toISOString().split('T')[0] : ''
                    } : {}}
                    onSubmit={handleSubmit}
                    submitLabel={currentTeacher ? 'Update Details' : 'Add Teacher'}
                />
            </Modal>
        </div>
    );
};

export default Teachers;
