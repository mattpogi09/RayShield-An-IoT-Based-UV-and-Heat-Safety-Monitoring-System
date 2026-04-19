<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SettingsController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'auto_night_mode'   => 'boolean',
            'manual_night_mode' => 'boolean',
            'temperature_unit'  => 'in:celsius,fahrenheit',
        ]);

        $systemUser = User::firstOrCreate(
            ['email' => 'admin@rayshield.test'],
            [
                'name' => 'RayShield Admin',
                'password' => Hash::make('password'),
            ]
        );

        UserSetting::updateOrCreate(
            ['user_id' => $systemUser->id],
            $validated
        );

        return back()->with('message', 'Settings updated successfully');
    }
}
