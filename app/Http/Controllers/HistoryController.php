<?php

namespace App\Http\Controllers;

use App\Models\DailySensorSnapshot;
use App\Models\UserSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class HistoryController extends Controller
{
    public function index(Request $request)
    {
        $snapshots = DailySensorSnapshot::orderBy('snapshot_date', 'desc')
            ->limit(90)
            ->get();

        $systemUser = User::firstOrCreate(
            ['email' => 'admin@rayshield.test'],
            ['name' => 'RayShield Admin', 'password' => Hash::make('password')]
        );
        $settings = UserSetting::where('user_id', $systemUser->id)->first();

        return Inertia::render('History', [
            'snapshots' => $snapshots,
            'settings'  => $settings,
        ]);
    }
}
