#!/usr/bin/env python3
"""
RayShield Serial to API Bridge
Reads sensor data from ESP32 via USB serial and posts to Laravel API
"""

import serial
from serial.tools import list_ports
import json
import requests
import time
import sys
import os
from datetime import datetime
from urllib.parse import urlparse

# Configuration
SERIAL_PORT = os.getenv("RAYSHIELD_SERIAL_PORT", "").strip()
BAUD_RATE = 115200
API_URL = os.getenv("RAYSHIELD_API_URL", "http://127.0.0.1:8000/api/sensor-data")
API_KEY = os.getenv("RAYSHIELD_API_KEY", "rayshield-secret-key-2026")
TIMEOUT = int(os.getenv("RAYSHIELD_API_TIMEOUT", "20"))
MAX_RETRIES = int(os.getenv("RAYSHIELD_API_RETRIES", "3"))
RETRY_DELAY_SECONDS = float(os.getenv("RAYSHIELD_API_RETRY_DELAY", "1.5"))
LAST_ESP32_DIE_LINE = "ESP32 Die: N/A (firmware log not seen yet)"


def normalize_api_url(url):
    """Normalize API URL for hosted deployments."""
    url = (url or "").strip()
    if not url:
        return "http://127.0.0.1:8000/api/sensor-data"

    parsed = urlparse(url)

    # Render serves over HTTPS. Auto-fix common accidental http:// config.
    if parsed.netloc.endswith("onrender.com") and parsed.scheme == "http":
        url = "https://" + parsed.netloc + parsed.path

    if not url.endswith("/api/sensor-data"):
        url = url.rstrip("/") + "/api/sensor-data"

    return url


API_URL = normalize_api_url(API_URL)


def list_candidate_ports():
    """Return serial ports sorted with likely ESP32 devices first."""
    candidates = []
    for port in list_ports.comports():
        text = f"{port.device} {port.description} {port.hwid}".lower()
        score = 0

        # Common ESP32 USB-UART chip hints.
        if any(k in text for k in ["cp210", "ch340", "ch910", "ftdi", "usb serial", "uart", "wch", "silicon labs"]):
            score += 10

        if "bluetooth" in text:
            score -= 5

        candidates.append((score, port))

    candidates.sort(key=lambda item: item[0], reverse=True)
    return [p for _, p in candidates]


def resolve_serial_port():
    """Resolve serial port from env override or auto-detect."""
    if SERIAL_PORT:
        return SERIAL_PORT

    ports = list_candidate_ports()
    if not ports:
        return None

    return ports[0].device


def print_available_ports():
    ports = list_ports.comports()
    if not ports:
        print("No serial ports found.")
        return

    print("Detected serial ports:")
    for port in ports:
        print(f"  - {port.device}: {port.description}")

def read_sensor_data_from_serial(ser):
    """Read and parse sensor data from ESP32 serial output"""
    global LAST_ESP32_DIE_LINE

    while True:
        try:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if not line:
                    continue

                # Show important diagnostics from ESP32 logs in the bridge terminal.
                if "ESP32 Die:" in line:
                    die_line = line[line.find("ESP32 Die:"):]
                    LAST_ESP32_DIE_LINE = die_line
                    print(f"  [ESP32] {die_line}")
                    continue

                # Parse sensor payload line used for API posting.
                if line.startswith("RAYSHIELD_SENSOR_DATA:"):
                    json_str = line.split("RAYSHIELD_SENSOR_DATA:", 1)[1].strip()
                    try:
                        data = json.loads(json_str)
                        return data
                    except json.JSONDecodeError:
                        print(f"Failed to parse JSON: {json_str}")
                        continue
        except Exception as e:
            print(f"Error reading serial: {e}")
            continue

def post_to_api(data):
    """Post sensor data to Laravel API"""
    headers = {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json"
    }

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.post(API_URL, json=data, headers=headers, timeout=TIMEOUT)

            if response.status_code in [200, 201]:
                print(f"✓ Posted successfully (HTTP {response.status_code})")
                return True

            print(f"✗ Post failed (HTTP {response.status_code}): {response.text}")
            return False

        except requests.exceptions.ReadTimeout:
            if attempt < MAX_RETRIES:
                print(
                    f"… API timeout on attempt {attempt}/{MAX_RETRIES} "
                    f"(Render may be waking up). Retrying in {RETRY_DELAY_SECONDS:.1f}s..."
                )
                time.sleep(RETRY_DELAY_SECONDS)
                continue
            print(
                f"✗ API read timeout after {MAX_RETRIES} attempts "
                f"(timeout={TIMEOUT}s)."
            )
            return False
        except requests.exceptions.ConnectionError:
            if attempt < MAX_RETRIES:
                print(
                    f"… Connection error on attempt {attempt}/{MAX_RETRIES}. "
                    f"Retrying in {RETRY_DELAY_SECONDS:.1f}s..."
                )
                time.sleep(RETRY_DELAY_SECONDS)
                continue
            print(f"✗ Connection error - API not reachable at {API_URL}")
            return False
        except Exception as e:
            print(f"✗ Error posting data: {e}")
            return False

def main():
    selected_port = resolve_serial_port()

    print("=" * 60)
    print("RayShield Serial to API Bridge")
    print("=" * 60)
    if SERIAL_PORT:
        print(f"Serial port: {selected_port} (manual via RAYSHIELD_SERIAL_PORT)")
    else:
        print(f"Serial port: {selected_port or 'Not found'} (auto-detected)")
    print(f"API URL:     {API_URL}")
    print(f"API timeout: {TIMEOUT}s, retries: {MAX_RETRIES}")

    if not selected_port:
        print("\nESP32 serial port could not be auto-detected.")
        print("Set RAYSHIELD_SERIAL_PORT manually and try again.")
        print_available_ports()
        sys.exit(1)

    print(f"Connecting to ESP32 on {selected_port}...")
    
    ser = None
    try:
        ser = serial.Serial(selected_port, BAUD_RATE, timeout=1)
        print(f"Connected! Reading sensor data...")
        print("-" * 60)
        
        # Skip initial bootup messages
        time.sleep(2)
        ser.reset_input_buffer()
        
        failed_posts = 0
        successful_posts = 0
        
        while True:
            try:
                data = read_sensor_data_from_serial(ser)
                
                if data:
                    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Sensor Reading Received:")
                    print(f"  Temp: {data.get('temperature_c', 'N/A')}°C / {data.get('temperature_f', 'N/A')}°F")
                    print(f"  Humidity: {data.get('humidity', 'N/A')}%")
                    print(f"  Heat Index: {data.get('heat_index_c', 'N/A')}°C / {data.get('heat_index_f', 'N/A')}°F")
                    print(f"  UV Index: {data.get('uv_index', 'N/A')}")
                    print(f"  {LAST_ESP32_DIE_LINE}")
                    
                    print("  Posting to API...", end=" ", flush=True)
                    
                    if post_to_api(data):
                        successful_posts += 1
                    else:
                        failed_posts += 1
                    
                    print(f"  [Posts: {successful_posts} success, {failed_posts} failed]")
                    
            except KeyboardInterrupt:
                print("\n\nShutting down...")
                break
            except Exception as e:
                print(f"Error in main loop: {e}")
                time.sleep(1)
                
    except serial.SerialException as e:
        print(f"\nError opening serial port {selected_port}: {e}")
        print("\nMake sure:")
        print("  1. ESP32 is connected via USB")
        print("  2. COM port is correct (or set RAYSHIELD_SERIAL_PORT)")
        print("  3. No other application is using the COM port (close PlatformIO monitor)")
        print_available_ports()
        sys.exit(1)
    finally:
        if ser is not None and ser.is_open:
            ser.close()
            print("Serial connection closed.")

if __name__ == "__main__":
    main()
