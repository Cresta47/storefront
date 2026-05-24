<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OutletController extends Controller
{
    /**
     * Fetch all outlets for the current tenant.
     */
    public function index()
    {
        $outlets = DB::table('outlets')->get();

        return response()->json([
            'success' => true,
            'data' => $outlets
        ]);
    }

    /**
     * Create a new outlet/warehouse for the tenant.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'address' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'tax_number' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $id = DB::table('outlets')->insertGetId([
            'name' => $request->name,
            'address' => $request->address,
            'phone' => $request->phone,
            'tax_number' => $request->tax_number,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $outlet = DB::table('outlets')->where('id', $id)->first();

        return response()->json([
            'success' => true,
            'message' => 'Outlet branch location created successfully!',
            'data' => $outlet
        ], 201);
    }
}
