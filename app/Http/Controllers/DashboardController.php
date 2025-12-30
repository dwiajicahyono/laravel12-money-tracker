<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Ensure user has active period
        $activePeriod = $user->getOrCreateActivePeriod();

        // Statistics for CURRENT PERIOD only
        $pengeluaranBulanIni = Transaksi::where('period_id', $activePeriod->id)
            ->where('jenis', 'pengeluaran')
            ->sum('nominal');

        $pemasukanBulanIni = Transaksi::where('period_id', $activePeriod->id)
            ->where('jenis', 'pemasukan')
            ->sum('nominal');

        // Last period statistics
        $lastPeriod = $user->periods()
            ->where('is_active', false)
            ->orderBy('end_date', 'desc')
            ->first();

        $pengeluaranBulanKemarin = $lastPeriod?->total_pengeluaran ?? 0;
        $pemasukanBulanKemarin = $lastPeriod?->total_pemasukan ?? 0;

        // All-time totals (sum of all archived periods + current)
        $pengeluaranTotal = $user->periods()->sum('total_pengeluaran') + $pengeluaranBulanIni;
        $pemasukanTotal = $user->periods()->sum('total_pemasukan') + $pemasukanBulanIni;
        $selisihTotal = $pemasukanTotal - $pengeluaranTotal;
        $selisihBulanIni = $pemasukanBulanIni - $pengeluaranBulanIni;

        // Recent transactions (current period only)
        $transaksiTerbaru = Transaksi::with(['user', 'category'])
            ->where('period_id', $activePeriod->id)
            ->where('jenis', 'pengeluaran')
            ->latest('tanggal')
            ->latest('created_at')
            ->paginate(10);

        // User categories
        $categories = $user->categories()->orderBy('name')->get();

        return Inertia::render('dashboard', [
            'statistics' => [
                'pengeluaran_bulan_ini' => $pengeluaranBulanIni,
                'pengeluaran_bulan_kemarin' => $pengeluaranBulanKemarin,
                'pengeluaran_total' => $pengeluaranTotal,
                'pemasukan_bulan_ini' => $pemasukanBulanIni,
                'pemasukan_bulan_kemarin' => $pemasukanBulanKemarin,
                'pemasukan_total' => $pemasukanTotal,
                'selisih_bulan_ini' => $selisihBulanIni,
                'selisih_total' => $selisihTotal,
            ],
            'transaksi_terbaru' => $transaksiTerbaru,
            'active_period' => $activePeriod,
            'categories' => $categories,
        ]);
    }
}