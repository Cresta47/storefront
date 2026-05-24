import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../store/store.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final store = Provider.of<StoreNotifier>(context);

    // Calculate trial countdown
    final trialEnds = DateTime.parse(store.tenant['trialEndsAt']);
    final daysLeft = trialEnds.difference(DateTime.now()).inDays;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Store Profile & License settings",
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 4),
          const Text(
            "Manage outlets branches lists and active SaaS billing parameters",
            style: TextStyle(fontSize: 13, color: Colors.grey),
          ),
          const SizedBox(height: 24),

          // Subscription Box
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF1E2234).withOpacity(0.4),
              border: Border.all(color: Colors.white.withOpacity(0.07)),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    const Text("SaaS Yearly License", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white)),
                    Icon(
                      store.tenant['subscriptionStatus'] == 'active' ? Icons.check_circle : Icons.stars_rounded,
                      color: store.tenant['subscriptionStatus'] == 'active' ? Colors.emerald : const Color(0xFFC084FC),
                    )
                  ],
                ),
                const SizedBox(height: 8),
                if (store.tenant['subscriptionStatus'] == 'trial')
                  Text(
                    "You are currently using StoreFlow on a 30-Day Free Trial. Your trial has **$daysLeft days remaining** before locks apply.",
                    style: const TextStyle(color: Colors.grey, fontSize: 13, height: 1.4),
                  )
                else
                  const Text(
                    "Your yearly StoreFlow license is fully active! Auto-renewal processed seamlessly.",
                    style: TextStyle(color: Colors.grey, fontSize: 13, height: 1.4),
                  ),
                const SizedBox(height: 16),
                const Divider(color: Colors.white10),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    const Text("Upgrade Pricing:", style: TextStyle(color: Colors.grey, fontSize: 13)),
                    const Text("\$149.00 / Year", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  ],
                ),
                if (store.tenant['subscriptionStatus'] == 'trial') ...[
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFC084FC),
                        foregroundColor: const Color(0xFF0C0214),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () {
                        store.upgradeLicense();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("🎉 Yearly Subscription Activated successfully!")),
                        );
                      },
                      child: const Text("Activate Yearly Subscription", style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  )
                ]
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Outlet list view
          const Text(
            "Configured Outlet Branches",
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: ListView.builder(
              itemCount: store.outlets.length,
              itemBuilder: (context, idx) {
                final o = store.outlets[idx];
                return Card(
                  color: const Color(0xFF1E2234).withOpacity(0.4),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.white.withOpacity(0.05)),
                  ),
                  child: ListTile(
                    leading: const Icon(Icons.location_on, color: Color(0xFFC084FC)),
                    title: Text(o['name'], style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                    subtitle: Text(o['address'], style: const TextStyle(color: Colors.grey)),
                    trailing: Text(
                      o['isActive'] ? 'Active' : 'Disabled',
                      style: const TextStyle(color: Colors.emerald, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                );
              },
            ),
          )
        ],
      ),
    );
  }
}
