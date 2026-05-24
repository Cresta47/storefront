import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Settings as SettingsIcon, 
  MapPin, 
  CreditCard, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';

export default function Settings() {
  const { tenant, outlets, addOutlet, setTenant } = useStore();

  // Outlet Form States
  const [outletName, setOutletName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  // General Settings States
  const [storeName, setStoreName] = useState(tenant.name);
  const [currency, setCurrency] = useState(tenant.currency);
  const [taxRate, setTaxRate] = useState(String(tenant.taxRate));

  const handleAddOutlet = (e) => {
    e.preventDefault();
    if (!outletName || !address) return;

    addOutlet({
      name: outletName,
      address,
      phone,
      taxNumber
    });

    setOutletName('');
    setAddress('');
    setPhone('');
    setTaxNumber('');
  };

  const handleUpdateTenant = (e) => {
    e.preventDefault();
    setTenant({
      ...tenant,
      name: storeName,
      currency,
      taxRate: parseFloat(taxRate)
    });
    alert('Global store parameters updated successfully!');
  };

  const handleBuySubscription = () => {
    setTenant({
      ...tenant,
      subscriptionStatus: 'active',
      trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 Year extension
    });
    alert('Thank you! Your yearly StoreFlow SaaS subscription is now active ($149 / Year charge authorized). Dedicated MySQL isolated tenant database locks cleared.');
  };

  return (
    <div style={{ padding: '32px' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Global Store & Subscription Settings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Configure multi-outlet settings, update store parameters, and manage yearly licensing
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
        
        {/* Left Hand: Outlet Lists & Settings Modifiers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* General Store configuration */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SettingsIcon size={18} color="var(--primary)" /> Store Profile Configuration
            </h3>
            
            <form onSubmit={handleUpdateTenant} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Store Brand Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Base Currency Symbol</label>
                <select 
                  className="form-control"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="NPR">NPR (Rs.)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Store Tax % (VAT/GST)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary">
                  Update Store Settings
                </button>
              </div>
            </form>
          </div>

          {/* Outlets Listing Table */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--success)" /> Configured Outlet Locations
            </h3>
            
            <div className="table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Branch / Outlet Name</th>
                    <th>Full Address Location</th>
                    <th>Phone Contact</th>
                    <th>Tax Reg No</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {outlets.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{o.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{o.address}</td>
                      <td>{o.phone || 'N/A'}</td>
                      <td>{o.taxNumber || 'None'}</td>
                      <td>
                        <span className={`status-badge ${o.isActive ? 'active' : 'inactive'}`}>
                          {o.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Hand: Add Outlet form & Subscriptions info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Subscription Panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <CreditCard size={18} color="var(--primary)" /> Subscription Status
            </h3>

            {tenant.subscriptionStatus === 'trial' ? (
              <div 
                style={{ 
                  background: 'rgba(251, 191, 36, 0.05)', 
                  border: '1px solid rgba(251, 191, 36, 0.15)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--warning)', fontWeight: '600', marginBottom: '8px' }}>
                  <Sparkles size={16} /> 30-Day Free Trial Active
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Your trial is currently running. You have standard database privileges. Upgrade to a yearly subscription to avoid checkout interruptions.
                </p>
              </div>
            ) : (
              <div 
                style={{ 
                  background: 'rgba(52, 211, 153, 0.05)', 
                  border: '1px solid rgba(52, 211, 153, 0.15)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--success)', fontWeight: '600', marginBottom: '8px' }}>
                  <CheckCircle2 size={16} /> Standard Subscription Active
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Your yearly store license is active! Next automated billing charge will be processed in 365 days.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Licensing Tier:</span>
              <strong style={{ color: 'var(--primary)' }}>Universal Year Plan</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>SaaS Cost:</span>
              <strong>$149.00 / Year</strong>
            </div>

            {tenant.subscriptionStatus === 'trial' && (
              <button className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '4px' }} onClick={handleBuySubscription}>
                <Sparkles size={16} /> Activate Yearly License ($149)
              </button>
            )}

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
              <ShieldCheck size={14} /> Multi-tenant secure isolated MySQL connections active.
            </div>
          </div>

          {/* Add Outlet Form */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--primary)" /> Add New Outlet Location
            </h3>

            <form onSubmit={handleAddOutlet}>
              <div className="form-group">
                <label className="form-label">Outlet / Branch Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Kathmandu Civil Mall Store" 
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Physical Address Location *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Civil Mall 3rd Floor, Kathmandu" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Phone Contact Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. +977-1-4200000" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Local Tax Reg #</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. PAN-6002010" 
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--primary)', color: 'var(--primary)', marginTop: '8px' }}>
                Create Outlet Branch
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
