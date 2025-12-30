<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Period extends Model
{
    protected $fillable = [
        'user_id',
        'start_date',
        'end_date',
        'period_name',
        'is_active',
        'total_pemasukan',
        'total_pengeluaran',
        'total_selisih',
        'total_transactions',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'total_pemasukan' => 'decimal:2',
        'total_pengeluaran' => 'decimal:2',
        'total_selisih' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transaksis(): HasMany
    {
        return $this->hasMany(Transaksi::class);
    }

    public function archivedTransaksis(): HasMany
    {
        return $this->hasMany(ArchivedTransaksi::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function updateStatistics(): void
    {
        $this->total_pemasukan = $this->transaksis()
            ->where('jenis', 'pemasukan')->sum('nominal');

        $this->total_pengeluaran = $this->transaksis()
            ->where('jenis', 'pengeluaran')->sum('nominal');

        $this->total_selisih = $this->total_pemasukan - $this->total_pengeluaran;
        $this->total_transactions = $this->transaksis()->count();

        $this->save();
    }
}
