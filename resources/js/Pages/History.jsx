import { Head, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatSnapshotDate(dateStr) {
    // dateStr = "2026-04-25"
    const d = new Date(dateStr + 'T00:00:00');
    return {
        day: DAY_NAMES[d.getDay()],
        date: `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
    };
}

function formatSnapshotTime(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    // Display in Philippine time
    return d.toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Manila',
    });
}

function uvLabel(uvi) {
    if (uvi === null || uvi === undefined) return { label: '—', color: '' };
    if (uvi < 3) return { label: 'Low', color: 'text-emerald-500' };
    if (uvi < 6) return { label: 'Moderate', color: 'text-yellow-500' };
    if (uvi < 8) return { label: 'High', color: 'text-orange-500' };
    if (uvi < 11) return { label: 'Very High', color: 'text-red-500' };
    return { label: 'Extreme', color: 'text-purple-500' };
}

function heatIndexLabel(hi) {
    if (hi === null || hi === undefined) return { label: '—', color: '' };
    if (hi < 27) return { label: 'Safe', color: 'text-emerald-500' };
    if (hi < 32) return { label: 'Caution', color: 'text-yellow-500' };
    if (hi < 39) return { label: 'Ext. Caution', color: 'text-orange-400' };
    if (hi < 51) return { label: 'Danger', color: 'text-red-500' };
    return { label: 'Ext. Danger', color: 'text-purple-500' };
}

function SnapshotDetailModal({ snapshot, onClose, isNightMode, tempUnit }) {
    if (!snapshot) return null;
    const { day, date } = formatSnapshotDate(snapshot.snapshot_date);
    const time = formatSnapshotTime(snapshot.snapshot_taken_at);
    const temp = tempUnit === 'fahrenheit' ? snapshot.temperature_f : snapshot.temperature_c;
    const tempSuffix = tempUnit === 'fahrenheit' ? '°F' : '°C';
    const hi = tempUnit === 'fahrenheit' ? snapshot.heat_index_f : snapshot.heat_index_c;
    const hiInfo = heatIndexLabel(snapshot.heat_index_c);
    const uvInfo = uvLabel(snapshot.uv_index);

    const base = isNightMode
        ? 'bg-[#111638] border-white/10 text-white'
        : 'bg-white border-slate-200 text-slate-800';
    const muted = isNightMode ? 'text-gray-400' : 'text-slate-500';
    const card = isNightMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${base}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${muted}`}>{day}</p>
                        <h2 className="text-xl font-bold">{date}</h2>
                        <p className={`text-sm mt-0.5 ${muted}`}>Last reading at <span className="font-medium">{time}</span></p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isNightMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Temperature */}
                    <div className={`rounded-xl border p-4 ${card}`}>
                        <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${muted}`}>🌡 Temperature</p>
                        <p className="text-2xl font-bold">
                            {temp != null ? `${temp.toFixed(1)}${tempSuffix}` : '—'}
                        </p>
                        <p className={`text-xs mt-0.5 ${muted}`}>Humidity {snapshot.humidity != null ? `${snapshot.humidity.toFixed(0)}%` : '—'}</p>
                    </div>

                    {/* Heat Index */}
                    <div className={`rounded-xl border p-4 ${card}`}>
                        <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${muted}`}>🔥 Heat Index</p>
                        <p className="text-2xl font-bold">
                            {hi != null ? `${hi.toFixed(1)}${tempSuffix}` : '—'}
                        </p>
                        <p className={`text-xs mt-0.5 font-semibold ${hiInfo.color}`}>{hiInfo.label}</p>
                    </div>

                    {/* UV Index */}
                    <div className={`rounded-xl border p-4 ${card}`}>
                        <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${muted}`}>☀️ UV Index</p>
                        <p className="text-2xl font-bold">
                            {snapshot.uv_index != null ? snapshot.uv_index.toFixed(1) : '—'}
                        </p>
                        <p className={`text-xs mt-0.5 font-semibold ${uvInfo.color}`}>{uvInfo.label}</p>
                    </div>

                    {/* UVA / UVB */}
                    <div className={`rounded-xl border p-4 ${card}`}>
                        <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${muted}`}>🔆 UVA / UVB</p>
                        <p className="text-base font-bold">
                            {snapshot.uva != null ? snapshot.uva.toFixed(1) : '—'}
                            <span className={`text-xs font-normal ml-1 ${muted}`}>UVA</span>
                        </p>
                        <p className={`text-base font-bold mt-0.5`}>
                            {snapshot.uvb != null ? snapshot.uvb.toFixed(1) : '—'}
                            <span className={`text-xs font-normal ml-1 ${muted}`}>UVB</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className={`mt-5 w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                        isNightMode
                            ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    }`}
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default function History() {
    const { snapshots, settings } = usePage().props;
    const [selected, setSelected] = useState(null);

    const isNightMode = settings?.manual_night_mode ?? false;
    const tempUnit = settings?.temperature_unit || 'celsius';
    const tempSuffix = tempUnit === 'fahrenheit' ? '°F' : '°C';

    const bg = isNightMode
        ? 'bg-gradient-to-br from-[#0a0e27] via-[#111638] to-[#0d1229]'
        : 'bg-gradient-to-br from-[#f8fbff] via-[#eef4ff] to-[#e8f1ff]';
    const text = isNightMode ? 'text-white' : 'text-slate-800';
    const muted = isNightMode ? 'text-gray-400' : 'text-slate-500';
    const card = isNightMode
        ? 'bg-white/5 border-white/10 hover:bg-white/10'
        : 'bg-white border-slate-200 hover:bg-indigo-50/60 hover:border-indigo-200';
    const headerBg = isNightMode ? 'border-white/10' : 'border-slate-200';

    return (
        <>
            <Head title="History — RayShield" />

            <div className={`min-h-screen ${bg} ${text}`}>
                {/* Header */}
                <header className={`px-4 sm:px-8 py-4 flex items-center gap-4 border-b ${headerBg}`}>
                    <Link
                        href="/dashboard"
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isNightMode ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Dashboard
                    </Link>
                    <span className={`${muted}`}>/</span>
                    <span className="text-sm font-semibold">Daily History</span>
                </header>

                <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold">📅 Daily History</h1>
                        <p className={`text-sm mt-1 ${muted}`}>
                            End-of-day snapshots — last reading recorded before midnight each day.
                        </p>
                    </div>

                    {snapshots.length === 0 ? (
                        <div className={`rounded-2xl border p-12 text-center ${isNightMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                            <p className="text-4xl mb-3">🌙</p>
                            <p className="font-semibold text-lg">No history yet</p>
                            <p className={`text-sm mt-1 ${muted}`}>
                                Daily snapshots are recorded automatically at midnight. Check back tomorrow.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {snapshots.map((snap) => {
                                const { day, date } = formatSnapshotDate(snap.snapshot_date);
                                const time = formatSnapshotTime(snap.snapshot_taken_at);
                                const temp = tempUnit === 'fahrenheit' ? snap.temperature_f : snap.temperature_c;
                                const hi = tempUnit === 'fahrenheit' ? snap.heat_index_f : snap.heat_index_c;
                                const hiInfo = heatIndexLabel(snap.heat_index_c);
                                const uvInfo = uvLabel(snap.uv_index);

                                return (
                                    <button
                                        key={snap.id}
                                        onClick={() => setSelected(snap)}
                                        className={`w-full text-left rounded-2xl border p-4 sm:p-5 transition-all duration-150 ${card} cursor-pointer`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                                            {/* Date */}
                                            <div className="sm:w-44 shrink-0">
                                                <p className={`text-xs font-semibold uppercase tracking-widest ${muted}`}>{day}</p>
                                                <p className="font-bold text-base leading-tight">{date}</p>
                                                <p className={`text-xs mt-0.5 ${muted}`}>at {time}</p>
                                            </div>

                                            {/* Metrics */}
                                            <div className="flex flex-wrap gap-4 sm:gap-6 flex-1">
                                                <div>
                                                    <p className={`text-xs ${muted}`}>🌡 Temp</p>
                                                    <p className="font-semibold">
                                                        {temp != null ? `${temp.toFixed(1)}${tempSuffix}` : '—'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-xs ${muted}`}>💧 Humidity</p>
                                                    <p className="font-semibold">
                                                        {snap.humidity != null ? `${snap.humidity.toFixed(0)}%` : '—'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-xs ${muted}`}>🔥 Heat Index</p>
                                                    <p className={`font-semibold ${hiInfo.color}`}>
                                                        {hi != null ? `${hi.toFixed(1)}${tempSuffix}` : '—'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-xs ${muted}`}>☀️ UV Index</p>
                                                    <p className={`font-semibold ${uvInfo.color}`}>
                                                        {snap.uv_index != null ? snap.uv_index.toFixed(1) : '—'}
                                                        <span className={`text-xs font-normal ml-1 ${muted}`}>{uvInfo.label}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <svg className={`w-4 h-4 shrink-0 self-center hidden sm:block ${muted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {selected && (
                <SnapshotDetailModal
                    snapshot={selected}
                    onClose={() => setSelected(null)}
                    isNightMode={isNightMode}
                    tempUnit={tempUnit}
                />
            )}
        </>
    );
}
