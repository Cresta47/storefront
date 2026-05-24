<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->unsignedBigInteger('outlet_id');
            $table->unsignedBigInteger('cashier_id');
            $table->decimal('subtotal', 15, 2)->default(0.00);
            $table->decimal('discount', 15, 2)->default(0.00);
            $table->decimal('tax_amount', 15, 2)->default(0.00);
            $table->decimal('total', 15, 2)->default(0.00);
            $table->string('payment_method')->default('cash'); // cash, card, split, mobile_wallet
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('outlet_id')->references('id')->on('outlets')->onDelete('restrict');
            $table->foreign('cashier_id')->references('id')->on('users')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
