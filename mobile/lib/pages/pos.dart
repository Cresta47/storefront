import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../store/store.dart';

class PosPage extends StatefulWidget {
  const PosPage({super.key});

  @override
  State<PosPage> createState() => _PosPageState();
}

class _PosPageState extends State<PosPage> {
  String search = "";
  final TextEditingController _discountController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  String paymentMode = "cash";

  @override
  Widget build(BuildContext context) {
    final store = Provider.of<StoreNotifier>(context);

    final filteredProducts = store.products.where((p) =>
      p['name'].toString().toLowerCase().contains(search.toLowerCase()) ||
      p['sku'].toString().toLowerCase().contains(search.toLowerCase()) ||
      p['barcode'].toString().contains(search)
    ).toList();

    // Helper stock check
    double getStock(int productId) {
      final stock = store.outletStocks.firstWhere(
        (s) => s['productId'] == productId && s['outletId'] == store.selectedOutletId
      );
      return stock['quantity'] as double;
    }

    return Column(
      children: [
        // Search Header Row
        Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.search, color: Colors.grey),
                    hintText: "Search items, scan barcode code...",
                    hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                    fillColor: const Color(0xFF131622),
                    filled: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.white.withOpacity(0.07)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFC084FC)),
                    ),
                  ),
                  onChanged: (val) {
                    setState(() {
                      search = val;
                    });
                  },
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF1E2234),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.qr_code_scanner, color: Color(0xFFC084FC)),
                onPressed: () {
                  // Launch camera scan simulation
                  if (store.products.isNotEmpty) {
                    final firstProduct = store.products.first;
                    store.addToCart(firstProduct);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text("✅ Camera Scan Match: ${firstProduct['name']} appended to cart!")),
                    );
                  }
                },
              ),
            ],
          ),
        ),

        // Product Catalog Grid
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 1.1,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
            ),
            itemCount: filteredProducts.length,
            itemBuilder: (context, index) {
              final product = filteredProducts[index];
              final stock = getStock(product['id']);
              final isOutOfStock = stock <= 0;

              return InkWell(
                onTap: () {
                  if (!isOutOfStock) {
                    store.addToCart(product);
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("⚠️ Selected product is out of stock at this outlet branch location!")),
                    );
                  }
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E2234).withOpacity(isOutOfStock ? 0.2 : 0.4),
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
                          Text("SKU: ${product['sku']}", style: const TextStyle(color: Colors.grey, fontSize: 10)),
                          Text(
                            isOutOfStock ? "Out of Stock" : "${stock.toStringAsFixed(0)} left",
                            style: TextStyle(
                              color: isOutOfStock ? Colors.redAccent : Colors.emerald,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        product['name'],
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: [
                          Text(
                            "${store.tenant['currency']} ${product['sellingPrice'].toStringAsFixed(0)}",
                            style: const TextStyle(color: Color(0xFFC084FC), fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.03),
                              border: Border.all(color: Colors.white.withOpacity(0.05)),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              "+${product['taxPercentage'].toStringAsFixed(0)}%",
                              style: const TextStyle(fontSize: 9, color: Colors.grey),
                            ),
                          ),
                        ],
                      )
                    ],
                  ),
                ),
              );
            },
          ),
        ),

        // Cart Preview Footer Row
        if (store.cart.isNotEmpty)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF131622),
              border: Border(top: BorderSide(color: Colors.white.withOpacity(0.07))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        "${store.cart.fold(0, (sum, item) => sum + (item['quantity'] as int))} products selected",
                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        "POS Cart Items Active",
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white.withOpacity(0.9)),
                      )
                    ],
                  ),
                ),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC084FC),
                    foregroundColor: const Color(0xFF0C0214),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.shopping_cart_checkout, size: 18),
                  label: const Text("View Register", style: TextStyle(fontWeight: FontWeight.bold)),
                  onPressed: () => _showCheckoutSheet(context, store),
                )
              ],
            ),
          )
      ],
    );
  }

  void _showCheckoutSheet(BuildContext context, StoreNotifier store) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F111A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            double subtotal = store.cart.fold(0.00, (sum, item) => sum + (item['product']['sellingPrice'] as double) * (item['quantity'] as int));
            double discount = double.tryParse(_discountController.text) ?? 0.00;
            double tax = (subtotal - discount) * ((store.tenant['taxRate'] as int) / 100);
            double total = subtotal - discount + tax;

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
                        "Cashier Register Checkout",
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.grey),
                        onPressed: () => Navigator.pop(context),
                      )
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Cart list
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxHeight: 180),
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: store.cart.length,
                      itemBuilder: (context, idx) {
                        final item = store.cart[idx];
                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          dense: true,
                          title: Text(item['product']['name'], style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white)),
                          subtitle: Text(
                            "${store.tenant['currency']} ${item['product']['sellingPrice'].toStringAsFixed(2)} x ${item['quantity']}",
                            style: const TextStyle(color: Colors.grey),
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove, color: Colors.grey, size: 16),
                                onPressed: () {
                                  store.updateCartQty(item['product']['id'], item['quantity'] - 1);
                                  setSheetState(() {});
                                },
                              ),
                              Text("${item['quantity']}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              IconButton(
                                icon: const Icon(Icons.add, color: Colors.grey, size: 16),
                                onPressed: () {
                                  store.updateCartQty(item['product']['id'], item['quantity'] + 1);
                                  setSheetState(() {});
                                },
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete, color: Colors.redAccent, size: 16),
                                onPressed: () {
                                  store.removeFromCart(item['product']['id']);
                                  setSheetState(() {});
                                },
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                  const Divider(color: Colors.white10),

                  // Form details
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("Discount", style: TextStyle(color: Colors.grey, fontSize: 12)),
                            const SizedBox(height: 4),
                            TextField(
                              style: const TextStyle(color: Colors.white),
                              controller: _discountController,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                hintText: "0.00",
                                hintStyle: const TextStyle(color: Colors.grey),
                                fillColor: const Color(0xFF131622),
                                filled: true,
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              onChanged: (v) => setSheetState(() {}),
                            )
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("Payment Method", style: TextStyle(color: Colors.grey, fontSize: 12)),
                            const SizedBox(height: 4),
                            DropdownButtonFormField<String>(
                              dropdownColor: const Color(0xFF0F111A),
                              value: paymentMode,
                              style: const TextStyle(color: Colors.white),
                              decoration: InputDecoration(
                                fillColor: const Color(0xFF131622),
                                filled: true,
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              items: const [
                                DropdownMenuItem(value: "cash", child: Text("Cash")),
                                DropdownMenuItem(value: "card", child: Text("Card")),
                                DropdownMenuItem(value: "split", child: Text("Split")),
                                DropdownMenuItem(value: "mobile_wallet", child: Text("Mobile")),
                              ],
                              onChanged: (v) {
                                if (v != null) {
                                  paymentMode = v;
                                }
                              },
                            )
                          ],
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Financial aggregations
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.02),
                      border: Border.all(color: Colors.white.withOpacity(0.07)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            const Text("Subtotal", style: TextStyle(color: Colors.grey)),
                            Text("${store.tenant['currency']} ${subtotal.toStringAsFixed(2)}", style: const TextStyle(color: Colors.white)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            const Text("VAT (13%)", style: TextStyle(color: Colors.grey)),
                            Text("${store.tenant['currency']} ${tax.toStringAsFixed(2)}", style: const TextStyle(color: Colors.white)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            const Text("Total", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                            Text(
                              "${store.tenant['currency']} ${total.toStringAsFixed(2)}",
                              style: const TextStyle(color: Color(0xFFC084FC), fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                          ],
                        ),
                      ],
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
                        final result = store.processSale(paymentMode, discount, _notesController.text);
                        if (result != null) {
                          Navigator.pop(context);
                          _discountController.clear();
                          _notesController.clear();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text("✅ Invoice ${result['invoiceNumber']} Completed! Triggering Bluetooth Portable thermal receipt..."),
                            ),
                          );
                        }
                      },
                      child: const Text("Authorize Cashier Transaction", style: TextStyle(fontWeight: FontWeight.bold)),
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
