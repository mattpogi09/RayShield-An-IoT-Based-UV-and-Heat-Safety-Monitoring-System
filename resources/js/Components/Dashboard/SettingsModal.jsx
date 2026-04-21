import { useState } from 'react';

export default function SettingsModal({ manualNightMode, temperatureUnit, isNightMode, onSave, onClose }) {
    const [manualNight, setManualNight] = useState(manualNightMode);
    const [tempUnit, setTempUnit] = useState(temperatureUnit);

    const handleSave = () => {
        onSave({
            auto_night_mode: false,
            manual_night_mode: manualNight,
            temperature_unit: tempUnit,
        });
        onClose();
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm ${isNightMode ? 'bg-black/60' : 'bg-slate-900/35'}`}
            onClick={onClose}
        >
            <div
                className={`w-full max-w-md max-h-[88vh] overflow-y-auto rounded-2xl p-4 sm:p-6 ${isNightMode ? 'bg-[#1a1f4e] border border-white/10' : 'bg-white border border-slate-200 shadow-2xl'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`font-bold text-lg ${isNightMode ? 'text-white' : 'text-slate-900'}`}>Settings</h2>
                    <button onClick={onClose} className={`${isNightMode ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'} transition-colors`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Night Mode */}
                <div className="mb-6">
                    <h3 className={`font-semibold text-sm mb-3 ${isNightMode ? 'text-white' : 'text-slate-800'}`}>Night Mode</h3>

                    <label className="flex items-center justify-between cursor-pointer">
                        <span className={`text-sm ${isNightMode ? 'text-gray-300' : 'text-slate-600'}`}>Enable night mode</span>
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
                </div>

                {/* Temperature Unit */}
                <div className="mb-6">
                    <h3 className={`font-semibold text-sm mb-3 ${isNightMode ? 'text-white' : 'text-slate-800'}`}>Temperature Unit</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={() => setTempUnit('celsius')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                                tempUnit === 'celsius'
                                    ? 'bg-purple-500 text-white'
                                    : isNightMode
                                        ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Celsius (°C)
                        </button>
                        <button
                            onClick={() => setTempUnit('fahrenheit')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                                tempUnit === 'fahrenheit'
                                    ? 'bg-purple-500 text-white'
                                    : isNightMode
                                        ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Fahrenheit (°F)
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className={`w-full py-3 text-white font-semibold rounded-lg transition-colors ${isNightMode ? 'bg-purple-500 hover:bg-purple-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    Save Settings
                </button>
            </div>
        </div>
    );
}
