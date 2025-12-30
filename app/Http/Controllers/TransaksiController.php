<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransaksiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        $activePeriod = $user->activePeriod();

        $transaksis = Transaksi::with(['user', 'category'])
            ->where('period_id', $activePeriod?->id)
            ->latest()
            ->paginate(10);

        $categories = $user->categories()->orderBy('name')->get();

        return Inertia::render('transaksi/index', [
            'transaksis' => $transaksis,
            'active_period' => $activePeriod,
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return redirect()->route('transaksi.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_transaksi' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'tanggal' => 'required|date',
            'jenis' => 'required|in:pemasukan,pengeluaran',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $user = auth()->user();
        $activePeriod = $user->getOrCreateActivePeriod();

        $validated['user_id'] = $user->id;
        $validated['period_id'] = $activePeriod->id;

        Transaksi::create($validated);

        return redirect()->route('transaksi.index')
            ->with('success', 'Transaksi berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaksi $transaksi)
    {
        return Inertia::render('transaksi/show', [
            'transaksi' => $transaksi->load('user'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transaksi $transaksi)
    {
        return redirect()->route('transaksi.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transaksi $transaksi)
    {
        $validated = $request->validate([
            'nama_transaksi' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'tanggal' => 'required|date',
            'jenis' => 'required|in:pemasukan,pengeluaran',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $transaksi->update($validated);

        return redirect()->route('transaksi.index')
            ->with('success', 'Transaksi berhasil diupdate.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaksi $transaksi)
    {
        $transaksi->delete();

        return redirect()->route('transaksi.index')
            ->with('success', 'Transaksi berhasil dihapus.');
    }
}