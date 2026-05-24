<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('outlet_id')->nullable(); // Null means a corporate/global store expense
            $table->decimal('amount', 15, 2)->default(0.00);
            $table->date('expense_date');
            $table->string('receipt_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('expense_categories')->onDelete('restrict');
            $table->foreign('outlet_id')->references('id')->on('outlets')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
