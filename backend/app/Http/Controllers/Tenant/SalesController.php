<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SalesController extends Controller
{
    /**
     * Complete a sales checkout transaction inside the tenant context.
     * Records transaction parameters and decreases branch-specific inventory quantities.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'outlet_id' => 'required|integer|exists:outlets,id',
            'cashier_id' => 'required|integer|exists:users,id',
            'payment_method' => 'required|string|max:50',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // 1. Generate clean sequential invoice number
            // e.g. INV-2026-0001
            $year = date('Y');
            $salesCount = DB::table('sales')->count();
            $invoiceNumber = 'INV-' . $year . '-' . str_pad((string)($salesCount + 1), 4, '0', STR_PAD_LEFT);

            // 2. Fetch all products in this transaction to calculate totals server-side
            // This prevents client tampering with selling prices or taxes!
            $productIds = collect($request->items)->pluck('product_id')->toArray();
            $products = DB::table('products')->whereIn('id', $productIds)->get()->keyBy('id');

            $subtotal = 0.00;
            $taxAmount = 0.00;
            $itemsPayload = [];

            // 3. Loop through items to calculate totals
            foreach ($request->items as $item) {
                $product = $products->get($item['product_id']);
                
                $qty = parseFloat($item['quantity']) ?? (float)$item['quantity'];
                $itemSubtotal = $product->selling_price * $qty;
                $itemTax = $itemSubtotal * ($product->tax_percentage / 100);
                $itemTotal = $itemSubtotal + $itemTax;

                $subtotal += $itemSubtotal;
                $taxAmount += $itemTax;

                // Check physical stock quantity first
                $stock = DB::table('outlet_stocks')
                    ->where('product_id', $product->id)
                    ->where('outlet_id', $request->outlet_id)
                    ->first();

                $currentQty = $stock ? (float)$stock->quantity : 0.00;
                if ($currentQty < $qty) {
                    throw new \Exception("Insufficient stock for product '{$product->name}' at this outlet branch. Remaining: {$currentQty} {$product->uom}.");
                }

                $itemsPayload[] = [
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'price' => $product->selling_price,
                    'tax_amount' => $itemTax,
                    'total' => $itemTotal,
                ];
            }

            // Apply global discount
            $discount = parseFloat($request->discount) ?? (float)($request->discount ?? 0.00);
            $taxAmount = max(0.00, ($subtotal - $discount) * (13 / 100)); // Standard tenant base VAT fallback
            $total = max(0.00, $subtotal - $discount + $taxAmount);

            // 4. Create primary Sale record
            $saleId = DB::table('sales')->insertGetId([
                'invoice_number' => $invoiceNumber,
                'outlet_id' => $request->outlet_id,
                'cashier_id' => $request->cashier_id,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 5. Create Sale Items records & Deduct Outlet Inventory Stock levels
            foreach ($itemsPayload as $itemData) {
                $itemData['sale_id'] = $saleId;
                $itemData['created_at'] = now();
                $itemData['updated_at'] = now();

                // Save Sale Item
                DB::table('sale_items')->insert($itemData);

                // Deduct physical inventory stock level
                DB::table('outlet_stocks')
                    ->where('product_id', $itemData['product_id'])
                    ->where('outlet_id', $request->outlet_id)
                    ->decrement('quantity', $itemData['quantity']);
            }

            DB::commit();

            // 6. Fetch fully compiled sale record for cashier invoice printing
            $sale = DB::table('sales')->where('id', $saleId)->first();
            $saleItems = DB::table('sale_items')
                ->join('products', 'sale_items.product_id', '=', 'products.id')
                ->where('sale_id', $saleId)
                ->select('sale_items.*', 'products.name as product_name', 'products.sku as product_sku')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Sales invoice created successfully and stock balances deducted!',
                'data' => [
                    'sale' => $sale,
                    'items' => $saleItems
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Sales checkout failed: ' . $e->getMessage()
            ], 500);
        }
    }
}

// Inline helper to prevent PHP parseFloat discrepancies
function parseFloat($value) {
    return is_numeric($value) ? (float)$value : null;
}
