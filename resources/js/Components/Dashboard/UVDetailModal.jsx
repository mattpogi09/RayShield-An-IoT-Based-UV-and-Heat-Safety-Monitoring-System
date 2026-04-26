import { useState } from 'react';

export default function UVDetailModal({ uva, uvb, uvIndex, onClose, isNightMode }) {
    const [showRawData, setShowRawData] = useState(false);

    /* ── UV Index scale segments (based on WHO/EPA standard) ── */
    const uvScaleSegments = [
        { min: 0, max: 2,  label: 'Low',       color: '#22c55e',  tailwind: 'bg-green-500'  },
        { min: 2, max: 5,  label: 'Moderate',  color: '#eab308',  tailwind: 'bg-yellow-500' },
        { min: 5, max: 7,  label: 'High',      color: '#f97316',  tailwind: 'bg-orange-500' },
        { min: 7, max: 10, label: 'Very High', color: '#ef4444',  tailwind: 'bg-red-500'    },
        { min: 10, max: 13,label: 'Extreme',   color: '#9333ea',  tailwind: 'bg-purple-600' },
    ];
    const uvScaleMax = 13;
    const uvScaleTicks = [0, 2, 5, 7, 10, 13];

    const getUVIndexLevel = (index) => {
        if (index >= 11) return { label: 'Extreme',   color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-400/40', barColor: '#9333ea' };
        if (index >= 8)  return { label: 'Very High', color: 'text-red-400',    bg: 'bg-red-500/20 border-red-400/40',       barColor: '#ef4444' };
        if (index >= 6)  return { label: 'High',      color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-400/40', barColor: '#f97316' };
        if (index >= 3)  return { label: 'Moderate',  color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-400/40', barColor: '#eab308' };
        if (index > 0)   return { label: 'Low',       color: 'text-green-400',  bg: 'bg-green-500/20 border-green-400/40',   barColor: '#22c55e' };
        return                  { label: 'None',      color: 'text-gray-400',   bg: 'bg-gray-500/20 border-gray-400/30',     barColor: '#64748b' };
    };

    const getUVALevel = (val) => {
        if (val >= 200) return { label: 'Very High', color: 'text-red-400',    bg: 'bg-red-400'    };
        if (val >= 100) return { label: 'High',      color: 'text-orange-400', bg: 'bg-orange-400' };
        if (val >= 50)  return { label: 'Moderate',  color: 'text-yellow-400', bg: 'bg-yellow-400' };
        if (val > 0)    return { label: 'Low',       color: 'text-green-400',  bg: 'bg-green-400'  };
        return                 { label: 'None',      color: 'text-gray-400',   bg: 'bg-gray-400'   };
    };

    const getUVBLevel = (val) => {
        if (val >= 80) return { label: 'Very High', color: 'text-red-400',    bg: 'bg-red-400'    };
        if (val >= 40) return { label: 'High',      color: 'text-orange-400', bg: 'bg-orange-400' };
        if (val >= 20) return { label: 'Moderate',  color: 'text-yellow-400', bg: 'bg-yellow-400' };
        if (val > 0)   return { label: 'Low',       color: 'text-green-400',  bg: 'bg-green-400'  };
        return                { label: 'None',      color: 'text-gray-400',   bg: 'bg-gray-400'   };
    };

    const uvIndexLevel = getUVIndexLevel(uvIndex ?? 0);
    const uvaLevel     = getUVALevel(uva ?? 0);
    const uvbLevel     = getUVBLevel(uvb ?? 0);

    const uvaPercent = Math.min(((uva ?? 0) / 300) * 100, 100);
    const uvbPercent = Math.min(((uvb ?? 0) / 100) * 100, 100);

    const uvScalePercent = Math.min(((uvIndex ?? 0) / uvScaleMax) * 100, 100);

    const d = isNightMode;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${d ? 'bg-black/60' : 'bg-slate-900/35'}`}
            onClick={onClose}
        >
            <div
                className={`w-full max-w-lg rounded-2xl p-6 overflow-y-auto max-h-[90vh] ${d ? 'bg-[#1a1f4e] border border-white/10' : 'bg-white border border-slate-200 shadow-2xl'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className={`font-bold text-lg flex items-center gap-2 ${d ? 'text-white' : 'text-slate-900'}`}>
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        UV Radiation Breakdown
                    </h2>
                    <button
                        onClick={onClose}
                        className={`${d ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'} transition-colors`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── UV Index summary box ── */}
                <div className={`rounded-xl p-4 mb-1 ${d ? 'bg-white/5' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <p className={`text-xs font-medium ${d ? 'text-gray-400' : 'text-slate-500'}`}>Combined UV Index</p>
                            {/* "Breakdown" badge */}
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${d ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
                                Breakdown
                            </span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${d ? uvIndexLevel.bg + ' ' + uvIndexLevel.color : 'text-slate-700 bg-slate-100 border-slate-300'}`}>
                            {uvIndexLevel.label}
                        </span>
                    </div>
                    <p className={`text-4xl font-bold text-center my-1 ${d ? 'text-white' : 'text-slate-900'}`}>
                        {typeof uvIndex === 'number' ? uvIndex.toFixed(1) : '0.0'}
                    </p>
                </div>

                {/* ── UV Index Scale ── */}
                <div className={`rounded-xl px-4 pt-3 pb-4 mb-5 ${d ? 'bg-white/5' : 'bg-slate-50 border border-slate-200'}`}>
                    <p className={`text-[11px] font-semibold uppercase tracking-wide mb-2 ${d ? 'text-gray-400' : 'text-slate-500'}`}>
                        UV Index Scale
                    </p>

                    {/* Bar */}
                    <div className="relative mb-1">
                        <div className="flex rounded-full overflow-hidden h-3">
                            {uvScaleSegments.map((seg, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: `${((seg.max - seg.min) / uvScaleMax) * 100}%`,
                                        backgroundColor: seg.color,
                                        opacity: 0.75,
                                    }}
                                />
                            ))}
                        </div>
                        {/* Indicator needle */}
                        <div
                            className={`absolute top-0 w-1 h-3 rounded-full transition-all duration-500 ${d ? 'bg-white shadow-lg shadow-white/40' : 'bg-slate-700 shadow shadow-slate-700/30'}`}
                            style={{ left: `calc(${uvScalePercent}% - 2px)` }}
                        />
                    </div>

                    {/* Tick labels */}
                    <div className={`relative h-4 text-[10px] ${d ? 'text-gray-500' : 'text-slate-500'}`}>
                        {uvScaleTicks.map((tick, idx) => {
                            const leftPct = (tick / uvScaleMax) * 100;
                            const isFirst = idx === 0;
                            const isLast  = idx === uvScaleTicks.length - 1;
                            return (
                                <span
                                    key={tick}
                                    className={`absolute ${isFirst ? 'left-0' : isLast ? 'right-0' : '-translate-x-1/2'}`}
                                    style={isFirst || isLast ? undefined : { left: `${leftPct}%` }}
                                >
                                    {tick}
                                </span>
                            );
                        })}
                    </div>

                    {/* Legend dots */}
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                        {uvScaleSegments.map((seg, i) => (
                            <div key={i} className="flex items-center gap-1 text-[10px]">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                                <span className={d ? 'text-gray-400' : 'text-slate-500'}>
                                    {seg.label} ({seg.min}–{seg.max === 13 ? '11+' : seg.max})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── View Raw Data toggle ── */}
                <button
                    onClick={() => setShowRawData((v) => !v)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl mb-3 border text-sm font-semibold transition-all duration-200 ${
                        d
                            ? 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        View Raw Data
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${d ? 'bg-purple-500/20 border-purple-400/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-600'}`}>
                            UVA · UVB
                        </span>
                    </div>
                    <svg
                        className={`w-4 h-4 transition-transform duration-300 ${showRawData ? 'rotate-180' : 'rotate-0'} ${d ? 'text-gray-400' : 'text-slate-400'}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* ── Raw Data (collapsible) ── */}
                <div
                    className={`overflow-hidden transition-all duration-400 ease-in-out ${showRawData ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    <div className={`rounded-xl px-4 py-4 mb-5 ${d ? 'border border-white/10 bg-white/5' : 'border border-slate-200 bg-slate-50'}`}>
                        {/* Raw data header */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className={`h-px flex-1 ${d ? 'bg-white/10' : 'bg-slate-200'}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${d ? 'text-gray-500' : 'text-slate-400'}`}>
                                Sensor Raw Values
                            </span>
                            <div className={`h-px flex-1 ${d ? 'bg-white/10' : 'bg-slate-200'}`} />
                        </div>

                        {/* UVA */}
                        <div className="mb-5">
                            <div className="flex items-center mb-1.5">
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-semibold text-sm ${d ? 'text-white' : 'text-slate-900'}`}>UVA Radiation</h3>
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${d ? 'bg-blue-500/20 border-blue-400/40 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
                                        Raw Data
                                    </span>
                                </div>
                            </div>
                            <p className={`text-[11px] mb-2 ${d ? 'text-gray-400' : 'text-slate-500'}`}>Long-wave (315–400nm) · Penetrates deep into skin</p>

                            {/* Single-colour fill bar — colour follows UV Index level */}
                            <div className={`relative w-full rounded-full h-2.5 overflow-hidden ${d ? 'bg-white/10' : 'bg-slate-200'}`}>
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${uvaPercent}%`, backgroundColor: uvIndexLevel.barColor, opacity: 0.85 }}
                                />
                            </div>

                            <div className="flex items-center justify-between mt-1">
                                <span className={`text-[10px] ${d ? 'text-gray-500' : 'text-slate-400'}`}>0</span>
                                <span className={`font-bold text-base tabular-nums ${d ? 'text-white' : 'text-slate-900'}`}>
                                    {typeof uva === 'number' ? uva.toFixed(1) : '0.0'}
                                    <span className={`text-xs font-normal ml-1 ${d ? 'text-gray-400' : 'text-slate-500'}`}>raw μW/cm²</span>
                                </span>
                                <span className={`text-[10px] ${d ? 'text-gray-500' : 'text-slate-400'}`}>300</span>
                            </div>

                            <div className={`mt-2 text-[11px] space-y-0.5 ${d ? 'text-gray-500' : 'text-slate-500'}`}>
                                <p>• Causes premature aging and wrinkles</p>
                                <p>• Can penetrate glass and clouds</p>
                                <p>• Present at relatively equal intensity throughout daylight</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className={`h-px w-full mb-5 ${d ? 'bg-white/10' : 'bg-slate-200'}`} />

                        {/* UVB */}
                        <div>
                            <div className="flex items-center mb-1.5">
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-semibold text-sm ${d ? 'text-white' : 'text-slate-900'}`}>UVB Radiation</h3>
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${d ? 'bg-blue-500/20 border-blue-400/40 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
                                        Raw Data
                                    </span>
                                </div>
                            </div>
                            <p className={`text-[11px] mb-2 ${d ? 'text-gray-400' : 'text-slate-500'}`}>Short-wave (280–315nm) · Burns skin surface</p>

                            {/* Single-colour fill bar — colour follows UV Index level */}
                            <div className={`relative w-full rounded-full h-2.5 overflow-hidden ${d ? 'bg-white/10' : 'bg-slate-200'}`}>
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${uvbPercent}%`, backgroundColor: uvIndexLevel.barColor, opacity: 0.85 }}
                                />
                            </div>

                            <div className="flex items-center justify-between mt-1">
                                <span className={`text-[10px] ${d ? 'text-gray-500' : 'text-slate-400'}`}>0</span>
                                <span className={`font-bold text-base tabular-nums ${d ? 'text-white' : 'text-slate-900'}`}>
                                    {typeof uvb === 'number' ? uvb.toFixed(1) : '0.0'}
                                    <span className={`text-xs font-normal ml-1 ${d ? 'text-gray-400' : 'text-slate-500'}`}>raw μW/cm²</span>
                                </span>
                                <span className={`text-[10px] ${d ? 'text-gray-500' : 'text-slate-400'}`}>100</span>
                            </div>

                            <div className={`mt-2 text-[11px] space-y-0.5 ${d ? 'text-gray-500' : 'text-slate-500'}`}>
                                <p>• Primary cause of sunburn</p>
                                <p>• Strongest between 10 AM and 4 PM</p>
                                <p>• Blocked by glass but not by clouds</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Close button ── */}
                <button
                    onClick={onClose}
                    className={`w-full py-3 font-semibold rounded-lg transition-colors ${
                        d
                            ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                    }`}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
