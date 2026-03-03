import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import UVIndexCard from '@/Components/Dashboard/UVIndexCard';
import TemperatureCard from '@/Components/Dashboard/TemperatureCard';
import HumidityCard from '@/Components/Dashboard/HumidityCard';
import HeatIndexCard from '@/Components/Dashboard/HeatIndexCard';
import SafetyTips from '@/Components/Dashboard/SafetyTips';
import StatusBanner from '@/Components/Dashboard/StatusBanner';
import PhilippineClock from '@/Components/Dashboard/PhilippineClock';
import SettingsModal from '@/Components/Dashboard/SettingsModal';
import UVDetailModal from '@/Components/Dashboard/UVDetailModal';

export default function Dashboard() {
    const { latestReading, settings } = usePage().props;

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

    const [isNightMode, setIsNightMode] = useState(false);
    const [autoNightMode, setAutoNightMode] = useState(settings?.auto_night_mode ?? true);
    const [tempUnit, setTempUnit] = useState(settings?.temperature_unit || 'celsius');
    const [showSettings, setShowSettings] = useState(false);
    const [showUVDetail, setShowUVDetail] = useState(false);

    const checkNightMode = useCallback(() => {
        if (!autoNightMode) return;
        const phTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
        const hour = new Date(phTime).getHours();
        setIsNightMode(hour >= 18 || hour < 6);
    }, [autoNightMode]);

    useEffect(() => {
        checkNightMode();
        const interval = setInterval(checkNightMode, 60000);
        return () => clearInterval(interval);
    }, [checkNightMode]);

    useEffect(() => {
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
                console.log('Polling error:', err);
            }
        };

        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSettingsSave = (newSettings) => {
        setAutoNightMode(newSettings.auto_night_mode);
        setTempUnit(newSettings.temperature_unit);

        if (!newSettings.auto_night_mode) {
            setIsNightMode(newSettings.manual_night_mode || false);
        } else {
            checkNightMode();
        }

        router.patch('/settings', {
            auto_night_mode: newSettings.auto_night_mode,
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

    return (
        <>
            <Head title="Dashboard" />

            <div className={`min-h-screen transition-colors duration-700 ${
                isNightMode
                    ? 'bg-gradient-to-br from-[#0a0e27] via-[#111638] to-[#0d1229]'
                    : 'bg-gradient-to-br from-[#1a1f4e] via-[#1e2555] to-[#161b45]'
            }`}>
                <header className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-purple-400/50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                <span className="text-white">RAY</span>
                                <span className="text-purple-400">SHIELD</span>
                            </h1>
                            <p className="text-xs text-gray-400 tracking-wider">IOT SAFETY MONITOR</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                            title="Settings"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        <PhilippineClock />
                    </div>
                </header>

                <div className="px-6 mb-6">
                    <StatusBanner uvIndex={uvIndex} isNightMode={isNightMode} />
                </div>

                <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
                        />
                    </div>
                </div>

                <div className="px-6 mb-6">
                    <HeatIndexCard
                        heatIndexC={sensorData.heat_index_c}
                        heatIndexF={sensorData.heat_index_f}
                        unit={tempUnit}
                        humidity={sensorData.humidity}
                        temperatureF={sensorData.temperature_f}
                    />
                </div>

                <div className="px-6 pb-8">
                    <SafetyTips />
                </div>

                {showSettings && (
                    <SettingsModal
                        autoNightMode={autoNightMode}
                        manualNightMode={isNightMode}
                        temperatureUnit={tempUnit}
                        onSave={handleSettingsSave}
                        onClose={() => setShowSettings(false)}
                    />
                )}

                {showUVDetail && (
                    <UVDetailModal
                        uva={sensorData.uva}
                        uvb={sensorData.uvb}
                        uvIndex={uvIndex}
                        onClose={() => setShowUVDetail(false)}
                    />
                )}
            </div>
        </>
    );
}
