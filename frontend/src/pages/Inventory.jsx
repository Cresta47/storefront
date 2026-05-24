import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Package, 
  PlusCircle, 
  MapPin, 
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function Inventory() {
  const { products, outletStocks, selectedOutletId, outlets, addProduct, updateStock, tenant } = useStore();

  const [activeTab, setActiveTab] = useState('products'); // products, stock_allocations

  // Form States for New Product
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [uom, setUom] = useState('pcs');
  const [taxPercentage, setTaxPercentage] = useState('13.00');
  const [description, setDescription] = useState('');

  // Form State for Stock Adjustment
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustOutletId, setAdjustOutletId] = useState(selectedOutletId);
  const [adjustQty, setAdjustQty] = useState('');

  const activeOutlet = outlets.find(o => o.id === selectedOutletId);

  // Helper to get stock details
  const getStockRow = (productId, outletId) => {
    return outletStocks.find(s => s.productId === productId && s.outletId === outletId);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!name || !sku || !purchasePrice || !sellingPrice) return;

    const payload = {
      name,
      sku,
      barcode,
      purchase_price: parseFloat(purchasePrice),
      purchasePrice: parseFloat(purchasePrice),
      selling_price: parseFloat(sellingPrice),
      sellingPrice: parseFloat(sellingPrice),
      uom,
      tax_percentage: parseFloat(taxPercentage),
      taxPercentage: parseFloat(taxPercentage),
      description
    };

    addProduct(payload);

    // Reset Form
    setName('');
    setSku('');
    setBarcode('');
    setPurchasePrice('');
    setSellingPrice('');
    setUom('pcs');
    setTaxPercentage('13.00');
    setDescription('');
  };

  const handleAdjustStock = (e) => {
    e.preventDefault();
    if (!adjustProductId || !adjustOutletId || adjustQty === '') return;

    updateStock(parseInt(adjustProductId), parseInt(adjustOutletId), parseFloat(adjustQty));

    // Reset Form
    setAdjustProductId('');
    setAdjustQty('');
  };

  return (
    <div style={{ padding: '32px' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Inventory Catalog & Stock Levels</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Manage universal products, barcodes, and allocate balances per outlet
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', padding: '4px', borderRadius: '12px' }}>
          <button 
            className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px' }}
            onClick={() => setActiveTab('products')}
          >
            <Package size={14} /> Catalog List
          </button>
          <button 
            className={`btn ${activeTab === 'stock_allocations' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px' }}
            onClick={() => setActiveTab('stock_allocations')}
          >
            <MapPin size={14} /> Stock Allocations
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
        
        {/* Left Side: Dynamic Tab Render */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'products' ? (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Universal Product Records</h3>
              <div className="table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>SKU / Barcode</th>
                      <th>Cost Price</th>
                      <th>Selling Price</th>
                      <th>Tax %</th>
                      <th>UoM</th>
                      <th>Stock HQ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const hqStock = getStockRow(p.id, 1); // Main HQ stock count
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.name}</div>
                            {p.description && <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>{p.description}</div>}
                          </td>
                          <td>
                            <div style={{ color: 'var(--primary)', fontWeight: '500' }}>{p.sku}</div>
                            {p.barcode && <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>{p.barcode}</div>}
                          </td>
                          <td>{tenant.currency} {p.purchasePrice.toFixed(2)}</td>
                          <td style={{ fontWeight: '600' }}>{tenant.currency} {p.sellingPrice.toFixed(2)}</td>
                          <td>{p.taxPercentage}%</td>
                          <td style={{ textTransform: 'uppercase', fontSize: '12px', color: 'var(--text-secondary)' }}>{p.uom}</td>
                          <td>
                            <span className={`status-badge ${(hqStock?.quantity || 0) <= (hqStock?.lowStockThreshold || 0) ? 'warning' : 'active'}`}>
                              {hqStock ? hqStock.quantity : 0} {p.uom}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Outlet Quantities Mapping</h3>
              <div className="table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      {outlets.map(o => (
                        <th key={o.id}>{o.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: '600' }}>{p.name}</td>
                        {outlets.map(o => {
                          const stock = getStockRow(p.id, o.id);
                          const isLow = stock && stock.quantity <= stock.lowStockThreshold;
                          return (
                            <td key={o.id}>
                              <span 
                                style={{ 
                                  color: isLow ? 'var(--danger)' : 'var(--text-main)', 
                                  fontWeight: isLow ? '700' : '500',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {isLow && <AlertTriangle size={13} color="var(--warning)" />}
                                {stock ? stock.quantity : 0} {p.uom}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Operations Forms Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Add Product Form */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={18} color="var(--primary)" /> Add Generic Product
            </h3>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Corsair Vengeance RAM 16GB" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">SKU *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. RAM-COR-16G" 
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Barcode Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. 501234567890" 
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Purchase Price ({tenant.currency}) *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="0.00" 
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price ({tenant.currency}) *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="0.00" 
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Unit of Measure (UoM)</label>
                  <select 
                    className="form-control"
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="box">Boxes (box)</option>
                    <option value="liters">Liters (liters)</option>
                    <option value="meters">Meters (meters)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tax Rate (%)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Description</label>
                <textarea 
                  className="form-control" 
                  placeholder="Optional detail parameters..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  style={{ resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                <Sparkles size={16} /> Save Product to Catalog
              </button>
            </form>
          </div>

          {/* Quick Stock Adjustment Form */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={18} color="var(--success)" /> Manual Stock Audit
            </h3>
            <form onSubmit={handleAdjustStock}>
              <div className="form-group">
                <label className="form-label">Select Product</label>
                <select 
                  className="form-control"
                  value={adjustProductId}
                  onChange={(e) => setAdjustProductId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Catalog Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Target Outlet Location</label>
                  <select 
                    className="form-control"
                    value={adjustOutletId}
                    onChange={(e) => setAdjustOutletId(e.target.value)}
                    required
                  >
                    {outlets.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Set Quantity</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="0" 
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--success)', color: 'var(--success)' }}>
                Commit Stock Adjustment
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
