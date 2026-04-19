<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->name('dashboard');

Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');
