<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\AnggotaController;
use App\Http\Controllers\PeriodController;
use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('transaksi', TransaksiController::class);
    Route::resource('anggota', AnggotaController::class)->only(['index', 'store', 'update', 'destroy']);

    // Period routes
    Route::get('period', [PeriodController::class, 'index'])->name('period.index');
    Route::get('period/{period}', [PeriodController::class, 'show'])->name('period.show');
    Route::post('period/reset', [PeriodController::class, 'reset'])->name('period.reset');

    // Category routes (API)
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');

    // Category management page
    Route::get('categories', [\App\Http\Controllers\CategoryManagementController::class, 'index'])->name('categories.index');
    Route::put('categories/{category}', [\App\Http\Controllers\CategoryManagementController::class, 'update'])->name('categories.update');
    Route::delete('categories/{category}', [\App\Http\Controllers\CategoryManagementController::class, 'destroy'])->name('categories.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
