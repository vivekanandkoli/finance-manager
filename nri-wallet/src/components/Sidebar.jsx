import React, { useState } from 'react';

const Sidebar = ({ currentView, setCurrentView }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'add expense', label: 'Add Expense', icon: '➕' },
    { id: 'expense history', label: 'Expense History', icon: '📋' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'budgets', label: 'Budget Manager', icon: '💰' },
    { id: 'bills', label: 'Bills & Recurring', icon: '📅' },
    { id: 'investments', label: 'Investments', icon: '💼' },
    { id: 'loans', label: 'Loan Tracker', icon: '🏦' },
    { id: 'goals', label: 'Goal Tracker', icon: '🎯' },
    { id: 'currency', label: 'Currency Converter', icon: '💱' },
    { id: 'wealth report', label: 'Wealth Report', icon: '💎' },
    { id: 'import/export', label: 'Import/Export', icon: '📤' },
    { id: 'edit data', label: 'Data Manager', icon: '🗃️' },
  ];

  return (
    <aside 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{
        width: isCollapsed ? '80px' : '260px',
        minHeight: '100vh',
        height: '100vh',
        background: 'linear-gradient(180deg, #1a1f3a 0%, #0f1419 100%)',
        color: 'white',
        padding: '0',
        transition: 'width 0.3s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.2)'
      }}>
        {!isCollapsed ? (
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px'
            }}>
              💰 Finance Manager
            </h2>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '11px',
              color: '#94a3b8',
              fontWeight: '500'
            }}>
              Vivek's Dashboard
            </p>
          </div>
        ) : (
          <div style={{ 
            fontSize: '24px', 
            textAlign: 'center',
            filter: 'grayscale(0.3)'
          }}>
            💰
          </div>
        )}
      </div>

      {/* Menu Items - Scrollable */}
      <div style={{
        flex: '1',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '16px 0',
        paddingBottom: '100px' // Space for user profile
      }}>
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              style={{
                width: '100%',
                padding: isCollapsed ? '16px 0' : '12px 20px',
                background: isActive 
                  ? 'linear-gradient(90deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%)'
                  : 'transparent',
                border: 'none',
                borderLeft: isActive ? '4px solid #667eea' : '4px solid transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <span style={{ 
                fontSize: '18px',
                marginLeft: isCollapsed ? '0' : '0',
                width: isCollapsed ? '100%' : 'auto',
                textAlign: isCollapsed ? 'center' : 'left',
                filter: isActive ? 'none' : 'grayscale(0.3) opacity(0.8)'
              }}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span style={{ 
                  flex: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.label}
                </span>
              )}
              {!isCollapsed && isActive && (
                <span style={{
                  fontSize: '18px',
                  opacity: 0.5
                }}>→</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer - User Profile (Fixed at bottom) */}
      {!isCollapsed && (
        <div style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          width: '260px',
          padding: '16px 20px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 50%)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              VK
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#ffffff'
              }}>
                Vivek Koli
              </p>
              <p style={{ 
                fontSize: '11px', 
                color: '#94a3b8',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                vivek@finance.com
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'absolute',
          top: '28px',
          right: '-12px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '2px solid #0f1419',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 10,
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isCollapsed ? '→' : '←'}
      </button>
    </aside>
  );
};

export default Sidebar;
