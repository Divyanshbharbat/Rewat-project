import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, FileText, AlertCircle, ChevronRight, Save, Plus, X } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import Modal from '../../components/Modal/Modal';

const Assignments = () => {
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher';
    
    const [assignments, setAssignments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [mySubmissions, setMySubmissions] = useState([]);
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        classId: '',
        subject: '',
        dueDate: ''
    });

    useEffect(() => {
        if (user && user.token) {
            fetchAssignments();
            if (isTeacher) {
                fetchClasses();
            } else {
                fetchMySubmissions();
            }
        }
    }, [user, isTeacher]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const res = await API.get(isTeacher ? '/assignments' : '/student/dashboard');
            setAssignments(isTeacher ? res.data : res.data.assignments || []);
        } catch (error) {
            console.error('Failed to fetch assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMySubmissions = async () => {
        try {
            const res = await API.get('/submissions/my-status');
            setMySubmissions(res.data);
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await API.get('/teacher/classes');
            setClasses(res.data);
        } catch (error) {
            toast.error('Failed to fetch classes');
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await API.post('/assignments', formData);
            toast.success('Assignment created successfully');
            setIsModalOpen(false);
            setFormData({ title: '', description: '', classId: '', subject: '', dueDate: '' });
            fetchAssignments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create assignment');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) return toast.error('Please select a file');
        
        try {
            setSaving(true);
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('assignmentId', selectedAssignment._id);
            
            await API.post('/submissions/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success('Assignment submitted successfully');
            setIsModalOpen(false);
            fetchMySubmissions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setSaving(false);
        }
    };

    const handleViewSubmissions = async (assignmentId) => {
        try {
            const res = await API.get(`/submissions/assignment/${assignmentId}`);
            setSubmissions(res.data);
            setIsSubmissionsModalOpen(true);
        } catch (error) {
            toast.error('Failed to fetch submissions');
        }
    };

    const isSubmitted = (assignmentId) => {
        return mySubmissions.some(s => s.assignmentId === assignmentId);
    };

    const handleDeleteAssignment = async (id) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        try {
            await API.delete(`/assignments/${id}`);
            toast.success('Assignment deleted');
            fetchAssignments();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading assignments...</div>;

    return (
        <div>
            <Toaster position="top-right" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>
                        {isTeacher ? 'Manage Assignments' : 'My Assignments'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isTeacher ? 'Create and track assignments for your classes' : 'View and submit your assignments'}
                    </p>
                </div>
                {isTeacher && (
                    <button 
                        onClick={() => {
                            setSelectedAssignment(null);
                            setIsModalOpen(true);
                        }}
                        className="btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={18} /> Create Assignment
                    </button>
                )}
            </div>

            {/* Assignments List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {assignments.map((a, idx) => {
                    const submitted = !isTeacher && isSubmitted(a._id);
                    return (
                        <div key={idx} className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: submitted ? '#ecfdf5' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {submitted ? <CheckCircle size={20} color="#10b981" /> : <FileText size={20} color="#3b82f6" />}
                                </div>
                                {isTeacher && (
                                    <button 
                                        onClick={() => handleDeleteAssignment(a._id)}
                                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{a.title}</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                {a.subject} {isTeacher && ` - (${a.classId?.className} ${a.classId?.section})`}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
                                <Clock size={14} color="var(--text-muted)" />
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                            </div>
                            
                            {isTeacher ? (
                                <button 
                                    onClick={() => handleViewSubmissions(a._id)}
                                    className="btn-primary" 
                                    style={{ width: '100%', padding: '10px', fontSize: '14px', background: '#f1f5f9', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                                >
                                    View Submissions
                                </button>
                            ) : (
                                <button 
                                    onClick={() => {
                                        setSelectedAssignment(a);
                                        setIsModalOpen(true);
                                    }}
                                    className="btn-primary" 
                                    style={{ 
                                        width: '100%', 
                                        padding: '10px', 
                                        fontSize: '14px', 
                                        background: submitted ? '#ecfdf5' : 'var(--primary-color)', 
                                        color: submitted ? '#10b981' : 'white', 
                                        border: submitted ? '1px solid #10b981' : 'none' 
                                    }}
                                >
                                    {submitted ? 'Resubmit Assignment' : 'Submit Assignment'}
                                </button>
                            )}
                        </div>
                    );
                })}
                {assignments.length === 0 && (
                    <div style={{ gridColumn: 'span 3', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No assignments found.
                    </div>
                )}
            </div>

            {/* Create/Submit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isTeacher ? "Create New Assignment" : "Submit Assignment"}
            >
                {isTeacher ? (
                    <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Title</label>
                            <input 
                                type="text" 
                                required
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Class</label>
                            <select 
                                required
                                value={formData.classId}
                                onChange={(e) => {
                                    const cls = classes.find(c => c._id === e.target.value);
                                    setFormData({...formData, classId: e.target.value, subject: cls?.subjects?.[0] || ''});
                                }}
                                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            >
                                <option value="">Select Class...</option>
                                {classes.map(c => <option key={c._id} value={c._id}>{c.className} - {c.section}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Subject</label>
                            <select 
                                required
                                value={formData.subject}
                                onChange={e => setFormData({...formData, subject: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            >
                                <option value="">Select Subject...</option>
                                {classes.find(c => c._id === formData.classId)?.subjects.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Due Date</label>
                            <input 
                                type="date" 
                                required
                                value={formData.dueDate}
                                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Description</label>
                            <textarea 
                                rows="3"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', resize: 'none' }}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="btn-primary" 
                            style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Save size={18} /> {saving ? 'Creating...' : 'Create Assignment'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{selectedAssignment?.title}</h4>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{selectedAssignment?.description || 'No description provided.'}</p>
                        </div>
                        <div style={{ padding: '30px', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                            <input 
                                type="file" 
                                accept=".pdf"
                                onChange={e => setFile(e.target.files[0])}
                                style={{ display: 'none' }}
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                                    <FileText size={40} color="var(--primary-color)" />
                                </div>
                                <p style={{ fontWeight: '500' }}>{file ? file.name : 'Click to select PDF or drag and drop'}</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Only PDF files (max 5MB)</p>
                            </label>
                        </div>
                        <button 
                            type="submit" 
                            disabled={saving || !file}
                            className="btn-primary" 
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Save size={18} /> {saving ? 'Uploading...' : 'Submit PDF'}
                        </button>
                    </form>
                )}
            </Modal>

            {/* View Submissions Modal */}
            <Modal
                isOpen={isSubmissionsModalOpen}
                onClose={() => setIsSubmissionsModalOpen(false)}
                title="Student Submissions"
            >
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '12px', fontSize: '13px' }}>Student</th>
                                <th style={{ padding: '12px', fontSize: '13px' }}>Submitted</th>
                                <th style={{ padding: '12px', fontSize: '13px', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((s, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px' }}>
                                        <p style={{ fontWeight: '600', fontSize: '14px' }}>{s.studentId.firstName} {s.studentId.lastName}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {s.studentId.studentId}</p>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '13px' }}>
                                        {new Date(s.submittedAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <a 
                                            href={`http://localhost:5000${s.fileUrl}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn-primary"
                                            style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}
                                        >
                                            View PDF
                                        </a>
                                    </td>
                                </tr>
                            ))}
                            {submissions.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No submissions yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </div>
    );
};

export default Assignments;

