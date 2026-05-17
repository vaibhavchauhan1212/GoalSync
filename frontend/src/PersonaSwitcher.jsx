// frontend/src/PersonaSwitcher.jsx
import React from 'react';

export default function PersonaSwitcher({ currentRole, setRole }) {
  return (
    <div style={{
      background: '#1e293b',
      color: '#fff',
      padding: '12px 20px',
      display: 'flex',
      gap: '15px',
      alignItems: 'center',
      borderBottom: '3px solid #3b82f6',
      fontFamily: 'sans-serif',
      justifyContent: 'space-between'
    }}>
      <div>
        <strong style={{ color: '#3b82f6', marginRight: '8px' }}>🤖 ATOMQUEST DEMO MODE:</strong>
        <span>Switch viewpoints instantly to show end-to-end user journeys.</span>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setRole('Employee')} 
          style={{
            background: currentRole === 'Employee' ? '#2563eb' : '#475569',
            padding: '6px 12px',
            border: 'none',
            color: '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🧑‍💻 Employee View
        </button>
        <button 
          onClick={() => setRole('Manager')} 
          style={{
            background: currentRole === 'Manager' ? '#2563eb' : '#475569',
            padding: '6px 12px',
            border: 'none',
            color: '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          💼 Manager (L1) View
        </button>
        <button 
          onClick={() => setRole('Admin')} 
          style={{
            background: currentRole === 'Admin' ? '#2563eb' : '#475569',
            padding: '6px 12px',
            border: 'none',
            color: '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          👑 Admin / HR View
        </button>
      </div>
    </div>
  );
}