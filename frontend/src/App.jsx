// frontend/src/App.jsx
import React, { useState } from 'react';
import PersonaSwitcher from "./PersonaSwitcher";

export default function App() {
  const [currentRole, setRole] = useState('Employee');
  
  // State to hold the list of goals an employee is building
  const [goals, setGoals] = useState([
    { title: 'Increase Platform Speed', thrustArea: 'Infrastructure', uom: 'Percentage', target: '25', weightage: 30 },
    { title: 'Resolve Customer Tickets', thrustArea: 'Support', uom: 'Numeric', target: '150', weightage: 20 }
  ]);

  // Input states for creating a new individual goal
  const [newTitle, setNewTitle] = useState('');
  const [newThrust, setNewThrust] = useState('Infrastructure');
  const [newUom, setNewUom] = useState('Numeric');
  const [newTarget, setNewTarget] = useState('');
  const [newWeight, setNewWeight] = useState(10);

  // Validation Trackers
  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);
  const goalCount = goals.length;

  // Add a goal to local state array
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return alert("Please fill out Title and Target fields.");
    if (goalCount >= 8) return alert("Constraint Violation: Max 8 goals reached.");

    const freshGoal = {
      title: newTitle,
      thrustArea: newThrust,
      uom: newUom,
      target: newTarget,
      weightage: parseInt(newWeight)
    };

    setGoals([...goals, freshGoal]);
    // Reset entry fields
    setNewTitle('');
    setNewTarget('');
    setNewWeight(10);
  };

  // Remove a goal from the temporary layout list
  const handleRemoveGoal = (index) => {
    const updated = goals.filter((_, i) => i !== index);
    setGoals(updated);
  };

  // Mock Submit execution to talk to our node server
  const handleFinalSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/goals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals })
      });
      const data = await response.json();
      alert(data.message);
    } catch (err) {
      alert("Error connecting to backend server. Make sure node index.js is running.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
      <PersonaSwitcher currentRole={currentRole} setRole={setRole} />

      <nav style={{ background: '#fff', padding: '15px 30px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>🎯 GoalSync Portal</h2>
        <div style={{ background: '#e2e8f0', padding: '6px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>
          Current Dashboard: {currentRole}
        </div>
      </nav>

      <main style={{ padding: '30px' }}>
        {currentRole === 'Employee' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* LEFT COLUMN: Dynamic Entry Form */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: 0, color: '#2563eb', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Create New Goal</h3>
              
              <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <label>
                  <strong style={{ display: 'block', marginBottom: '5px' }}>Goal Title</strong>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g., Redesign internal landing interface" style={{ width: '95%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </label>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <label style={{ flex: 1 }}>
                    <strong>Thrust Area</strong>
                    <select value={newThrust} onChange={(e) => setNewThrust(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '5px' }}>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Support">Support</option>
                      <option value="Security">Security</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </label>

                  <label style={{ flex: 1 }}>
                    <strong>Unit of Measurement (UoM)</strong>
                    <select value={newUom} onChange={(e) => setNewUom(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '5px' }}>
                      <option value="Numeric">Numeric</option>
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Timeline">Timeline</option>
                      <option value="Zero-based">Zero-based</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <label style={{ flex: 1 }}>
                    <strong>Target Metric Value</strong>
                    <input type="text" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} placeholder="e.g., 99.9 or 2026-12-31" style={{ width: '90%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '5px' }} />
                  </label>

                  <label style={{ flex: 1 }}>
                    <strong>Weightage (%)</strong>
                    <input type="number" min="1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} style={{ width: '90%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '5px' }} />
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Min 10% target per goal</span>
                  </label>
                </div>

                <button type="submit" disabled={goalCount >= 8} style={{ background: goalCount >= 8 ? '#cbd5e1' : '#2563eb', color: '#fff', padding: '10px', border: 'none', borderRadius: '6px', cursor: goalCount >= 8 ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                  {goalCount >= 8 ? 'Goal Capacity Reached (Max 8)' : '➕ Add Goal Sheet Row'}
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: Active Goal Sheets Review & Dynamic Rule Checkers */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ marginTop: 0, color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Current Goal Sheet Draft</h3>
                
                {/* SYSTEM ENFORCED METRIC VISUAL COUNTERS */}
                <div style={{ display: 'flex', gap: '15px', margin: '15px 0' }}>
                  <div style={{ flex: 1, padding: '10px', borderRadius: '8px', background: totalWeightage === 100 ? '#dcfce7' : '#fef3c7', border: totalWeightage === 100 ? '1px solid #22c55e' : '1px solid #f59e0b', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '12px', color: '#475569' }}>Total Weightage</span>
                    <strong style={{ fontSize: '20px', color: totalWeightage === 100 ? '#15803d' : '#b45309' }}>{totalWeightage}% / 100%</strong>
                  </div>

                  <div style={{ flex: 1, padding: '10px', borderRadius: '8px', background: goalCount <= 8 ? '#f1f5f9' : '#fee2e2', border: goalCount <= 8 ? '1px solid #cbd5e1' : '1px solid #ef4444', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '12px', color: '#475569' }}>Goal Sheet Count</span>
                    <strong style={{ fontSize: '20px', color: '#0f172a' }}>{goalCount} / 8 Max</strong>
                  </div>
                </div>

                {/* DYNAMIC LIST ENGINE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                  {goals.map((g, index) => (
                    <div key={index} style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: g.weightage < 10 ? '#fff1f2' : '#fafafa' }}>
                      <div>
                        <strong style={{ display: 'block', color: '#334155' }}>{g.title}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{g.thrustArea} • UoM: {g.uom} • Target: {g.target}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 'bold', background: g.weightage < 10 ? '#f43f5e' : '#e2e8f0', color: g.weightage < 10 ? '#fff' : '#334155', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>
                          {g.weightage}%
                        </span>
                        <button onClick={() => handleRemoveGoal(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                  {goals.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No goals drafted yet. Use the left form panel.</p>}
                </div>
              </div>

              {/* ACTION SUBMIT BUTTON TRIGGER */}
              <button onClick={handleFinalSubmit} disabled={totalWeightage !== 100 || goalCount > 8} style={{ width: '100%', padding: '12px', background: (totalWeightage === 100 && goalCount <= 8) ? '#16a34a' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '6px', cursor: (totalWeightage === 100 && goalCount <= 8) ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '15px', marginTop: '15px' }}>
                🚀 Submit Goal Sheet for L1 Review
              </button>
            </div>

          </div>
        )}

        {currentRole === 'Manager' && (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: '#059669' }}>💼 Manager Approval Console</h3>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Reviewing pending submission for: <strong>Vaibhav Chauhan (ID: 23SCSE1010681)</strong></p>
        </div>
        <span style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
          Status: Pending L1 Review
        </span>
      </div>

      {/* INLINE WEIGHTAGE ADJUSTMENT TABLE */}
      <h4 style={{ color: '#334155', marginBottom: '10px' }}>Submitted Goal Dimensions & Weightage Overrides</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
        <thead>
          <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '12px' }}>Goal Title</th>
            <th style={{ padding: '12px' }}>Thrust Area</th>
            <th style={{ padding: '12px' }}>Target Metric</th>
            <th style={{ padding: '12px', width: '150px' }}>Weightage (%)</th>
          </tr>
        </thead>
        <tbody>
          {goals.map((g, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px', fontWeight: '500' }}>{g.title}</td>
              <td style={{ padding: '12px' }}><span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>{g.thrustArea}</span></td>
              <td style={{ padding: '12px', color: '#475569' }}>{g.target} ({g.uom})</td>
              <td style={{ padding: '12px' }}>
                <input 
                  type="number" 
                  value={g.weightage} 
                  onChange={(e) => {
                    const updated = [...goals];
                    updated[index].weightage = parseInt(e.target.value) || 0;
                    setGoals(updated);
                  }}
                  style={{ width: '70px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* METRIC INTEGRITY CHECKER FOR MANAGER */}
      <div style={{ background: totalWeightage === 100 ? '#f0fdf4' : '#fff1f2', padding: '15px', borderRadius: '8px', border: totalWeightage === 100 ? '1px solid #bbf7d0' : '1px solid #fecdd3', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong style={{ color: totalWeightage === 100 ? '#16a34a' : '#df1c1c' }}>
            {totalWeightage === 100 ? '✅ Total Weightage Balance Intact' : '⚠️ Weightage Balance Error'}
          </strong>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
            Manager modifications must still maintain a cumulative total of exactly 100%. Current total: <strong>{totalWeightage}%</strong>
          </p>
        </div>
      </div>

      {/* FORMULATION OF DISCUSSIONS & COMMENTS LOG */}
      <label style={{ display: 'block', marginBottom: '20px' }}>
        <strong style={{ display: 'block', marginBottom: '8px', color: '#334155' }}>L1 Reviewer Discussion Comments / Feedback Log</strong>
        <textarea 
          rows="4" 
          placeholder="Enter audit trail comments regarding alignment modifications or target thresholds..." 
          style={{ width: '98%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'sans-serif' }}
        />
      </label>

      {/* FINAL ACTION TRIGGER CONSOLE */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => alert("Goal sheet sent back to employee for revision.")}
          style={{ padding: '10px 20px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}
        >
          ↩️ Return for Revision
        </button>
        <button 
          disabled={totalWeightage !== 100}
          onClick={() => alert(`Goal sheet approved successfully with a final weightage profile of ${totalWeightage}%!`)}
          style={{ padding: '10px 20px', background: totalWeightage === 100 ? '#059669' : '#cbd5e1', border: 'none', borderRadius: '6px', cursor: totalWeightage === 100 ? 'pointer' : 'not-allowed', fontWeight: 'bold', color: '#fff' }}
        >
          🛡️ Approve & Lock Milestone
        </button>
      </div>
    </div>
  )}

        {currentRole === 'Admin' && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* ROW 1: GLOBAL CONTROL SETTINGS */}
      <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>
        <div style={{ borderRight: '2px solid #f1f5f9', paddingRight: '20px' }}>
          <h3 style={{ marginTop: 0, color: '#7c3aed' }}>👑 HR Governance Desk</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Global lifecycle orchestration parameters for corporate performance management cycles.</p>
          
          <div style={{ marginTop: '20px' }}>
            <strong>Goal Window Status</strong>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <span style={{ background: '#dcfce7', color: '#16a34a', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>🟢 WINDOW OPEN</span>
            </div>
            <button onClick={() => alert("Global submission cycle locked. System status set to Read-Only.")} style={{ marginTop: '12px', width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
              🔒 Emergency Freeze Cycle
            </button>
          </div>
        </div>

        {/* METRICS & TRACKING COUNTERS */}
        <div>
          <h4 style={{ margin: '0 0 15px 0', color: '#334155' }}>Corporate Cycle Submission Analytics (Q2)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Total Eligible Staff</span>
              <strong style={{ fontSize: '24px', color: '#0f172a' }}>1,240</strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Approved Sheets</span>
              <strong style={{ fontSize: '24px', color: '#059669' }}>842 <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#64748b' }}>(67.9%)</span></strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Pending Escalations</span>
              <strong style={{ fontSize: '24px', color: '#b45309' }}>14</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: SECURITY LOGS AUDIT TRAIL */}
      <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#334155' }}>🔒 Real-Time System Audit Trail (Security & Rule Override Logs)</h4>
        <div style={{ background: '#0f172a', color: '#38bdf8', fontFamily: 'monospace', padding: '15px', borderRadius: '8px', fontSize: '13px', lineHeight: '1.6', maxHeight: '180px', overflowY: 'auto' }}>
          <div>[2026-05-17 10:42:11] - SUCCESS: Connection established from frontend port 5173 to API endpoint.</div>
          <div>[2026-05-17 10:45:04] - INBOUND: Payload submission initiated for Employee ID 23SCSE1010681.</div>
          <div>[2026-05-17 10:45:05] - PASS: validateGoals middleware checked 3 rows. Weight sum checks out at 100%.</div>
          <div style={{ color: '#4ade80' }}>[2026-05-17 10:45:05] - SECURE LOCK: Document signature stored. Write permissions revoked for client.</div>
        </div>
      </div>

    </div>
  )}
      </main>
    </div>
  );
}