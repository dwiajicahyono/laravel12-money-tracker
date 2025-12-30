<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArchivedTransaksi extends Model
{
    protected $fillable = [
        'period_id',
        'user_id',
        'category_id',
        'nama_transaksi',
        'nominal',
        'tanggal',
        'jenis',
        'original_created_at',
        'archived_at',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'nominal' => 'decimal:2',
        'original_created_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
