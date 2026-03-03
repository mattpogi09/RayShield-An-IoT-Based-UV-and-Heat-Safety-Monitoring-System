<?php

namespace App\Http\Controllers;

use App\Models\SensorReading;
use App\Models\UserSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $latestReading = SensorReading::latest()->first();
        $settings = UserSetting::where('user_id', $request->user()->id)->first();

        if (!$settings) {
            $settings = UserSetting::create([
                'user_id'         => $request->user()->id,
                'auto_night_mode' => true,
                'temperature_unit' => 'celsius',
            ]);
        }

        return Inertia::render('Dashboard', [
            'latestReading' => $latestReading,
            'settings'      => $settings,
        ]);
    }
}
