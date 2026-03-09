import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Mail, Phone, Calendar as CalendarIcon, MapPin, GraduationCap, Award, BookOpen, Clock } from 'lucide-react';
import API from '../../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${user?.token}` }
    });

    useEffect(() => {
        if (user && user.token) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const endpoint = user.role === 'student' ? '/student/profile' : '/teacher/profile';
            const res = await API.get(endpoint, getHeaders());
            if (res.data) setProfile(res.data);
        } catch (error) {
            toast.error('Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const endpoint = user.role === 'student' ? '/student/profile' : '/teacher/profile';
            await API.put(endpoint, profile, getHeaders());
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

    const isStudent = user.role === 'student';

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Toaster position="top-right" />
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>My Profile</h1>
                <p style={{ color: 'var(--text-muted)' }}>View and manage your personal information</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px' }}>
                {/* Left Column: Avatar & Basic Info */}
                <div className="premium-card" style={{ textAlign: 'center', height: 'fit-content' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px',
                        fontWeight: '700',
                        margin: '0 auto 20px'
                    }}>
                        {profile?.firstName?.substring(0, 1)}{profile?.lastName?.substring(0, 1)}
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>{profile?.firstName} {profile?.lastName}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{isStudent ? 'Grade 10-A' : profile?.subject}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>{isStudent ? `Student ID: ${profile?.studentId}` : 'Faculty Staff'}</p>
                    <button style={{ color: 'var(--primary-color)', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Change Photo</button>

                    <div style={{ textAlign: 'left', marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Mail size={18} color="var(--text-muted)" />
                            <div style={{ fontSize: '14px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Email</p>
                                <p style={{ fontWeight: '500' }}>{profile?.email}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Phone size={18} color="var(--text-muted)" />
                            <div style={{ fontSize: '14px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Phone</p>
                                <p style={{ fontWeight: '500' }}>{profile?.phone || '+1 234-567-8903'}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <CalendarIcon size={18} color="var(--text-muted)" />
                            <div style={{ fontSize: '14px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Date of Birth</p>
                                <p style={{ fontWeight: '500' }}>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'March 15, 2010'}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <MapPin size={18} color="var(--text-muted)" />
                            <div style={{ fontSize: '14px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Address</p>
                                <p style={{ fontWeight: '500' }}>{profile?.address || '789 Pine Rd, City'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Forms & Info Groups */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Personal Information */}
                    <div className="premium-card">
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '25px' }}>Personal Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>First Name</label>
                                <input className="premium-input" value={profile?.firstName || ''} disabled style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Last Name</label>
                                <input className="premium-input" value={profile?.lastName || ''} disabled style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Email</label>
                                <input className="premium-input" value={profile?.email || ''} disabled style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Phone</label>
                                <input className="premium-input" value={profile?.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Date of Birth</label>
                                <input className="premium-input" type="date" value={profile?.dateOfBirth?.split('T')[0] || ''} onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })} style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Blood Group</label>
                                <input className="premium-input" value={profile?.bloodGroup || ''} onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })} style={{ width: '100%' }} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Address</label>
                                <input className="premium-input" value={profile?.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })} style={{ width: '100%' }} />
                            </div>
                        </div>
                    </div>

                    {isStudent && (
                        <>
                            {/* Guardian Information */}
                            <div className="premium-card">
                                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '25px' }}>Guardian Information</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Father's Name</label>
                                        <input className="premium-input" value={profile?.guardianInfo?.fatherName || ''} onChange={(e) => setProfile({ ...profile, guardianInfo: { ...profile.guardianInfo, fatherName: e.target.value } })} style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Father's Phone</label>
                                        <input className="premium-input" value={profile?.guardianInfo?.fatherPhone || ''} onChange={(e) => setProfile({ ...profile, guardianInfo: { ...profile.guardianInfo, fatherPhone: e.target.value } })} style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Mother's Name</label>
                                        <input className="premium-input" value={profile?.guardianInfo?.motherName || ''} onChange={(e) => setProfile({ ...profile, guardianInfo: { ...profile.guardianInfo, motherName: e.target.value } })} style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Mother's Phone</label>
                                        <input className="premium-input" value={profile?.guardianInfo?.motherPhone || ''} onChange={(e) => setProfile({ ...profile, guardianInfo: { ...profile.guardianInfo, motherPhone: e.target.value } })} style={{ width: '100%' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information Summary Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                                <div className="premium-card" style={{ padding: '15px', textAlign: 'center' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 10px' }}>
                                        <BookOpen size={16} color="#3b82f6" />
                                    </div>
                                    <h4 style={{ fontSize: '18px', fontWeight: '700' }}>{profile?.academicInfo?.subjectsCount || 8}</h4>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Subjects</p>
                                </div>
                                <div className="premium-card" style={{ padding: '15px', textAlign: 'center' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 10px' }}>
                                        <Award size={16} color="#10b981" />
                                    </div>
                                    <h4 style={{ fontSize: '18px', fontWeight: '700' }}>87%</h4>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avg Grade</p>
                                </div>
                                <div className="premium-card" style={{ padding: '15px', textAlign: 'center' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 10px' }}>
                                        <Clock size={16} color="#8b5cf6" />
                                    </div>
                                    <h4 style={{ fontSize: '18px', fontWeight: '700' }}>96%</h4>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Attendance</p>
                                </div>
                                <div className="premium-card" style={{ padding: '15px', textAlign: 'center' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 10px' }}>
                                        <GraduationCap size={16} color="#f59e0b" />
                                    </div>
                                    <h4 style={{ fontSize: '18px', fontWeight: '700' }}>{profile?.academicInfo?.classRank || '3rd'}</h4>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Class Rank</p>
                                </div>
                            </div>
                        </>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                        <button className="btn-secondary" style={{ padding: '10px 24px' }}>Cancel</button>
                        <button onClick={handleProfileUpdate} className="btn-primary" style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
