<?php

use App\Http\Controllers\Api\SensorDataController;
use App\Http\Middleware\ValidateApiKey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ESP32 sensor data ingestion (protected by API key)
Route::post('/sensor-data', [SensorDataController::class, 'store'])
    ->middleware(ValidateApiKey::class);

// Public endpoints for the dashboard (polling from browser)
Route::get('/sensor-data/latest', [SensorDataController::class, 'latest']);
Route::get('/sensor-data/history', [SensorDataController::class, 'history']);
