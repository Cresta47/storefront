import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Receipt, 
  PlusCircle, 
  Image, 
  MapPin, 
  Trash,
  Sparkles,
  PieChart
} from 'lucide-react';

export default function Expenses() {
  const { expenses, expenseCategories, selectedOutletId, outlets, addExpense, tenant } = useStore();

  // Form States
  const [categoryId, setCategoryId] = useState('');
  const [outletIdInput, setOutletIdInput] = useState(String(selectedOutletId)); // Default to active outlet
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [receiptSimulated, setReceiptSimulated] = useState(false);

  const activeOutlet = outlets.find(o => o.id === selectedOutletId);

  // Filter expenses matching selected outlet (or global expenses)
  const filteredExpenses = expenses.filter(e => 
    e.outletId === selectedOutletId || e.outletId === null
  );

  // Aggregate expenses by category for metrics
  const categoryTotals = expenseCategories.map(cat => {
    const total = filteredExpenses
      .filter(e => e.categoryId === cat.id)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    return { ...cat, total };
  });

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!categoryId || !amount || !expenseDate) return;

    const payload = {
      categoryId: parseInt(categoryId),
      outletId: outletIdInput === 'global' ? null : parseInt(outletIdInput),
      amount: parseFloat(amount),
      expenseDate,
      notes,
      receiptPath: receiptSimulated ? '/uploads/receipts/mock_invoice.png' : null
    };

    addExpense(payload);

    // Reset Form
    setCategoryId('');
    setAmount('');
    setNotes('');
    setReceiptSimulated(false);
  };

  return (
    <div style={{ padding: '32px' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Business Expenses & Operating Outflow</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Record non-inventory expenses and allocate expenses to specific locations
        </p>
      </div>

      {/* Category Breakdowns row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {categoryTotals.map(cat => (
          <div key={cat.id} className="glass-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '500', marginBottom: '6px' }}>
              {cat.name}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-main)' }}>
              {tenant.currency} {cat.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {cat.description}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
        
        {/* Expenses List */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Expense Ledger Logs</h3>
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Scope / Outlet</th>
                  <th>Description Notes</th>
                  <th>Amount</th>
                  <th>Receipt</th>
                  <th>Logged Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No expenses logged under this branch location context.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => {
                    const cat = expenseCategories.find(c => c.id === exp.categoryId);
                    const outletName = exp.outletId 
                      ? outlets.find(o => o.id === exp.outletId)?.name 
                      : 'Global Corporate';
                    return (
                      <tr key={exp.id}>
                        <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{cat ? cat.name : 'Unassigned'}</td>
                        <td>
                          <span className="status-badge active" style={{ background: exp.outletId ? 'rgba(52, 211, 153, 0.1)' : 'rgba(192, 132, 252, 0.1)', color: exp.outletId ? 'var(--success)' : 'var(--primary)' }}>
                            {outletName}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{exp.notes || 'N/A'}</td>
                        <td style={{ fontWeight: '700', color: 'var(--danger)' }}>
                          {tenant.currency} {exp.amount.toFixed(2)}
                        </td>
                        <td>
                          {exp.receiptPath ? (
                            <span style={{ fontSize: '11px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => alert('Opening attached receipt PDF in browser...')}>
                              View PDF
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>None</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{exp.expenseDate}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Logging Form */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={18} color="var(--primary)" /> Log New Expense Outflow
          </h3>
          
          <form onSubmit={handleAddExpense}>
            
            <div className="form-group">
              <label className="form-label">Expense Category *</label>
              <select 
                className="form-control"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">-- Choose Category --</option>
                {expenseCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Scope Allocation</label>
                <select 
                  className="form-control"
                  value={outletIdInput}
                  onChange={(e) => setOutletIdInput(e.target.value)}
                  required
                >
                  <option value="global">🏢 Global Corporate</option>
                  {outlets.map(o => (
                    <option key={o.id} value={o.id}>📍 {o.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount ({tenant.currency}) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Expense Execution Date *</label>
              <input 
                type="date" 
                className="form-control" 
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Receipt File Upload Simulator</label>
              <div 
                onClick={() => setReceiptSimulated(!receiptSimulated)}
                style={{
                  background: 'rgba(15, 17, 26, 0.4)',
                  border: receiptSimulated ? '2px dashed var(--primary)' : '2px dashed var(--border-glass)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: receiptSimulated ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Image size={24} />
                {receiptSimulated ? (
                  <span>✅ Receipt receipt_scan.png Captured!</span>
                ) : (
                  <span>Click to mock scan/upload expense invoice</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Expense Notes / Memo</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Log payment methods or terms..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
              <Sparkles size={16} /> Log Expense Ledger
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
