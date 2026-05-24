import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../store/store.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final store = Provider.of<StoreNotifier>(context);

    // Filters sales & expenses by outlet
    final outletSales = store.sales.where((s) => s['outletId'] == store.selectedOutletId).toList();
    final outletExpenses = store.expenses.where((e) => e['outletId'] == store.selectedOutletId || e['outletId'] == null).toList();

    // Financial math
    double totalSales = outletSales.fold(0.00, (sum, item) => sum + (item['total'] as double));
    double totalExpenses = outletExpenses.fold(0.00, (sum, item) => sum + (item['amount'] as double));
    double netProfit = totalSales - totalExpenses;

    // Filter low stock
    final lowStockItems = store.outletStocks.where((stock) {
      if (stock['outletId'] != store.selectedOutletId) return false;
      return (stock['quantity'] as double) <= (stock['lowStockThreshold'] as double);
    }).map((stock) {
      final product = store.products.firstWhere((p) => p['id'] == stock['productId']);
      return {
        'name': product['name'],
        'sku': product['sku'],
        'qty': stock['quantity'],
        'threshold': stock['lowStockThreshold']
      };
    }).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Greeting Row
          const Text(
            "Operating Metrics Dashboard",
            style: TextStyle(fontSize: 22, fontWeight: TextStyle.bold, color: Colors.white),
          ),
          const SizedBox(height: 4),
          Text(
            "Real-time cash registry logs for ${store.outlets.firstWhere((o) => o['id'] == store.selectedOutletId)['name']}",
            style: const TextStyle(fontSize: 13, color: Colors.grey),
          ),
          const SizedBox(height: 20),

          // KPI Grid (Scrollable row or simple wrap)
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.4,
            children: [
              _buildKpiCard(
                title: "Gross Sales",
                value: "${store.tenant['currency']} ${totalSales.toStringAsFixed(0)}",
                color: const Color(0xFFC084FC),
                icon: Icons.shopping_bag_outlined,
              ),
              _buildKpiCard(
                title: "Expenses Out",
                value: "${store.tenant['currency']} ${totalExpenses.toStringAsFixed(0)}",
                color: Colors.redAccent,
                icon: Icons.trending_down_outlined,
              ),
              _buildKpiCard(
                title: "Net Margin",
                value: "${store.tenant['currency']} ${netProfit.toStringAsFixed(0)}",
                color: Colors.emerald,
                icon: Icons.attach_money_outlined,
              ),
              _buildKpiCard(
                title: "Low Stock Items",
                value: "${lowStockItems.length}",
                color: lowStockItems.isNotEmpty ? Colors.amber : Colors.emerald,
                icon: Icons.warning_amber_rounded,
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Section low stocks
          if (lowStockItems.isNotEmpty) ...[
            const Text(
              "Critical Low Stock Warnings",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: lowStockItems.length,
              itemBuilder: (context, index) {
                final item = lowStockItems[index];
                return Card(
                  color: Colors.amber.withOpacity(0.05),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.amber.withOpacity(0.2)),
                  ),
                  child: ListTile(
                    dense: true,
                    title: Text(item['name'], style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                    subtitle: Text("SKU: ${item['sku']}", style: const TextStyle(color: Colors.grey)),
                    trailing: Text(
                      "${item['qty']} / ${item['threshold']} left",
                      style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 24),
          ],

          // Recent Sales Ledger
          const Text(
            "Recent POS Checkouts",
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 8),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: outletSales.isEmpty ? 1 : outletSales.length,
            itemBuilder: (context, index) {
              if (outletSales.isEmpty) {
                return const Card(
                  color: Colors.transparent,
                  child: Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Center(
                      child: Text("No transactions recorded for this branch today.", style: TextStyle(color: Colors.grey)),
                    ),
                  ),
                );
              }
              final sale = outletSales[index];
              return Card(
                color: const Color(0xFF1E2234).withOpacity(0.4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.white.withOpacity(0.05)),
                ),
                child: ListTile(
                  title: Text(sale['invoiceNumber'], style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFC084FC))),
                  subtitle: Text("Payment: ${sale['paymentMethod']}", style: const TextStyle(color: Colors.grey)),
                  trailing: Text(
                    "${store.tenant['currency']} ${sale['total'].toStringAsFixed(2)}",
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildKpiCard({required String title, required String value, required Color color, required IconData icon}) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E2234).withOpacity(0.4),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.07)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Text(title, style: const TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.w500)),
              Icon(icon, color: color, size: 18),
            ],
          ),
          Text(
            value,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 2),
        ],
      ),
    );
  }
}
