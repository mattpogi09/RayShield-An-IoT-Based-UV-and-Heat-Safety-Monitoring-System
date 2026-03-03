<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SensorReading extends Model
{
    protected $fillable = [
        'temperature_c',
        'temperature_f',
        'humidity',
        'heat_index_c',
        'heat_index_f',
        'uv_index',
        'uva',
        'uvb',
    ];

    protected $casts = [
        'temperature_c' => 'float',
        'temperature_f' => 'float',
        'humidity' => 'float',
        'heat_index_c' => 'float',
        'heat_index_f' => 'float',
        'uv_index' => 'float',
        'uva' => 'float',
        'uvb' => 'float',
    ];
}
