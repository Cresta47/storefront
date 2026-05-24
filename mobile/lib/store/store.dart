import 'package:flutter/material.dart';

class StoreNotifier extends ChangeNotifier {
  // Active Cashier Profile
  Map<String, dynamic> _user = {
    'id': 1,
    'name': 'Bikram Shrestha',
    'email': 'bikram@example.com',
    'role': 'owner',
    'outletId': null,
  };
  Map<String, dynamic> get user => _user;

  // Active Tenant Metadata
  Map<String, dynamic> _tenant = {
    'id': '78e510f7-3308-4d7a-87a0-ece40b71584b',
    'name': 'Alpha MegaStore',
    'subdomain': 'alpha',
    'currency': 'NPR',
    'taxRate': 13,
    'trialEndsAt': DateTime.now().add(const Duration(days: 15)).toIso8601String(),
    'subscriptionStatus': 'trial', // trial, active, expired
  };
  Map<String, dynamic> get tenant => _tenant;

  // Selected Outlet
  int _selectedOutletId = 1;
  int get selectedOutletId => _selectedOutletId;

  // Branch Outlets List
  final List<Map<String, dynamic>> _outlets = [
    { 'id': 1, 'name': 'Main HQ Outlet', 'address': 'Kathmandu, Nepal', 'phone': '+977-1-4400000', 'isActive': true },
    { 'id': 2, 'name': 'Lalitpur Branch', 'address': 'Lalitpur, Nepal', 'phone': '+977-1-5500000', 'isActive': true },
    { 'id': 3, 'name': 'Central Warehouse', 'address': 'Bhaktapur, Nepal', 'phone': '+977-1-6600000', 'isActive': true }
  ];
  List<Map<String, dynamic>> get outlets => _outlets;

  // Universal Product Records
  final List<Map<String, dynamic>> _products = [
    { 'id': 1, 'name': 'Intel i9 Processor 14th Gen', 'sku': 'CPU-INT-I9-14', 'barcode': '501234567890', 'purchasePrice': 45000.00, 'sellingPrice': 58000.00, 'uom': 'pcs', 'taxPercentage': 13.00 },
    { 'id': 2, 'name': 'DDR5 32GB RAM Corsair', 'sku': 'MEM-COR-D5-32', 'barcode': '501234567891', 'purchasePrice': 8500.00, 'sellingPrice': 12000.00, 'uom': 'pcs', 'taxPercentage': 13.00 },
    { 'id': 3, 'name': 'ASUS ROG RTX 4080 GPU', 'sku': 'GPU-ASU-4080-ROG', 'barcode': '501234567892', 'purchasePrice': 95000.00, 'sellingPrice': 135000.00, 'uom': 'pcs', 'taxPercentage': 13.00 },
    { 'id': 4, 'name': 'Cat6 Ethernet Cable (100m)', 'sku': 'CAB-CAT6-100', 'barcode': '501234567893', 'purchasePrice': 1500.00, 'sellingPrice': 2800.00, 'uom': 'meters', 'taxPercentage': 13.00 },
    { 'id': 5, 'name': 'Dell UltraSharp 27 Monitor', 'sku': 'MON-DEL-U27', 'barcode': '501234567894', 'purchasePrice': 28000.00, 'sellingPrice': 39999.00, 'uom': 'pcs', 'taxPercentage': 13.00 },
  ];
  List<Map<String, dynamic>> get products => _products;

  // Branch Stocks
  final List<Map<String, dynamic>> _outletStocks = [
    { 'id': 1, 'productId': 1, 'outletId': 1, 'quantity': 12.00, 'lowStockThreshold': 3.00 },
    { 'id': 2, 'productId': 1, 'outletId': 2, 'quantity': 4.00, 'lowStockThreshold': 3.00 },
    { 'id': 3, 'productId': 2, 'outletId': 1, 'quantity': 24.00, 'lowStockThreshold': 5.00 },
    { 'id': 4, 'productId': 2, 'outletId': 2, 'quantity': 2.00, 'lowStockThreshold': 5.00 },
    { 'id': 5, 'productId': 3, 'outletId': 1, 'quantity': 6.00, 'lowStockThreshold': 2.00 },
    { 'id': 6, 'productId': 4, 'outletId': 1, 'quantity': 300.00, 'lowStockThreshold': 50.00 },
    { 'id': 7, 'productId': 5, 'outletId': 1, 'quantity': 8.00, 'lowStockThreshold': 2.00 },
    { 'id': 8, 'productId': 5, 'outletId': 2, 'quantity': 1.00, 'lowStockThreshold': 2.00 },
  ];
  List<Map<String, dynamic>> get outletStocks => _outletStocks;

  // Operating Expenses Categories & Logs
  final List<Map<String, dynamic>> _expenseCategories = [
    { 'id': 1, 'name': 'Rent', 'description': 'Monthly store rental' },
    { 'id': 2, 'name': 'Electricity & Utilities', 'description': 'Power grid bills' },
    { 'id': 3, 'name': 'Employee Salary', 'description': 'Cashier & manager payouts' },
    { 'id': 4, 'name': 'Inventory Logistics', 'description': 'Inflow shipping charges' }
  ];
  List<Map<String, dynamic>> get expenseCategories => _expenseCategories;

  final List<Map<String, dynamic>> _expenses = [
    { 'id': 1, 'categoryId': 1, 'outletId': 1, 'amount': 25000.00, 'expenseDate': '2026-05-01', 'notes': 'HQ Rent paid' },
    { 'id': 2, 'categoryId': 2, 'outletId': 1, 'amount': 4800.00, 'expenseDate': '2026-05-15', 'notes': 'HQ Power bill' },
    { 'id': 3, 'categoryId': 3, 'outletId': 2, 'amount': 18000.00, 'expenseDate': '2026-05-20', 'notes': 'Staff salaries Lalitpur' },
    { 'id': 4, 'categoryId': 4, 'outletId': null, 'amount': 6500.00, 'expenseDate': '2026-05-22', 'notes': 'Global shipping import' }
  ];
  List<Map<String, dynamic>> get expenses => _expenses;

  // POS State
  final List<Map<String, dynamic>> _cart = [];
  List<Map<String, dynamic>> get cart => _cart;

  final List<Map<String, dynamic>> _sales = [
    { 'id': 1, 'invoiceNumber': 'INV-2026-0001', 'outletId': 1, 'cashierId': 1, 'subtotal': 70000.00, 'discount': 5000.00, 'taxAmount': 8450.00, 'total': 73450.00, 'paymentMethod': 'split', 'notes': 'Loyal customer checkout', 'createdAt': '2026-05-23T14:20:00Z' }
  ];
  List<Map<String, dynamic>> get sales => _sales;

  // Setters
  void setSelectedOutletId(int id) {
    _selectedOutletId = id;
    notifyListeners();
  }

  // Upgrade Trial
  void upgradeLicense() {
    _tenant['subscriptionStatus'] = 'active';
    _tenant['trialEndsAt'] = DateTime.now().add(const Duration(days: 365)).toIso8601String();
    notifyListeners();
  }

  // Stock Audit Modifier
  void updateStock(int productId, int outletId, double qty) {
    for (var stock in _outletStocks) {
      if (stock['productId'] == productId && stock['outletId'] == outletId) {
        stock['quantity'] = qty;
        notifyListeners();
        break;
      }
    }
  }

  // Expense CRUD
  void addExpense(Map<String, dynamic> expense) {
    _expenses.add({
      'id': _expenses.length + 1,
      ...expense
    });
    notifyListeners();
  }

  // POS Operations
  void addToCart(Map<String, dynamic> product) {
    int idx = _cart.indexWhere((item) => item['product']['id'] == product['id']);
    if (idx != -1) {
      _cart[idx]['quantity'] = _cart[idx]['quantity'] + 1;
    } else {
      _cart.add({
        'product': product,
        'quantity': 1
      });
    }
    notifyListeners();
  }

  void removeFromCart(int productId) {
    _cart.removeWhere((item) => item['product']['id'] == productId);
    notifyListeners();
  }

  void updateCartQty(int productId, int qty) {
    int idx = _cart.indexWhere((item) => item['product']['id'] == productId);
    if (idx != -1) {
      _cart[idx]['quantity'] = qty < 1 ? 1 : qty;
      notifyListeners();
    }
  }

  void clearCart() {
    _cart.clear();
    notifyListeners();
  }

  Map<String, dynamic>? processSale(String paymentMethod, double discount, String notes) {
    if (_cart.isEmpty) return null;

    double subtotal = 0.00;
    for (var item in _cart) {
      subtotal += (item['product']['sellingPrice'] as double) * (item['quantity'] as int);
    }

    double taxAmount = (subtotal - discount) * ((_tenant['taxRate'] as int) / 100);
    double total = subtotal - discount + taxAmount;
    String invoiceNumber = 'INV-2026-${(_sales.length + 1).toString().padLeft(4, '0')}';
    int saleId = _sales.length + 1;

    final newSale = {
      'id': saleId,
      'invoiceNumber': invoiceNumber,
      'outletId': _selectedOutletId,
      'cashierId': _user['id'],
      'subtotal': subtotal,
      'discount': discount,
      'taxAmount': taxAmount,
      'total': total,
      'paymentMethod': paymentMethod,
      'notes': notes,
      'createdAt': DateTime.now().toIso8601String(),
    };

    // Deduct physical stocks
    for (var item in _cart) {
      int pId = item['product']['id'];
      for (var stock in _outletStocks) {
        if (stock['productId'] == pId && stock['outletId'] == _selectedOutletId) {
          stock['quantity'] = double.parse((stock['quantity'] - item['quantity']).toString());
          if (stock['quantity'] < 0) stock['quantity'] = 0.00;
        }
      }
    }

    _sales.add(newSale);
    _cart.clear();
    notifyListeners();
    return newSale;
  }
}
