<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ActivityLogController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->name('dashboard');

Route::get('/history', [HistoryController::class, 'index'])
    ->name('history');

Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');

Route::get('/activity-log', [ActivityLogController::class, 'index'])->name('activity-log');
