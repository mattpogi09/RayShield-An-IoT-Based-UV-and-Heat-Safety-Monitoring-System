#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_SHT4x.h>
#include <Adafruit_VEML6075.h>

const char* ssid      = "Wifi_Fevers";
const char* password  = "123456788999";
const char* serverHost = "10.17.20.75";
const uint16_t serverPort = 8000;
const char* serverPath = "/api/sensor-data";
const char* apiKey    = "rayshield-secret-key-2026";

// ── VEML6075: use the default Wire object (GPIO21=SDA, GPIO22=SCL) ──
// ── SHT40:    use a second bus   (GPIO18=SDA, GPIO19=SCL)          ──
//
// Wiring:
//   VEML6075  white→D21  yellow→D22  red→3.3V  black→GND  (no change)
//   SHT40     yellow→D18 white→D19   red→3.3V  black→GND
//
// NOTE: SHT40 yellow=SDA, white=SCL  (its connector is physically swapped)

TwoWire I2C_SHT = TwoWire(1);   // second I2C peripheral for SHT40

Adafruit_SHT4x    sht4 = Adafruit_SHT4x();
Adafruit_VEML6075 uv   = Adafruit_VEML6075();

bool sht40Available    = false;
bool veml6075Available = false;

const unsigned long SEND_INTERVAL  = 5000;
const unsigned long RETRY_INTERVAL = 30000;
unsigned long lastSend  = 0;
unsigned long lastRetry = 0;

// ── Calibration + smoothing (tune these after side-by-side field checks) ──
const float TEMP_OFFSET_C      = -1.5f;  // Compensate ESP32/self-heating bias.
const float HUMIDITY_OFFSET_RH = 0.0f;

const float UVA_DARK_OFFSET    = 20.0f;  // Remove baseline when UV should be near zero.
const float UVB_DARK_OFFSET    = 8.0f;
const float UVI_DARK_OFFSET    = 0.20f;
const float UV_SCALE_FACTOR    = 0.80f;  // Tone down overly aggressive UV conversion.

const float EMA_ALPHA_TEMP     = 0.25f;
const float EMA_ALPHA_HUMIDITY = 0.25f;
const float EMA_ALPHA_HEAT     = 0.20f;
const float EMA_ALPHA_UVA      = 0.25f;
const float EMA_ALPHA_UVB      = 0.25f;
const float EMA_ALPHA_UVI      = 0.20f;

bool shtFilterReady = false;
bool uvFilterReady  = false;
float filtTempC = 0.0f;
float filtHumidity = 0.0f;
float filtHeatIndexF = 0.0f;
float filtUva = 0.0f;
float filtUvb = 0.0f;
float filtUvi = 0.0f;

float clampf(float v, float lo, float hi) {
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

float applyEma(float prev, float current, float alpha) {
  return (alpha * current) + ((1.0f - alpha) * prev);
}

const char* wifiStatusText(wl_status_t status) {
  switch (status) {
    case WL_NO_SHIELD:      return "No WiFi shield";
    case WL_IDLE_STATUS:    return "Idle";
    case WL_NO_SSID_AVAIL:  return "SSID not found";
    case WL_SCAN_COMPLETED: return "Scan completed";
    case WL_CONNECTED:      return "Connected";
    case WL_CONNECT_FAILED: return "Connect failed";
    case WL_CONNECTION_LOST:return "Connection lost";
    case WL_DISCONNECTED:   return "Disconnected";
    default:                return "Unknown";
  }
}

// ── Sensor init ───────────────────────────────────────────────────
bool initSHT40() {
  I2C_SHT.beginTransmission(0x44);
  if (I2C_SHT.endTransmission() != 0) {
    Serial.println("SHT40 not detected on GPIO18/19.");
    return false;
  }
  if (!sht4.begin(&I2C_SHT)) {
    Serial.println("SHT40 begin() failed.");
    return false;
  }
  sht4.setPrecision(SHT4X_HIGH_PRECISION);
  sht4.setHeater(SHT4X_NO_HEATER);
  return true;
}

bool initVEML6075() {
  Wire.beginTransmission(0x10);
  if (Wire.endTransmission() != 0) {
    Serial.println("VEML6075 not detected on GPIO21/22.");
    return false;
  }
  if (!uv.begin(VEML6075_100MS, false, false, &Wire)) {
    Serial.println("VEML6075 begin() failed.");
    return false;
  }
  return true;
}

// ── Retry offline sensors ─────────────────────────────────────────
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

// ── Heat index ────────────────────────────────────────────────────
float calculateHeatIndex(float tempF, float humidity) {
  float hi = 0.5f * (tempF + 61.0f + ((tempF - 68.0f) * 1.2f) + (humidity * 0.094f));
  if (hi >= 80.0f) {
    float T = tempF, RH = humidity;
    hi = -42.379f + 2.04901523f*T + 10.14333127f*RH
       - 0.22475541f*T*RH - 0.00683783f*T*T - 0.05481717f*RH*RH
       + 0.00122874f*T*T*RH + 0.00085282f*T*RH*RH
       - 0.00000199f*T*T*RH*RH;
    if (RH < 13.0f && T >= 80.0f && T <= 112.0f)
      hi -= ((13.0f - RH) / 4.0f) * sqrtf((17.0f - fabsf(T - 95.0f)) / 17.0f);
    if (RH > 85.0f && T >= 80.0f && T <= 87.0f)
      hi += ((RH - 85.0f) / 10.0f) * ((87.0f - T) / 5.0f);
  }
  return hi;
}

float celsiusToFahrenheit(float c) { return (c * 9.0f / 5.0f) + 32.0f; }
float fahrenheitToCelsius(float f) { return (f - 32.0f) * 5.0f / 9.0f; }

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.disconnect(true, true);
  delay(150);

  Serial.printf("Connecting to WiFi SSID: %s\n", ssid);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    if (attempts % 4 == 3) {
      wl_status_t s = WiFi.status();
      Serial.printf(" [%s]", wifiStatusText(s));
    }
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    wl_status_t s = WiFi.status();
    Serial.println("\nWiFi connection FAILED.");
    Serial.printf("Final WiFi status: %s (%d)\n", wifiStatusText(s), (int)s);
    Serial.println("Hotspot checklist: 2.4GHz band, WPA2 security, correct SSID/password.");
    Serial.println("If using phone hotspot, disable battery saver and keep hotspot screen active.");
    Serial.println("Will retry...");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=================================");
  Serial.println("  RayShield ESP32 Starting...");
  Serial.println("=================================");

  // Default Wire: GPIO21=SDA, GPIO22=SCL (ESP32 hardware default)
  Wire.begin();   // uses GPIO21/22 automatically

  // Second bus (SHT40): only init when SHT40 wires are on D18/D19
  I2C_SHT.begin(18, 19);

  delay(100);

  Serial.println("VEML6075 bus: Wire  — GPIO21(white)=SDA, GPIO22(yellow)=SCL");
  Serial.println("SHT40    bus: Wire1 — GPIO18(yellow)=SDA, GPIO19(white)=SCL");
  Serial.println();

  Serial.print("Initializing SHT40... ");
  sht40Available = initSHT40();
  Serial.println(sht40Available ? "OK" : "OFFLINE — continuing without temp/humidity.");

  delay(200);
  Serial.print("Initializing VEML6075... ");
  veml6075Available = initVEML6075();
  Serial.println(veml6075Available ? "OK" : "OFFLINE — continuing without UV data.");

  Serial.println("\n--- Sensor Status ---");
  Serial.printf("SHT40:    %s\n", sht40Available    ? "Online" : "OFFLINE");
  Serial.printf("VEML6075: %s\n", veml6075Available ? "Online" : "OFFLINE");
  Serial.println("---------------------\n");

  connectWiFi();
  Serial.println("\nRayShield ESP32 ready!\n");
}

void loop() {
  unsigned long now = millis();

  if ((!sht40Available || !veml6075Available) &&
      (now - lastRetry >= RETRY_INTERVAL)) {
    lastRetry = now;
    retryOfflineSensors();
  }

  if (now - lastSend < SEND_INTERVAL) return;
  lastSend = now;

  float tempC      = -999;
  float tempF      = -999;
  float humidity   = -999;
  float heatIndexC = -999;
  float heatIndexF = -999;
  float uva        = -999;
  float uvb        = -999;
  float uvIndex    = -999;

  if (sht40Available) {
    sensors_event_t humEvent, tempEvent;
    if (sht4.getEvent(&humEvent, &tempEvent)) {
      float correctedTempC = tempEvent.temperature + TEMP_OFFSET_C;
      float correctedHumidity = clampf(humEvent.relative_humidity + HUMIDITY_OFFSET_RH, 0.0f, 100.0f);
      float correctedTempF = celsiusToFahrenheit(correctedTempC);
      float correctedHeatIndexF = calculateHeatIndex(correctedTempF, correctedHumidity);

      if (!shtFilterReady) {
        filtTempC = correctedTempC;
        filtHumidity = correctedHumidity;
        filtHeatIndexF = correctedHeatIndexF;
        shtFilterReady = true;
      } else {
        filtTempC = applyEma(filtTempC, correctedTempC, EMA_ALPHA_TEMP);
        filtHumidity = applyEma(filtHumidity, correctedHumidity, EMA_ALPHA_HUMIDITY);
        filtHeatIndexF = applyEma(filtHeatIndexF, correctedHeatIndexF, EMA_ALPHA_HEAT);
      }

      tempC      = filtTempC;
      tempF      = celsiusToFahrenheit(tempC);
      humidity   = filtHumidity;
      heatIndexF = filtHeatIndexF;
      heatIndexC = fahrenheitToCelsius(heatIndexF);
    } else {
      Serial.println("SHT40 read failed — marking OFFLINE.");
      sht40Available = false;
      shtFilterReady = false;
    }
  }

  if (veml6075Available) {
    float rawUva = uv.readUVA();
    float rawUvb = uv.readUVB();
    float rawUvi = uv.readUVI();

    if (rawUvi < 0.0f) {
      Serial.println("VEML6075 read failed — marking OFFLINE.");
      veml6075Available = false;
      uvFilterReady = false;
      uva = uvb = uvIndex = -999;
    } else {
      float correctedUva = clampf((rawUva - UVA_DARK_OFFSET) * UV_SCALE_FACTOR, 0.0f, 2000.0f);
      float correctedUvb = clampf((rawUvb - UVB_DARK_OFFSET) * UV_SCALE_FACTOR, 0.0f, 2000.0f);
      float correctedUvi = clampf((rawUvi - UVI_DARK_OFFSET) * UV_SCALE_FACTOR, 0.0f, 20.0f);

      if (!uvFilterReady) {
        filtUva = correctedUva;
        filtUvb = correctedUvb;
        filtUvi = correctedUvi;
        uvFilterReady = true;
      } else {
        filtUva = applyEma(filtUva, correctedUva, EMA_ALPHA_UVA);
        filtUvb = applyEma(filtUvb, correctedUvb, EMA_ALPHA_UVB);
        filtUvi = applyEma(filtUvi, correctedUvi, EMA_ALPHA_UVI);
      }

      uva = filtUva;
      uvb = filtUvb;
      uvIndex = filtUvi;
    }
  }

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

  // Output sensor data as JSON for Python serial reader
  String sensorJson = "RAYSHIELD_SENSOR_DATA:";
  sensorJson += "{";
  sensorJson += "\"temperature_c\":"  + String(tempC, 2) + ",";
  sensorJson += "\"temperature_f\":"  + String(tempF, 2) + ",";
  sensorJson += "\"humidity\":"       + String(humidity, 2) + ",";
  sensorJson += "\"heat_index_c\":"   + String(heatIndexC, 2) + ",";
  sensorJson += "\"heat_index_f\":"   + String(heatIndexF, 2) + ",";
  sensorJson += "\"uv_index\":"       + String(uvIndex, 2) + ",";
  sensorJson += "\"uva\":"            + String(uva, 2) + ",";
  sensorJson += "\"uvb\":"            + String(uvb, 2);
  sensorJson += "}";
  Serial.println(sensorJson);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectWiFi();
    return;
  }

  // Data will be read from serial by Python script and posted to API
  Serial.println("(Sensor data sent to serial for Python bridge to post)");
}
