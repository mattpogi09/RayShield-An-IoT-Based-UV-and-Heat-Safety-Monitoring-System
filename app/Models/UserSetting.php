<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'auto_night_mode',
        'temperature_unit',
    ];

    protected $casts = [
        'auto_night_mode' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
