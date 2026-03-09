import React from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const Table = ({ columns, data, onEdit, onDelete, onRowClick }) => {
    return (
        <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
        }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--primary-light)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} style={{ padding: '15px 20px', fontSize: '13px', fontWeight: '600', color: 'var(--secondary-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {col.header}
                                </th>
                            ))}
                            {(onEdit || onDelete) && (
                                <th style={{ padding: '15px 20px', fontSize: '13px', fontWeight: '600', color: 'var(--secondary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIdx) => (
                                <tr
                                    key={row._id || row.id || rowIdx}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    style={{
                                        borderBottom: '1px solid var(--border-color)',
                                        cursor: onRowClick ? 'pointer' : 'default',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} style={{ padding: '15px 20px', fontSize: '14px', color: 'var(--text-main)', verticalAlign: 'middle' }}>
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete) && (
                                        <td style={{ padding: '15px 20px', textAlign: 'right', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                {onEdit && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                                                        style={{
                                                            padding: '6px 12px',
                                                            borderRadius: 'var(--radius-sm)',
                                                            backgroundColor: 'var(--primary-light)',
                                                            color: 'var(--primary-color)',
                                                            fontSize: '13px',
                                                            fontWeight: '500',
                                                            transition: 'background-color 0.2s',
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-color)'; e.currentTarget.style.color = '#fff'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-light)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onDelete(row); }}
                                                        style={{
                                                            padding: '6px 12px',
                                                            borderRadius: 'var(--radius-sm)',
                                                            backgroundColor: '#fee2e2',
                                                            color: '#ef4444',
                                                            fontSize: '13px',
                                                            fontWeight: '500',
                                                            transition: 'background-color 0.2s',
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Placeholder */}
            {data.length > 0 && (
                <div style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Showing {data.length} entries</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button style={{ padding: '6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'transparent', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
                            <ChevronLeft size={16} />
                        </button>
                        <button style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', fontSize: '13px' }}>1</button>
                        <button style={{ padding: '6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'transparent', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Table;
