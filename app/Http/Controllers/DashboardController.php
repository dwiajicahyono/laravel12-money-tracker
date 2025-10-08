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
        // Pengeluaran bulan ini (semua user)
        $pengeluaranBulanIni = Transaksi::where('jenis', 'pengeluaran')
            ->whereMonth('tanggal', Carbon::now()->month)
            ->whereYear('tanggal', Carbon::now()->year)
            ->sum('nominal');

        // Pengeluaran bulan kemarin (semua user)
        $pengeluaranBulanKemarin = Transaksi::where('jenis', 'pengeluaran')
            ->whereMonth('tanggal', Carbon::now()->subMonth()->month)
            ->whereYear('tanggal', Carbon::now()->subMonth()->year)
            ->sum('nominal');

        // Pengeluaran sepanjang masa (semua user)
        $pengeluaranTotal = Transaksi::where('jenis', 'pengeluaran')
            ->sum('nominal');

        // Pemasukan sepanjang masa (semua user)
        $pemasukanTotal = Transaksi::where('jenis', 'pemasukan')
            ->sum('nominal');

        // Selisih sepanjang masa
        $selisihTotal = $pemasukanTotal - $pengeluaranTotal;

        // Pemasukan bulan ini (semua user)
        $pemasukanBulanIni = Transaksi::where('jenis', 'pemasukan')
            ->whereMonth('tanggal', Carbon::now()->month)
            ->whereYear('tanggal', Carbon::now()->year)
            ->sum('nominal');

        // Pemasukan bulan kemarin (semua user)
        $pemasukanBulanKemarin = Transaksi::where('jenis', 'pemasukan')
            ->whereMonth('tanggal', Carbon::now()->subMonth()->month)
            ->whereYear('tanggal', Carbon::now()->subMonth()->year)
            ->sum('nominal');

        // Selisih bulan ini (pemasukan - pengeluaran)
        $selisihBulanIni = $pemasukanBulanIni - $pengeluaranBulanIni;

        // Transaksi terbaru dengan pagination (10 per halaman) - semua user
        $transaksiTerbaru = Transaksi::with('user')
            ->where('jenis', 'pengeluaran')
            ->latest('tanggal')
            ->latest('created_at')
            ->paginate(10);

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
        ]);
    }
}