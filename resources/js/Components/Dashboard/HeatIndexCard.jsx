import { useEffect, useRef, useState } from 'react';

export default function HeatIndexCard({
    heatIndexC,
    heatIndexF,
    unit,
    humidity,
    temperatureF,
    temperatureC,
    onClickDetail,
    isNightMode,
}) {
    const heatIndex = unit === 'celsius' ? heatIndexC : heatIndexF;
    const unitSymbol = unit === 'celsius' ? '°C' : '°F';
    const [animatedHeatIndex, setAnimatedHeatIndex] = useState(typeof heatIndex === 'number' ? heatIndex : 0);
    const animatedHeatIndexRef = useRef(typeof heatIndex === 'number' ? heatIndex : 0);
    const animationFrameRef = useRef(null);

    // Heat Index danger levels (based on Fahrenheit)
    const hiF = typeof heatIndexF === 'number' ? heatIndexF : 0;

    useEffect(() => {
        animatedHeatIndexRef.current = animatedHeatIndex;
    }, [animatedHeatIndex]);

    useEffect(() => {
        if (typeof heatIndex !== 'number') {
            setAnimatedHeatIndex(0);
            animatedHeatIndexRef.current = 0;
            return;
        }

        const start = animatedHeatIndexRef.current;
        const target = heatIndex;

        if (Math.abs(target - start) < 0.03) {
            setAnimatedHeatIndex(target);
            animatedHeatIndexRef.current = target;
            return;
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        const duration = 500;
        const startTime = performance.now();
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const value = start + (target - start) * eased;

            setAnimatedHeatIndex(value);
            animatedHeatIndexRef.current = value;

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(tick);
            }
        };

        animationFrameRef.current = requestAnimationFrame(tick);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [heatIndex]);

    const hiValue = animatedHeatIndex.toFixed(1);

    const getLevel = () => {
        if (hiF >= 130) return { label: 'EXTREME DANGER', color: 'text-fuchsia-400', bg: 'from-fuchsia-900/55 via-purple-900/45 to-red-900/45', border: 'border-fuchsia-500/40', glow: 'shadow-lg shadow-fuchsia-900/40', lightBg: 'from-fuchsia-100 via-rose-100 to-red-100', lightBorder: 'border-fuchsia-300', lightChip: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200', desc: 'Heat stroke highly likely. Avoid all outdoor activity.' };
        if (hiF >= 105) return { label: 'DANGER', color: 'text-red-400', bg: 'from-red-900/55 via-rose-900/45 to-orange-900/35', border: 'border-red-500/40', glow: 'shadow-lg shadow-red-900/35', lightBg: 'from-red-100 via-rose-100 to-orange-100', lightBorder: 'border-red-300', lightChip: 'text-red-700 bg-red-50 border-red-200', desc: 'Heat cramps and heat exhaustion likely. Heat stroke possible with prolonged exposure.' };
        if (hiF >= 90) return { label: 'EXTREME CAUTION', color: 'text-orange-400', bg: 'from-orange-900/55 via-amber-900/45 to-yellow-900/30', border: 'border-orange-500/40', glow: 'shadow-lg shadow-orange-900/35', lightBg: 'from-orange-100 via-amber-100 to-yellow-100', lightBorder: 'border-orange-300', lightChip: 'text-orange-700 bg-orange-50 border-orange-200', desc: 'Heat cramps and heat exhaustion possible. Limit outdoor activities.' };
        if (hiF >= 80) return { label: 'CAUTION', color: 'text-yellow-400', bg: 'from-yellow-900/50 via-amber-900/35 to-lime-900/25', border: 'border-yellow-500/40', glow: 'shadow-lg shadow-yellow-900/30', lightBg: 'from-yellow-100 via-amber-100 to-lime-100', lightBorder: 'border-yellow-300', lightChip: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'Fatigue possible with prolonged exposure and physical activity.' };
        return { label: 'SAFE', color: 'text-green-400', bg: 'from-emerald-900/45 via-green-900/35 to-teal-900/30', border: 'border-green-500/40', glow: 'shadow-lg shadow-emerald-900/30', lightBg: 'from-emerald-100 via-green-100 to-cyan-100', lightBorder: 'border-emerald-300', lightChip: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'Heat index is within safe range. Normal activity is fine.' };
    };

    const level = getLevel();

    // Heat Index scale segments (based on unit)
    const segmentsFahrenheit = [
        { min: 0, max: 80, label: 'Safe', color: 'bg-green-500' },
        { min: 80, max: 90, label: 'Caution', color: 'bg-yellow-500' },
        { min: 90, max: 105, label: 'Ext. Caution', color: 'bg-orange-500' },
        { min: 105, max: 130, label: 'Danger', color: 'bg-red-500' },
        { min: 130, max: 150, label: 'Ext. Danger', color: 'bg-fuchsia-500' },
    ];

    const segmentsCelsius = [
        { min: 0, max: 27, label: 'Safe', color: 'bg-green-500' },
        { min: 27, max: 32, label: 'Caution', color: 'bg-yellow-500' },
        { min: 32, max: 39, label: 'Ext. Caution', color: 'bg-orange-500' },
        { min: 39, max: 51, label: 'Danger', color: 'bg-red-500' },
        { min: 51, max: 60, label: 'Ext. Danger', color: 'bg-fuchsia-500' },
    ];

    const segments = unit === 'celsius' ? segmentsCelsius : segmentsFahrenheit;
    const maxScale = unit === 'celsius' ? 60 : 150;
    const currentValue = animatedHeatIndex;
    const barPercentage = Math.min(Math.max((currentValue / maxScale) * 100, 0), 100);
    const scaleTicks = unit === 'celsius'
        ? [0, 27, 32, 39, 51, 60]
        : [0, 80, 90, 105, 130, 150];

    const containerClass = isNightMode
        ? `border ${level.border} bg-gradient-to-r ${level.bg} ${level.glow} backdrop-blur-sm`
        : `border ${level.lightBorder} bg-gradient-to-r ${level.lightBg} shadow-md`;
    const titleClass = isNightMode ? 'text-white' : 'text-slate-800';
    const bodyClass = isNightMode ? 'text-gray-300' : 'text-slate-600';
    const subtleTextClass = isNightMode ? 'text-gray-400' : 'text-slate-500';
    const panelClass = isNightMode
        ? 'bg-white/5'
        : hiF >= 105
            ? 'bg-red-50/90 border border-red-200/70'
            : hiF >= 90
                ? 'bg-orange-50/90 border border-orange-200/70'
                : hiF >= 80
                    ? 'bg-amber-50/90 border border-amber-200/70'
                    : 'bg-emerald-50/90 border border-emerald-200/70';

    return (
        <div
            className={`rounded-2xl p-6 transition-all duration-300 ease-out ${containerClass} ${onClickDetail ? `cursor-pointer group ${
                isNightMode
                    ? 'hover:border-white/60 hover:shadow-2xl hover:shadow-orange-900/50 hover:scale-[1.012]'
                    : 'hover:border-orange-400 hover:shadow-xl hover:shadow-orange-200/60 hover:scale-[1.012]'
            }` : ''}`}
            onClick={onClickDetail}
            onKeyDown={(e) => {
                if (!onClickDetail) return;
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClickDetail();
                }
            }}
            role={onClickDetail ? 'button' : undefined}
            tabIndex={onClickDetail ? 0 : undefined}
            aria-label={onClickDetail ? 'Open heat index raw status details' : undefined}
        >
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                <h2 className={`font-semibold text-lg ${titleClass}`}>Heat Index</h2>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold transition-all duration-500 ${isNightMode ? `${level.color} bg-white/5 border border-white/10` : level.lightChip}`}>
                    {level.label}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Value and description */}
                <div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className={`text-5xl font-bold transition-colors duration-500 ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{hiValue}</span>
                        <span className={`text-xl transition-colors duration-500 ${subtleTextClass}`}>{unitSymbol}</span>
                    </div>
                    <p className={`text-sm ${bodyClass}`}>{level.desc}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className={`${panelClass} rounded-lg p-3`}>
                            <p className={`${subtleTextClass} text-xs`}>Feels Like vs Actual</p>
                            <p className={`font-semibold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
                                {(() => {
                                    const actualTemp = unit === 'celsius' ? (temperatureC || 0) : (temperatureF || 0);
                                    const feelsLike = unit === 'celsius' ? (heatIndexC || 0) : (heatIndexF || 0);
                                    const diff = feelsLike - actualTemp;
                                    const sign = diff > 0 ? '+' : '';
                                    return `${sign}${diff.toFixed(1)}${unitSymbol}`;
                                })()}
                            </p>
                        </div>
                        <div className={`${panelClass} rounded-lg p-3`}>
                            <p className={`${subtleTextClass} text-xs`}>Humidity Factor</p>
                            <p className={`font-semibold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{typeof humidity === 'number' ? humidity.toFixed(0) : 0}%</p>
                        </div>
                    </div>
                </div>

                {/* Right: Scale bar */}
                <div>
                    <p className={`text-xs mb-3 ${subtleTextClass}`}>Heat Index Scale ({unitSymbol})</p>
                    <div className="relative">
                        {/* Scale bar segments */}
                        <div className="flex rounded-full overflow-hidden h-4 mb-2">
                            {segments.map((seg, i) => (
                                <div
                                    key={i}
                                    className={`${seg.color} opacity-60`}
                                    style={{ width: `${((seg.max - seg.min) / maxScale) * 100}%` }}
                                />
                            ))}
                        </div>

                        {/* Indicator */}
                        <div
                            className={`absolute top-0 w-1 h-4 rounded-full transition-all duration-500 ${isNightMode ? 'bg-white shadow-lg shadow-white/50' : 'bg-slate-700 shadow-md shadow-slate-700/30'}`}
                            style={{ left: `${barPercentage}%` }}
                        />

                        {/* Labels */}
                        <div className={`relative mt-1 h-4 text-[10px] ${isNightMode ? 'text-gray-500' : 'text-slate-500'}`}>
                            {scaleTicks.map((tick, idx) => {
                                const leftPercent = (tick / maxScale) * 100;
                                const baseClass = 'absolute';
                                const positionClass = idx === 0
                                    ? 'left-0'
                                    : idx === scaleTicks.length - 1
                                        ? 'right-0'
                                        : '-translate-x-1/2';

                                return (
                                    <span
                                        key={tick}
                                        className={`${baseClass} ${positionClass}`}
                                        style={idx === 0 || idx === scaleTicks.length - 1 ? undefined : { left: `${leftPercent}%` }}
                                    >
                                        {tick}{unitSymbol}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-4 space-y-1">
                        {segments.map((seg, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                                <div className={`w-2 h-2 rounded-full ${seg.color}`} />
                                <span className={subtleTextClass}>{seg.label}: {seg.min}–{seg.max}{unitSymbol}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
