import { useEffect, useRef, useState } from 'react';

export default function HumidityCard({ humidity, temperature, isNightMode }) {
    const prevHumRef = useRef(humidity);
    const [trend, setTrend] = useState('stable');
    const trendRef = useRef('stable');
    const pendingTrendRef = useRef('stable');
    const pendingCountRef = useRef(0);
    const [animatedHumidity, setAnimatedHumidity] = useState(typeof humidity === 'number' ? humidity : 0);
    const animatedHumidityRef = useRef(typeof humidity === 'number' ? humidity : 0);
    const animationFrameRef = useRef(null);

    const TREND_ENTER = 1.2;
    const TREND_EXIT = 0.5;
    const CONFIRM_UPDATES = 2;

    useEffect(() => {
        if (typeof humidity !== 'number' || typeof prevHumRef.current !== 'number') {
            prevHumRef.current = humidity;
            return;
        }

        const delta = humidity - prevHumRef.current;
        const currentTrend = trendRef.current;

        let candidate = currentTrend;
        if (delta >= TREND_ENTER) candidate = 'rising';
        else if (delta <= -TREND_ENTER) candidate = 'falling';
        else if (Math.abs(delta) <= TREND_EXIT) candidate = 'stable';

        if (candidate === currentTrend) {
            pendingTrendRef.current = candidate;
            pendingCountRef.current = 0;
        } else {
            if (pendingTrendRef.current === candidate) {
                pendingCountRef.current += 1;
            } else {
                pendingTrendRef.current = candidate;
                pendingCountRef.current = 1;
            }

            if (pendingCountRef.current >= CONFIRM_UPDATES) {
                trendRef.current = candidate;
                setTrend(candidate);
                pendingCountRef.current = 0;
            }
        }

        prevHumRef.current = humidity;
    }, [humidity]);

    useEffect(() => {
        animatedHumidityRef.current = animatedHumidity;
    }, [animatedHumidity]);

    useEffect(() => {
        if (typeof humidity !== 'number') {
            setAnimatedHumidity(0);
            animatedHumidityRef.current = 0;
            return;
        }

        const start = animatedHumidityRef.current;
        const target = humidity;

        if (Math.abs(target - start) < 0.1) {
            setAnimatedHumidity(target);
            animatedHumidityRef.current = target;
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

            setAnimatedHumidity(value);
            animatedHumidityRef.current = value;

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
    }, [humidity]);

    const humValue = Math.round(animatedHumidity).toString();

    const getPalette = () => {
        // Very humid conditions should remain urgent.
        if (humidity >= 80) return {
            border: 'border-red-500/40',
            bg: 'from-[#3a1219]/90 via-[#2b1c3d]/85 to-[#171c45]/85',
            chip: 'bg-red-500/20 border-red-300/30',
            lightBorder: 'border-red-300',
            lightBg: 'from-red-100 via-rose-100 to-orange-100',
        };

        // Stable should look pleasant.
        if (trend === 'stable') {
            return humidity >= 60
                ? {
                    border: 'border-cyan-500/35',
                    bg: 'from-[#12323f]/90 via-[#1f2a47]/85 to-[#172246]/85',
                    chip: 'bg-cyan-500/20 border-cyan-300/30',
                    lightBorder: 'border-cyan-300',
                    lightBg: 'from-cyan-100 via-sky-100 to-blue-100',
                }
                : {
                    border: 'border-emerald-500/35',
                    bg: 'from-[#13392e]/90 via-[#1f2c47]/85 to-[#172246]/85',
                    chip: 'bg-emerald-500/20 border-emerald-300/30',
                    lightBorder: 'border-emerald-300',
                    lightBg: 'from-emerald-100 via-teal-100 to-cyan-100',
                };
        }

        if (trend === 'rising') {
            return humidity >= 60
                ? {
                    border: 'border-yellow-500/40',
                    bg: 'from-[#3a2f13]/90 via-[#27223d]/85 to-[#171c45]/85',
                    chip: 'bg-yellow-500/20 border-yellow-300/30',
                    lightBorder: 'border-yellow-300',
                    lightBg: 'from-yellow-100 via-amber-100 to-lime-100',
                }
                : {
                    border: 'border-cyan-500/35',
                    bg: 'from-[#123241]/90 via-[#202847]/85 to-[#172246]/85',
                    chip: 'bg-cyan-500/20 border-cyan-300/30',
                    lightBorder: 'border-cyan-300',
                    lightBg: 'from-cyan-100 via-sky-100 to-indigo-100',
                };
        }

        // Dropping humidity should look recovery/cool.
        return {
            border: 'border-emerald-500/35',
            bg: 'from-[#13372d]/90 via-[#202b47]/85 to-[#172246]/85',
            chip: 'bg-emerald-500/20 border-emerald-300/30',
            lightBorder: 'border-emerald-300',
            lightBg: 'from-emerald-100 via-cyan-100 to-sky-100',
        };
    };

    const palette = getPalette();
    const humidityStatus = humidity >= 80
        ? 'High'
        : humidity >= 60
            ? 'Elevated'
            : humidity >= 30
                ? 'Normal'
                : 'Low';

    const getStatusChipClass = () => {
        if (!isNightMode) {
            if (humidity >= 80) return 'bg-red-100 border-red-300 text-red-700';
            if (humidity >= 60) return 'bg-amber-100 border-amber-300 text-amber-700';
            if (humidity >= 30) return 'bg-emerald-100 border-emerald-300 text-emerald-700';
            return 'bg-sky-100 border-sky-300 text-sky-700';
        }

        if (humidity >= 80) return 'bg-red-500/24 border-red-300/40';
        if (humidity >= 60) return 'bg-amber-500/24 border-amber-300/40';
        if (humidity >= 30) return 'bg-emerald-500/20 border-emerald-300/35';
        return 'bg-sky-500/20 border-sky-300/35';
    };

    const getAdviceChipClass = () => {
        if (!isNightMode) {
            if (humidity >= 80) return 'bg-red-100 border-red-300 text-red-700';
            if (trend === 'stable') return 'bg-emerald-100 border-emerald-300 text-emerald-700';
            if (humidity >= 60) return 'bg-yellow-100 border-yellow-300 text-yellow-700';
            return 'bg-cyan-100 border-cyan-300 text-cyan-700';
        }

        if (humidity >= 80) return 'bg-red-500/22 border-red-300/35';
        if (trend === 'stable') return 'bg-emerald-500/18 border-emerald-300/30';
        if (humidity >= 60) return 'bg-yellow-500/20 border-yellow-300/35';
        return 'bg-cyan-500/18 border-cyan-300/30';
    };

    const getAdvice = () => {
        // Calculate dew point approximation: Td ≈ T - ((100 - RH) / 5)
        const dewPoint = temperature - ((100 - humidity) / 5);
        const dewDiff = temperature - dewPoint;

        if (humidity >= 80) return { text: 'Very humid conditions' };
        if (dewDiff < 3) return { text: 'Dew point approaching' };
        if (humidity >= 60) return { text: 'Moderate humidity' };
        if (humidity >= 30) return { text: 'Comfortable humidity' };
        return { text: 'Dry conditions' };
    };

    const advice = getAdvice();

    const containerClass = isNightMode
        ? `border ${palette.border} bg-gradient-to-br ${palette.bg} shadow-lg backdrop-blur-sm`
        : `border ${palette.lightBorder} bg-gradient-to-br ${palette.lightBg} shadow-md`;

    const titleClass = isNightMode ? 'text-white' : 'text-slate-800';
    const valueClass = isNightMode ? 'text-white' : 'text-slate-900';
    const unitClass = isNightMode ? 'text-gray-400' : 'text-slate-500';
    const chipTextClass = isNightMode ? 'text-white' : '';

    return (
        <div className={`rounded-2xl p-5 transition-all duration-500 ease-out ${containerClass}`}>
            <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <h3 className={`font-semibold ${titleClass}`}>Humidity</h3>
                <span className={`ml-auto rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-all duration-500 ${chipTextClass} ${getStatusChipClass()}`}>{humidityStatus}</span>
            </div>

            <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold transition-colors duration-500 ${valueClass}`}>{humValue}</span>
                <span className={`text-xl transition-colors duration-500 ${unitClass}`}>%</span>
            </div>

            <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-500 ${chipTextClass} ${getAdviceChipClass()}`}>
                <span>{advice.text}</span>
            </div>
        </div>
    );
}
