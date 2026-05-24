<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Fetch the Profit & Loss statement for the tenant.
     * Optionally filters by outlet branch.
     */
    public function getProfitLoss(Request $request)
    {
        $outletId = $request->query('outlet_id');

        // 1. Calculate Gross Sales, Discounts, and Net Sales
        $salesQuery = DB::table('sales');
        if ($outletId) {
            $salesQuery->where('outlet_id', $outletId);
        }

        $salesSum = $salesQuery->select(
            DB::raw('SUM(subtotal) as gross_subtotal'),
            DB::raw('SUM(discount) as total_discounts'),
            DB::raw('SUM(tax_amount) as total_tax'),
            DB::raw('SUM(total) as grand_total')
        )->first();

        $grossSubtotal = (float)($salesSum->gross_subtotal ?? 0.00);
        $totalDiscounts = (float)($salesSum->total_discounts ?? 0.00);
        $totalTax = (float)($salesSum->total_tax ?? 0.00);
        $grandTotal = (float)($salesSum->grand_total ?? 0.00);
        $netSales = $grossSubtotal - $totalDiscounts;

        // 2. Calculate Cost of Goods Sold (COGS)
        // COGS = Sum of (sale_items.quantity * products.purchase_price)
        $cogsQuery = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id');

        if ($outletId) {
            $cogsQuery->where('sales.outlet_id', $outletId);
        }

        $cogsVal = (float)$cogsQuery->sum(DB::raw('sale_items.quantity * products.purchase_price'));

        // 3. Compute Gross Profit
        $grossProfit = $netSales - $cogsVal;

        // 4. Calculate Operating Expenses
        $expensesQuery = DB::table('expenses');
        if ($outletId) {
            // Include expenses assigned specifically to this outlet, or global corporate expenses
            $expensesQuery->where(function ($q) use ($outletId) {
                $q->where('outlet_id', $outletId)
                  ->orWhereNull('outlet_id');
            });
        }

        $operatingExpenses = (float)$expensesQuery->sum('amount');

        // 5. Compute Net Profit
        $netProfit = $grossProfit - $operatingExpenses;

        return response()->json([
            'success' => true,
            'data' => [
                'outlet_id' => $outletId ? (int)$outletId : null,
                'revenue' => [
                    'gross_sales' => $grossSubtotal,
                    'discounts' => $totalDiscounts,
                    'net_sales' => $netSales,
                    'tax_collected' => $totalTax,
                    'grand_total' => $grandTotal
                ],
                'cost_of_goods_sold' => $cogsVal,
                'financials' => [
                    'gross_profit' => $grossProfit,
                    'operating_expenses' => $operatingExpenses,
                    'net_profit' => $netProfit,
                    'net_margin_percentage' => $netSales > 0 ? ($netProfit / $netSales) * 100 : 0.00
                ]
            ]
        ]);
    }
}
