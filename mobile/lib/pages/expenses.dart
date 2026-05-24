import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../store/store.dart';

class ExpensesPage extends StatefulWidget {
  const ExpensesPage({super.key});

  @override
  State<ExpensesPage> createState() => _ExpensesPageState();
}

class _ExpensesPageState extends State<ExpensesPage> {
  final _amountController = TextEditingController();
  final _notesController = TextEditingController();
  int? categoryId;
  String scope = "global"; // global or outlet ID
  bool hasAttachedReceipt = false;

  @override
  Widget build(BuildContext context) {
    final store = Provider.of<StoreNotifier>(context);

    // Filter expenses matching branch or global
    final filteredExpenses = store.expenses.where((e) =>
      e['outletId'] == store.selectedOutletId || e['outletId'] == null
    ).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          const Text(
            "Expenses Operating Ledger",
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 4),
          const Text(
            "Record branch disbursements and capture camera receipt invoices",
            style: TextStyle(fontSize: 13, color: Colors.grey),
          ),
          const SizedBox(height: 20),

          // Categories horizontal list
          SizedBox(
            height: 100,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: store.expenseCategories.length,
              itemBuilder: (context, idx) {
                final cat = store.expenseCategories[idx];
                final catTotal = filteredExpenses
                  .where((e) => e['categoryId'] == cat['id'])
                  .fold(0.00, (sum, item) => sum + (item['amount'] as double));

                return Container(
                  width: 160,
                  margin: const EdgeInsets.only(right: 12),
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
                      Text(
                        cat['name'],
                        style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        "${store.tenant['currency']} ${catTotal.toStringAsFixed(0)}",
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 24),

          // Action Form Button
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1E2234),
              foregroundColor: Colors.white,
              surfaceTintColor: Colors.transparent,
              side: BorderSide(color: Colors.white.withOpacity(0.07)),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.add, color: Color(0xFFC084FC)),
            label: const Text("Log Operating Expense"),
            onPressed: () => _showAddExpenseForm(context, store),
          ),
          const SizedBox(height: 24),

          // Table list
          const Text(
            "Expense Transactions",
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 8),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: filteredExpenses.length,
            itemBuilder: (context, idx) {
              final exp = filteredExpenses[idx];
              final cat = store.expenseCategories.firstWhere((c) => c['id'] == exp['categoryId']);
              final outletName = exp['outletId'] != null 
                ? store.outlets.firstWhere((o) => o['id'] == exp['outletId'])['name']
                : 'Global Corporate';

              return Card(
                color: const Color(0xFF1E2234).withOpacity(0.4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.white.withOpacity(0.05)),
                ),
                child: ListTile(
                  title: Text(cat['name'], style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  subtitle: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: exp['outletId'] != null ? Colors.emerald.withOpacity(0.1) : Colors.purple.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          outletName,
                          style: TextStyle(
                            fontSize: 10,
                            color: exp['outletId'] != null ? Colors.emerald : const Color(0xFFC084FC),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(exp['notes'] ?? '', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                    ],
                  ),
                  trailing: Text(
                    "-${store.tenant['currency']} ${exp['amount'].toStringAsFixed(2)}",
                    style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  void _showAddExpenseForm(BuildContext context, StoreNotifier store) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F111A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setFormState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 16, right: 16, top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text(
                        "Log Operational Expenditure",
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.grey),
                        onPressed: () => Navigator.pop(context),
                      )
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Category Select
                  DropdownButtonFormField<int>(
                    dropdownColor: const Color(0xFF0F111A),
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      labelText: "Expense Category",
                      labelStyle: const TextStyle(color: Colors.grey),
                      fillColor: const Color(0xFF131622),
                      filled: true,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    items: store.expenseCategories.map((cat) {
                      return DropdownMenuItem<int>(
                        value: cat['id'],
                        child: Text(cat['name']),
                      );
                    }).toList(),
                    onChanged: (v) {
                      setFormState(() {
                        categoryId = v;
                      });
                    },
                  ),
                  const SizedBox(height: 12),

                  // Scope & Amount
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          dropdownColor: const Color(0xFF0F111A),
                          value: scope,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            labelText: "Scope",
                            labelStyle: const TextStyle(color: Colors.grey),
                            fillColor: const Color(0xFF131622),
                            filled: true,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          items: [
                            const DropdownMenuItem(value: "global", child: Text("Global Corp")),
                            ...store.outlets.map((o) => DropdownMenuItem(
                              value: o['id'].toString(),
                              child: Text(o['name']),
                            )).toList(),
                          ],
                          onChanged: (v) {
                            if (v != null) {
                              setFormState(() {
                                scope = v;
                              });
                            }
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          style: const TextStyle(color: Colors.white),
                          controller: _amountController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: "Amount",
                            labelStyle: const TextStyle(color: Colors.grey),
                            fillColor: const Color(0xFF131622),
                            filled: true,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Camera Scanner box simulator
                  InkWell(
                    onTap: () {
                      setFormState(() {
                        hasAttachedReceipt = !hasAttachedReceipt;
                      });
                    },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF131622),
                        border: Border.all(
                          color: hasAttachedReceipt ? const Color(0xFFC084FC) : Colors.white.withOpacity(0.07),
                          width: hasAttachedReceipt ? 2 : 1,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        children: [
                          Icon(Icons.camera_alt_outlined, color: hasAttachedReceipt ? const Color(0xFFC084FC) : Colors.grey, size: 24),
                          const SizedBox(height: 8),
                          Text(
                            hasAttachedReceipt ? "✅ Receipt camera_scan.jpg Attached!" : "Mock Snap physical expense invoice receipt",
                            style: TextStyle(
                              color: hasAttachedReceipt ? const Color(0xFFC084FC) : Colors.grey,
                              fontSize: 12,
                              fontWeight: hasAttachedReceipt ? FontWeight.bold : FontWeight.normal,
                            ),
                          )
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Notes
                  TextField(
                    style: const TextStyle(color: Colors.white),
                    controller: _notesController,
                    decoration: InputDecoration(
                      labelText: "Notes",
                      labelStyle: const TextStyle(color: Colors.grey),
                      fillColor: const Color(0xFF131622),
                      filled: true,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Submit
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFC084FC),
                        foregroundColor: const Color(0xFF0C0214),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        if (categoryId == null || _amountController.text.isEmpty) return;

                        store.addExpense({
                          'categoryId': categoryId,
                          'outletId': scope == 'global' ? null : int.parse(scope),
                          'amount': double.parse(_amountController.text),
                          'notes': _notesController.text,
                          'expenseDate': DateTime.now().toIso8601String().split('T')[0],
                          'receiptPath': hasAttachedReceipt ? '/uploads/mock.png' : null
                        });

                        Navigator.pop(context);
                        _amountController.clear();
                        _notesController.clear();
                        setState(() {
                          categoryId = null;
                          scope = "global";
                          hasAttachedReceipt = false;
                        });
                      },
                      child: const Text("Commit Expense Entry", style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
