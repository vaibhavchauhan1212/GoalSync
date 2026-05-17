// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import PersonaSwitcher from "./PersonaSwitcher";

export default function App() {
  const [currentRole, setRole] = useState('Employee');
  const [adminStats, setAdminStats] = useState({ totalEligible: 1240, submitted: 0, approved: 0, pending: 0 });

  // 🔐 Authentication & Session Tracking Hooks
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  
  // State to hold the list of goals an employee is building/tracking (Includes a Shared Departmental KPI)
  const [goals, setGoals] = useState([
    { title: 'Increase Platform Speed', thrustArea: 'Infrastructure', uom: 'Percentage', direction: 'Min', target: '25', weightage: 30, actual: '0', status: 'Not Started', isShared: false },
    { title: 'Reduce Server Turnaround Time (TAT)', thrustArea: 'Operations', uom: 'Numeric', direction: 'Max', target: '200', weightage: 20, actual: '200', status: 'Not Started', isShared: false },
    { title: 'Corporate Cyber-Security Compliance Audit', thrustArea: 'Security', uom: 'Zero-based', direction: 'Min', target: '0', weightage: 10, actual: '0', status: 'Not Started', isShared: true }
  ]);
  // 📑 Live database lifecycle state
  const [submissionStatus, setSubmissionStatus] = useState("Pending L1 Review");

  // Fetch data dynamically from MongoDB Atlas
  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        if (currentRole === 'Manager') {
          const response = await fetch('http://localhost:5000/api/auth/login');
          const result = await response.json();
          if (result.status === "success" && result.data) {
            setGoals(result.data.goals);
            if (result.data.status) {
              setSubmissionStatus(result.data.status);
            }
          }
        } else if (currentRole === 'Admin') {
          const response = await fetch('http://localhost:5000/api/auth/login');
          const result = await response.json();
          if (result.status === "success" && result.data) {
            setAdminStats(result.data);
          }
        }
      } catch (error) {
        console.error("Error loading cloud database records:", error);
      }
    };

    fetchCloudData();
  }, [currentRole]); 

  // Input states for creating a new goal
  const [newTitle, setNewTitle] = useState('');
  const [newThrust, setNewThrust] = useState('Infrastructure');
  const [newUom, setNewUom] = useState('Numeric');
  const [newDirection, setNewDirection] = useState('Min'); 
  const [newTarget, setNewTarget] = useState('');
  const [newWeight, setNewWeight] = useState(10);

  // Helper calculation parameters
  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);
  const goalCount = goals.length;

  // 📐 SYSTEM-COMPUTED PROGRESS SCORES (Strictly adheres to Section 2.2 BRD Formulas)
  const calculateProgressScore = (g) => {
    const target = parseFloat(g.target) || 0;
    const actual = parseFloat(g.actual) || 0;
    if (target === 0) return 0;

    if (g.uom === 'Zero-based') {
      return actual === 0 ? 100 : 0; 
    }
    
    if (g.uom === 'Timeline') {
      return g.status === 'Completed' ? 100 : g.status === 'On Track' ? 50 : 0;
    }

    if (g.direction === 'Max') {
      if (actual === 0) return 0;
      return Math.min(Math.round((target / actual) * 100), 100);
    }

    return Math.min(Math.round((actual / target) * 100), 100);
  };

  // 📊 CSV Export Engine (Fulfills Section 4: Achievement Report Requirement)
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Goal Title,Thrust Area,UoM,Direction,Target,Actual Achievement,Status,Progress Score,Weightage\n";
    
    goals.forEach(g => {
      const score = calculateProgressScore(g);
      csvContent += `"${g.title}","${g.thrustArea}","${g.uom}","${g.direction === 'Min' ? 'Higher is Better' : 'Lower is Better'}","${g.target}","${g.actual || 0}","${g.status}","${score}%","${g.weightage}%"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GoalSync_Achievement_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return alert("Please fill out Title and Target fields.");
    if (goalCount >= 8) return alert("Constraint Violation: Max 8 goals reached.");

    const freshGoal = {
      title: newTitle,
      thrustArea: newThrust,
      uom: newUom,
      direction: newDirection,
      target: newTarget,
      weightage: parseInt(newWeight),
      actual: '0',
      status: 'Not Started',
      isShared: false
    };

    setGoals([...goals, freshGoal]);
    setNewTitle('');
    setNewTarget('');
    setNewWeight(10);
  };

  const handleRemoveGoal = (index) => {
    // Shared KPIs pushed by Admin cannot be deleted by employees
    if (goals[index].isShared) {
      return alert("Governance Restriction: Mandated corporate shared KPIs cannot be deleted from individual sheets.");
    }
    const updated = goals.filter((_, i) => i !== index);
    setGoals(updated);
  };

 const handleFinalSubmit = async () => {
    try {
      // Added /api/goals/submit to the URL string below:
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals })
      });
      const data = await response.json();
      alert(data.message);
    } catch (err) {
      alert("Error connecting to backend server.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
      
      {!isAuthenticated ? (
        /* 🔒 SECURE LOGIN PANEL VIEW */
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <span style={{ fontSize: '40px' }}>🎯</span>
              <h2 style={{ margin: '10px 0 5px 0', color: '#0f172a' }}>Welcome to GoalSync</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Sign in to manage your performance cycles</p>
            </div>

            {loginError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '15px', fontWeight: '500' }}>
                ❌ {loginError}
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoginError('');
              try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(loginCredentials)
                });
                const result = await response.json();
                
                if (result.status === 'success') {
                  setIsAuthenticated(true);
                  setCurrentUserInfo(result.user);
                  setRole(result.user.role); 
                } else {
                  setLoginError(result.message);
                }
              } catch (err) {
                setLoginError("Cannot connect to authorization cluster backend server.");
              }
            }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Username</label>
                <input type="text" value={loginCredentials.username} onChange={(e) => setLoginCredentials({...loginCredentials, username: e.target.value})} style={{ width: '94%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Password</label>
                <input type="password" value={loginCredentials.password} onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})} style={{ width: '94%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>Sign In Securely</button>
            </form>
          </div>
        </div>
      ) : (
        /* 🔓 AUTHORIZED APPLICATION DASHBOARD WORKSPACE */
        <>
          {currentUserInfo?.role === 'Admin' && (
            <PersonaSwitcher currentRole={currentRole} setRole={setRole} />
          )}

          <nav style={{ background: '#fff', padding: '15px 30px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: '#0f172a' }}>🎯 GoalSync Portal</h2>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <button onClick={exportToCSV} style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>📥 Export CSV Report</button>
              <div style={{ background: '#e2e8f0', padding: '6px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Dashboard: {currentRole}</div>
            </div>
          </nav>

          {/* 📅 SECTION 2.3: ENFORCED GOVERNANCE TIMELINE BANNER */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 25px', borderRadius: '8px', margin: '0 30px 25px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>📆</span>
              <span style={{ fontSize: '14px', color: '#1e40af', fontWeight: '500' }}>
                Active Governance Window: <strong>Phase 1 — Goal Setting & Approval (Cycle Launch: 1st May)</strong> [cite: 37]
              </span>
            </div>
            <span style={{ fontSize: '12px', background: '#3b82f6', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>Next Up: Q1 Progress Review (July) [cite: 37]</span>
          </div>

          <main style={{ padding: '0 30px 30px 30px' }}>
            {currentRole === 'Employee' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* PHASE 1: Goal Creation Workspace */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px', alignItems: 'start' }}>
                  <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0, color: '#2563eb', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Create New Goal</h3>
                    <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                      <label>
                        <strong style={{ display: 'block', marginBottom: '5px' }}>Goal Title</strong>
                        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g., Optimize API endpoints" style={{ width: '95%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
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
                          <strong>UoM Type</strong>
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
                          <strong>Metric Rule Direction</strong>
                          <select value={newDirection} onChange={(e) => setNewDirection(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '5px' }}>
                            <option value="Min">Higher is Better (e.g. Sales)</option>
                            <option value="Max">Lower is Better (e.g. TAT / Cost)</option>
                          </select>
                        </label>
                        <label style={{ flex: 1 }}>
                          <strong>Target Value</strong>
                          <input type="text" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} placeholder="e.g., 90" style={{ width: '90%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '5px' }} />
                        </label>
                        <label style={{ flex: 1 }}>
                          <strong>Weightage (%)</strong>
                          <input type="number" min="1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} style={{ width: '90%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '5px' }} />
                        </label>
                      </div>
                      <button type="submit" disabled={goalCount >= 8} style={{ background: goalCount >= 8 ? '#cbd5e1' : '#2563eb', color: '#fff', padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>➕ Add Goal Sheet Row</button>
                    </form>
                  </div>

                  <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ marginTop: 0, color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Current Goal Sheet Draft</h3>
                      <div style={{ display: 'flex', gap: '15px', margin: '15px 0' }}>
                        <div style={{ flex: 1, padding: '10px', borderRadius: '8px', background: totalWeightage === 100 ? '#dcfce7' : '#fef3c7', textAlign: 'center' }}>
                          <strong style={{ fontSize: '18px', color: totalWeightage === 100 ? '#15803d' : '#b45309' }}>{totalWeightage}% / 100%</strong>
                        </div>
                        <div style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#f1f5f9', textAlign: 'center' }}>
                          <strong style={{ fontSize: '18px', color: '#0f172a' }}>{goalCount} / 8 Max</strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {goals.map((g, index) => (
                          <div key={index} style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: g.isShared ? '#f8fafc' : '#ffffff', borderLeft: g.isShared ? '4px solid #0284c7' : '1px solid #e2e8f0' }}>
                            <div>
                              <strong style={{ color: '#334155' }}>
                                {g.title} {g.isShared && <span style={{ fontSize: '11px', background: '#bae6fd', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>📢 Shared KPI</span>}
                              </strong>
                              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{g.thrustArea} • Target: {g.target} ({g.uom}) • <small style={{color:'#0369a1'}}>{g.direction === 'Min' ? 'Higher is Better' : 'Lower is Better'}</small></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontWeight: 'bold', background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>{g.weightage}%</span>
                              <button onClick={() => handleRemoveGoal(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={handleFinalSubmit} disabled={totalWeightage !== 100 || goalCount > 8} style={{ width: '100%', padding: '12px', background: (totalWeightage === 100 && goalCount <= 8) ? '#16a34a' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', marginTop: '15px' }}>🚀 Submit Goal Sheet for L1 Review</button>
                  </div>
                </div>

                {/* PHASE 2: Live Achievement Tracking Workspace */}
                <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ marginTop: 0, color: '#ea580c', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>⏱️ Phase 2 — Quarterly Achievement Tracking Workspace</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    {goals.map((g, index) => (
                      <div key={index} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '20px', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#1e293b', display: 'block' }}>{g.title}</strong>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Planned Target: <strong>{g.target} ({g.uom})</strong> | Calculation: <strong>{g.direction === 'Min' ? 'Higher is Better' : 'Lower is Better'}</strong></span>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Actual Achievement</label>
                          <input type="text" value={g.actual || '0'} onChange={(e) => { const updated = [...goals]; updated[index].actual = e.target.value; setGoals(updated); }} style={{ width: '80%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Progress Status</label>
                          <select value={g.status || 'Not Started'} onChange={(e) => { const updated = [...goals]; updated[index].status = e.target.value; setGoals(updated); }} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                            <option value="Not Started">Not Started</option>
                            <option value="On Track">On Track</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Computed Score</span>
                          <strong style={{ fontSize: '18px', color: '#2563eb' }}>{calculateProgressScore(g)}%</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleFinalSubmit} style={{ marginTop: '20px', padding: '12px 24px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>💾 Save Live Quarterly Progress Logs</button>
                </div>

              </div>
            )}

            {currentRole === 'Manager' && (
              <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#059669' }}>💼 Manager Approval Console & Check-in Desk</h3>
                    <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Reviewing pending submission for: <strong>Vaibhav Chauhan (ID: 23SCSE1010681)</strong></p>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>Status: {submissionStatus}</span>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px' }}>Goal Title</th>
                      <th style={{ padding: '12px' }}>Model</th>
                      <th style={{ padding: '12px' }}>Planned Target</th>
                      <th style={{ padding: '12px' }}>Actual Progress</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Computed Score</th>
                      <th style={{ padding: '12px', width: '120px' }}>Weightage (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goals.map((g, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>
                          {g.title} {g.isShared && <small style={{color:'#0284c7', display:'block'}}>📢 Pushed Shared KPI (Target Locked) [cite: 25]</small>}
                        </td>
                        <td style={{ padding: '12px', fontSize:'13px', color:'#0369a1' }}>{g.direction === 'Min' ? 'Higher is Better' : 'Lower is Better'}</td>
                        <td style={{ padding: '12px' }}>
                          {/* Target and title are read-only for employees/recipients under Section 2.1 */}
                          <input 
                            type="text" 
                            value={g.target} 
                            disabled={g.isShared} 
                            onChange={(e) => { const updated = [...goals]; updated[index].target = e.target.value; setGoals(updated); }} 
                            style={{ width: '80px', padding: '4px', border: g.isShared ? 'none' : '1px solid #cbd5e1', background: g.isShared ? 'transparent' : '#fff' }} 
                          />
                        </td>
                        <td style={{ padding: '12px', color: '#ea580c', fontWeight: 'bold' }}>{g.actual || '0'}</td>
                        <td style={{ padding: '12px' }}><span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: g.status === 'Completed' ? '#dcfce7' : '#fef3c7', color: g.status === 'Completed' ? '#16a34a' : '#d97706' }}>{g.status || 'Not Started'}</span></td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#2563eb' }}>{calculateProgressScore(g)}%</td>
                        <td style={{ padding: '12px' }}>
                          <input type="number" value={g.weightage} onChange={(e) => { const updated = [...goals]; updated[index].weightage = parseInt(e.target.value) || 0; setGoals(updated); }} style={{ width: '70px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                  <button onClick={async () => {
                    const response = await fetch('https://rockslide-user-sureness.ngrok-free.dev', { method: 'POST' });
                    const result = await response.json();
                    if (result.status === "success") {
                      alert("🛡️ Milestone Secured: Goal sheet verified and approved inside MongoDB Atlas Cloud!");
                      window.location.reload(); 
                    }
                  }} style={{ padding: '10px 20px', background: '#059669', border: 'none', borderRadius: '6px', fontWeight: 'bold', color: '#fff', cursor: 'pointer' }}>🛡️ Approve & Lock Milestone</button>
                </div>
              </div>
            )}

            {currentRole === 'Admin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>
                  <div style={{ borderRight: '2px solid #f1f5f9', paddingRight: '20px' }}>
                    <h3 style={{ marginTop: 0, color: '#7c3aed' }}>👑 HR Governance Desk</h3>
                    <span style={{ background: '#dcfce7', color: '#16a34a', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>🟢 WINDOW OPEN</span>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 15px 0', color: '#334155' }}>Corporate Cycle Submission Analytics (Q2)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
                      <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Total Eligible</span><strong style={{ fontSize: '24px', color: '#0f172a' }}>{adminStats.totalEligible}</strong></div>
                      <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Saved Sheets</span><strong style={{ fontSize: '24px', color: '#0f172a' }}>{adminStats.submitted}</strong></div>
                      <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Approved</span><strong style={{ fontSize: '24px', color: '#059669' }}>{adminStats.approved}</strong></div>
                      <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Escalations</span><strong style={{ fontSize: '24px', color: '#b45309' }}>{adminStats.pending}</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}