import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const DAY_NAMES  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function uvLabel(uvi) {
    if (uvi === null || uvi === undefined) return { label: '—', color: 'text-gray-400', dot: 'bg-gray-400' };
    if (uvi < 3)  return { label: 'Low',       color: 'text-emerald-500', dot: 'bg-emerald-400' };
    if (uvi < 6)  return { label: 'Moderate',  color: 'text-yellow-500',  dot: 'bg-yellow-400'  };
    if (uvi < 8)  return { label: 'High',      color: 'text-orange-500',  dot: 'bg-orange-400'  };
    if (uvi < 11) return { label: 'Very High', color: 'text-red-500',     dot: 'bg-red-400'     };
    return             { label: 'Extreme',    color: 'text-purple-500',  dot: 'bg-purple-400'  };
}

function heatIndexLabel(hi) {
    if (hi === null || hi === undefined) return { label: '—', color: '' };
    if (hi < 27) return { label: 'Safe',         color: 'text-emerald-500' };
    if (hi < 32) return { label: 'Caution',      color: 'text-yellow-500' };
    if (hi < 39) return { label: 'Ext. Caution', color: 'text-orange-400' };
    if (hi < 51) return { label: 'Danger',       color: 'text-red-500'    };
    return           { label: 'Ext. Danger',  color: 'text-purple-500' };
}

function formatTime(isoStr) {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleTimeString('en-PH', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true, timeZone: 'Asia/Manila',
    });
}

function formatDateTime(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return {
        time: d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Manila' }),
        date: `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`,
    };
}

/* ── Detail Modal ──────────────────────────────────────────── */
function LogDetailModal({ entry, onClose, isNightMode, tempUnit }) {
    if (!entry) return null;
    const { time, date } = formatDateTime(entry.created_at);
    const temp = tempUnit === 'fahrenheit' ? entry.temperature_f : entry.temperature_c;
    const hi   = tempUnit === 'fahrenheit' ? entry.heat_index_f  : entry.heat_index_c;
    const suffix = tempUnit === 'fahrenheit' ? '°F' : '°C';
    const uvInfo = uvLabel(entry.uv_index);
    const hiInfo = heatIndexLabel(entry.heat_index_c);

    const base = isNightMode ? 'bg-[#111638] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800';
    const muted = isNightMode ? 'text-gray-400' : 'text-slate-500';
    const card  = isNightMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${base}`}>
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${muted}`}>{date}</p>
                        <h2 className="text-xl font-bold">{time}</h2>
                        <p className={`text-xs mt-0.5 ${muted}`}>Sensor reading snapshot</p>
                    </div>
                    <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isNightMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className={`rounded-xl border p-4 ${card}`}>
                        <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${muted}`}>🌡 Temperature</p>
                        <p className="text-2xl font-bold">{temp != null ? `${Number(temp).toFixed(1)}${suffix}` : '—'}</p>
                        <p className={`text-xs mt-0.5 ${muted}`}>Humidity {entry.humidity != null ? `${Number(entry.humidity).toFixed(0)}%` : '—'}</p>
                    </div>
                    <div className={`rounded-xl border p-4 ${card}`}>
                        <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${muted}`}>🔥 Heat Index</p>
                        <p className="text-2xl font-bold">{hi != null ? `${Number(hi).toFixed(1)}${suffix}` : '—'}</p>
                        <p className={`text-xs mt-0.5 font-semibold ${hiInfo.color}`}>{hiInfo.label}</p>
                    </div>
                    <div className={`rounded-xl border p-4 ${card}`}>
                        <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${muted}`}>☀️ UV Index</p>
                        <p className="text-2xl font-bold">{entry.uv_index != null ? Number(entry.uv_index).toFixed(1) : '—'}</p>
                        <p className={`text-xs mt-0.5 font-semibold ${uvInfo.color}`}>{uvInfo.label}</p>
                    </div>
                    <div className={`rounded-xl border p-4 ${card}`}>
                        <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${muted}`}>🔆 UVA / UVB</p>
                        <p className="text-base font-bold">
                            {entry.uva != null ? Number(entry.uva).toFixed(1) : '—'}
                            <span className={`text-xs font-normal ml-1 ${muted}`}>UVA</span>
                        </p>
                        <p className="text-base font-bold mt-0.5">
                            {entry.uvb != null ? Number(entry.uvb).toFixed(1) : '—'}
                            <span className={`text-xs font-normal ml-1 ${muted}`}>UVB</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className={`mt-5 w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                        isNightMode ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    }`}
                >
                    Close
                </button>
            </div>
        </div>
    );
}

/* ── Main Page ─────────────────────────────────────────────── */
const PAGE_SIZE = 20;

export default function ActivityLog({ settings }) {
    const isNightMode = settings?.manual_night_mode ?? false;
    const tempUnit    = settings?.temperature_unit   || 'celsius';
    const tempSuffix  = tempUnit === 'fahrenheit' ? '°F' : '°C';

    const [readings, setReadings] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);
    const [selected, setSelected] = useState(null);
    const [page,     setPage]     = useState(1);

    useEffect(() => {
        setLoading(true);
        fetch('/api/sensor-data/history?hours=24', {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
            .then((json) => {
                // Reverse so newest first
                setReadings([...(json.data ?? [])].reverse());
                setLoading(false);
            })
            .catch((err) => {
                setError('Failed to load activity log.');
                setLoading(false);
            });
    }, []);

    /* ── style tokens ── */
    const bg       = isNightMode ? 'bg-gradient-to-br from-[#0a0e27] via-[#111638] to-[#0d1229]' : 'bg-gradient-to-br from-[#f8fbff] via-[#eef4ff] to-[#e8f1ff]';
    const text     = isNightMode ? 'text-white'          : 'text-slate-800';
    const muted    = isNightMode ? 'text-gray-400'       : 'text-slate-500';
    const card     = isNightMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-indigo-50/60 hover:border-indigo-200';
    const hdrBdr   = isNightMode ? 'border-white/10'     : 'border-slate-200';

    const paginated  = readings.slice(0, page * PAGE_SIZE);
    const hasMore    = paginated.length < readings.length;

    return (
        <>
            <Head title="Activity Log — RayShield" />

            <div className={`min-h-screen ${bg} ${text}`}>
                {/* Header */}
                <header className={`px-4 sm:px-8 py-4 flex items-center gap-4 border-b ${hdrBdr}`}>
                    <Link
                        href="/dashboard"
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isNightMode ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Dashboard
                    </Link>
                    <span className={muted}>/</span>
                    <span className="text-sm font-semibold">Activity Log</span>
                </header>

                <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold">📋 Activity Log</h1>
                        <p className={`text-sm mt-1 ${muted}`}>
                            Every sensor reading from the last 24 hours — newest first.
                        </p>
                    </div>

                    {loading && (
                        <div className={`rounded-2xl border p-12 text-center ${isNightMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                            <p className="text-4xl mb-3 animate-pulse">📡</p>
                            <p className={`text-sm ${muted}`}>Loading activity log…</p>
                        </div>
                    )}

                    {error && (
                        <div className={`rounded-2xl border p-8 text-center ${isNightMode ? 'bg-red-500/10 border-red-400/30' : 'bg-red-50 border-red-200'}`}>
                            <p className="text-red-400 font-semibold">{error}</p>
                        </div>
                    )}

                    {!loading && !error && readings.length === 0 && (
                        <div className={`rounded-2xl border p-12 text-center ${isNightMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                            <p className="text-4xl mb-3">🌙</p>
                            <p className="font-semibold text-lg">No readings yet</p>
                            <p className={`text-sm mt-1 ${muted}`}>Sensor data will appear here once the device is connected.</p>
                        </div>
                    )}

                    {!loading && !error && readings.length > 0 && (
                        <>
                            <div className="space-y-2">
                                {paginated.map((r, idx) => {
                                    const { time, date } = formatDateTime(r.created_at);
                                    const temp   = tempUnit === 'fahrenheit' ? r.temperature_f : r.temperature_c;
                                    const hi     = tempUnit === 'fahrenheit' ? r.heat_index_f  : r.heat_index_c;
                                    const uvInfo = uvLabel(r.uv_index);
                                    const hiInfo = heatIndexLabel(r.heat_index_c);
                                    return (
                                        <button
                                            key={r.id ?? r.created_at + idx}
                                            onClick={() => setSelected(r)}
                                            className={`w-full text-left rounded-2xl border px-4 py-3.5 sm:p-5 transition-all duration-150 cursor-pointer ${card}`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                                {/* Date / time */}
                                                <div className="sm:w-44 shrink-0">
                                                    <p className={`text-[11px] font-semibold uppercase tracking-widest ${muted}`}>{date}</p>
                                                    <p className="font-bold text-base leading-tight">{time}</p>
                                                </div>
                                                {/* Metrics */}
                                                <div className="flex flex-wrap gap-4 sm:gap-6 flex-1">
                                                    <div>
                                                        <p className={`text-xs ${muted}`}>🌡 Temp</p>
                                                        <p className="font-semibold">{temp != null ? `${Number(temp).toFixed(1)}${tempSuffix}` : '—'}</p>
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs ${muted}`}>💧 Humidity</p>
                                                        <p className="font-semibold">{r.humidity != null ? `${Number(r.humidity).toFixed(0)}%` : '—'}</p>
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs ${muted}`}>🔥 Heat Index</p>
                                                        <p className={`font-semibold ${hiInfo.color}`}>{hi != null ? `${Number(hi).toFixed(1)}${tempSuffix}` : '—'}</p>
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs ${muted}`}>☀️ UV Index</p>
                                                        <p className={`font-semibold ${uvInfo.color}`}>
                                                            {r.uv_index != null ? Number(r.uv_index).toFixed(1) : '—'}
                                                            <span className={`text-xs font-normal ml-1 ${muted}`}>{uvInfo.label}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <svg className={`w-4 h-4 shrink-0 self-center hidden sm:block ${muted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {hasMore && (
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    className={`mt-5 w-full py-3 rounded-2xl font-semibold text-sm transition-colors border ${
                                        isNightMode
                                            ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200'
                                    }`}
                                >
                                    Load more
                                </button>
                            )}

                            <p className={`text-xs text-center mt-4 ${muted}`}>
                                Showing {paginated.length} of {readings.length} readings
                            </p>
                        </>
                    )}
                </div>
            </div>

            {selected && (
                <LogDetailModal
                    entry={selected}
                    onClose={() => setSelected(null)}
                    isNightMode={isNightMode}
                    tempUnit={tempUnit}
                />
            )}
        </>
    );
}
