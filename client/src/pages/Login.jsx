import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, GraduationCap } from 'lucide-react';
import loginImage from './image.png';

const Login = () => {
    const [role, setRole] = useState('Teacher');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password, role.toLowerCase());
        if (res.success) {
            navigate(`/${role.toLowerCase()}/dashboard`);
        } else {
            setError(res.message);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
            {/* Left Side - Brand & Illustration */}
            <div className="auth-gradient" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                padding: '40px'
            }}>
                <div style={{ alignSelf: 'flex-start', marginBottom: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <GraduationCap size={40} />
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>SchoolERP</h1>
                            <p style={{ opacity: 0.8 }}>Education Management System</p>
                        </div>
                    </div>
                </div>

                <div className="premium-card" style={{
                    width: '80%',
                    maxWidth: '400px',
                    height: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    {/* Placeholder for Illustration */}
                    <div style={{ textAlign: 'center' }}>
                        <img src={loginImage}
                            alt="Education"
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </div>
                </div>

                <div style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>
                    <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Welcome Back!</h2>
                    <p style={{ opacity: 0.8, maxWidth: '400px' }}>
                        Manage your school operations efficiently with our comprehensive ERP system.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div style={{
                flex: 1,
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
                    <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Sign In</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                        Select your role and enter your credentials
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Login As</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['Admin', 'Teacher', 'Student'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: 'var(--radius-md)',
                                            border: `1px solid ${role === r ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                            backgroundColor: role === r ? 'white' : 'var(--bg-color)',
                                            color: role === r ? 'var(--primary-color)' : 'var(--text-muted)',
                                            fontWeight: '500',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    placeholder={`${role.toLowerCase()}@school.com`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--bg-color)'
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--bg-color)'
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '15px' }}>{error}</p>}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" style={{ color: 'var(--primary-color)', fontSize: '14px' }}>Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--primary-color)',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '16px',
                                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
