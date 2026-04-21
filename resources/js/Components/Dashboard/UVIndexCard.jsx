import { useEffect, useRef, useState } from 'react';

export default function UVIndexCard({ uvIndex, isNightMode, onClickDetail }) {
    const prevUvRef = useRef(uvIndex);
    const [trend, setTrend] = useState('stable');
    const trendRef = useRef('stable');
    const pendingTrendRef = useRef('stable');
    const pendingCountRef = useRef(0);
    const [animatedUv, setAnimatedUv] = useState(typeof uvIndex === 'number' ? uvIndex : 0);
    const animatedUvRef = useRef(typeof uvIndex === 'number' ? uvIndex : 0);
    const animationFrameRef = useRef(null);

    const TREND_ENTER = 0.3;
    const TREND_EXIT = 0.12;
    const CONFIRM_UPDATES = 2;

    useEffect(() => {
        if (typeof uvIndex !== 'number' || typeof prevUvRef.current !== 'number') {
            prevUvRef.current = uvIndex;
            return;
        }

        const delta = uvIndex - prevUvRef.current;
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

        prevUvRef.current = uvIndex;
    }, [uvIndex]);

    useEffect(() => {
        animatedUvRef.current = animatedUv;
    }, [animatedUv]);

    useEffect(() => {
        if (typeof uvIndex !== 'number') {
            setAnimatedUv(0);
            animatedUvRef.current = 0;
            return;
        }

        const start = animatedUvRef.current;
        const target = uvIndex;

        if (Math.abs(target - start) < 0.05) {
            setAnimatedUv(target);
            animatedUvRef.current = target;
            return;
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        const duration = 550;
        const startTime = performance.now();
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const value = start + (target - start) * eased;

            setAnimatedUv(value);
            animatedUvRef.current = value;

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
    }, [uvIndex]);

    const getUVLevel = (index) => {
        if (index >= 11) return { label: 'EXTREME', color: '#9333ea', ringColor: 'stroke-purple-500', bg: 'from-[#3b0b2f]/90 via-[#2b1a45]/85 to-[#171c45]/85', border: 'border-fuchsia-500/40', chip: 'bg-fuchsia-500/20 border-fuchsia-300/30', lightBg: 'from-fuchsia-100 via-rose-100 to-red-100', lightBorder: 'border-fuchsia-300', lightChip: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-700' };
        if (index >= 8) return { label: 'VERY HIGH', color: '#ef4444', ringColor: 'stroke-red-500', bg: 'from-[#3b1118]/90 via-[#2b1b44]/85 to-[#171c45]/85', border: 'border-red-500/40', chip: 'bg-red-500/20 border-red-300/30', lightBg: 'from-red-100 via-rose-100 to-orange-100', lightBorder: 'border-red-300', lightChip: 'bg-red-100 border-red-300 text-red-700' };
        if (index >= 6) return { label: 'HIGH', color: '#f97316', ringColor: 'stroke-orange-500', bg: 'from-[#3a1f11]/90 via-[#2a2141]/85 to-[#171c45]/85', border: 'border-orange-500/40', chip: 'bg-orange-500/20 border-orange-300/30', lightBg: 'from-orange-100 via-amber-100 to-yellow-100', lightBorder: 'border-orange-300', lightChip: 'bg-orange-100 border-orange-300 text-orange-700' };
        if (index >= 3) return { label: 'MODERATE', color: '#eab308', ringColor: 'stroke-yellow-500', bg: 'from-[#3a3012]/90 via-[#26233f]/85 to-[#171c45]/85', border: 'border-yellow-500/40', chip: 'bg-yellow-500/20 border-yellow-300/30', lightBg: 'from-yellow-100 via-amber-100 to-lime-100', lightBorder: 'border-yellow-300', lightChip: 'bg-yellow-100 border-yellow-300 text-yellow-700' };
        if (index > 0) return { label: 'LOW', color: '#22c55e', ringColor: 'stroke-green-500', bg: 'from-[#123627]/90 via-[#1f2743]/85 to-[#171c45]/85', border: 'border-emerald-500/40', chip: 'bg-emerald-500/20 border-emerald-300/30', lightBg: 'from-emerald-100 via-teal-100 to-cyan-100', lightBorder: 'border-emerald-300', lightChip: 'bg-emerald-100 border-emerald-300 text-emerald-700' };
        return { label: 'NO UV RADIATION', color: '#64748b', ringColor: 'stroke-slate-500', bg: 'from-[#1e2438]/90 via-[#222a42]/85 to-[#171c45]/85', border: 'border-slate-500/35', chip: 'bg-slate-500/20 border-slate-300/30', lightBg: 'from-slate-100 via-blue-100 to-indigo-100', lightBorder: 'border-slate-300', lightChip: 'bg-slate-100 border-slate-300 text-slate-700' };
    };

    const level = getUVLevel(uvIndex);
    const maxUV = 15;
    const percentage = Math.min((animatedUv / maxUV) * 100, 100);
    const circumference = 2 * Math.PI * 80;
    const offset = circumference - (percentage / 100) * circumference;

    const uvStatus = level.label;

    const containerClass = isNightMode
        ? `border ${level.border} bg-gradient-to-br ${level.bg} shadow-lg backdrop-blur-sm`
        : `border ${level.lightBorder} bg-gradient-to-br ${level.lightBg} shadow-md`;

    const titleClass = isNightMode ? 'text-white' : 'text-slate-800';
    const bodyClass = isNightMode ? 'text-gray-400' : 'text-slate-500';
    const trendTextClass = isNightMode ? 'text-white' : '';

    return (
        <div
            className={`rounded-2xl p-6 h-full transition-all duration-500 ease-out cursor-pointer ${containerClass} ${isNightMode ? 'hover:border-white/35' : 'hover:border-slate-400/80 hover:shadow-lg'}`}
            onClick={onClickDetail}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClickDetail();
                }
            }}
            role="button"
            tabIndex={0}
            aria-label="Open UV details"
        >
            <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <h2 className={`font-semibold text-lg ${titleClass}`}>Ultraviolet Index</h2>
                <span className={`ml-auto rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-all duration-500 ${trendTextClass} ${isNightMode ? level.chip : level.lightChip}`}>{uvStatus}</span>
            </div>

            <div className="flex items-center justify-around">
                {/* UV Gauge */}
                <div className="relative">
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                        {/* Background circle */}
                        <circle
                            cx="100" cy="100" r="80"
                            fill="none"
                            stroke={isNightMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.12)'}
                            strokeWidth="12"
                        />
                        {/* Progress arc */}
                        <circle
                            cx="100" cy="100" r="80"
                            fill="none"
                            className={`${level.ringColor} transition-colors duration-500`}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' }}
                        />
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-bold transition-colors duration-500 ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{Math.round(animatedUv)}</span>
                        <span className={`text-xs mt-1 tracking-wider ${isNightMode ? 'text-white/75' : 'text-slate-500'}`}>{level.label}</span>
                    </div>
                </div>

                {/* Night mode indicator or UV info */}
                {isNightMode ? (
                    <div className="text-center">
                        <svg className="w-12 h-12 text-purple-400 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <p className={`font-semibold ${titleClass}`}>Night Mode Active</p>
                        <p className={`text-sm mt-1 max-w-[180px] ${bodyClass}`}>
                            UV levels are naturally zero after sunset.
                            Monitoring will resume at dawn.
                        </p>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="mb-3">
                            <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke={level.color} strokeWidth="2">
                                <circle cx="12" cy="12" r="5"/>
                                <line x1="12" y1="1" x2="12" y2="3"/>
                                <line x1="12" y1="21" x2="12" y2="23"/>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                <line x1="1" y1="12" x2="3" y2="12"/>
                                <line x1="21" y1="12" x2="23" y2="12"/>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                            </svg>
                        </div>
                        <p className={`font-semibold ${titleClass}`}>UV Monitoring Active</p>
                        <p className={`text-sm mt-1 ${bodyClass}`}>
                            Click anywhere on this card<br/>to view UVA/UVB breakdown
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
