<?php

namespace App\Http\Controllers;

use App\Models\UserSetting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'auto_night_mode'  => 'boolean',
            'temperature_unit' => 'in:celsius,fahrenheit',
        ]);

        $settings = UserSetting::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return back()->with('message', 'Settings updated successfully');
    }
}
