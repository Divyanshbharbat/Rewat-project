import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import api from '../../services/api';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import Form from '../../components/Form/Form';
import { Toaster, toast } from 'react-hot-toast';

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentClass, setCurrentClass] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
        fetchTeachers();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/classes');
            setClasses(response.data);
        } catch (error) {
            toast.error('Failed to fetch classes');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await api.get('/teachers');
            setTeachers(response.data);
        } catch (error) {
            toast.error('Failed to fetch teachers');
        }
    };

    const handleAdd = () => {
        setCurrentClass(null);
        setIsModalOpen(true);
    };

    const handleEdit = (cls) => {
        setCurrentClass({
            ...cls,
            classTeacher: cls.classTeacher?._id || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (cls) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                await api.delete(`/classes/${cls._id}`);
                toast.success('Class deleted successfully');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete class');
            }
        }
    };

    const handleSubmit = async (values) => {
        try {
            // handle array format for subjects
            const submitValues = { ...values };
            if (typeof submitValues.subjects === 'string') {
                submitValues.subjects = submitValues.subjects.split(',').map(s => s.trim());
            }

            if (currentClass) {
                await api.put(`/classes/${currentClass._id}`, submitValues);
                toast.success('Class updated successfully');
            } else {
                await api.post('/classes', submitValues);
                toast.success('Class created successfully');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const columns = [
        { 
            header: 'Class & Section', 
            accessor: 'className',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: 'var(--radius-md)', 
                        backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '600', fontSize: '13px'
                    }}>
                        {row.className}
                    </div>
                    <div>
                        <p style={{ fontWeight: '500', color: 'var(--text-main)', fontSize: '14px' }}>Class {row.className}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Section {row.section}</p>
                    </div>
                </div>
            )
        },
        { 
            header: 'Class Teacher', 
            accessor: 'classTeacher',
            render: (row) => row.classTeacher ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        backgroundColor: '#e0f2fe', color: '#0284c7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '600', fontSize: '10px'
                    }}>
                        {row.classTeacher.name?.charAt(0)}
                    </div>
                    <span>{row.classTeacher.name}</span>
                </div>
            ) : <span style={{ color: 'var(--text-muted)' }}>Not Assigned</span>
        },
        { header: 'Room', accessor: 'roomNumber', render: (row) => row.roomNumber || 'N/A' },
        { header: 'Capacity', accessor: 'capacity', render: (row) => row.capacity || 'N/A' },
        { 
            header: 'Subjects', 
            accessor: 'subjects',
            render: (row) => row.subjects?.length > 0 ? (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {row.subjects.slice(0, 3).map((sub, idx) => (
                        <span key={idx} style={{ 
                            fontSize: '11px', 
                            padding: '2px 6px', 
                            backgroundColor: 'var(--bg-color)', 
                            borderRadius: '4px',
                            color: 'var(--secondary-color)',
                            border: '1px solid var(--border-color)'
                        }}>
                            {sub}
                        </span>
                    ))}
                    {row.subjects.length > 3 && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '4px' }}>+{row.subjects.length - 3}</span>
                    )}
                </div>
            ) : <span style={{ color: 'var(--text-muted)' }}>None specified</span>
        }
    ];

    const formFields = [
        { name: 'className', label: 'Class/Grade (e.g., 10)', required: true },
        { name: 'section', label: 'Section (e.g., A)', required: true },
        { 
            name: 'classTeacher', 
            label: 'Class Teacher', 
            type: 'select', 
            options: teachers.map(t => ({ value: t._id, label: t.name })) 
        },
        { name: 'roomNumber', label: 'Room Number' },
        { name: 'capacity', label: 'Capacity', type: 'number' },
        { name: 'subjects', label: 'Subjects (comma-separated)', placeholder: 'Math, Science, English' }
    ];

    const filteredClasses = classes.filter(c => 
        (c.className && c.className.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.section && c.section.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.classTeacher && c.classTeacher.name && c.classTeacher.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div>
            <Toaster position="top-right" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Classes</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage classes, sections, and assign class teachers.</p>
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
                        boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}
                >
                    <Plus size={18} />
                    Create Class
                </button>
            </div>

            <div className="premium-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search classes or teachers..."
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
                        data={filteredClasses} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={currentClass ? 'Edit Class' : 'Create New Class'}
            >
                <Form 
                    fields={formFields}
                    initialValues={currentClass ? {
                        ...currentClass,
                        subjects: currentClass.subjects?.join(', ') || ''
                    } : {}}
                    onSubmit={handleSubmit}
                    submitLabel={currentClass ? 'Update Class' : 'Create Class'}
                />
            </Modal>
        </div>
    );
};

export default Classes;
