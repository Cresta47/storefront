<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outlet_stocks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('outlet_id');
            $table->decimal('quantity', 15, 2)->default(0.00);
            $table->decimal('low_stock_threshold', 15, 2)->default(5.00);
            $table->timestamps();

            $table->unique(['product_id', 'outlet_id']);
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('outlet_id')->references('id')->on('outlets')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outlet_stocks');
    }
};
