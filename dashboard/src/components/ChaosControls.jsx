import React, { useState } from 'react';
import { Play, AlertOctagon, RotateCcw } from 'lucide-react';

const ChaosControls = ({ systemState, setSystemState }) => {
  const [triggering, setTriggering] = useState(false);

  const triggerFailure = async (scenario) => {
    if (systemState !== 'healthy') return;
    
    setTriggering(true);
    try {
      const res = await fetch('http://localhost:8000/api/trigger_chaos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenario: scenario })
      });
      if (res.ok) {
        setSystemState('anomaly');
      }
    } catch (err) {
      console.error("Failed to trigger chaos via backend.", err);
    }
    setTriggering(false);
  };

  const resetSystem = async () => {
    try {
      await fetch('http://localhost:8000/api/reset', { method: 'POST' });
    } catch (err) {
      console.error("Failed to reset backend.", err);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <button 
        style={{
          background: systemState === 'healthy' ? 'rgba(255,0,127,0.1)' : 'rgba(255,255,255,0.05)',
          color: systemState === 'healthy' ? '#FF007F' : '#8A8F98',
          border: `1px solid ${systemState === 'healthy' ? '#FF007F' : 'transparent'}`,
          padding: '0.8rem 1.2rem',
          borderRadius: '8px',
          cursor: systemState === 'healthy' && !triggering ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
          transition: 'all 0.2s',
          boxShadow: systemState === 'healthy' ? '0 0 10px rgba(255,0,127,0.2)' : 'none'
        }}
        onClick={() => triggerFailure('payment_crash')}
        disabled={systemState !== 'healthy' || triggering}
      >
        <AlertOctagon size={18} />
        {triggering ? "Injecting..." : "Crash Payment Service"}
      </button>

      <button 
        style={{
          background: systemState === 'healthy' ? 'rgba(255,165,0,0.1)' : 'rgba(255,255,255,0.05)',
          color: systemState === 'healthy' ? '#FFA500' : '#8A8F98',
          border: `1px solid ${systemState === 'healthy' ? '#FFA500' : 'transparent'}`,
          padding: '0.8rem 1.2rem',
          borderRadius: '8px',
          cursor: systemState === 'healthy' && !triggering ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
          transition: 'all 0.2s',
          boxShadow: systemState === 'healthy' ? '0 0 10px rgba(255,165,0,0.2)' : 'none'
        }}
        onClick={() => triggerFailure('frontend_spike')}
        disabled={systemState !== 'healthy' || triggering}
      >
        <AlertOctagon size={18} />
        {triggering ? "Injecting..." : "Frontend Traffic Spike"}
      </button>

      <button 
        style={{
          background: 'rgba(0,240,255,0.1)',
          color: '#00F0FF',
          border: '1px solid #00F0FF',
          padding: '0.8rem 1.2rem',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
        }}
        onClick={resetSystem}
      >
        <RotateCcw size={18} />
        Reset Demo
      </button>

      <div style={{ 
        flex: 1, 
        padding: '1rem',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
         <h4 style={{ margin: 0, color: '#E2E8F0', fontSize: '0.9rem' }}>Demo Script Control</h4>
         <p style={{ margin: 0, fontSize: '0.8rem', color: '#8A8F98' }}>
           Clicking "Inject Failure" will initiate the automated AI RCA and auto-remediation demonstration pipeline directly calling the Python Backend.
         </p>
      </div>
    </div>
  );
};

export default ChaosControls;
