import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Active User Profile
  user: {
    id: 1,
    name: 'Bikram Shrestha',
    email: 'bikram@example.com',
    role: 'owner', // owner, manager, cashier
    outletId: null, // null = all access
  },

  // Multi-Tenant Details
  tenant: {
    id: '78e510f7-3308-4d7a-87a0-ece40b71584b',
    name: 'Alpha MegaStore',
    subdomain: 'alpha',
    currency: 'NPR',
    taxRate: 13, // 13% VAT
    trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days left
    subscriptionStatus: 'trial', // trial, active, expired, grace
  },

  // Multi-Outlet Management
  outlets: [
    { id: 1, name: 'Main HQ Outlet', address: 'Kathmandu, Nepal', phone: '+977-1-4400000', isActive: true },
    { id: 2, name: 'Lalitpur Branch', address: 'Lalitpur, Nepal', phone: '+977-1-5500000', isActive: true },
    { id: 3, name: 'Central Warehouse', address: 'Bhaktapur, Nepal', phone: '+977-1-6600000', isActive: true }
  ],
  selectedOutletId: 1, // Default selected outlet

  // Products Generic Catalog
  products: [
    { id: 1, name: 'Intel i9 Processor 14th Gen', sku: 'CPU-INT-I9-14', barcode: '501234567890', purchasePrice: 45000.00, sellingPrice: 58000.00, uom: 'pcs', taxPercentage: 13.00 },
    { id: 2, name: 'DDR5 32GB RAM Corsair', sku: 'MEM-COR-D5-32', barcode: '501234567891', purchasePrice: 8500.00, sellingPrice: 12000.00, uom: 'pcs', taxPercentage: 13.00 },
    { id: 3, name: 'ASUS ROG RTX 4080 GPU', sku: 'GPU-ASU-4080-ROG', barcode: '501234567892', purchasePrice: 95000.00, sellingPrice: 135000.00, uom: 'pcs', taxPercentage: 13.00 },
    { id: 4, name: 'Cat6 Ethernet Cable (100m)', sku: 'CAB-CAT6-100', barcode: '501234567893', purchasePrice: 1500.00, sellingPrice: 2800.00, uom: 'meters', taxPercentage: 13.00 },
    { id: 5, name: 'Dell UltraSharp 27" Monitor', sku: 'MON-DEL-U27', barcode: '501234567894', purchasePrice: 28000.00, sellingPrice: 39999.00, uom: 'pcs', taxPercentage: 13.00 },
  ],

  // Stock Quantities per Product per Outlet
  outletStocks: [
    { id: 1, productId: 1, outletId: 1, quantity: 12, lowStockThreshold: 3 },
    { id: 2, productId: 1, outletId: 2, quantity: 4, lowStockThreshold: 3 },
    { id: 3, productId: 2, outletId: 1, quantity: 24, lowStockThreshold: 5 },
    { id: 4, productId: 2, outletId: 2, quantity: 2, lowStockThreshold: 5 }, // triggers alert
    { id: 5, productId: 3, outletId: 1, quantity: 6, lowStockThreshold: 2 },
    { id: 6, productId: 4, outletId: 1, quantity: 300, lowStockThreshold: 50 },
    { id: 7, productId: 5, outletId: 1, quantity: 8, lowStockThreshold: 2 },
    { id: 8, productId: 5, outletId: 2, quantity: 1, lowStockThreshold: 2 }, // triggers alert
  ],

  // Expenses Logs
  expenseCategories: [
    { id: 1, name: 'Rent', description: 'Monthly store rental' },
    { id: 2, name: 'Electricity & Utilities', description: 'Power grid bills' },
    { id: 3, name: 'Employee Salary', description: 'Cashier & manager payouts' },
    { id: 4, name: 'Inventory Logistics', description: 'Inflow shipping charges' }
  ],
  expenses: [
    { id: 1, categoryId: 1, outletId: 1, amount: 25000.00, expenseDate: '2026-05-01', notes: 'HQ Rent paid' },
    { id: 2, categoryId: 2, outletId: 1, amount: 4800.00, expenseDate: '2026-05-15', notes: 'HQ Power bill' },
    { id: 3, categoryId: 3, outletId: 2, amount: 18000.00, expenseDate: '2026-05-20', notes: 'Staff salaries Lalitpur' },
    { id: 4, categoryId: 4, outletId: null, amount: 6500.00, expenseDate: '2026-05-22', notes: 'Global shipping import' }
  ],

  // POS State
  cart: [],
  sales: [
    { id: 1, invoiceNumber: 'INV-2026-0001', outletId: 1, cashierId: 1, subtotal: 70000.00, discount: 5000.00, taxAmount: 8450.00, total: 73450.00, paymentMethod: 'split', notes: 'Loyal customer checkout', createdAt: '2026-05-23T14:20:00Z' }
  ],
  saleItems: [
    { id: 1, saleId: 1, productId: 1, quantity: 1, price: 58000.00, taxAmount: 7540.00, total: 65540.00 },
    { id: 2, saleId: 1, productId: 2, quantity: 1, price: 12000.00, taxAmount: 910.00, total: 12910.00 }
  ],

  // State Modifiers / Setters
  setUser: (user) => set({ user }),
  setTenant: (tenant) => set({ tenant }),
  setSelectedOutletId: (selectedOutletId) => set({ selectedOutletId }),
  
  // Outlet CRUD
  addOutlet: (outlet) => set((state) => ({ 
    outlets: [...state.outlets, { id: state.outlets.length + 1, isActive: true, ...outlet }] 
  })),

  // Product Catalog CRUD
  addProduct: (product) => set((state) => {
    const newId = state.products.length + 1;
    const newProduct = { id: newId, ...product };
    // Auto-create stock records for all outlets
    const newStocks = state.outlets.map((o, idx) => ({
      id: state.outletStocks.length + idx + 1,
      productId: newId,
      outletId: o.id,
      quantity: 0,
      lowStockThreshold: 5
    }));
    return {
      products: [...state.products, newProduct],
      outletStocks: [...state.outletStocks, ...newStocks]
    };
  }),

  // Stock Modifiers
  updateStock: (productId, outletId, quantity) => set((state) => ({
    outletStocks: state.outletStocks.map(stock => 
      stock.productId === productId && stock.outletId === outletId 
        ? { ...stock, quantity: parseFloat(quantity) } 
        : stock
    )
  })),

  // Expense CRUD
  addExpense: (expense) => set((state) => ({
    expenses: [...state.expenses, { id: state.expenses.length + 1, ...expense }]
  })),

  // POS Checkout Core Logic
  addToCart: (product) => set((state) => {
    const existing = state.cart.find(item => item.product.id === product.id);
    if (existing) {
      return {
        cart: state.cart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      };
    }
    return { cart: [...state.cart, { product, quantity: 1 }] };
  }),

  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.product.id !== productId)
  })),

  updateCartQty: (productId, qty) => set((state) => ({
    cart: state.cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: Math.max(1, parseInt(qty)) } 
        : item
    )
  })),

  clearCart: () => set({ cart: [] }),

  processSale: (paymentMethod, discount = 0, notes = '') => set((state) => {
    const { cart, selectedOutletId, user, products, tenant } = state;
    if (cart.length === 0) return false;

    // Calculate financials
    const subtotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
    const taxAmount = (subtotal - discount) * (tenant.taxRate / 100);
    const total = subtotal - discount + taxAmount;
    
    const invoiceNumber = `INV-2026-${String(state.sales.length + 1).padStart(4, '0')}`;
    const saleId = state.sales.length + 1;

    const newSale = {
      id: saleId,
      invoiceNumber,
      outletId: selectedOutletId,
      cashierId: user.id,
      subtotal,
      discount,
      taxAmount,
      total,
      paymentMethod,
      notes,
      createdAt: new Date().toISOString()
    };

    const newSaleItems = cart.map((item, idx) => ({
      id: state.saleItems.length + idx + 1,
      saleId,
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.sellingPrice,
      taxAmount: item.product.sellingPrice * item.quantity * (tenant.taxRate / 100),
      total: (item.product.sellingPrice * item.quantity) * (1 + tenant.taxRate / 100)
    }));

    // Deduct physical stocks in State
    const updatedStocks = state.outletStocks.map(stock => {
      const cartItem = cart.find(item => item.product.id === stock.productId && stock.outletId === selectedOutletId);
      if (cartItem) {
        return { ...stock, quantity: Math.max(0, stock.quantity - cartItem.quantity) };
      }
      return stock;
    });

    set({
      sales: [...state.sales, newSale],
      saleItems: [...state.saleItems, ...newSaleItems],
      outletStocks: updatedStocks,
      cart: []
    });

    return newSale;
  }),
}));
