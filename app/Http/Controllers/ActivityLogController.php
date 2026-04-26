<?php

namespace App\Http\Controllers;

use App\Models\UserSetting;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index()
    {
        $systemUser = User::firstOrCreate(
            ['email' => 'admin@rayshield.test'],
            ['name' => 'RayShield Admin', 'password' => Hash::make('password')]
        );
        $settings = UserSetting::where('user_id', $systemUser->id)->first();

        return Inertia::render('ActivityLog', [
            'settings' => $settings,
        ]);
    }
}
