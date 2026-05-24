<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TenantRegistrationController extends Controller
{
    /**
     * Handle multi-tenant signup requests.
     */
    public function register(Request $request)
    {
        // 1. Validate credentials
        $validator = Validator::make($request->all(), [
            'store_name' => 'required|string|max:100',
            'owner_name' => 'required|string|max:100',
            'email' => 'required|string|email|max:191',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:30',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Generate a clean subdomain slug
        $subdomain = Str::slug($request->store_name);
        
        // Ensure subdomain uniqueness on the central DB
        if (Tenant::where('id', $subdomain)->exists()) {
            $subdomain = $subdomain . '-' . Str::lower(Str::random(4));
        }

        try {
            // 3. Create Tenant in Central database
            // This triggers the stancl/tenancy event listeners to automatically:
            // - CREATE the dedicated MySQL database "tenant{subdomain}"
            // - RUN all tenant-specific migrations inside the newly created database
            $tenant = Tenant::create([
                'id' => $subdomain,
                'owner_name' => $request->owner_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'trial_ends_at' => now()->addDays(30), // 30-day free trial
                'subscription_status' => 'trial',
            ]);

            // 4. Register Domain Subdomain Mapping
            $tenant->createDomain([
                'domain' => $subdomain . '.localhost' // e.g. alpha.localhost in local development
            ]);

            // 5. Connect to the Tenant DB to seed defaults (Admin owner, Default Outlet, Default Categories)
            $tenant->run(function () use ($request) {
                // A. Create the Owner User inside the tenant database
                // Note: We use \DB or raw queries or dynamic model references since we are in tenant context.
                // We'll insert directly to users table.
                \DB::table('users')->insert([
                    'name' => $request->owner_name,
                    'email' => $request->email,
                    'password' => bcrypt($request->password),
                    'role' => 'owner',
                    'outlet_id' => null, // Owner has access to all branches
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // B. Seed a default "Headquarters" outlet location out of the box
                $outletId = \DB::table('outlets')->insertGetId([
                    'name' => 'Main Headquarters Outlet',
                    'address' => 'Central City Store',
                    'phone' => $request->phone,
                    'tax_number' => 'VAT-PENDING',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // C. Seed operating expense categories
                $categories = [
                    ['name' => 'Rent', 'description' => 'Monthly branch store rentals', 'created_at' => now(), 'updated_at' => now()],
                    ['name' => 'Electricity & Utilities', 'description' => 'Power, water, and heat bills', 'created_at' => now(), 'updated_at' => now()],
                    ['name' => 'Employee Salaries', 'description' => 'Cashier, manager, and auditor payrolls', 'created_at' => now(), 'updated_at' => now()],
                    ['name' => 'Logistics & Shipping', 'description' => 'Product supply delivery operations', 'created_at' => now(), 'updated_at' => now()]
                ];
                \DB::table('expense_categories')->insert($categories);
            });

            return response()->json([
                'success' => true,
                'message' => 'Store registered successfully! Tenant database generated and seeded with default categories and a main headquarters outlet branch.',
                'data' => [
                    'store_name' => $request->store_name,
                    'subdomain' => $subdomain,
                    'domain' => $subdomain . '.localhost:8000', // standard dev address
                    'trial_ends_at' => $tenant->trial_ends_at->toIso8601String()
                ]
            ], 201);

        } catch (\Exception $e) {
            // Clean up tenant if registration fails mid-process to prevent orphaned DBs
            if (isset($tenant)) {
                $tenant->delete();
            }

            return response()->json([
                'success' => false,
                'message' => 'Store provisioning failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
