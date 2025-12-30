<?php

namespace App\Services;

use App\Models\Period;
use App\Models\Transaksi;
use App\Models\ArchivedTransaksi;
use App\Models\User;
use App\Models\UserSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PeriodService
{
    /**
     * Reset current period: archive transactions and create new period
     */
    public function resetPeriod(User $user, string $startDate): Period
    {
        return DB::transaction(function () use ($user, $startDate) {
            $activePeriod = $user->activePeriod();

            if (!$activePeriod) {
                return $this->createFirstPeriod($user, $startDate);
            }

            // Archive current period
            $this->archivePeriod($activePeriod);

            // Create new period with custom start date
            return $this->createNewPeriodWithDate($user, $startDate);
        });
    }

    /**
     * Archive a period: move transactions to archive and mark inactive
     */
    public function archivePeriod(Period $period): void
    {
        // Update period statistics before archiving
        $period->updateStatistics();

        // Move transactions to archive
        $transactions = $period->transaksis;

        foreach ($transactions as $transaction) {
            ArchivedTransaksi::create([
                'period_id' => $period->id,
                'user_id' => $transaction->user_id,
                'category_id' => $transaction->category_id,
                'nama_transaksi' => $transaction->nama_transaksi,
                'nominal' => $transaction->nominal,
                'tanggal' => $transaction->tanggal,
                'jenis' => $transaction->jenis,
                'original_created_at' => $transaction->created_at,
                'archived_at' => now(),
            ]);
        }

        // Delete original transactions
        $period->transaksis()->delete();

        // Mark period as inactive
        $period->update([
            'is_active' => false,
            'end_date' => now()->subDay(), // Yesterday
        ]);
    }

    /**
     * Create new period based on payday date
     */
    public function createNewPeriod(User $user, int $paydayDate): Period
    {
        $startDate = $this->calculatePeriodStartDate($paydayDate);
        $endDate = $this->calculatePeriodEndDate($startDate, $paydayDate);
        $periodName = $this->generatePeriodName($startDate, $endDate);

        return Period::create([
            'user_id' => $user->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'period_name' => $periodName,
            'is_active' => true,
        ]);
    }

    /**
     * Create first period for new user
     */
    public function createFirstPeriod(User $user, ?string $startDate = null): Period
    {
        if ($startDate) {
            return $this->createNewPeriodWithDate($user, $startDate);
        }

        $settings = $user->settings ?? UserSetting::create([
            'user_id' => $user->id,
            'payday_date' => 1,
        ]);

        return $this->createNewPeriod($user, $settings->payday_date);
    }

    /**
     * Create new period with specific start date
     */
    public function createNewPeriodWithDate(User $user, string $startDate): Period
    {
        $start = Carbon::parse($startDate);
        $end = $start->copy()->addMonth()->subDay();
        $periodName = $this->generatePeriodName($start, $end);

        return Period::create([
            'user_id' => $user->id,
            'start_date' => $start,
            'end_date' => $end,
            'period_name' => $periodName,
            'is_active' => true,
        ]);
    }

    /**
     * Calculate period start date based on payday
     */
    private function calculatePeriodStartDate(int $paydayDate): Carbon
    {
        $today = Carbon::now();
        $currentMonth = $today->month;
        $currentYear = $today->year;

        // If payday hasn't occurred this month, start from last month's payday
        if ($today->day < $paydayDate) {
            $startDate = Carbon::create($currentYear, $currentMonth, 1)
                ->subMonth()
                ->day(min($paydayDate, Carbon::now()->subMonth()->daysInMonth));
        } else {
            // Start from this month's payday
            $startDate = Carbon::create($currentYear, $currentMonth, 1)
                ->day(min($paydayDate, $today->daysInMonth));
        }

        return $startDate;
    }

    /**
     * Calculate period end date (day before next payday)
     */
    private function calculatePeriodEndDate(Carbon $startDate, int $paydayDate): Carbon
    {
        $nextMonth = $startDate->copy()->addMonth();
        $endDate = Carbon::create($nextMonth->year, $nextMonth->month, 1)
            ->day(min($paydayDate, $nextMonth->daysInMonth))
            ->subDay();

        return $endDate;
    }

    /**
     * Generate human-readable period name
     */
    private function generatePeriodName(Carbon $startDate, Carbon $endDate): string
    {
        setlocale(LC_TIME, 'id_ID');
        Carbon::setLocale('id');

        if ($startDate->month === $endDate->month) {
            // Same month: "Oktober 2024"
            return $startDate->translatedFormat('F Y');
        }

        // Different months: "25 Okt - 24 Nov 2024"
        return $startDate->translatedFormat('d M') . ' - ' .
               $endDate->translatedFormat('d M Y');
    }

    /**
     * Get period history with statistics
     */
    public function getPeriodHistory(User $user, int $perPage = 10)
    {
        return $user->periods()
            ->where('is_active', false)
            ->orderBy('end_date', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get transactions for a specific archived period
     */
    public function getArchivedTransactions(Period $period, int $perPage = 20)
    {
        return $period->archivedTransaksis()
            ->orderBy('tanggal', 'desc')
            ->paginate($perPage);
    }
}
