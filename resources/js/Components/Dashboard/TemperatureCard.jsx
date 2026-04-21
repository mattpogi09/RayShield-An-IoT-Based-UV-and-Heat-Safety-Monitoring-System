import { useEffect, useRef, useState } from 'react';

export default function TemperatureCard({ temperature, unit, heatIndex, isNightMode }) {
    const unitSymbol = unit === 'celsius' ? '°C' : '°F';
    const prevTempRef = useRef(temperature);
    const [trend, setTrend] = useState('stable');
    const trendRef = useRef('stable');
    const pendingTrendRef = useRef('stable');
    const pendingCountRef = useRef(0);
    const [animatedTemp, setAnimatedTemp] = useState(typeof temperature === 'number' ? temperature : 0);
    const animatedTempRef = useRef(typeof temperature === 'number' ? temperature : 0);
    const animationFrameRef = useRef(null);

    const TREND_ENTER = 0.22;
    const TREND_EXIT = 0.10;
    const CONFIRM_UPDATES = 2;

    useEffect(() => {
        if (typeof temperature !== 'number' || typeof prevTempRef.current !== 'number') {
            prevTempRef.current = temperature;
            return;
        }

        const delta = temperature - prevTempRef.current;
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

        prevTempRef.current = temperature;
    }, [temperature]);

    useEffect(() => {
        animatedTempRef.current = animatedTemp;
    }, [animatedTemp]);

    useEffect(() => {
        if (typeof temperature !== 'number') {
            setAnimatedTemp(0);
            animatedTempRef.current = 0;
            return;
        }

        const start = animatedTempRef.current;
        const target = temperature;

        if (Math.abs(target - start) < 0.02) {
            setAnimatedTemp(target);
            animatedTempRef.current = target;
            return;
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        const duration = 480;
        const startTime = performance.now();
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const value = start + (target - start) * eased;

            setAnimatedTemp(value);
            animatedTempRef.current = value;

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
    }, [temperature]);

    const tempValue = animatedTemp.toFixed(1);

    const tempC = unit === 'celsius' ? temperature : (temperature - 32) * 5 / 9;

    const getPalette = () => {
        // Dangerous heat should remain visually urgent regardless of trend.
        if (tempC >= 40) return {
            border: 'border-red-500/40',
            bg: 'from-[#3b0a14]/90 via-[#2a1638]/85 to-[#171c45]/85',
            chip: 'bg-red-500/20 border-red-300/30',
            lightBorder: 'border-red-300',
            lightBg: 'from-red-100 via-rose-100 to-orange-100',
            lightChip: 'bg-red-100 border-red-300',
        };

        // Stable should look calm and pleasant.
        if (trend === 'stable') {
            return tempC >= 30
                ? {
                    border: 'border-cyan-500/35',
                    bg: 'from-[#113240]/90 via-[#1d2a47]/85 to-[#172246]/85',
                    chip: 'bg-cyan-500/20 border-cyan-300/30',
                    lightBorder: 'border-cyan-300',
                    lightBg: 'from-cyan-100 via-sky-100 to-blue-100',
                    lightChip: 'bg-cyan-100 border-cyan-300',
                }
                : {
                    border: 'border-emerald-500/35',
                    bg: 'from-[#12372d]/90 via-[#1e2b47]/85 to-[#172246]/85',
                    chip: 'bg-emerald-500/20 border-emerald-300/30',
                    lightBorder: 'border-emerald-300',
                    lightBg: 'from-emerald-100 via-teal-100 to-cyan-100',
                    lightChip: 'bg-emerald-100 border-emerald-300',
                };
        }

        if (trend === 'rising') {
            return tempC >= 35
                ? {
                    border: 'border-orange-500/40',
                    bg: 'from-[#3a1d0d]/90 via-[#2a1f3a]/85 to-[#171c45]/85',
                    chip: 'bg-orange-500/20 border-orange-300/30',
                    lightBorder: 'border-orange-300',
                    lightBg: 'from-orange-100 via-amber-100 to-yellow-100',
                    lightChip: 'bg-orange-100 border-orange-300',
                }
                : {
                    border: 'border-yellow-500/40',
                    bg: 'from-[#3a3210]/90 via-[#26213b]/85 to-[#171c45]/85',
                    chip: 'bg-yellow-500/20 border-yellow-300/30',
                    lightBorder: 'border-yellow-300',
                    lightBg: 'from-yellow-100 via-amber-100 to-lime-100',
                    lightChip: 'bg-yellow-100 border-yellow-300',
                };
        }

        // Cooling trend goes back to safer cool tones.
        return {
            border: 'border-emerald-500/35',
            bg: 'from-[#14352b]/90 via-[#1e2846]/85 to-[#172246]/85',
            chip: 'bg-emerald-500/20 border-emerald-300/30',
            lightBorder: 'border-emerald-300',
            lightBg: 'from-emerald-100 via-cyan-100 to-sky-100',
            lightChip: 'bg-emerald-100 border-emerald-300',
        };
    };

    const palette = getPalette();

    const temperatureStatus = tempC >= 40
        ? 'Danger'
        : tempC >= 35
            ? 'High'
            : tempC >= 30
                ? 'Warm'
                : tempC >= 25
                    ? 'Normal'
                    : 'Cool';

    const getStatusChipClass = () => {
        if (!isNightMode) {
            if (tempC >= 40) return 'bg-red-100 border-red-300 text-red-700';
            if (tempC >= 35) return 'bg-orange-100 border-orange-300 text-orange-700';
            if (tempC >= 30) return 'bg-yellow-100 border-yellow-300 text-yellow-700';
            if (tempC >= 25) return 'bg-emerald-100 border-emerald-300 text-emerald-700';
            return 'bg-sky-100 border-sky-300 text-sky-700';
        }

        if (tempC >= 40) return 'bg-red-500/24 border-red-300/40';
        if (tempC >= 35) return 'bg-orange-500/24 border-orange-300/40';
        if (tempC >= 30) return 'bg-yellow-500/22 border-yellow-300/38';
        if (tempC >= 25) return 'bg-emerald-500/20 border-emerald-300/35';
        return 'bg-sky-500/20 border-sky-300/35';
    };

    const getAdviceChipClass = () => {
        if (!isNightMode) {
            if (tempC >= 40) return 'bg-red-100 border-red-300 text-red-700';
            if (tempC >= 35) return 'bg-orange-100 border-orange-300 text-orange-700';
            if (trend === 'stable') return 'bg-emerald-100 border-emerald-300 text-emerald-700';
            if (tempC >= 30) return 'bg-yellow-100 border-yellow-300 text-yellow-700';
            return 'bg-cyan-100 border-cyan-300 text-cyan-700';
        }

        if (tempC >= 40) return 'bg-red-500/22 border-red-300/35';
        if (tempC >= 35) return 'bg-orange-500/22 border-orange-300/35';
        if (trend === 'stable') return 'bg-emerald-500/18 border-emerald-300/30';
        if (tempC >= 30) return 'bg-yellow-500/20 border-yellow-300/35';
        return 'bg-cyan-500/18 border-cyan-300/30';
    };

    const getAdvice = () => {
        if (isNightMode && tempC < 25) return { text: 'Night cooling active', icon: '✧' };
        if (tempC >= 40) return { text: 'Extreme heat danger', icon: '🔥' };
        if (tempC >= 35) return { text: 'Heat advisory active', icon: '⚠️' };
        if (tempC >= 30) return { text: 'Stay hydrated', icon: '💧' };
        if (tempC >= 25) return { text: 'Comfortable range', icon: '✓' };
        return { text: 'Cool conditions', icon: '❄️' };
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
                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a3 3 0 00-3 3v8.17a5 5 0 106 0V5a3 3 0 00-3-3zm0 2a1 1 0 011 1v9.59l.41.29a3 3 0 11-2.82 0l.41-.29V5a1 1 0 011-1z"/>
                </svg>
                <h3 className={`font-semibold ${titleClass}`}>Temperature</h3>
                <span className={`ml-auto rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-all duration-500 ${chipTextClass} ${getStatusChipClass()}`}>{temperatureStatus}</span>
            </div>

            <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold transition-colors duration-500 ${valueClass}`}>{tempValue}</span>
                <span className={`text-xl transition-colors duration-500 ${unitClass}`}>{unitSymbol}</span>
            </div>

            <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-500 ${chipTextClass} ${getAdviceChipClass()}`}>
                <span>{advice.icon}</span>
                <span>{advice.text}</span>
            </div>
        </div>
    );
}
