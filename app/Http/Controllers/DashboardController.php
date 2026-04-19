<?php

namespace App\Http\Controllers;

use App\Models\SensorReading;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $latestReading = SensorReading::latest()->first();
        $systemUser = User::firstOrCreate(
            ['email' => 'admin@rayshield.test'],
            [
                'name' => 'RayShield Admin',
                'password' => Hash::make('password'),
            ]
        );

        $settings = UserSetting::where('user_id', $systemUser->id)->first();

        if (!$settings) {
            $settings = UserSetting::create([
                'user_id'           => $systemUser->id,
                'auto_night_mode'   => false,
                'manual_night_mode' => false,
                'temperature_unit'  => 'celsius',
            ]);
        }

        $isStale = $latestReading
            ? $latestReading->created_at->lt(now()->subSeconds(20))
            : true;

        $sensorStatus = [
            'sht40_connected' => $latestReading
                ? (!$isStale && $latestReading->temperature_c > -900 && $latestReading->humidity > -900)
                : false,
            'veml6075_connected' => $latestReading
                ? (!$isStale && $latestReading->uv_index > -900 && $latestReading->uva > -900 && $latestReading->uvb > -900)
                : false,
            'data_stale' => $isStale,
        ];

        return Inertia::render('Dashboard', [
            'latestReading' => $latestReading,
            'settings'      => $settings,
            'sensorStatus'  => $sensorStatus,
        ]);
    }
}
