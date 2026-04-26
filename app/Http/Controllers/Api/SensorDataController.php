<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailySensorSnapshot;
use App\Models\SensorReading;
use Illuminate\Http\Request;

class SensorDataController extends Controller
{
    /**
     * Receive sensor data from ESP32.
     * POST /api/sensor-data
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'temperature_c' => 'required|numeric',
            'temperature_f' => 'required|numeric',
            'humidity'       => 'required|numeric',
            'heat_index_c'   => 'required|numeric',
            'heat_index_f'   => 'required|numeric',
            'uv_index'       => 'required|numeric',
            'uva'            => 'required|numeric',
            'uvb'            => 'required|numeric',
        ]);

        $reading = SensorReading::create($validated);

        // Clear the cache so the latest reading is immediately available
        cache()->forget('sensor:latest');

        return response()->json([
            'message' => 'Sensor data stored successfully',
            'data'    => $reading,
        ], 201);
    }

    /**
     * Get latest sensor reading.
     * GET /api/sensor-data/latest
     */
    public function latest(Request $request)
    {
        $forceFresh = $request->boolean('fresh');

        // Use uncached read for manual "Reload" checks, cached read for normal polling.
        if ($forceFresh) {
            $reading = SensorReading::latest()->first();
        } else {
            // Cache for 1 second to reduce database load during frequent polling
            $reading = cache()->remember('sensor:latest', 1, function () {
                return SensorReading::latest()->first();
            });
        }

        if (!$reading) {
            // Return mock/default data when no readings exist
            return response()->json([
                'data' => [
                    'temperature_c' => 0,
                    'temperature_f' => 32,
                    'humidity'       => 0,
                    'heat_index_c'   => 0,
                    'heat_index_f'   => 32,
                    'uv_index'       => 0,
                    'uva'            => 0,
                    'uvb'            => 0,
                    'created_at'     => now()->toISOString(),
                ],
                'sensor_status' => [
                    'sht40_connected' => false,
                    'veml6075_connected' => false,
                    'data_stale' => true,
                ],
            ]);
        }

        $isStale = $reading->created_at->lt(now()->subSeconds(20));

        return response()->json([
            'data' => $reading,
            'sensor_status' => [
                // A sensor is considered connected only when values are valid and data is fresh.
                'sht40_connected' => !$isStale && $reading->temperature_c > -900 && $reading->humidity > -900,
                'veml6075_connected' => !$isStale && $reading->uv_index > -900 && $reading->uva > -900 && $reading->uvb > -900,
                'data_stale' => $isStale,
            ],
        ]);
    }

    /**
     * Get sensor readings history (last 24 hours).
     * GET /api/sensor-data/history
     */
    public function history(Request $request)
    {
        $hours = $request->get('hours', 24);

        $readings = SensorReading::where('created_at', '>=', now()->subHours($hours))
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['data' => $readings]);
    }

    /**
     * Get daily end-of-day snapshots.
     * GET /api/sensor-data/daily-history
     */
    public function dailyHistory(Request $request)
    {
        $limit = (int) $request->get('limit', 90);

        $snapshots = DailySensorSnapshot::orderBy('snapshot_date', 'desc')
            ->limit($limit)
            ->get();

        return response()->json(['data' => $snapshots]);
    }
}
