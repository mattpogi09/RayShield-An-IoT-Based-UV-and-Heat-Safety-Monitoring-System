<?php

use App\Console\Commands\TakeDailySnapshot;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Take a daily snapshot of the last sensor reading every midnight (Philippine time)
Schedule::command(TakeDailySnapshot::class)
    ->dailyAt('00:00')
    ->timezone('Asia/Manila')
    ->withoutOverlapping();
