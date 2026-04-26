import { Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

/* ─── helpers ─────────────────────────────────────────────── */
function uvLabel(uvi) {
    if (uvi === null || uvi === undefined) return { label: '—', color: 'text-gray-400', dot: 'bg-gray-400' };
    if (uvi < 3)  return { label: 'Low',       color: 'text-emerald-500', dot: 'bg-emerald-400' };
    if (uvi < 6)  return { label: 'Moderate',  color: 'text-yellow-500',  dot: 'bg-yellow-400'  };
    if (uvi < 8)  return { label: 'High',      color: 'text-orange-500',  dot: 'bg-orange-400'  };
    if (uvi < 11) return { label: 'Very High', color: 'text-red-500',     dot: 'bg-red-400'     };
    return             { label: 'Extreme',    color: 'text-purple-500',  dot: 'bg-purple-400'  };
}

function formatTime(isoStr) {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleTimeString('en-PH', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true, timeZone: 'Asia/Manila',
    });
}

function formatDateFull() {
    const now = new Date();
    return now.toLocaleDateString('en-PH', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        timeZone: 'Asia/Manila',
    });
}

function formatTimeFull() {
    const now = new Date();
    return now.toLocaleTimeString('en-PH', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true, timeZone: 'Asia/Manila',
    });
}

/* ─── Section heading ─────────────────────────────────────── */
function SectionLabel({ icon, label, isNightMode }) {
    return (
        <p className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest mb-2 ${
            isNightMode ? 'text-gray-500' : 'text-slate-400'
        }`}>
            <span>{icon}</span> {label}
        </p>
    );
}

/* ─── Main component ──────────────────────────────────────── */
export default function BurgerMenu({
    open,
    onClose,
    isNightMode,
    uvNotification,
    tempUnit,
    activityLog,
    manualNightMode,
    onSettingsSave,
}) {
    const drawerRef = useRef(null);

    /* Close on Escape */
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    /* ── derived style tokens ── */
    const bg       = isNightMode ? 'bg-[#0f1336]'        : 'bg-white';
    const border   = isNightMode ? 'border-white/10'     : 'border-slate-200';
    const text     = isNightMode ? 'text-white'          : 'text-slate-800';
    const muted    = isNightMode ? 'text-gray-400'       : 'text-slate-500';
    const divider  = isNightMode ? 'border-white/8'      : 'border-slate-100';
    const cardBg   = isNightMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200';
    const hoverBg  = isNightMode ? 'hover:bg-white/10'   : 'hover:bg-slate-100';
    const inputBg  = isNightMode ? 'bg-white/5 text-gray-300' : 'bg-slate-100 text-slate-600';
    const activeBg = isNightMode ? 'bg-purple-500/30 text-purple-300 border-purple-500/40'
                                 : 'bg-indigo-600 text-white border-indigo-700';

    return (
        <>
            {/* ── Backdrop ── */}
            <div
                className={`fixed inset-0 z-40 transition-opacity duration-300 ${
                    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                } bg-black/40 backdrop-blur-sm`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* ── Drawer ── */}
            <aside
                ref={drawerRef}
                className={`fixed top-0 right-0 z-50 h-full w-[min(88vw,360px)] flex flex-col border-l shadow-2xl
                    transition-transform duration-300 ease-out
                    ${open ? 'translate-x-0' : 'translate-x-full'}
                    ${bg} ${border} ${text}`}
            >
                {/* ─── 1. HEADER: Time & Date ─────────────────── */}
                <div className={`px-5 pt-5 pb-4 border-b ${divider} shrink-0`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className={`text-2xl font-bold tabular-nums tracking-tight`}>
                                {formatTimeFull()}
                            </p>
                            <p className={`text-xs mt-0.5 ${muted}`}>{formatDateFull()}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${hoverBg} ${muted}`}
                            aria-label="Close menu"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ─── Scrollable body ─────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

                    {/* ─── 2. NOTIFICATIONS ──────────────────────── */}
                    <section>
                        <SectionLabel icon="🔔" label="Notifications" isNightMode={isNightMode} />
                        <div className={`rounded-xl border p-3.5 ${uvNotification.chip}`}>
                            <p className="font-semibold text-sm">{uvNotification.title}</p>
                            <p className={`text-xs mt-1 ${isNightMode ? 'text-gray-300' : 'text-slate-600'}`}>
                                {uvNotification.message}
                            </p>
                        </div>
                    </section>

                    <hr className={`border-t ${divider}`} />

                    {/* ─── 3. HISTORY ────────────────────────────── */}
                    <section>
                        <SectionLabel icon="📅" label="History" isNightMode={isNightMode} />
                        <Link
                            href="/history"
                            onClick={onClose}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${cardBg} ${hoverBg} cursor-pointer`}
                        >
                            <span>View Daily History</span>
                            <svg className={`w-4 h-4 ${muted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <p className={`text-[11px] mt-1.5 ${muted}`}>
                            End-of-day snapshots recorded at midnight each day.
                        </p>
                    </section>

                    <hr className={`border-t ${divider}`} />

                    {/* ─── 4. ACTIVITY LOG ───────────────────────── */}
                    <section>
                        <SectionLabel icon="📋" label="Activity Log" isNightMode={isNightMode} />
                        {activityLog.length === 0 ? (
                            <div className={`rounded-xl border p-4 text-center ${cardBg}`}>
                                <p className="text-2xl mb-1">📡</p>
                                <p className={`text-xs ${muted}`}>Waiting for sensor data…</p>
                            </div>
                        ) : (
                            <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {activityLog.map((entry, idx) => {
                                    const uvInfo = uvLabel(entry.uv_index);
                                    return (
                                        <li
                                            key={entry.created_at + idx}
                                            className={`rounded-xl border px-3 py-2.5 text-xs ${cardBg}`}
                                        >
                                            {/* Time row */}
                                            <div className="flex items-center justify-between mb-1.5">
                                                <p className={`font-semibold tabular-nums ${muted}`}>
                                                    {formatTime(entry.created_at)}
                                                </p>
                                                <span className={`flex items-center gap-1 font-bold ${uvInfo.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${uvInfo.dot}`} />
                                                    UV {entry.uv_index != null ? Number(entry.uv_index).toFixed(1) : '—'}
                                                </span>
                                            </div>
                                            {/* Metrics row */}
                                            <div className="flex gap-3 flex-wrap">
                                                <span className={muted}>
                                                    🌡{' '}
                                                    <span className={text}>
                                                        {tempUnit === 'fahrenheit'
                                                            ? `${Number(entry.temperature_f ?? 0).toFixed(1)}°F`
                                                            : `${Number(entry.temperature_c ?? 0).toFixed(1)}°C`}
                                                    </span>
                                                </span>
                                                <span className={muted}>
                                                    💧{' '}
                                                    <span className={text}>
                                                        {entry.humidity != null ? `${Number(entry.humidity).toFixed(0)}%` : '—'}
                                                    </span>
                                                </span>
                                                <span className={muted}>
                                                    🔥{' '}
                                                    <span className={text}>
                                                        {tempUnit === 'fahrenheit'
                                                            ? `${Number(entry.heat_index_f ?? 0).toFixed(1)}°F`
                                                            : `${Number(entry.heat_index_c ?? 0).toFixed(1)}°C`}
                                                    </span>
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    <hr className={`border-t ${divider}`} />

                    {/* ─── 5. SETTINGS ────────────────────────────── */}
                    <section>
                        <SectionLabel icon="⚙️" label="Settings" isNightMode={isNightMode} />

                        {/* Night Mode */}
                        <div className={`rounded-xl border p-3.5 mb-3 ${cardBg}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold">Night Mode</p>
                                    <p className={`text-[11px] mt-0.5 ${muted}`}>
                                        Dark theme for low-light use
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        onSettingsSave({
                                            manual_night_mode: !manualNightMode,
                                            temperature_unit: tempUnit,
                                        })
                                    }
                                    className={`relative w-11 h-6 rounded-full transition-colors ${
                                        manualNightMode ? 'bg-purple-500' : isNightMode ? 'bg-gray-600' : 'bg-slate-300'
                                    }`}
                                    aria-label="Toggle night mode"
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                            manualNightMode ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Temperature Unit */}
                        <div className={`rounded-xl border p-3.5 ${cardBg}`}>
                            <p className="text-sm font-semibold mb-2.5">Temperature Unit</p>
                            <div className="grid grid-cols-2 gap-2">
                                {['celsius', 'fahrenheit'].map((unit) => (
                                    <button
                                        key={unit}
                                        onClick={() =>
                                            onSettingsSave({
                                                manual_night_mode: manualNightMode,
                                                temperature_unit: unit,
                                            })
                                        }
                                        className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${
                                            tempUnit === unit
                                                ? activeBg
                                                : `${inputBg} border-transparent ${hoverBg}`
                                        }`}
                                    >
                                        {unit === 'celsius' ? '°C Celsius' : '°F Fahrenheit'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                </div>
            </aside>
        </>
    );
}
