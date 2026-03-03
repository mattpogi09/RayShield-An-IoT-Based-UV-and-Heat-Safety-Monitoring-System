<?php

namespace Database\Seeders;

use App\Models\SensorReading;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MockDataSeeder extends Seeder
{
    /**
     * Seed with realistic mock sensor data for testing without ESP32.
     */
    public function run(): void
    {
        // Create a test user
        $user = User::firstOrCreate(
            ['email' => 'admin@rayshield.test'],
            [
                'name'     => 'RayShield Admin',
                'password' => Hash::make('password'),
            ]
        );

        // Create default settings
        UserSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'auto_night_mode'  => true,
                'temperature_unit' => 'celsius',
            ]
        );

        // Generate 24 hours of readings (every 5 minutes = 288 readings)
        $now = now()->setTimezone('Asia/Manila');
        $readingsData = [];

        for ($i = 288; $i >= 0; $i--) {
            $time = $now->copy()->subMinutes($i * 5);
            $hour = (int) $time->format('H');

            // Simulate realistic day/night patterns
            $isDay = $hour >= 6 && $hour < 18;
            $peakFactor = $isDay ? sin(M_PI * ($hour - 6) / 12) : 0;

            // Temperature: 22-35°C during day, 20-25°C at night
            $baseTemp = $isDay ? 25 + ($peakFactor * 10) : 22 + (rand(0, 30) / 10);
            $tempC = round($baseTemp + (rand(-10, 10) / 10), 1);
            $tempF = round(($tempC * 9 / 5) + 32, 1);

            // Humidity: 55-75%
            $humidity = round(65 + (rand(-100, 100) / 10) - ($peakFactor * 5), 1);
            $humidity = max(30, min(95, $humidity));

            // UV Index: 0-11 during day, 0 at night
            $uvIndex = $isDay ? round($peakFactor * 11 + (rand(-10, 10) / 10), 1) : 0;
            $uvIndex = max(0, $uvIndex);

            // UVA/UVB
            $uva = round($uvIndex * 25 + rand(0, 50), 2);
            $uvb = round($uvIndex * 8 + rand(0, 20), 2);

            // Heat Index calculation (Rothfusz regression)
            $heatIndexF = $this->calculateHeatIndex($tempF, $humidity);
            $heatIndexC = round(($heatIndexF - 32) * 5 / 9, 1);

            $readingsData[] = [
                'temperature_c' => $tempC,
                'temperature_f' => $tempF,
                'humidity'       => $humidity,
                'heat_index_c'   => $heatIndexC,
                'heat_index_f'   => round($heatIndexF, 1),
                'uv_index'       => $uvIndex,
                'uva'            => $uva,
                'uvb'            => $uvb,
                'created_at'     => $time,
                'updated_at'     => $time,
            ];
        }

        SensorReading::insert($readingsData);

        $this->command->info('Mock data seeded: ' . count($readingsData) . ' sensor readings created.');
        $this->command->info('Test login: admin@rayshield.test / password');
    }

    private function calculateHeatIndex(float $tempF, float $humidity): float
    {
        $hi = 0.5 * ($tempF + 61.0 + (($tempF - 68.0) * 1.2) + ($humidity * 0.094));

        if ($hi >= 80.0) {
            $T  = $tempF;
            $RH = $humidity;
            $hi = -42.379
                + 2.04901523  * $T
                + 10.14333127 * $RH
                - 0.22475541  * $T * $RH
                - 0.00683783  * $T * $T
                - 0.05481717  * $RH * $RH
                + 0.00122874  * $T * $T * $RH
                + 0.00085282  * $T * $RH * $RH
                - 0.00000199  * $T * $T * $RH * $RH;

            if ($RH < 13 && $T >= 80 && $T <= 112) {
                $hi -= ((13 - $RH) / 4) * sqrt((17 - abs($T - 95)) / 17);
            }
            if ($RH > 85 && $T >= 80 && $T <= 87) {
                $hi += (($RH - 85) / 10) * ((87 - $T) / 5);
            }
        }

        return $hi;
    }
}
