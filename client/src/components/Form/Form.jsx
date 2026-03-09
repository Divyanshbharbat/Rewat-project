import React from 'react';

const Form = ({ fields, onSubmit, initialValues, submitLabel }) => {
    const [values, setValues] = React.useState(initialValues || {});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(values);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {fields.map((field) => (
                    <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>
                            {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                        </label>
                        {field.type === 'select' ? (
                            <select
                                name={field.name}
                                value={values[field.name] || ''}
                                onChange={handleChange}
                                required={field.required}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '14px',
                                    backgroundColor: 'white',
                                    color: 'var(--text-main)',
                                    appearance: 'none',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    cursor: 'pointer'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            >
                                <option value="" disabled>Select {field.label}</option>
                                {field.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type || 'text'}
                                name={field.name}
                                value={values[field.name] || ''}
                                onChange={handleChange}
                                required={field.required}
                                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '14px',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        )}
                    </div>
                ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                    type="submit"
                    style={{
                        padding: '12px 24px',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}
                >
                    {submitLabel || 'Submit'}
                </button>
            </div>
        </form>
    );
};

export default Form;
