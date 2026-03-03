<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        return response()->json([
            'message' => 'Sensor data stored successfully',
            'data'    => $reading,
        ], 201);
    }

    /**
     * Get latest sensor reading.
     * GET /api/sensor-data/latest
     */
    public function latest()
    {
        $reading = SensorReading::latest()->first();

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
            ]);
        }

        return response()->json(['data' => $reading]);
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
}
