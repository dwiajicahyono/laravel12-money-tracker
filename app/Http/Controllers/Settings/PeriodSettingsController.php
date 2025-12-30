<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\UserSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PeriodSettingsController extends Controller
{
    public function edit()
    {
        $user = auth()->user();
        $settings = $user->settings ?? UserSetting::create([
            'user_id' => $user->id,
            'payday_date' => 1,
        ]);

        return Inertia::render('settings/period', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'payday_date' => 'required|integer|min:1|max:31',
            'auto_archive' => 'nullable|boolean',
            'period_naming_format' => 'nullable|string|in:month_year,date_range',
        ]);

        $user = auth()->user();
        $settings = $user->settings ?? new UserSetting(['user_id' => $user->id]);

        $settings->fill($validated);
        $settings->save();

        return back()->with('success', 'Pengaturan periode berhasil disimpan.');
    }
}
