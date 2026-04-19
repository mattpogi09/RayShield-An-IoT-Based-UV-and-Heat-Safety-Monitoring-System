export default function HeatIndexDetailModal({
    heatIndexC,
    heatIndexF,
    temperatureC,
    temperatureF,
    humidity,
    createdAt,
    onClose,
    isNightMode,
}) {
    const hiF = typeof heatIndexF === 'number' ? heatIndexF : 0;

    const getHeatLevel = () => {
        if (hiF >= 130) return { label: 'EXTREME DANGER', color: 'text-fuchsia-300' };
        if (hiF >= 105) return { label: 'DANGER', color: 'text-red-300' };
        if (hiF >= 90) return { label: 'EXTREME CAUTION', color: 'text-orange-300' };
        if (hiF >= 80) return { label: 'CAUTION', color: 'text-yellow-300' };
        return { label: 'SAFE', color: 'text-green-300' };
    };

    const level = getHeatLevel();
    const diffC = (typeof heatIndexC === 'number' ? heatIndexC : 0) - (typeof temperatureC === 'number' ? temperatureC : 0);
    const diffF = (typeof heatIndexF === 'number' ? heatIndexF : 0) - (typeof temperatureF === 'number' ? temperatureF : 0);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${isNightMode ? 'bg-black/60' : 'bg-slate-900/35'}`}
            onClick={onClose}
        >
            <div
                className={`w-full max-w-xl rounded-2xl p-6 ${isNightMode ? 'border border-white/10 bg-[#1a1f4e]' : 'border border-slate-200 bg-white shadow-2xl'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className={`text-lg font-bold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>Heat Index Raw Status</h2>
                        <p className={`text-xs ${isNightMode ? 'text-gray-400' : 'text-slate-500'}`}>Live computed values and threshold mapping</p>
                    </div>
                    <button onClick={onClose} className={`${isNightMode ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'} transition-colors`}>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className={`mb-4 rounded-xl p-4 text-sm ${isNightMode ? 'border border-white/10 bg-white/5' : 'border border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center justify-between py-1">
                        <span className={isNightMode ? 'text-gray-300' : 'text-slate-600'}>Current status</span>
                        <span className={`font-semibold ${level.color}`}>{level.label}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className={isNightMode ? 'text-gray-300' : 'text-slate-600'}>Heat Index (°C)</span>
                        <span className={`font-semibold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{typeof heatIndexC === 'number' ? heatIndexC.toFixed(1) : '0.0'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className={isNightMode ? 'text-gray-300' : 'text-slate-600'}>Heat Index (°F)</span>
                        <span className={`font-semibold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{typeof heatIndexF === 'number' ? heatIndexF.toFixed(1) : '32.0'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className={isNightMode ? 'text-gray-300' : 'text-slate-600'}>Air Temperature (°C)</span>
                        <span className={`font-semibold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{typeof temperatureC === 'number' ? temperatureC.toFixed(1) : '0.0'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className={isNightMode ? 'text-gray-300' : 'text-slate-600'}>Air Temperature (°F)</span>
                        <span className={`font-semibold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{typeof temperatureF === 'number' ? temperatureF.toFixed(1) : '32.0'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className={isNightMode ? 'text-gray-300' : 'text-slate-600'}>Humidity</span>
                        <span className={`font-semibold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{typeof humidity === 'number' ? humidity.toFixed(1) : '0.0'}%</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className={isNightMode ? 'text-gray-300' : 'text-slate-600'}>Feels-like delta (°C)</span>
                        <span className={`font-semibold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{`${diffC >= 0 ? '+' : ''}${diffC.toFixed(1)}`}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className={isNightMode ? 'text-gray-300' : 'text-slate-600'}>Feels-like delta (°F)</span>
                        <span className={`font-semibold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{`${diffF >= 0 ? '+' : ''}${diffF.toFixed(1)}`}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className={isNightMode ? 'text-gray-300' : 'text-slate-600'}>Reading timestamp</span>
                        <span className={`font-semibold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
                            {createdAt ? new Date(createdAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : 'N/A'}
                        </span>
                    </div>
                </div>

                <div className={`rounded-xl p-4 text-sm ${isNightMode ? 'border border-white/10 bg-white/5 text-gray-300' : 'border border-slate-200 bg-slate-50 text-slate-700'}`}>
                    <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${isNightMode ? 'text-gray-400' : 'text-slate-500'}`}>Thresholds (heat index °F)</p>
                    <p>Safe: below 80</p>
                    <p>Caution: 80 to 89.9</p>
                    <p>Extreme Caution: 90 to 104.9</p>
                    <p>Danger: 105 to 129.9</p>
                    <p>Extreme Danger: 130 and above</p>
                </div>

                <button
                    onClick={onClose}
                    className={`mt-5 w-full rounded-lg py-3 font-semibold transition-colors ${isNightMode ? 'border border-orange-400/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20' : 'border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
