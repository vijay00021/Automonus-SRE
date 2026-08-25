import React from 'react';
import { Server, Database, ShoppingCart, UserCheck, HardDrive } from 'lucide-react';

const ServiceNode = ({ name, icon: Icon, isFailed, isRecovering }) => {
  let borderColor = 'rgba(255, 255, 255, 0.1)';
  let bgColor = 'rgba(255, 255, 255, 0.02)';
  let glow = 'none';

  if (isFailed) {
    borderColor = '#FF3366';
    bgColor = 'rgba(255, 51, 102, 0.1)';
    glow = '0 0 15px rgba(255, 51, 102, 0.4)';
  } else if (isRecovering) {
    borderColor = '#00BFFF';
    bgColor = 'rgba(0, 191, 255, 0.1)';
    glow = '0 0 15px rgba(0, 191, 255, 0.4)';
  } else {
    borderColor = '#00FF66';
  }

  return (
    <div style={{
      padding: '1rem',
      borderRadius: '12px',
      border: `1px solid ${borderColor}`,
      background: bgColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      minWidth: '100px',
      boxShadow: glow,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        padding: '0.8rem',
        borderRadius: '50%',
        color: isFailed ? '#FF3366' : isRecovering ? '#00BFFF' : '#E2E8F0'
      }}>
        <Icon size={24} />
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E2E8F0' }}>{name}</span>
      <span style={{ fontSize: '0.7rem', color: isFailed ? '#FF3366' : isRecovering ? '#00BFFF' : '#00FF66' }}>
        {isFailed ? 'CRASHLOOP' : isRecovering ? 'RESTARTING' : 'RUNNING'}
      </span>
    </div>
  );
};

const topologyStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2rem',
    padding: '1rem',
    position: 'relative'
  },
  row: {
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center',
    width: '100%'
  },
  line: {
    position: 'absolute',
    borderLeft: '2px dashed rgba(255,255,255,0.1)',
    zIndex: 0
  }
};

const TopologyMap = ({ systemState, failingNode }) => {
  const isAnomaly = systemState === 'anomaly' || systemState === 'rca';
  const isRecovering = systemState === 'remediation' || systemState === 'recovering';

  const paymentFailed = isAnomaly && failingNode === 'payment';
  const paymentRecovering = isRecovering && failingNode === 'payment';

  const frontendFailed = isAnomaly && failingNode === 'frontend';
  const frontendRecovering = isRecovering && failingNode === 'frontend';

  return (
    <div style={topologyStyles.container}>
      {/* Level 1: Ingress / Frontend */}
      <div style={{ ...topologyStyles.row, zIndex: 1 }}>
        <ServiceNode name="React Frontend" icon={UserCheck} isFailed={frontendFailed} isRecovering={frontendRecovering} />
      </div>

      {/* Level 2: Core Services */}
      <div style={{ ...topologyStyles.row, zIndex: 1 }}>
        <ServiceNode name="Cart Service" icon={ShoppingCart} isFailed={false} isRecovering={false} />
        <ServiceNode name="Payment Service" icon={HardDrive} isFailed={paymentFailed} isRecovering={paymentRecovering} />
        <ServiceNode name="Product Service" icon={Server} isFailed={false} isRecovering={false} />
      </div>

      {/* Level 3: Data layer */}
      <div style={{ ...topologyStyles.row, zIndex: 1 }}>
        <ServiceNode name="Order DB" icon={Database} isFailed={false} isRecovering={false} />
        <ServiceNode name="Payment DB" icon={Database} isFailed={paymentFailed} isRecovering={paymentRecovering} />
      </div>
    </div>
  );
};

export default TopologyMap;
