<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * List all products and their associated outlet stock levels.
     */
    public function index()
    {
        $products = DB::table('products')->get();
        
        // Fetch all stock logs to correlate on client
        $stocks = DB::table('outlet_stocks')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'products' => $products,
                'stocks' => $stocks
            ]
        ]);
    }

    /**
     * Create a new product in the generic store catalog.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:191',
            'sku' => 'required|string|max:100|unique:products,sku',
            'barcode' => 'nullable|string|max:100',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'uom' => 'required|string|max:30', // pcs, kg, etc.
            'tax_percentage' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // 1. Insert product
            $productId = DB::table('products')->insertGetId([
                'name' => $request->name,
                'sku' => $request->sku,
                'barcode' => $request->barcode,
                'purchase_price' => $request->purchase_price,
                'selling_price' => $request->selling_price,
                'uom' => $request->uom,
                'tax_percentage' => $request->tax_percentage ?? 0.00,
                'description' => $request->description,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 2. Automatically provision empty stock mappings (quantity = 0) for all registered outlets
            $outlets = DB::table('outlets')->get();
            $stocksPayload = [];
            foreach ($outlets as $o) {
                $stocksPayload[] = [
                    'product_id' => $productId,
                    'outlet_id' => $o.id ?? $o->id,
                    'quantity' => 0.00,
                    'low_stock_threshold' => 5.00,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($stocksPayload)) {
                DB::table('outlet_stocks')->insert($stocksPayload);
            }

            DB::commit();

            $product = DB::table('products')->where('id', $productId)->first();

            return response()->json([
                'success' => true,
                'message' => 'Product saved to catalog successfully!',
                'data' => $product
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to save product: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Adjust product stock level at a specific outlet location.
     */
    public function adjustStock(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|integer|exists:products,id',
            'outlet_id' => 'required|integer|exists:outlets,id',
            'quantity' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Update or insert stock mapping
        DB::table('outlet_stocks')->updateOrInsert(
            [
                'product_id' => $request->product_id,
                'outlet_id' => $request->outlet_id,
            ],
            [
                'quantity' => $request->quantity,
                'updated_at' => now(),
            ]
        );

        $stock = DB::table('outlet_stocks')
            ->where('product_id', $request->product_id)
            ->where('outlet_id', $request->outlet_id)
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Stock adjustments committed successfully!',
            'data' => $stock
        ]);
    }
}
