<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('archived_transaksis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('period_id')->constrained('periods')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nama_transaksi');
            $table->decimal('nominal', 15, 2);
            $table->date('tanggal');
            $table->enum('jenis', ['pemasukan', 'pengeluaran']);
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['period_id', 'jenis']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archived_transaksis');
    }
};
