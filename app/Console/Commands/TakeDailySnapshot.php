<?php

namespace App\Console\Commands;

use App\Models\DailySensorSnapshot;
use App\Models\SensorReading;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class TakeDailySnapshot extends Command
{
    protected $signature   = 'snapshots:take-daily';
    protected $description = 'Record the last sensor reading of the previous day as a daily snapshot.';

    public function handle(): int
    {
        $yesterday = Carbon::yesterday('Asia/Manila');

        // Find the last valid reading from yesterday (in Philippine time)
        $reading = SensorReading::whereBetween('created_at', [
            $yesterday->copy()->startOfDay()->utc(),
            $yesterday->copy()->endOfDay()->utc(),
        ])
            ->orderBy('created_at', 'desc')
            ->first();

        if (! $reading) {
            $this->warn("No readings found for {$yesterday->toDateString()} — snapshot skipped.");
            return self::SUCCESS;
        }

        // Skip if sentinel values (sensor was offline)
        $sentinel = -900;
        if ($reading->temperature_c < $sentinel || $reading->humidity < $sentinel) {
            $this->warn("Reading for {$yesterday->toDateString()} has sentinel values — snapshot skipped.");
            return self::SUCCESS;
        }

        DailySensorSnapshot::updateOrCreate(
            ['snapshot_date' => $yesterday->toDateString()],
            [
                'snapshot_taken_at' => $reading->created_at,
                'temperature_c'     => $reading->temperature_c,
                'temperature_f'     => $reading->temperature_f,
                'humidity'          => $reading->humidity,
                'heat_index_c'      => $reading->heat_index_c,
                'heat_index_f'      => $reading->heat_index_f,
                'uv_index'          => $reading->uv_index,
                'uva'               => $reading->uva,
                'uvb'               => $reading->uvb,
            ]
        );

        $this->info("Daily snapshot saved for {$yesterday->toDateString()}.");
        return self::SUCCESS;
    }
}
