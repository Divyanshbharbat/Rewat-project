import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock } from 'lucide-react';
import API from '../../services/api';
import Table from '../../components/Table/Table';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const MyClasses = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(user && user.token) {
            fetchClasses();
        }
    }, [user]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await API.get('/teacher/classes', {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            setClasses(res.data);
        } catch (error) {
            toast.error('Failed to fetch assigned classes');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { 
            header: 'Class Info', 
            accessor: 'className',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: 'var(--radius-md)', 
                        backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '600', fontSize: '14px'
                    }}>
                        {row.className}
                    </div>
                    <div>
                        <p style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>Class {row.className} - {row.section}</p>
                    </div>
                </div>
            )
        },
        { 
            header: 'Room', 
            accessor: 'roomNumber',
            render: (row) => (
                <span style={{ color: 'var(--text-muted)' }}>{row.roomNumber || 'N/A'}</span>
            )
        },
        { 
            header: 'Capacity', 
            accessor: 'capacity',
        },
        { 
            header: 'Subjects Taught', 
            accessor: 'subjects',
            render: (row) => row.subjects?.length > 0 ? (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {row.subjects.map((sub, idx) => (
                        <span key={idx} style={{ 
                            fontSize: '12px', 
                            padding: '4px 8px', 
                            backgroundColor: 'var(--bg-color)', 
                            borderRadius: '4px',
                            color: 'var(--secondary-color)',
                            border: '1px solid var(--border-color)',
                            fontWeight: '500'
                        }}>
                            {sub}
                        </span>
                    ))}
                </div>
            ) : <span style={{ color: 'var(--text-muted)' }}>None specified</span>
        }
    ];

    return (
        <div>
            <Toaster position="top-right" />
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>My Classes</h1>
                <p style={{ color: 'var(--text-muted)' }}>Overview of all your assigned classes and sections.</p>
            </div>

            <div className="premium-card" style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={20} color="var(--primary-color)" /> Assigned Classes ({classes.length})
                    </h2>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading classes...</div>
                ) : (
                    <Table 
                        columns={columns} 
                        data={classes} 
                    />
                )}
            </div>
        </div>
    );
};

export default MyClasses;
