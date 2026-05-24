<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('cashier'); // owner, manager, cashier, accountant
            $table->unsignedBigInteger('outlet_id')->nullable(); // null means global/all access
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('outlet_id')->references('id')->on('outlets')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
