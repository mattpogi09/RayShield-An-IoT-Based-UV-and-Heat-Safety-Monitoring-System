import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import UVIndexCard from '@/Components/Dashboard/UVIndexCard';
import TemperatureCard from '@/Components/Dashboard/TemperatureCard';
import HumidityCard from '@/Components/Dashboard/HumidityCard';
import HeatIndexCard from '@/Components/Dashboard/HeatIndexCard';
import SafetyTips from '@/Components/Dashboard/SafetyTips';
import StatusBanner from '@/Components/Dashboard/StatusBanner';
import PhilippineClock from '@/Components/Dashboard/PhilippineClock';
import SettingsModal from '@/Components/Dashboard/SettingsModal';
import SensorDisconnectModal from '@/Components/Dashboard/SensorDisconnectModal';
import HeatIndexDetailModal from '@/Components/Dashboard/HeatIndexDetailModal';
import UVDetailModal from '@/Components/Dashboard/UVDetailModal';
import BurgerMenu from '@/Components/Dashboard/BurgerMenu';

const MAX_LOG_ENTRIES = 100;

export default function Dashboard() {
    const { latestReading, settings, sensorStatus: initialSensorStatus } = usePage().props;
    const initialHasSensorIssue = !(initialSensorStatus?.sht40_connected ?? false)
        || !(initialSensorStatus?.veml6075_connected ?? false)
        || (initialSensorStatus?.data_stale ?? true);

    const [sensorData, setSensorData] = useState(latestReading || {
        temperature_c: 0,
        temperature_f: 32,
        humidity: 0,
        heat_index_c: 0,
        heat_index_f: 32,
        uv_index: 0,
        uva: 0,
        uvb: 0,
        created_at: new Date().toISOString(),
    });

    const [isNightMode, setIsNightMode] = useState(settings?.manual_night_mode ?? false);
    const [manualNightMode, setManualNightMode] = useState(settings?.manual_night_mode ?? false);
    const [tempUnit, setTempUnit] = useState(settings?.temperature_unit || 'celsius');
    const [showSettings, setShowSettings] = useState(false);
    const [showUVDetail, setShowUVDetail] = useState(false);
    const [showHeatIndexDetail, setShowHeatIndexDetail] = useState(false);
    const [sensorStatus, setSensorStatus] = useState(initialSensorStatus || {
        sht40_connected: false,
        veml6075_connected: false,
        data_stale: true,
    });
    const [showSensorModal, setShowSensorModal] = useState(initialHasSensorIssue);
    const [isReloadingSensors, setIsReloadingSensors] = useState(false);
    const [showBurgerMenu, setShowBurgerMenu] = useState(false);

    // Activity log: accumulates unique sensor readings (detected by created_at change)
    const [activityLog, setActivityLog] = useState([]);
    const lastCreatedAtRef = useRef(latestReading?.created_at ?? null);
    const previousIssueRef = useRef(initialHasSensorIssue);

    const fetchLatestData = useCallback(async (forceFresh = false) => {
        const url = forceFresh
            ? `/api/sensor-data/latest?fresh=1&t=${Date.now()}`
            : '/api/sensor-data/latest';

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch latest sensor data (${response.status})`);
        }

        const json = await response.json();

        if (json.data) {
            setSensorData(json.data);

            // Append to activity log only when created_at changes (new unique reading)
            if (json.data.created_at && json.data.created_at !== lastCreatedAtRef.current) {
                lastCreatedAtRef.current = json.data.created_at;
                setActivityLog((prev) => {
                    const next = [json.data, ...prev];
                    return next.slice(0, MAX_LOG_ENTRIES);
                });
            }
        }

        if (json.sensor_status) {
            setSensorStatus(json.sensor_status);
        }

        return json;
    }, []);

    const handleReloadSensors = useCallback(async () => {
        setIsReloadingSensors(true);

        try {
            for (let attempt = 0; attempt < 3; attempt += 1) {
                const json = await fetchLatestData(true);
                const status = json?.sensor_status;
                const healthy = status
                    && status.sht40_connected
                    && status.veml6075_connected
                    && !status.data_stale;

                if (healthy) {
                    break;
                }

                if (attempt < 2) {
                    await new Promise((resolve) => setTimeout(resolve, 900));
                }
            }
        } catch (err) {
            console.log('Manual sensor reload failed:', err);
        } finally {
            setIsReloadingSensors(false);
        }
    }, [fetchLatestData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchLatestData(false);
            } catch (err) {
                console.log('Polling error:', err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 1500);
        return () => clearInterval(interval);
    }, [fetchLatestData]);

    const handleSettingsSave = (newSettings) => {
        setManualNightMode(newSettings.manual_night_mode);
        setTempUnit(newSettings.temperature_unit);
        setIsNightMode(newSettings.manual_night_mode);

        router.patch('/settings', {
            auto_night_mode: false,
            manual_night_mode: newSettings.manual_night_mode,
            temperature_unit: newSettings.temperature_unit,
        }, { preserveState: true });
    };

    const uvIndex = sensorData.uv_index ?? 0;
    const temperature = tempUnit === 'celsius'
        ? sensorData.temperature_c
        : sensorData.temperature_f;
    const heatIndex = tempUnit === 'celsius'
        ? sensorData.heat_index_c
        : sensorData.heat_index_f;
    const showStatusBanner = isNightMode || uvIndex >= 3;
    const hasSensorIssue = !sensorStatus?.sht40_connected
        || !sensorStatus?.veml6075_connected
        || sensorStatus?.data_stale;

    const getUvNotification = () => {
        if (isNightMode) {
            return {
                title: 'Night Monitoring Active',
                message: 'UV is expected to stay low at night. Monitoring continues for any daytime transition.',
                chip: 'bg-indigo-500/20 border-indigo-300/30 text-indigo-200',
                dot: 'bg-indigo-300',
                hasAlert: false,
            };
        }

        if (uvIndex >= 8) {
            return {
                title: 'Unsafe UV Level',
                message: `UV index is ${uvIndex}. Limit outdoor exposure and use full protection.`,
                chip: 'bg-red-500/20 border-red-300/35 text-red-200',
                dot: 'bg-red-300',
                hasAlert: true,
            };
        }

        if (uvIndex >= 3) {
            return {
                title: 'UV Caution Notice',
                message: `UV index is ${uvIndex}. Protective measures are recommended outdoors.`,
                chip: 'bg-amber-500/20 border-amber-300/35 text-amber-200',
                dot: 'bg-amber-300',
                hasAlert: true,
            };
        }

        return {
            title: 'Low UV Notification',
            message: 'UV levels are low and currently safe for normal outdoor activity.',
            chip: isNightMode ? 'bg-emerald-500/20 border-emerald-300/30 text-emerald-200' : 'bg-emerald-500/15 border-emerald-300/35 text-emerald-700',
            dot: isNightMode ? 'bg-emerald-300' : 'bg-emerald-500',
            hasAlert: false,
        };
    };

    const uvNotification = getUvNotification();

    useEffect(() => {
        if (hasSensorIssue && !previousIssueRef.current) {
            setShowSensorModal(true);
        }
        if (!hasSensorIssue) {
            setShowSensorModal(false);
        }
        previousIssueRef.current = hasSensorIssue;
    }, [hasSensorIssue]);

    return (
        <>
            <Head title="Dashboard" />

            <div className={`min-h-screen overflow-x-hidden transition-colors duration-700 ${
                isNightMode
                    ? 'bg-gradient-to-br from-[#0a0e27] via-[#111638] to-[#0d1229]'
                    : 'bg-gradient-to-br from-[#f8fbff] via-[#eef4ff] to-[#e8f1ff]'
            }`}>
                {/* ── HEADER ── */}
                <header className="px-3 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${isNightMode ? 'border-purple-400/50' : 'border-indigo-300/70 bg-white/80'}`}>
                            <svg className={`w-5 h-5 ${isNightMode ? 'text-purple-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold">
                                <span className={isNightMode ? 'text-white' : 'text-slate-800'}>RAY</span>
                                <span className={isNightMode ? 'text-purple-400' : 'text-indigo-600'}>SHIELD</span>
                            </h1>
                            <p className={`text-xs tracking-wider ${isNightMode ? 'text-gray-400' : 'text-slate-500'}`}>IOT SAFETY MONITOR</p>
                        </div>
                    </div>

                    {/* Right side controls */}
                    <div className="relative flex w-full items-center justify-between gap-2 md:w-auto md:justify-end md:gap-3">
                        <PhilippineClock isNightMode={isNightMode} />

                        <div className="flex items-center gap-2">
                            {/* Sensor Warning — stays in header */}
                            {hasSensorIssue && (
                                <button
                                    onClick={() => setShowSensorModal(true)}
                                    className={`h-10 inline-flex items-center gap-2 rounded-lg border px-2.5 sm:px-3 text-[11px] sm:text-xs font-semibold transition-colors ${isNightMode
                                        ? 'border-amber-400/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
                                        : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                    }`}
                                    title="Sensor alerts"
                                >
                                    <span className={`inline-block h-2 w-2 rounded-full animate-pulse ${isNightMode ? 'bg-amber-300' : 'bg-amber-500'}`} />
                                    <span className="hidden sm:inline">Sensor Warning</span>
                                    <span className="sm:hidden">Warning</span>
                                </button>
                            )}

                            {/* Burger menu button */}
                            <button
                                id="burger-menu-btn"
                                onClick={() => setShowBurgerMenu(true)}
                                className={`h-10 w-10 inline-flex flex-col items-center justify-center gap-1.5 rounded-lg transition-colors ${isNightMode
                                    ? 'hover:bg-white/10 text-gray-300'
                                    : 'hover:bg-slate-200/70 text-slate-600'
                                }`}
                                title="Menu"
                                aria-label="Open menu"
                            >
                                <span className={`block w-5 h-0.5 rounded-full ${isNightMode ? 'bg-gray-300' : 'bg-slate-600'}`} />
                                <span className={`block w-5 h-0.5 rounded-full ${isNightMode ? 'bg-gray-300' : 'bg-slate-600'}`} />
                                <span className={`block w-5 h-0.5 rounded-full ${isNightMode ? 'bg-gray-300' : 'bg-slate-600'}`} />
                            </button>
                        </div>
                    </div>
                </header>

                {showStatusBanner && (
                    <div className="px-3 sm:px-6 mb-6">
                        <StatusBanner uvIndex={uvIndex} isNightMode={isNightMode} />
                    </div>
                )}

                <div className="px-3 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-2">
                        <UVIndexCard
                            uvIndex={uvIndex}
                            isNightMode={isNightMode}
                            onClickDetail={() => setShowUVDetail(true)}
                        />
                    </div>
                    <div className="space-y-6">
                        <TemperatureCard
                            temperature={temperature}
                            unit={tempUnit}
                            heatIndex={heatIndex}
                            isNightMode={isNightMode}
                        />
                        <HumidityCard
                            humidity={sensorData.humidity}
                            temperature={sensorData.temperature_c}
                            isNightMode={isNightMode}
                        />
                    </div>
                </div>

                <div className="px-3 sm:px-6 mb-6">
                    <HeatIndexCard
                        heatIndexC={sensorData.heat_index_c}
                        heatIndexF={sensorData.heat_index_f}
                        unit={tempUnit}
                        humidity={sensorData.humidity}
                        temperatureC={sensorData.temperature_c}
                        temperatureF={sensorData.temperature_f}
                        onClickDetail={() => setShowHeatIndexDetail(true)}
                        isNightMode={isNightMode}
                    />
                </div>

                <div className="px-3 sm:px-6 pb-8">
                    <SafetyTips isNightMode={isNightMode} />
                </div>

                {/* ── Burger Menu Drawer ── */}
                <BurgerMenu
                    open={showBurgerMenu}
                    onClose={() => setShowBurgerMenu(false)}
                    isNightMode={isNightMode}
                    uvNotification={uvNotification}
                    tempUnit={tempUnit}
                    activityLog={activityLog}
                    manualNightMode={manualNightMode}
                    onSettingsSave={handleSettingsSave}
                />

                {/* Settings Modal (kept for compat but triggered only from BurgerMenu now via handleSettingsSave) */}
                {showSettings && (
                    <SettingsModal
                        manualNightMode={manualNightMode}
                        temperatureUnit={tempUnit}
                        isNightMode={isNightMode}
                        onSave={handleSettingsSave}
                        onClose={() => setShowSettings(false)}
                    />
                )}

                {showUVDetail && (
                    <UVDetailModal
                        uva={sensorData.uva}
                        uvb={sensorData.uvb}
                        uvIndex={uvIndex}
                        isNightMode={isNightMode}
                        onClose={() => setShowUVDetail(false)}
                    />
                )}

                {showHeatIndexDetail && (
                    <HeatIndexDetailModal
                        heatIndexC={sensorData.heat_index_c}
                        heatIndexF={sensorData.heat_index_f}
                        temperatureC={sensorData.temperature_c}
                        temperatureF={sensorData.temperature_f}
                        humidity={sensorData.humidity}
                        createdAt={sensorData.created_at}
                        isNightMode={isNightMode}
                        onClose={() => setShowHeatIndexDetail(false)}
                    />
                )}

                {hasSensorIssue && showSensorModal && (
                    <SensorDisconnectModal
                        status={sensorStatus}
                        onClose={() => setShowSensorModal(false)}
                        onReload={handleReloadSensors}
                        isReloading={isReloadingSensors}
                        isNightMode={isNightMode}
                    />
                )}
            </div>
        </>
    );
}
