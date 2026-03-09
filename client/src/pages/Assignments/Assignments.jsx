import React, { useState, useEffect } from 'react';
import { BookMarked, Search, PlusCircle } from 'lucide-react';
import API from '../../services/api';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import Form from '../../components/Form/Form';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Assignments = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState(null);

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${user?.token}` }
    });

    useEffect(() => {
        if(user && user.token) {
            fetchClasses();
            fetchAssignments();
        }
    }, [user]);

    const fetchClasses = async () => {
        try {
            const res = await API.get('/teacher/classes', getHeaders());
            setClasses(res.data);
        } catch (error) {
            toast.error('Failed to fetch classes');
        }
    };

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const res = await API.get('/assignments/teacher', getHeaders());
            setAssignments(res.data);
        } catch (error) {
            toast.error('Failed to fetch assignments');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setCurrentAssignment(null);
        setIsModalOpen(true);
    };

    const handleEdit = (assignment) => {
        setCurrentAssignment({
            ...assignment,
            dueDate: new Date(assignment.dueDate).toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (assignment) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await API.delete(`/assignments/${assignment._id}`, getHeaders());
                toast.success('Assignment deleted successfully');
                fetchAssignments();
            } catch (error) {
                toast.error('Failed to delete assignment');
            }
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (currentAssignment && currentAssignment._id) {
                await API.put(`/assignments/${currentAssignment._id}`, values, getHeaders());
                toast.success('Assignment updated successfully');
            } else {
                await API.post('/assignments', values, getHeaders());
                toast.success('Assignment created successfully');
            }
            setIsModalOpen(false);
            fetchAssignments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const columns = [
        { 
            header: 'Title', 
            accessor: 'title',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: 'var(--radius-sm)', 
                        backgroundColor: '#fff7ed', color: '#f97316',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <BookMarked size={16} />
                    </div>
                    <div>
                        <p style={{ fontWeight: '500', color: 'var(--text-main)', fontSize: '14px' }}>{row.title}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                            {row.description}
                        </p>
                    </div>
                </div>
            )
        },
        { 
            header: 'Class', 
            accessor: 'className',
            render: (row) => row.classId?.className ? `Class ${row.classId.className}` : 'N/A'
        },
        { 
            header: 'Due Date', 
            accessor: 'dueDate',
            render: (row) => new Date(row.dueDate).toLocaleDateString()
        }
    ];

    const formFields = [
        { name: 'title', label: 'Assignment Title', required: true },
        { 
            name: 'classId', 
            label: 'Assign to Class', 
            required: true, 
            type: 'select', 
            options: classes.map(c => ({ value: c._id, label: `Class ${c.className}` }))
        },
        { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
        { name: 'description', label: 'Description', type: 'textarea' }
    ];

    return (
        <div>
            <Toaster position="top-right" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>Assignments</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Publish assignments & track progress across all your classes.</p>
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
                >
                    <PlusCircle size={18} />
                    Create Assignment
                </button>
            </div>

            <div className="premium-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookMarked size={20} color="var(--primary-color)" /> Posted Assignments
                    </h2>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading assignments...</div>
                ) : (
                    <Table 
                        columns={columns} 
                        data={assignments} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={currentAssignment ? 'Edit Assignment' : 'Create Assignment'}
            >
                <Form 
                    fields={formFields}
                    initialValues={currentAssignment || {}}
                    onSubmit={handleSubmit}
                    submitLabel={currentAssignment ? 'Update' : 'Post Assignment'}
                />
            </Modal>
        </div>
    );
};

export default Assignments;
