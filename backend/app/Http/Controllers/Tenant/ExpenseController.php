<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ExpenseController extends Controller
{
    /**
     * Fetch all expense logs and category descriptors inside the active tenant database.
     */
    public function index()
    {
        $expenses = DB::table('expenses')->get();
        $categories = DB::table('expense_categories')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'expenses' => $expenses,
                'categories' => $categories
            ]
        ]);
    }

    /**
     * Log a new operation expense outflow.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|integer|exists:expense_categories,id',
            'outlet_id' => 'nullable|integer|exists:outlets,id', // Null = global corporate expense
            'amount' => 'required|numeric|min:0.01',
            'expense_date' => 'required|date',
            'notes' => 'nullable|string',
            'receipt_file' => 'nullable|file|mimes:jpeg,png,pdf|max:2048', // 2MB max limit
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $receiptPath = null;

        // Simulate or handle physical file uploads
        if ($request->hasFile('receipt_file')) {
            $file = $request->file('receipt_file');
            // Stores the receipt in the tenant-isolated directory public storage
            $receiptPath = $file->store('receipts/tenant_' . tenant('id'), 'public');
        } elseif ($request->input('receipt_path')) {
            // Support passing mock paths from the react dashboard simulator
            $receiptPath = $request->input('receipt_path');
        }

        $id = DB::table('expenses')->insertGetId([
            'category_id' => $request->category_id,
            'outlet_id' => $request->outlet_id,
            'amount' => $request->amount,
            'expense_date' => $request->expense_date,
            'receipt_path' => $receiptPath,
            'notes' => $request->notes,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $expense = DB::table('expenses')->where('id', $id)->first();

        return response()->json([
            'success' => true,
            'message' => 'Expense item recorded successfully!',
            'data' => $expense
        ], 201);
    }

    /**
     * Create a custom expense category inside the tenant database.
     */
    public function storeCategory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:expense_categories,name',
            'description' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $id = DB::table('expense_categories')->insertGetId([
            'name' => $request->name,
            'description' => $request->description,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $category = DB::table('expense_categories')->where('id', $id)->first();

        return response()->json([
            'success' => true,
            'message' => 'Custom expense category created successfully!',
            'data' => $category
        ], 201);
    }
}
