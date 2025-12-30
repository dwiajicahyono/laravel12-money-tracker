<?php

namespace App\Http\Controllers;

use App\Models\Period;
use App\Services\PeriodService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PeriodController extends Controller
{
    protected $periodService;

    public function __construct(PeriodService $periodService)
    {
        $this->periodService = $periodService;
    }

    /**
     * Display period history
     */
    public function index()
    {
        $user = auth()->user();
        $periods = $this->periodService->getPeriodHistory($user);
        $activePeriod = $user->activePeriod();

        return Inertia::render('period/index', [
            'periods' => $periods,
            'active_period' => $activePeriod,
        ]);
    }

    /**
     * Show specific period details with transactions
     */
    public function show(int $periodId)
    {
        $period = Period::where('user_id', auth()->id())
            ->findOrFail($periodId);

        $transactions = $this->periodService
            ->getArchivedTransactions($period);

        return Inertia::render('period/show', [
            'period' => $period,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Reset current period (archive and create new)
     */
    public function reset(Request $request)
    {
        try {
            $validated = $request->validate([
                'start_date' => 'required|date',
            ]);

            $user = auth()->user();

            // Prevent multiple resets
            $activePeriod = $user->activePeriod();
            if ($activePeriod && $activePeriod->transaksis()->count() === 0) {
                return back()->with('error',
                    'Tidak dapat reset: periode saat ini tidak memiliki transaksi.');
            }

            $newPeriod = $this->periodService->resetPeriod($user, $validated['start_date']);

            return redirect()->route('dashboard')->with('success',
                "Periode berhasil direset. Periode baru: {$newPeriod->period_name}");

        } catch (\Exception $e) {
            return back()->with('error',
                'Terjadi kesalahan saat mereset periode: ' . $e->getMessage());
        }
    }
}
