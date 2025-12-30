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
        Schema::table('transaksis', function (Blueprint $table) {
            $table->foreignId('period_id')->nullable()->after('user_id')
                  ->constrained('periods')->nullOnDelete();
            $table->index('period_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaksis', function (Blueprint $table) {
            $table->dropForeign(['period_id']);
            $table->dropIndex(['period_id']);
            $table->dropColumn('period_id');
        });
    }
};
