import { useState } from 'react';

export default function SettingsModal({ autoNightMode, manualNightMode, temperatureUnit, onSave, onClose }) {
    const [autoNight, setAutoNight] = useState(autoNightMode);
    const [manualNight, setManualNight] = useState(manualNightMode);
    const [tempUnit, setTempUnit] = useState(temperatureUnit);

    const handleSave = () => {
        onSave({
            auto_night_mode: autoNight,
            manual_night_mode: manualNight,
            temperature_unit: tempUnit,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#1a1f4e] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white font-bold text-lg">Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Night Mode */}
                <div className="mb-6">
                    <h3 className="text-white font-semibold text-sm mb-3">Night Mode</h3>

                    <label className="flex items-center justify-between mb-3 cursor-pointer">
                        <span className="text-gray-300 text-sm">Auto night mode (6PM–6AM PH time)</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={autoNight}
                                onChange={(e) => setAutoNight(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-10 h-6 rounded-full transition-colors ${autoNight ? 'bg-purple-500' : 'bg-gray-600'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full transform transition-transform mt-1 ${autoNight ? 'translate-x-5' : 'translate-x-1'}`} />
                            </div>
                        </div>
                    </label>

                    {!autoNight && (
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-gray-300 text-sm">Manual night mode</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={manualNight}
                                    onChange={(e) => setManualNight(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors ${manualNight ? 'bg-purple-500' : 'bg-gray-600'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform mt-1 ${manualNight ? 'translate-x-5' : 'translate-x-1'}`} />
                                </div>
                            </div>
                        </label>
                    )}
                </div>

                {/* Temperature Unit */}
                <div className="mb-6">
                    <h3 className="text-white font-semibold text-sm mb-3">Temperature Unit</h3>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setTempUnit('celsius')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                                tempUnit === 'celsius'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            Celsius (°C)
                        </button>
                        <button
                            onClick={() => setTempUnit('fahrenheit')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                                tempUnit === 'fahrenheit'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            Fahrenheit (°F)
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
                >
                    Save Settings
                </button>
            </div>
        </div>
    );
}
