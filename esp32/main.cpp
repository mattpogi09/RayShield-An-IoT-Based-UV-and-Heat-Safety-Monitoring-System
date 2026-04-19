#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_SHT4x.h>
#include <Adafruit_VEML6075.h>

const char* ssid      = "Wifi_Fever";
const char* password  = "noaccess";
const char* serverUrl = "http://192.168.254.106:8000/api/sensor-data";
const char* apiKey    = "rayshield-secret-key-2026";

TwoWire I2C_BUS = TwoWire(0);
Adafruit_SHT4x    sht4 = Adafruit_SHT4x();
Adafruit_VEML6075 uv   = Adafruit_VEML6075();

bool sht40Available    = false;
bool veml6075Available = false;

const unsigned long SEND_INTERVAL  = 5000;
const unsigned long RETRY_INTERVAL = 30000;  // retry offline sensors every 30 s
unsigned long lastSend  = 0;
unsigned long lastRetry = 0;

// I2C addresses
#define SHT40_ADDR    0x44
#define VEML6075_ADDR 0x10

// ── Safe I2C bus probe ─────────────────────────────────────────────────────
// Returns true only if a device ACKs at the given address.
// Calling begin() on a sensor that isn't wired up can hang or crash;
// this probe prevents that.
bool i2cDevicePresent(uint8_t address) {
  I2C_BUS.beginTransmission(address);
  return (I2C_BUS.endTransmission() == 0);
}

// ── Try to initialise SHT40 ───────────────────────────────────────────────
bool initSHT40() {
  if (!i2cDevicePresent(SHT40_ADDR)) {
    Serial.println("SHT40 not detected on I2C bus.");
    return false;
  }
  if (!sht4.begin(&I2C_BUS)) {
    Serial.println("SHT40 found but begin() failed.");
    return false;
  }
  sht4.setPrecision(SHT4X_HIGH_PRECISION);
  sht4.setHeater(SHT4X_NO_HEATER);
  return true;
}

// ── Try to initialise VEML6075 ────────────────────────────────────────────
bool initVEML6075() {
  if (!i2cDevicePresent(VEML6075_ADDR)) {
    Serial.println("VEML6075 not detected on I2C bus.");
    return false;
  }
  if (!uv.begin(VEML6075_100MS, false, false, &I2C_BUS)) {
    Serial.println("VEML6075 found but begin() failed.");
    return false;
  }
  return true;
}

// ── Retry sensors that are currently offline ──────────────────────────────
void retryOfflineSensors() {
  if (!sht40Available) {
    Serial.print("[Retry] SHT40... ");
    sht40Available = initSHT40();
    Serial.println(sht40Available ? "OK" : "still OFFLINE");
  }
  if (!veml6075Available) {
    Serial.print("[Retry] VEML6075... ");
    veml6075Available = initVEML6075();
    Serial.println(veml6075Available ? "OK" : "still OFFLINE");
  }
}

// ── Heat-index (Rothfusz) ─────────────────────────────────────────────────
float calculateHeatIndex(float tempF, float humidity) {
  float hi = 0.5f * (tempF + 61.0f + ((tempF - 68.0f) * 1.2f) + (humidity * 0.094f));
  if (hi >= 80.0f) {
    float T  = tempF;
    float RH = humidity;
    hi = -42.379f
       + 2.04901523f  * T
       + 10.14333127f * RH
       - 0.22475541f  * T * RH
       - 0.00683783f  * T * T
       - 0.05481717f  * RH * RH
       + 0.00122874f  * T * T * RH
       + 0.00085282f  * T * RH * RH
       - 0.00000199f  * T * T * RH * RH;
    if (RH < 13.0f && T >= 80.0f && T <= 112.0f)
      hi -= ((13.0f - RH) / 4.0f) * sqrtf((17.0f - fabsf(T - 95.0f)) / 17.0f);
    if (RH > 85.0f && T >= 80.0f && T <= 87.0f)
      hi += ((RH - 85.0f) / 10.0f) * ((87.0f - T) / 5.0f);
  }
  return hi;
}

float celsiusToFahrenheit(float c) { return (c * 9.0f / 5.0f) + 32.0f; }
float fahrenheitToCelsius(float f) { return (f - 32.0f) * 5.0f / 9.0f; }

// ── WiFi ──────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=================================");
  Serial.println("  RayShield ESP32 Starting...");
  Serial.println("=================================");

  I2C_BUS.begin(21, 22);
  delay(100);  // let the bus settle

  // ── SHT40 ────────────────────────────────────────────────────
  Serial.print("Initializing SHT40... ");
  sht40Available = initSHT40();
  Serial.println(sht40Available ? "OK" : "FAILED — continuing without temp/humidity.");

  // ── VEML6075 ─────────────────────────────────────────────────
  delay(200);
  Serial.print("Initializing VEML6075... ");
  veml6075Available = initVEML6075();
  Serial.println(veml6075Available ? "OK" : "FAILED — continuing without UV data.");

  // ── Status summary ────────────────────────────────────────────
  Serial.println("\n--- Sensor Status ---");
  Serial.printf("SHT40:    %s\n", sht40Available    ? "Online" : "OFFLINE");
  Serial.printf("VEML6075: %s\n", veml6075Available ? "Online" : "OFFLINE");
  Serial.println("---------------------\n");

  connectWiFi();
  Serial.println("\nRayShield ESP32 ready!\n");
}

// ─────────────────────────────────────────────────────────────────────────
void loop() {
  unsigned long now = millis();

  // ── Periodically retry any offline sensor ─────────────────────
  if ((!sht40Available || !veml6075Available) &&
      (now - lastRetry >= RETRY_INTERVAL)) {
    lastRetry = now;
    retryOfflineSensors();
  }

  if (now - lastSend < SEND_INTERVAL) return;
  lastSend = now;

  // ── Sentinel values — sent as null when sensor is offline ──────
  float tempC      = -999;
  float tempF      = -999;
  float humidity   = -999;
  float heatIndexC = -999;
  float heatIndexF = -999;
  float uva        = -999;
  float uvb        = -999;
  float uvIndex    = -999;

  // ── Read SHT40 ────────────────────────────────────────────────
  if (sht40Available) {
    sensors_event_t humEvent, tempEvent;
    if (sht4.getEvent(&humEvent, &tempEvent)) {
      tempC      = tempEvent.temperature;
      tempF      = celsiusToFahrenheit(tempC);
      humidity   = humEvent.relative_humidity;
      heatIndexF = calculateHeatIndex(tempF, humidity);
      heatIndexC = fahrenheitToCelsius(heatIndexF);
    } else {
      // Sensor stopped responding mid-run — fall back to offline
      Serial.println("SHT40 read failed — marking OFFLINE.");
      sht40Available = false;
    }
  }

  // ── Read VEML6075 ─────────────────────────────────────────────
  if (veml6075Available) {
    uva     = uv.readUVA();
    uvb     = uv.readUVB();
    uvIndex = uv.readUVI();
    // readUVI() returns -1 on a communication error
    if (uvIndex < 0.0f) {
      Serial.println("VEML6075 read failed — marking OFFLINE.");
      veml6075Available = false;
      uva = uvb = uvIndex = -999;
    }
  }

  // ── Serial log ────────────────────────────────────────────────
  Serial.println("--- RayShield Sensor Reading ---");
  if (sht40Available) {
    Serial.printf("Temperature: %.1f C / %.1f F\n", tempC, tempF);
    Serial.printf("Humidity:    %.1f%%\n", humidity);
    Serial.printf("Heat Index:  %.1f C / %.1f F\n", heatIndexC, heatIndexF);
  } else {
    Serial.println("Temperature/Humidity: OFFLINE");
  }
  if (veml6075Available) {
    Serial.printf("UVA:         %.2f\n", uva);
    Serial.printf("UVB:         %.2f\n", uvb);
    Serial.printf("UV Index:    %.2f\n", uvIndex);
  } else {
    Serial.println("UV Sensor: OFFLINE");
  }
  Serial.println("--------------------------------\n");

  // ── Send to Laravel ───────────────────────────────────────────
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectWiFi();
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-KEY", apiKey);

  // Offline sensors send JSON null so the back-end can store NULLs
  String json = "{";
  json += "\"temperature_c\":"  + (sht40Available    ? String(tempC, 2)      : String("null")) + ",";
  json += "\"temperature_f\":"  + (sht40Available    ? String(tempF, 2)      : String("null")) + ",";
  json += "\"humidity\":"       + (sht40Available    ? String(humidity, 2)   : String("null")) + ",";
  json += "\"heat_index_c\":"   + (sht40Available    ? String(heatIndexC, 2) : String("null")) + ",";
  json += "\"heat_index_f\":"   + (sht40Available    ? String(heatIndexF, 2) : String("null")) + ",";
  json += "\"uv_index\":"       + (veml6075Available ? String(uvIndex, 2)    : String("null")) + ",";
  json += "\"uva\":"            + (veml6075Available ? String(uva, 2)        : String("null")) + ",";
  json += "\"uvb\":"            + (veml6075Available ? String(uvb, 2)        : String("null"));
  json += "}";

  int httpCode = http.POST(json);
  if (httpCode > 0) {
    Serial.printf("HTTP POST response: %d\n", httpCode);
    if (httpCode == 200 || httpCode == 201)
      Serial.println("Data sent successfully!");
  } else {
    Serial.printf("HTTP POST failed: %s\n", http.errorToString(httpCode).c_str());
  }
  http.end();
}