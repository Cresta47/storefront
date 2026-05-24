import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Receipt, 
  Settings, 
  Menu, 
  X, 
  Store, 
  Sparkles, 
  Lock, 
  LogOut 
} from 'lucide-react';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { tenant, outlets, selectedOutletId, setSelectedOutletId, user } = useStore();
  const navigate = useNavigate();

  // Calculate if trial is active
  const trialEnds = new Date(tenant.trialEndsAt);
  const daysLeft = Math.ceil((trialEnds - new Date()) / (1000 * 60 * 60 * 24));
  const isTrialExpired = daysLeft <= 0 && tenant.subscriptionStatus === 'trial';

  return (
    <div className="app-container">
      {/* 30-Day Free Trial Protection Lock Screen */}
      {isTrialExpired && (
        <div className="lock-overlay">
          <div className="glass-card lock-card">
            <div className="lock-icon">
              <Lock size={40} />
            </div>
            <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>Your 30-Day Trial Has Expired</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Your trial period for **{tenant.name}** ended. Unlock unlimited access, inventory controls, multiple outlets, and printing pipelines by renewing your yearly subscription today.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => alert('Redirecting to secure Stripe Billing Engine for yearly renewal...')}>
                <Sparkles size={18} /> Buy Subscription ($149 / Year)
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => navigate('/')}>
                Go to Landing Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Store size={26} color="var(--primary)" />
            {!collapsed && (
              <span>Store<span>Flow</span></span>
            )}
          </div>
          <button 
            className="no-print"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          <ul className="sidebar-menu">
            <li>
              <NavLink to="/" className={({ isActive }) => `menu-item-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                <span className="menu-text">Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/pos" className={({ isActive }) => `menu-item-link ${isActive ? 'active' : ''}`}>
                <ShoppingBag size={20} />
                <span className="menu-text">POS Terminal</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/products" className={({ isActive }) => `menu-item-link ${isActive ? 'active' : ''}`}>
                <Package size={20} />
                <span className="menu-text">Inventory Catalog</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/expenses" className={({ isActive }) => `menu-item-link ${isActive ? 'active' : ''}`}>
                <Receipt size={20} />
                <span className="menu-text">Expenses Logs</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={({ isActive }) => `menu-item-link ${isActive ? 'active' : ''}`}>
                <Settings size={20} />
                <span className="menu-text">SaaS Settings</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* User Context & Trial Countdown Indicator */}
        <div className="sidebar-footer" style={{ padding: '16px', borderTop: '1px solid var(--border-glass)' }}>
          {!collapsed && daysLeft > 0 && (
            <div 
              style={{
                background: 'rgba(192, 132, 252, 0.1)',
                border: '1px solid rgba(192, 132, 252, 0.2)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontWeight: '600', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Sparkles size={13} /> {daysLeft} Days Free Trial
              </div>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '11px' }}>Standard Year Plan ($149)</p>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: '#0c0214',
                fontSize: '14px'
              }}
            >
              {user.name.charAt(0)}
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        <header className="top-bar no-print">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px' }}>TENANT DOMAIN: {tenant.subdomain}.storeflow.io</span>
            <h1 style={{ fontSize: '18px', margin: 0, fontWeight: '700', letterSpacing: '0' }}>{tenant.name}</h1>
          </div>

          <div className="outlet-wrapper">
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Selected Outlet:</span>
            <select 
              className="outlet-select"
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(parseInt(e.target.value))}
            >
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name} {outlet.id === user.outletId ? '(Assigned)' : ''}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
