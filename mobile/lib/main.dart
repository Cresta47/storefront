import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'store/store.dart';
import 'pages/dashboard.dart';
import 'pages/pos.dart';
import 'pages/expenses.dart';
import 'pages/settings.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (context) => StoreNotifier(),
      child: const StoreFlowApp(),
    ),
  );
}

class StoreFlowApp extends StatelessWidget {
  const StoreFlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'StoreFlow Companion',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF090A0F),
        primaryColor: const Color(0xFFC084FC),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFC084FC),
          secondary: Color(0xFFC084FC),
          surface: Color(0xFF0F111A),
          background: Color(0xFF090A0F),
        ),
        useMaterial3: true,
      ),
      home: const MainPage(),
    );
  }
}

class MainPage extends StatefulWidget {
  const MainPage({super.key});

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  int _currentIndex = 0;

  final List<Widget> _pages = [
    const DashboardPage(),
    const PosPage(),
    const ExpensesPage(),
    const SettingsPage(),
  ];

  @override
  Widget build(BuildContext context) {
    final store = Provider.of<StoreNotifier>(context);

    // Verify trial countdown
    final trialEnds = DateTime.parse(store.tenant['trialEndsAt']);
    final daysLeft = trialEnds.difference(DateTime.now()).inDays;
    final isTrialExpired = daysLeft <= 0 && store.tenant['subscriptionStatus'] == 'trial';

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F111A),
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "${store.tenant['subdomain']}.storeflow.io",
              style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            Text(
              store.tenant['name'],
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            )
          ],
        ),
        actions: [
          // Dynamic Outlet Selector Dropdown inside AppBar!
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            margin: const EdgeInsets.only(right: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF1E2234).withOpacity(0.4),
              border: Border.all(color: Colors.white.withOpacity(0.07)),
              borderRadius: BorderRadius.circular(10),
            ),
            child: DropdownButton<int>(
              dropdownColor: const Color(0xFF0F111A),
              value: store.selectedOutletId,
              underline: const SizedBox(),
              icon: const Icon(Icons.arrow_drop_down, color: Color(0xFFC084FC), size: 20),
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              items: store.outlets.map((o) {
                return DropdownMenuItem<int>(
                  value: o['id'],
                  child: Text(o['name']),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) {
                  store.setSelectedOutletId(val);
                }
              },
            ),
          )
        ],
      ),
      body: Stack(
        children: [
          // Page Renders
          IndexedStack(
            index: _currentIndex,
            children: _pages,
          ),

          // 30-Day Free Trial Protection Lock Screen Overlay
          if (isTrialExpired)
            Container(
              color: const Color(0xFF090A0F).withOpacity(0.95),
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F111A),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.redAccent.withOpacity(0.15)),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 70,
                        height: 70,
                        decoration: BoxDecoration(
                          color: Colors.redAccent.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.lock, color: Colors.redAccent, size: 36),
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        "Trial Period Expired",
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        "Your 30-Day free trial for StoreFlow has ended. Access to register POS transactions, inventory updates, and P&L ledger reports is currently locked. Upgrade to a yearly subscription to resume operations.",
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey, fontSize: 13, height: 1.4),
                      ),
                      const SizedBox(height: 24),
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
                            store.upgradeLicense();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text("🎉 Yearly Subscription Activated! Dedicated SQLite locks cleared successfully.")),
                            );
                          },
                          child: const Text("Activate Yearly License (\$149)", style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      )
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
      bottomNavigationBar: isTrialExpired
          ? null
          : BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (index) {
                setState(() {
                  _currentIndex = index;
                });
              },
              backgroundColor: const Color(0xFF0F111A),
              selectedItemColor: const Color(0xFFC084FC),
              unselectedItemColor: Colors.grey,
              type: BottomNavigationBarType.fixed,
              selectedFontSize: 11,
              unselectedFontSize: 11,
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.dashboard_outlined, size: 20),
                  activeIcon: Icon(Icons.dashboard, size: 20),
                  label: "Dashboard",
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.shopping_bag_outlined, size: 20),
                  activeIcon: Icon(Icons.shopping_bag, size: 20),
                  label: "POS",
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.receipt_long_outlined, size: 20),
                  activeIcon: Icon(Icons.receipt_long, size: 20),
                  label: "Expenses",
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.settings_outlined, size: 20),
                  activeIcon: Icon(Icons.settings, size: 20),
                  label: "Settings",
                ),
              ],
            ),
    );
  }
}
