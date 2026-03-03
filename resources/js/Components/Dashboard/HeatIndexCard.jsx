export default function HeatIndexCard({ heatIndexC, heatIndexF, unit, humidity, temperatureF }) {
    const heatIndex = unit === 'celsius' ? heatIndexC : heatIndexF;
    const unitSymbol = unit === 'celsius' ? '°C' : '°F';
    const hiValue = typeof heatIndex === 'number' ? heatIndex.toFixed(1) : '0.0';

    // Heat Index danger levels (based on Fahrenheit)
    const hiF = typeof heatIndexF === 'number' ? heatIndexF : 0;

    const getLevel = () => {
        if (hiF >= 130) return { label: 'EXTREME DANGER', color: 'text-fuchsia-400', bg: 'from-fuchsia-900/30 to-red-900/30', border: 'border-fuchsia-500/30', desc: 'Heat stroke highly likely. Avoid all outdoor activity.' };
        if (hiF >= 105) return { label: 'DANGER', color: 'text-red-400', bg: 'from-red-900/30 to-orange-900/30', border: 'border-red-500/30', desc: 'Heat cramps and heat exhaustion likely. Heat stroke possible with prolonged exposure.' };
        if (hiF >= 90) return { label: 'EXTREME CAUTION', color: 'text-orange-400', bg: 'from-orange-900/30 to-yellow-900/30', border: 'border-orange-500/30', desc: 'Heat cramps and heat exhaustion possible. Limit outdoor activities.' };
        if (hiF >= 80) return { label: 'CAUTION', color: 'text-yellow-400', bg: 'from-yellow-900/30 to-green-900/30', border: 'border-yellow-500/30', desc: 'Fatigue possible with prolonged exposure and physical activity.' };
        return { label: 'SAFE', color: 'text-green-400', bg: 'from-green-900/30 to-teal-900/30', border: 'border-green-500/30', desc: 'Heat index is within safe range. Normal activity is fine.' };
    };

    const level = getLevel();

    // Heat Index scale segments
    const segments = [
        { min: 0, max: 80, label: 'Safe', color: 'bg-green-500' },
        { min: 80, max: 90, label: 'Caution', color: 'bg-yellow-500' },
        { min: 90, max: 105, label: 'Ext. Caution', color: 'bg-orange-500' },
        { min: 105, max: 130, label: 'Danger', color: 'bg-red-500' },
        { min: 130, max: 150, label: 'Ext. Danger', color: 'bg-fuchsia-500' },
    ];

    const barPercentage = Math.min(Math.max((hiF / 150) * 100, 0), 100);

    return (
        <div className={`rounded-2xl border ${level.border} bg-gradient-to-r ${level.bg} backdrop-blur-sm p-6`}>
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                <h2 className="text-white font-semibold text-lg">Heat Index</h2>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${level.color} bg-white/5 border border-white/10`}>
                    {level.label}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Value and description */}
                <div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-bold text-white">{hiValue}</span>
                        <span className="text-xl text-gray-400">{unitSymbol}</span>
                    </div>
                    <p className="text-sm text-gray-300">{level.desc}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-gray-400 text-xs">Feels Like vs Actual</p>
                            <p className="text-white font-semibold">
                                {unit === 'celsius'
                                    ? `${(heatIndexC - (unit === 'celsius' ? heatIndexC : 0) + (heatIndexC)).toFixed(1) !== hiValue ? '+' : ''}${(heatIndexC - (typeof heatIndexC === 'number' && typeof (unit === 'celsius' ? heatIndexC : heatIndexF) === 'number' ? 0 : 0)).toFixed(1)}${unitSymbol}`
                                    : `${hiValue}${unitSymbol}`
                                }
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-gray-400 text-xs">Humidity Factor</p>
                            <p className="text-white font-semibold">{typeof humidity === 'number' ? humidity.toFixed(0) : 0}%</p>
                        </div>
                    </div>
                </div>

                {/* Right: Scale bar */}
                <div>
                    <p className="text-xs text-gray-400 mb-3">Heat Index Scale (°F)</p>
                    <div className="relative">
                        {/* Scale bar segments */}
                        <div className="flex rounded-full overflow-hidden h-4 mb-2">
                            {segments.map((seg, i) => (
                                <div
                                    key={i}
                                    className={`${seg.color} opacity-60 flex-1`}
                                />
                            ))}
                        </div>

                        {/* Indicator */}
                        <div
                            className="absolute top-0 w-1 h-4 bg-white rounded-full shadow-lg shadow-white/50 transition-all duration-500"
                            style={{ left: `${barPercentage}%` }}
                        />

                        {/* Labels */}
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                            <span>0°F</span>
                            <span>80°F</span>
                            <span>90°F</span>
                            <span>105°F</span>
                            <span>130°F</span>
                            <span>150°F</span>
                        </div>
                    </div>

                    <div className="mt-4 space-y-1">
                        {segments.map((seg, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                                <div className={`w-2 h-2 rounded-full ${seg.color}`} />
                                <span className="text-gray-400">{seg.label}: {seg.min}–{seg.max}°F</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
