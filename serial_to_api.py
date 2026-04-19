#!/usr/bin/env python3
"""
RayShield Serial to API Bridge
Reads sensor data from ESP32 via USB serial and posts to Laravel API
"""

import serial
import json
import requests
import time
import sys
import os
from datetime import datetime

# Configuration
SERIAL_PORT = "COM3"  # Change if your ESP32 is on different COM port
BAUD_RATE = 115200
API_URL = os.getenv("RAYSHIELD_API_URL", "http://127.0.0.1:8000/api/sensor-data")
API_KEY = os.getenv("RAYSHIELD_API_KEY", "rayshield-secret-key-2026")
TIMEOUT = 5

def read_sensor_data_from_serial(ser):
    """Read and parse sensor data from ESP32 serial output"""
    buffer = ""
    
    while True:
        try:
            if ser.in_waiting > 0:
                char = ser.read().decode('utf-8', errors='ignore')
                buffer += char
                
                # Look for complete JSON sensor data (ends with "}")
                if "RAYSHIELD_SENSOR_DATA:" in buffer and "}" in buffer:
                    # Extract JSON part
                    start = buffer.find("{")
                    end = buffer.find("}") + 1
                    
                    if start != -1 and end > start:
                        json_str = buffer[start:end]
                        buffer = buffer[end:]  # Keep remaining buffer for next data
                        
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
    try:
        headers = {
            "X-API-KEY": API_KEY,
            "Content-Type": "application/json"
        }
        
        response = requests.post(API_URL, json=data, headers=headers, timeout=TIMEOUT)
        
        if response.status_code in [200, 201]:
            print(f"✓ Posted successfully (HTTP {response.status_code})")
            return True
        else:
            print(f"✗ Post failed (HTTP {response.status_code}): {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("✗ Connection error - Laravel server not reachable on 127.0.0.1:8000")
        return False
    except Exception as e:
        print(f"✗ Error posting data: {e}")
        return False

def main():
    print("=" * 60)
    print("RayShield Serial to API Bridge")
    print("=" * 60)
    print(f"Connecting to ESP32 on {SERIAL_PORT}...")
    
    ser = None
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
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
        print(f"\nError opening serial port {SERIAL_PORT}: {e}")
        print("\nMake sure:")
        print("  1. ESP32 is connected via USB")
        print("  2. COM port number matches (check Device Manager)")
        print("  3. No other application is using the COM port (close PlatformIO monitor)")
        sys.exit(1)
    finally:
        if ser is not None and ser.is_open:
            ser.close()
            print("Serial connection closed.")

if __name__ == "__main__":
    main()
