/*
 * RayShield ESP32 - UV & Heat Safety Monitoring System
 * 
 * Sensors:
 *   - VEML6075 (UV sensor)  → I2C (SDA=21, SCL=22)
 *   - SHT40   (Temp/Humid)  → I2C (SDA=21, SCL=22)
 * 
 * Sends JSON data to Laravel backend via HTTP POST every 5 seconds.
 * 
 * Wiring:
 *   Red    → 3.3V
 *   Black  → GND
 *   Yellow → GPIO21 (SDA)
 *   White  → GPIO22 (SCL)
 */

#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_SHT4x.h>
#include <Adafruit_VEML6075.h>

// ─── WiFi credentials ───────────────────────────────────────────────
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ─── Laravel backend URL ────────────────────────────────────────────
// Change this to your Laravel server IP/hostname
const char* serverUrl = "http://192.168.1.100:8000/api/sensor-data";

// ─── API Key (must match RAYSHIELD_API_KEY in Laravel .env) ─────────
const char* apiKey = "rayshield-secret-key-2026";

// ─── Sensor objects ─────────────────────────────────────────────────
Adafruit_SHT4x  sht4 = Adafruit_SHT4x();
Adafruit_VEML6075 uv  = Adafruit_VEML6075();

// ─── Send interval (ms) ─────────────────────────────────────────────
const unsigned long SEND_INTERVAL = 5000;
unsigned long lastSend = 0;

// ─── Heat Index Calculation (Rothfusz regression) ───────────────────
// Input: temperature in Fahrenheit, relative humidity in %
// Returns: heat index in Fahrenheit
float calculateHeatIndex(float tempF, float humidity) {
  // Simple formula for low heat index
  float hi = 0.5 * (tempF + 61.0 + ((tempF - 68.0) * 1.2) + (humidity * 0.094));

  if (hi >= 80.0) {
    // Full Rothfusz regression
    float T  = tempF;
    float RH = humidity;

    hi = -42.379
       + 2.04901523  * T
       + 10.14333127 * RH
       - 0.22475541  * T * RH
       - 0.00683783  * T * T
       - 0.05481717  * RH * RH
       + 0.00122874  * T * T * RH
       + 0.00085282  * T * RH * RH
       - 0.00000199  * T * T * RH * RH;

    // Adjustments
    if (RH < 13.0 && T >= 80.0 && T <= 112.0) {
      hi -= ((13.0 - RH) / 4.0) * sqrt((17.0 - abs(T - 95.0)) / 17.0);
    }
    if (RH > 85.0 && T >= 80.0 && T <= 87.0) {
      hi += ((RH - 85.0) / 10.0) * ((87.0 - T) / 5.0);
    }
  }

  return hi;
}

// ─── Celsius ↔ Fahrenheit ───────────────────────────────────────────
float celsiusToFahrenheit(float c) {
  return (c * 9.0 / 5.0) + 32.0;
}

float fahrenheitToCelsius(float f) {
  return (f - 32.0) * 5.0 / 9.0;
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection FAILED. Will retry...");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=================================");
  Serial.println("  RayShield ESP32 Starting...");
  Serial.println("=================================");

  // Start I2C
  Wire.begin(21, 22);

  // Initialize SHT40 (Temperature & Humidity)
  Serial.print("Initializing SHT40... ");
  if (!sht4.begin()) {
    Serial.println("FAILED! Check wiring.");
    Serial.println("  Red    -> 3.3V");
    Serial.println("  Black  -> GND");
    Serial.println("  Yellow -> GPIO21 (SDA)");
    Serial.println("  White  -> GPIO22 (SCL)");
    while (1) delay(1000);
  }
  Serial.println("OK");
  sht4.setPrecision(SHT4X_HIGH_PRECISION);
  sht4.setHeater(SHT4X_NO_HEATER);

  // Initialize VEML6075 (UV Sensor)
  Serial.print("Initializing VEML6075... ");
  if (!uv.begin()) {
    Serial.println("FAILED! Check wiring.");
    while (1) delay(1000);
  }
  Serial.println("OK");

  // Connect WiFi
  connectWiFi();

  Serial.println("\nRayShield ESP32 ready!\n");
}

void loop() {
  unsigned long now = millis();
  if (now - lastSend < SEND_INTERVAL) return;
  lastSend = now;

  // ── Read sensors ──────────────────────────────────────────────
  sensors_event_t humEvent, tempEvent;
  sht4.getEvent(&humEvent, &tempEvent);

  float tempC      = tempEvent.temperature;
  float tempF      = celsiusToFahrenheit(tempC);
  float humidity   = humEvent.relative_humidity;
  float uva        = uv.readUVA();
  float uvb        = uv.readUVB();
  float uvIndex    = uv.readUVI();
  float heatIndexF = calculateHeatIndex(tempF, humidity);
  float heatIndexC = fahrenheitToCelsius(heatIndexF);

  // ── Print to Serial ───────────────────────────────────────────
  Serial.println("--- RayShield Sensor Reading ---");
  Serial.printf("Temperature: %.1f°C / %.1f°F\n", tempC, tempF);
  Serial.printf("Humidity:    %.1f%%\n", humidity);
  Serial.printf("Heat Index:  %.1f°C / %.1f°F\n", heatIndexC, heatIndexF);
  Serial.printf("UVA:         %.2f\n", uva);
  Serial.printf("UVB:         %.2f\n", uvb);
  Serial.printf("UV Index:    %.2f\n", uvIndex);
  Serial.println("--------------------------------\n");

  // ── Send to Laravel backend ───────────────────────────────────
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectWiFi();
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-KEY", apiKey);

  // Build JSON payload
  String json = "{";
  json += "\"temperature_c\":" + String(tempC, 2) + ",";
  json += "\"temperature_f\":" + String(tempF, 2) + ",";
  json += "\"humidity\":"      + String(humidity, 2) + ",";
  json += "\"heat_index_c\":"  + String(heatIndexC, 2) + ",";
  json += "\"heat_index_f\":"  + String(heatIndexF, 2) + ",";
  json += "\"uv_index\":"      + String(uvIndex, 2) + ",";
  json += "\"uva\":"           + String(uva, 2) + ",";
  json += "\"uvb\":"           + String(uvb, 2);
  json += "}";

  int httpCode = http.POST(json);

  if (httpCode > 0) {
    Serial.printf("HTTP POST response: %d\n", httpCode);
    if (httpCode == 200 || httpCode == 201) {
      Serial.println("Data sent successfully!");
    }
  } else {
    Serial.printf("HTTP POST failed: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}
