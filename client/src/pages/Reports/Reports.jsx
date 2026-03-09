import React, { useState, useEffect } from 'react';
import { Download, Users, UserRound, BookOpen, Layers } from 'lucide-react';
import api from '../../services/api';
import { Toaster, toast } from 'react-hot-toast';

const Reports = () => {
    const [stats, setStats] = useState({
        students: [],
        teachers: [],
        classes: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [studentsRes, teachersRes, classesRes] = await Promise.all([
                api.get('/reports/students'),
                api.get('/reports/teachers'),
                api.get('/reports/classes')
            ]);
            
            setStats({
                students: studentsRes.data,
                teachers: teachersRes.data,
                classes: classesRes.data
            });
        } catch (error) {
            toast.error('Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCsv = (data, filename) => {
        if (!data || !data.length) {
            toast.error('No data to export');
            return;
        }

        // Get headers
        const headers = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
        
        // Convert to CSV
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                let cell = row[header] === null || row[header] === undefined ? '' : row[header];
                if (typeof cell === 'string' && (cell.includes(',') || cell.includes('\n'))) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatsByGender = () => {
        const result = { Male: 0, Female: 0, Other: 0 };
        stats.students.forEach(s => {
            if (s.gender) result[s.gender] = (result[s.gender] || 0) + 1;
        });
        return result;
    };

    const getStudentsPerClass = () => {
        const result = {};
        stats.students.forEach(s => {
            if (s.class && s.class.className) {
                const className = s.class.className;
                result[className] = (result[className] || 0) + 1;
            }
        });
        return Object.entries(result).map(([name, count]) => ({ name, count }));
    };

    const getTeachersPerDept = () => {
        const result = {};
        stats.teachers.forEach(t => {
            const dept = t.department || 'Unassigned';
            result[dept] = (result[dept] || 0) + 1;
        });
        return Object.entries(result).map(([name, count]) => ({ name, count }));
    };

    const ReportCard = ({ title, value, icon, color, data, onExport }) => (
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: `${color}15`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon}
                </div>
                <button
                    onClick={() => onExport(data, title.toLowerCase().replace(' ', '_'))}
                    style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        color: 'var(--text-muted)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <Download size={14} /> Export CSV
                </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '5px' }}>{title}</p>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginBottom: 'auto' }}>{value}</h2>
        </div>
    );

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading reports...</div>;
    }

    return (
        <div>
            <Toaster position="top-right" />
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Reports & Analytics</h1>
                <p style={{ color: 'var(--text-muted)' }}>Generate and export dynamic reports across all school modules.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <ReportCard 
                    title="Total Students Overview" 
                    value={stats.students.length} 
                    icon={<Users size={24} />} 
                    color="#3b82f6" 
                    data={stats.students}
                    onExport={handleExportCsv}
                />
                <ReportCard 
                    title="Total Teachers Staff" 
                    value={stats.teachers.length} 
                    icon={<UserRound size={24} />} 
                    color="#10b981" 
                    data={stats.teachers}
                    onExport={handleExportCsv}
                />
                <ReportCard 
                    title="Active Classes" 
                    value={stats.classes.length} 
                    icon={<BookOpen size={24} />} 
                    color="#8b5cf6" 
                    data={stats.classes}
                    onExport={handleExportCsv}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                        <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Layers size={18} color="var(--primary-color)" /> Students per Class
                        </h3>
                    </div>
                    {getStudentsPerClass().length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            {getStudentsPerClass().map((item, idx) => (
                                <div key={idx} style={{ padding: '12px', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Class {item.name}</span>
                                    <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)' }}>{item.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No student data available</p>
                    )}
                </div>

                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                        <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Layers size={18} color="#10b981" /> Teachers per Department
                        </h3>
                    </div>
                    {getTeachersPerDept().length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            {getTeachersPerDept().map((item, idx) => (
                                <div key={idx} style={{ padding: '12px', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{item.name}</span>
                                    <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)' }}>{item.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No teacher data available</p>
                    )}
                </div>
                
                <div className="premium-card" style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                        <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={18} color="#f59e0b" /> Student Demographics
                        </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        {Object.entries(getStatsByGender()).map(([gender, count]) => (
                            <div key={gender} style={{ flex: 1, padding: '20px', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                <span style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>{gender}</span>
                                <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)' }}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
