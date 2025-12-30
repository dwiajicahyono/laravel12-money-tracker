<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\UserSetting;
use App\Models\Period;
use Illuminate\Console\Command;

class InitializePeriods extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'period:initialize';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialize periods for existing users who already have transactions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Initializing periods for existing users...');

        $users = User::all();
        $usersProcessed = 0;
        $usersSkipped = 0;

        foreach ($users as $user) {
            // Create default settings if not exists
            if (!$user->settings) {
                UserSetting::create([
                    'user_id' => $user->id,
                    'payday_date' => 1,
                ]);
                $this->info("Created settings for user: {$user->name}");
            }

            // Skip if user already has periods
            if ($user->periods()->count() > 0) {
                $this->warn("User {$user->name} already has periods. Skipping...");
                $usersSkipped++;
                continue;
            }

            // Get user's earliest transaction
            $firstTransaction = $user->transaksis()->oldest('tanggal')->first();

            if ($firstTransaction) {
                // Create initial period from first transaction to now
                $period = Period::create([
                    'user_id' => $user->id,
                    'start_date' => $firstTransaction->tanggal,
                    'end_date' => now(),
                    'period_name' => 'Periode Awal',
                    'is_active' => true,
                ]);

                // Assign all existing transactions to this period
                $user->transaksis()->update(['period_id' => $period->id]);

                // Update statistics
                $period->updateStatistics();

                $this->info("✓ Initialized period for user: {$user->name} ({$period->total_transactions} transactions)");
                $usersProcessed++;
            } else {
                $this->comment("User {$user->name} has no transactions. Settings created but no period needed.");
                $usersSkipped++;
            }
        }

        $this->newLine();
        $this->info("Period initialization complete!");
        $this->info("Users processed: {$usersProcessed}");
        $this->info("Users skipped: {$usersSkipped}");

        return Command::SUCCESS;
    }
}
