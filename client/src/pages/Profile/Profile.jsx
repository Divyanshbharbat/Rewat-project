import React, { useState, useEffect } from 'react';
import { User, Lock, Save } from 'lucide-react';
import API from '../../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        name: '', email: '', phone: '', address: '', subject: '', department: ''
    });
    const [loading, setLoading] = useState(true);

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${user?.token}` }
    });

    useEffect(() => {
        if(user && user.token) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await API.get('/teacher/profile', getHeaders());
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
            await API.put('/teacher/profile', profile, getHeaders());
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Toaster position="top-right" />
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>My Profile</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your personal information and security settings.</p>
            </div>

            <div className="premium-card" style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={20} color="var(--primary-color)" /> Personal Details
                </h2>
                {loading ? <p>Loading...</p> : (
                    <form onSubmit={handleProfileUpdate}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={profile.name || ''}
                                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>Email</label>
                                <input
                                    type="email"
                                    value={profile.email || ''}
                                    disabled
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: '#f1f5f9' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>Phone Number</label>
                                <input
                                    type="text"
                                    value={profile.phone || ''}
                                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>Subject Specialty</label>
                                <input
                                    type="text"
                                    value={profile.subject || ''}
                                    disabled
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: '#f1f5f9' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Save size={16} /> Update Details
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
