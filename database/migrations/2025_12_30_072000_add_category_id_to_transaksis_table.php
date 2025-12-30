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
            $table->foreignId('category_id')->nullable()->after('period_id')
                  ->constrained('categories')->nullOnDelete();
            $table->index('category_id');
        });

        Schema::table('archived_transaksis', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('period_id')
                  ->constrained('categories')->nullOnDelete();
            $table->index('category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaksis', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropIndex(['category_id']);
            $table->dropColumn('category_id');
        });

        Schema::table('archived_transaksis', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropIndex(['category_id']);
            $table->dropColumn('category_id');
        });
    }
};
