import React from 'react';
import { useStore } from '../store/useStore';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  ShoppingCart, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function Dashboard() {
  const { sales, expenses, selectedOutletId, outlets, products, outletStocks, tenant } = useStore();

  const activeOutlet = outlets.find(o => o.id === selectedOutletId);

  // Filter sales and expenses by selected outlet
  const outletSales = sales.filter(s => s.outletId === selectedOutletId);
  const outletExpenses = expenses.filter(e => e.outletId === selectedOutletId || e.outletId === null); // Global expenses are shown everywhere

  // Compute metrics
  const totalSalesVal = outletSales.reduce((sum, s) => sum + parseFloat(s.total), 0);
  const totalExpensesVal = outletExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  
  // Calculate cost of goods sold (COGS) mock for sales
  const cogsVal = outletSales.reduce((sum, s) => sum + parseFloat(s.subtotal) * 0.7, 0); // Mock COGS at 70% of subtotal
  const grossProfit = totalSalesVal - cogsVal;
  const netProfit = totalSalesVal - totalExpensesVal;

  // Find low stock items for this outlet
  const lowStockItems = outletStocks
    .filter(stock => stock.outletId === selectedOutletId && stock.quantity <= stock.lowStockThreshold)
    .map(stock => {
      const product = products.find(p => p.id === stock.productId);
      return {
        id: stock.id,
        name: product ? product.name : 'Unknown Product',
        sku: product ? product.sku : 'N/A',
        qty: stock.quantity,
        threshold: stock.lowStockThreshold
      };
    });

  // Prepare chart data (Monthly aggregated mock data)
  const chartData = [
    { name: 'Jan', sales: 48000, expenses: 15000 },
    { name: 'Feb', sales: 55000, expenses: 18000 },
    { name: 'Mar', sales: 62000, expenses: 22000 },
    { name: 'Apr', sales: 74000, expenses: 25000 },
    { name: 'May', sales: totalSalesVal, expenses: totalExpensesVal }
  ];

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Business Dashboard Overview</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Real-time operating analytics for **{activeOutlet?.name}**
          </p>
        </div>
        <div style={{ fontSize: '13px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '8px 16px', color: 'var(--text-secondary)' }}>
          Currency: <strong style={{ color: 'var(--text-main)' }}>{tenant.currency}</strong> | Default Tax Rate: <strong style={{ color: 'var(--text-main)' }}>{tenant.taxRate}%</strong>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Gross Sales */}
        <div className="glass-card">
          <div className="card-header-row">
            <span className="card-title">Gross Sales</span>
            <div className="card-icon-container primary">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="card-value">{tenant.currency} {totalSalesVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="card-trend up">
            <TrendingUp size={14} /> +12.4% vs last month
          </div>
        </div>

        {/* Total Expenses */}
        <div className="glass-card">
          <div className="card-header-row">
            <span className="card-title">Total Expenses</span>
            <div className="card-icon-container danger">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="card-value">{tenant.currency} {totalExpensesVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="card-trend down">
            <TrendingUp size={14} /> +4.2% (rent, logistics)
          </div>
        </div>

        {/* Net Profit */}
        <div className="glass-card">
          <div className="card-header-row">
            <span className="card-title">Net Profit</span>
            <div className="card-icon-container success">
              <DollarSign size={18} />
            </div>
          </div>
          <div className={`card-value ${netProfit >= 0 ? '' : 'text-danger'}`} style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {tenant.currency} {netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="card-trend up">
            <TrendingUp size={14} /> Net Margin is healthy
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card">
          <div className="card-header-row">
            <span className="card-title">Stock Status</span>
            <div className={`card-icon-container ${lowStockItems.length > 0 ? 'warning' : 'success'}`}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="card-value">{lowStockItems.length}</div>
          <div className="card-trend" style={{ color: lowStockItems.length > 0 ? 'var(--warning)' : 'var(--success)' }}>
            {lowStockItems.length > 0 ? 'Action items required' : 'Inventory levels stable'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Performance Visualization Graph */}
        <div className="glass-card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Financial Trend (Sales vs. Operating Expenses)</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
                <YAxis stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-panel)', 
                    borderColor: 'var(--border-glass)', 
                    color: 'var(--text-main)', 
                    borderRadius: '12px',
                    fontFamily: 'var(--font-main)'
                  }} 
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" name="Gross Sales" dataKey="sales" stroke="var(--primary)" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" name="Expenses" dataKey="expenses" stroke="var(--danger)" fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Warning Sidebar */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--warning)" /> Critical Low Stock Items
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lowStockItems.length === 0 ? (
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '14px' }}>All product counts are within optimal bounds.</p>
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    background: 'rgba(251, 191, 36, 0.05)',
                    border: '1px solid rgba(251, 191, 36, 0.15)',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>SKU: {item.sku}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: 'var(--text-secondary)' }}>
                    <span>Quantity: <strong style={{ color: 'var(--danger)' }}>{item.qty} pcs</strong></span>
                    <span>Threshold: <strong>{item.threshold} pcs</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Recent POS Invoices Checkouts</h3>
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Payment Mode</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Taxes</th>
                <th>Grand Total</th>
                <th>Checkout Date</th>
              </tr>
            </thead>
            <tbody>
              {outletSales.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No sales recorded for this outlet today. Launch the POS interface to check out clients.
                  </td>
                </tr>
              ) : (
                outletSales.map((sale) => (
                  <tr key={sale.id}>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{sale.invoiceNumber}</td>
                    <td style={{ textTransform: 'capitalize' }}>
                      <span className={`status-badge active`} style={{ background: 'rgba(192, 132, 252, 0.15)', color: 'var(--primary)' }}>{sale.paymentMethod}</span>
                    </td>
                    <td>{tenant.currency} {sale.subtotal.toFixed(2)}</td>
                    <td style={{ color: 'var(--danger)' }}>-{tenant.currency} {sale.discount.toFixed(2)}</td>
                    <td>{tenant.currency} {sale.taxAmount.toFixed(2)}</td>
                    <td style={{ fontWeight: '700' }}>{tenant.currency} {sale.total.toFixed(2)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(sale.createdAt).toLocaleDateString()} {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
