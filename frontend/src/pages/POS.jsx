import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { 
  ShoppingCart, 
  Trash2, 
  Printer, 
  Search, 
  Barcode, 
  Sparkles, 
  Plus, 
  Minus,
  CheckCircle
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export default function POS() {
  const { 
    products, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQty, 
    clearCart, 
    processSale, 
    tenant,
    selectedOutletId,
    outlets,
    outletStocks
  } = useStore();

  const [search, setSearch] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [notes, setNotes] = useState('');
  const [printedSale, setPrintedSale] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const receiptRef = useRef(null);

  // Setup reactive print utility
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    onAfterPrint: () => {
      setPrintedSale(null);
      setCheckoutSuccess(false);
    }
  });

  const activeOutlet = outlets.find(o => o.id === selectedOutletId);

  // Filter products by search matching name, SKU, or barcode
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search))
  );

  // Helper to fetch live quantities for the selected outlet
  const getProductStockQty = (productId) => {
    const stock = outletStocks.find(s => s.productId === productId && s.outletId === selectedOutletId);
    return stock ? stock.quantity : 0;
  };

  // Calculate cart financials
  const discountVal = parseFloat(discountInput) || 0;
  const subtotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
  const taxAmount = Math.max(0, (subtotal - discountVal) * (tenant.taxRate / 100));
  const total = Math.max(0, subtotal - discountVal + taxAmount);

  // Handle transaction checkout
  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Process sale in state (deducts stock, updates records)
    const saleResult = processSale(paymentMode, discountVal, notes);
    
    if (saleResult) {
      setPrintedSale({
        ...saleResult,
        items: cart.map(item => ({
          name: item.product.name,
          qty: item.quantity,
          price: item.product.sellingPrice,
          total: item.product.sellingPrice * item.quantity
        }))
      });
      setDiscountInput('');
      setNotes('');
      setCheckoutSuccess(true);
    }
  };

  // Simulated barcode scan handler (allows typing barcode and hitting Enter)
  const handleBarcodeSearch = (e) => {
    if (e.key === 'Enter') {
      const found = products.find(p => p.barcode === search || p.sku.toLowerCase() === search.toLowerCase());
      if (found) {
        addToCart(found);
        setSearch('');
      }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '5fr 3fr', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
      
      {/* Catalog Search Grid */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', borderRight: '1px solid var(--border-glass)' }}>
        
        {/* Search Header Row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search product catalog by name, SKU, or type scanner code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleBarcodeSearch}
              style={{ paddingLeft: '48px', width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <Barcode size={18} /> Barcode Scan Mode
          </div>
        </div>

        {/* Product Catalog Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', alignContent: 'start', flex: 1 }}>
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '48px' }}>
              No products match your current filters. Add new products in the Inventory page.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const stockQty = getProductStockQty(p.id);
              const isOutOfStock = stockQty <= 0;

              return (
                <div 
                  key={p.id}
                  className="glass-card" 
                  onClick={() => !isOutOfStock && addToCart(p)}
                  style={{ 
                    padding: '16px', 
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    opacity: isOutOfStock ? 0.5 : 1,
                    minHeight: '160px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <span>SKU: {p.sku}</span>
                      <span style={{ color: isOutOfStock ? 'var(--danger)' : 'var(--success)' }}>
                        {isOutOfStock ? 'Out of Stock' : `${stockQty} pcs`}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)' }}>
                      {tenant.currency} {p.sellingPrice.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '2px 6px', color: 'var(--text-secondary)' }}>
                      +{p.taxPercentage}% Tax
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* POS Cart Sidebar Section */}
      <div style={{ background: 'var(--bg-panel)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {/* Cart Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={18} /> Active Cart List ({cart.reduce((sum, i) => sum + i.quantity, 0)})
          </h3>
          {cart.length > 0 && (
            <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={clearCart}>
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)', textAlign: 'center' }}>
              <ShoppingCart size={40} style={{ marginBottom: '16px', color: 'var(--text-glass)' }} />
              <p style={{ fontSize: '14px' }}>Cashier shopping cart is empty.</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Click items on the catalog grid to add to check out.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.product.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1, marginRight: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.product.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {tenant.currency} {item.product.sellingPrice.toFixed(2)} x {item.quantity}
                  </div>
                </div>

                {/* Qty selectors */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', color: 'var(--text-main)', cursor: 'pointer' }}
                    onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontSize: '13px', width: '20px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</span>
                  <button 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', color: 'var(--text-main)', cursor: 'pointer' }}
                    onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                  >
                    <Plus size={12} />
                  </button>
                  <button 
                    style={{ marginLeft: '6px', border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer' }}
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dynamic Billing Form */}
        {cart.length > 0 && (
          <form 
            onSubmit={handleCheckout}
            style={{ 
              padding: '24px', 
              borderTop: '1px solid var(--border-glass)', 
              background: 'rgba(9, 10, 15, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {/* Discount & Payment Method */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Discount ({tenant.currency})</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="0.00" 
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Payment Mode</label>
                <select 
                  className="form-control"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="cash">💵 Cash Mode</option>
                  <option value="card">💳 Card Terminal</option>
                  <option value="split">🤝 Split Checkout</option>
                  <option value="mobile_wallet">📱 Mobile Pay</option>
                </select>
              </div>
            </div>

            {/* Invoicing calculation drawer */}
            <div 
              style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '12px', 
                padding: '16px', 
                fontSize: '13px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span>{tenant.currency} {subtotal.toFixed(2)}</span>
              </div>
              {discountVal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                  <span>Discount Applied:</span>
                  <span>-{tenant.currency} {discountVal.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Estimated Tax ({tenant.taxRate}%):</span>
                <span>{tenant.currency} {taxAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', borderTop: '1px dashed var(--border-glass)', paddingTop: '8px', color: 'var(--text-main)' }}>
                <span>Grand Total:</span>
                <span style={{ color: 'var(--primary)' }}>{tenant.currency} {total.toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', width: '100%', padding: '12px' }}>
              <Sparkles size={16} /> Complete Invoice checkout
            </button>
          </form>
        )}
      </div>

      {/* Invisible Printable Thermal Receipt Wrapper */}
      <div style={{ display: 'none' }}>
        <div ref={receiptRef} className="thermal-receipt" style={{ padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: '#000', background: '#fff' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px', color: '#000' }}>{tenant.name}</h2>
            <p style={{ margin: '0 0 2px' }}>{activeOutlet?.name}</p>
            <p style={{ margin: '0 0 2px' }}>{activeOutlet?.address}</p>
            <p style={{ margin: '0 0 2px' }}>Phone: {activeOutlet?.phone}</p>
            {activeOutlet?.taxNumber && <p style={{ margin: '0' }}>Tax Registration #: {activeOutlet?.taxNumber}</p>}
          </div>

          <div style={{ marginBottom: '8px', fontSize: '11px' }}>
            <div>Invoice #: {printedSale?.invoiceNumber}</div>
            <div>Date: {printedSale ? new Date(printedSale.createdAt).toLocaleString() : ''}</div>
            <div>Cashier: {useStore.getState().user.name}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px dashed #000' }}>
                <th style={{ textAlign: 'left', padding: '4px 0' }}>Item Desc</th>
                <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '4px 0' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {printedSale?.items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '4px 0' }}>{item.name}</td>
                  <td style={{ textAlign: 'center', padding: '4px 0' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right', padding: '4px 0' }}>{tenant.currency} {item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>{tenant.currency} {printedSale?.subtotal.toFixed(2)}</span>
            </div>
            {printedSale?.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000' }}>
                <span>Discount:</span>
                <span>-{tenant.currency} {printedSale.discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>VAT ({tenant.taxRate}%):</span>
              <span>{tenant.currency} {printedSale?.taxAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', borderTop: '1px dashed #000', paddingTop: '4px' }}>
              <span>GRAND TOTAL:</span>
              <span>{tenant.currency} {printedSale?.total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px', borderTop: '1px dashed #000', paddingTop: '8px' }}>
            <p style={{ margin: '0 0 2px' }}>Thank you for shopping with us!</p>
            <p style={{ margin: '0', fontSize: '10px' }}>Powered by StoreFlow SaaS</p>
          </div>
        </div>
      </div>

      {/* POS Checkout Success Print Modal Overlay */}
      {checkoutSuccess && printedSale && (
        <div className="lock-overlay" style={{ background: 'rgba(9, 10, 15, 0.7)' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '32px' }}>
            <div style={{ color: 'var(--success)', marginBottom: '16px' }}>
              <CheckCircle size={56} style={{ margin: '0 auto' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Transaction Complete!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
              Invoice **{printedSale.invoiceNumber}** recorded successfully. Print thermal bill for the customer now.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={handlePrint}>
                <Printer size={16} /> Print Thermal Bill (80mm)
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => { setCheckoutSuccess(false); setPrintedSale(null); }}>
                Skip & Resume POS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
