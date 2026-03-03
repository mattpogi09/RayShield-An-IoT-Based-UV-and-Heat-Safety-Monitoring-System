<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateApiKey
{
    /**
     * Validate the ESP32 API key for sensor data ingestion.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-API-KEY');
        $validKey = config('services.rayshield.api_key');

        if (!$apiKey || $apiKey !== $validKey) {
            return response()->json(['message' => 'Invalid API key'], 401);
        }

        return $next($request);
    }
}
