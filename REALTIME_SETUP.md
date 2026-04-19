# Real-Time Updates with Laravel Broadcasting

This guide shows how to implement **true real-time updates** using WebSockets (no polling).

## Benefits
- ⚡ **Instant updates** - 0ms delay when ESP32 sends data
- 🔋 **Less battery/data** - No constant polling
- 📡 **Push notifications** - Server pushes data when available

---

## Setup Steps

### 1. Install Laravel WebSockets (Free Pusher Alternative)

```bash
composer require beyondcode/laravel-websockets
php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
php artisan migrate
php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
```

### 2. Install Pusher PHP SDK

```bash
composer require pusher/pusher-php-server
```

### 3. Configure Broadcasting

Edit `.env`:
```env
BROADCAST_DRIVER=pusher

PUSHER_APP_ID=rayshield
PUSHER_APP_KEY=rayshieldkey
PUSHER_APP_SECRET=rayshieldsecret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

Edit `config/broadcasting.php` - update pusher connection:
```php
'pusher' => [
    'driver' => 'pusher',
    'key' => env('PUSHER_APP_KEY'),
    'secret' => env('PUSHER_APP_SECRET'),
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'cluster' => env('PUSHER_APP_CLUSTER'),
        'host' => env('PUSHER_HOST', '127.0.0.1'),
        'port' => env('PUSHER_PORT', 6001),
        'scheme' => env('PUSHER_SCHEME', 'http'),
        'encrypted' => true,
        'useTLS' => env('PUSHER_SCHEME') === 'https',
    ],
],
```

### 4. Uncomment in `bootstrap/app.php`

Make sure broadcasting channels are loaded (already done by default in Laravel 11).

### 5. Create Event for Sensor Updates

```bash
php artisan make:event SensorDataUpdated
```

Edit `app/Events/SensorDataUpdated.php`:
```php
<?php

namespace App\Events;

use App\Models\SensorReading;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SensorDataUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public SensorReading $reading)
    {
    }

    public function broadcastOn(): Channel
    {
        return new Channel('sensor-data');
    }

    public function broadcastAs(): string
    {
        return 'updated';
    }

    public function broadcastWith(): array
    {
        return ['data' => $this->reading];
    }
}
```

### 6. Broadcast When ESP32 Sends Data

Update `app/Http/Controllers/Api/SensorDataController.php`:
```php
use App\Events\SensorDataUpdated;

public function store(Request $request)
{
    $validated = $request->validate([
        'temperature_c' => 'required|numeric',
        'temperature_f' => 'required|numeric',
        'humidity'       => 'required|numeric',
        'heat_index_c'   => 'required|numeric',
        'heat_index_f'   => 'required|numeric',
        'uv_index'       => 'required|numeric',
        'uva'            => 'required|numeric',
        'uvb'            => 'required|numeric',
    ]);

    $reading = SensorReading::create($validated);

    // Clear cache
    cache()->forget('sensor:latest');

    // Broadcast to all connected clients
    broadcast(new SensorDataUpdated($reading))->toOthers();

    return response()->json([
        'message' => 'Sensor data stored successfully',
        'data'    => $reading,
    ], 201);
}
```

### 7. Install Frontend Dependencies

```bash
npm install --save laravel-echo pusher-js
```

### 8. Configure Laravel Echo in Frontend

Edit `resources/js/bootstrap.js`:
```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
    wsHost: import.meta.env.VITE_PUSHER_HOST ?? `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
    wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
    wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
});
```

### 9. Update Dashboard to Use WebSockets

Edit `resources/js/Pages/Dashboard.jsx`:
```javascript
useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
        try {
            const response = await fetch('/api/sensor-data/latest', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            if (response.ok) {
                const json = await response.json();
                if (json.data) {
                    setSensorData(json.data);
                }
            }
        } catch (err) {
            console.log('Fetch error:', err);
        }
    };

    fetchData();

    // Listen for real-time updates
    const channel = window.Echo.channel('sensor-data')
        .listen('.updated', (event) => {
            console.log('Real-time update received:', event.data);
            setSensorData(event.data);
        });

    return () => {
        channel.stopListening('.updated');
        window.Echo.leaveChannel('sensor-data');
    };
}, []);
```

### 10. Start WebSocket Server

In a separate terminal:
```bash
php artisan websockets:serve
```

Or for production, use Supervisor to keep it running.

### 11. Build Frontend Assets
```bash
npm run build
# or for development:
npm run dev
```

---

## Testing

1. Start the WebSocket server: `php artisan websockets:serve`
2. Start your Laravel app: `php artisan serve`
3. Start frontend: `npm run dev`
4. Open the dashboard in your browser
5. Send data from ESP32 - it should appear INSTANTLY!

## Production Deployment

For production, use:
- **Pusher.com** (paid service, easier setup)
- **Soketi** (free, self-hosted alternative to Pusher)
- **Laravel WebSockets** behind Nginx/Apache with SSL

---

## Alternative: Server-Sent Events (SSE)

If WebSockets are too complex, SSE is a simpler one-way solution:

1. Create SSE endpoint in controller
2. Keep connection open and send updates when available
3. Use `EventSource` API in frontend

Let me know if you want the SSE implementation instead!
