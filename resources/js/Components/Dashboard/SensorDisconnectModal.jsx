export default function SensorDisconnectModal({ status, onClose, onReload, isReloading, isNightMode }) {
    const disconnected = [];

    if (!status?.sht40_connected) {
        disconnected.push('SHT40 (Temperature/Humidity)');
    }

    if (!status?.veml6075_connected) {
        disconnected.push('VEML6075 (UV Sensor)');
    }

    const hasDisconnected = disconnected.length > 0;

    if (!hasDisconnected && !status?.data_stale) {
        return null;
    }

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${isNightMode ? 'bg-black/60' : 'bg-slate-900/35 backdrop-blur-sm'}`}>
            <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${isNightMode ? 'border border-red-400/30 bg-[#111638]' : 'border border-red-200 bg-white'}`}>
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 className={`text-xl font-bold ${isNightMode ? 'text-red-300' : 'text-red-700'}`}>Sensor Connection Alert</h2>
                        <p className={`mt-1 text-sm ${isNightMode ? 'text-gray-300' : 'text-slate-600'}`}>
                            RayShield detected one or more sensor connection problems.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${isNightMode ? 'border border-white/10 text-gray-200 hover:bg-white/10' : 'border border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                    >
                        Close
                    </button>
                </div>

                <div className={`mb-4 rounded-xl p-4 text-sm ${isNightMode ? 'border border-white/10 bg-white/5 text-gray-200' : 'border border-slate-200 bg-slate-50 text-slate-700'}`}>
                    <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${isNightMode ? 'text-gray-300' : 'text-slate-500'}`}>Current sensor status</p>
                    <div className="flex items-center justify-between py-1">
                        <span>SHT40 (Temperature/Humidity)</span>
                        <span className={status?.sht40_connected ? (isNightMode ? 'text-emerald-300' : 'text-emerald-700') : (isNightMode ? 'text-red-300' : 'text-red-700')}>
                            {status?.sht40_connected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span>VEML6075 (UV Sensor)</span>
                        <span className={status?.veml6075_connected ? (isNightMode ? 'text-emerald-300' : 'text-emerald-700') : (isNightMode ? 'text-red-300' : 'text-red-700')}>
                            {status?.veml6075_connected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span>Data stream</span>
                        <span className={status?.data_stale ? (isNightMode ? 'text-amber-300' : 'text-amber-700') : (isNightMode ? 'text-emerald-300' : 'text-emerald-700')}>
                            {status?.data_stale ? 'Stale (no fresh reading)' : 'Live'}
                        </span>
                    </div>
                </div>

                {hasDisconnected && (
                    <div className={`mb-4 rounded-xl p-4 ${isNightMode ? 'border border-red-400/30 bg-red-950/30' : 'border border-red-200 bg-red-50'}`}>
                        <p className={`mb-2 text-sm font-semibold ${isNightMode ? 'text-red-200' : 'text-red-700'}`}>Disconnected sensors:</p>
                        <ul className={`list-disc space-y-1 pl-5 text-sm ${isNightMode ? 'text-red-100' : 'text-red-700'}`}>
                            {disconnected.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {status?.data_stale && (
                    <div className={`rounded-xl p-4 text-sm ${isNightMode ? 'border border-amber-400/30 bg-amber-950/30 text-amber-100' : 'border border-amber-200 bg-amber-50 text-amber-800'}`}>
                        No fresh reading was received in the last 20 seconds. Check USB cable, serial bridge, or ESP32 power.
                    </div>
                )}

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onReload}
                        disabled={isReloading}
                        className={`rounded-lg px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${isNightMode ? 'border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20' : 'border border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'}`}
                    >
                        {isReloading ? 'Checking sensors...' : 'Reload Sensor Status'}
                    </button>
                </div>
            </div>
        </div>
    );
}
