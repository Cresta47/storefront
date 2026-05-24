<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
    'subscription.active',
])->group(function () {
    Route::get('/', function () {
        return 'This is your multi-tenant application. The id of the current tenant is ' . tenant('id');
    });

    Route::prefix('api')->group(function () {
        // Outlets CRUD
        Route::get('/outlets', [\App\Http\Controllers\Tenant\OutletController::class, 'index']);
        Route::post('/outlets', [\App\Http\Controllers\Tenant\OutletController::class, 'store']);

        // Catalog & Inventory CRUD
        Route::get('/products', [\App\Http\Controllers\Tenant\ProductController::class, 'index']);
        Route::post('/products', [\App\Http\Controllers\Tenant\ProductController::class, 'store']);
        Route::post('/products/adjust-stock', [\App\Http\Controllers\Tenant\ProductController::class, 'adjustStock']);

        // Sales POS Transaction
        Route::post('/sales', [\App\Http\Controllers\Tenant\SalesController::class, 'store']);

        // Expenses Operating Ledger
        Route::get('/expenses', [\App\Http\Controllers\Tenant\ExpenseController::class, 'index']);
        Route::post('/expenses', [\App\Http\Controllers\Tenant\ExpenseController::class, 'store']);
        Route::post('/expenses/categories', [\App\Http\Controllers\Tenant\ExpenseController::class, 'storeCategory']);

        // Financial Reports & Dashboards
        Route::get('/reports/profit-loss', [\App\Http\Controllers\Tenant\ReportController::class, 'getProfitLoss']);
    });
});
